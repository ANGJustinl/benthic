import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StorySequencer } from './storySequencer';
import { LogEntry } from '../types';

describe('StorySequencer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createLog = (text: string, timestamp: number = Date.now()): LogEntry => ({
    id: `log-${Math.random()}`,
    text,
    type: 'info',
    timestamp
  });

  describe('processStorySequence', () => {
    it('should process single log without sequencing', () => {
      const logs = [createLog('单条消息')];
      const result = StorySequencer.processStorySequence(logs);

      expect(result).toHaveLength(1);
      expect(result[0].isVisible).toBe(true);
      expect(result[0].sequenceIndex).toBeUndefined();
    });

    it('should sequence story batch with multiple related logs', () => {
      const baseTime = Date.now();
      const logs = [
        createLog('[SONAR] 被动监听模式开启。', baseTime),
        createLog('[SONAR] 捕捉到规律信号。', baseTime + 100),
        createLog('[AUDIO] 正在放大信号增益...', baseTime + 200),
        createLog('[LOG] 听起来像是敲击声。', baseTime + 300),
        createLog('[DECODER] 摩斯电码：S.O.S.', baseTime + 400),
      ];

      const result = StorySequencer.processStorySequence(logs);

      expect(result).toHaveLength(5);
      
      // 结果按时间戳降序排列，但最旧的消息（最后一个）应该立即可见
      expect(result[4].isVisible).toBe(true);  // [SONAR] 被动监听模式开启（最旧的）
      expect(result[4].sequenceIndex).toBe(0);
      
      // 其他消息应该隐藏，等待序列显示
      expect(result[3].isVisible).toBe(false); // [SONAR] 捕捉到规律信号
      expect(result[3].sequenceIndex).toBe(1);
      
      expect(result[2].isVisible).toBe(false); // [AUDIO] 正在放大信号增益
      expect(result[2].sequenceIndex).toBe(2);
      
      expect(result[1].isVisible).toBe(false); // [LOG] 听起来像是敲击声
      expect(result[1].sequenceIndex).toBe(3);
      
      expect(result[0].isVisible).toBe(false); // [DECODER] 摩斯电码（最新的）
      expect(result[0].sequenceIndex).toBe(4);
    });

    it('should not sequence non-story batch', () => {
      const baseTime = Date.now();
      const logs = [
        createLog('普通消息1', baseTime),
        createLog('普通消息2', baseTime + 100),
        createLog('普通消息3', baseTime + 200),
      ];

      const result = StorySequencer.processStorySequence(logs);

      expect(result).toHaveLength(3);
      // 所有消息都应该立即可见
      result.forEach(log => {
        expect(log.isVisible).toBe(true);
        expect(log.sequenceIndex).toBeUndefined();
      });
    });

    it('should separate logs into different batches based on time', () => {
      const baseTime = Date.now();
      const logs = [
        // 第一批（剧情）
        createLog('[SONAR] 消息1', baseTime),
        createLog('[AUDIO] 消息2', baseTime + 100),
        // 第二批（时间间隔大）
        createLog('普通消息', baseTime + 3000), // 改为3秒，超过2秒窗口
      ];

      const result = StorySequencer.processStorySequence(logs);

      expect(result).toHaveLength(3);
      
      // 结果按时间戳降序排列：普通消息(最新) -> [AUDIO] 消息2 -> [SONAR] 消息1
      // 普通消息应该立即可见（单独批次）
      expect(result[0].isVisible).toBe(true);
      expect(result[0].text).toBe('普通消息');
      
      // 剧情批次：[SONAR] 消息1（最旧的）应该立即可见，[AUDIO] 消息2 应该被隐藏等待序列化
      expect(result[2].isVisible).toBe(true);  // [SONAR] 消息1（最旧的）
      expect(result[2].text).toBe('[SONAR] 消息1');
      
      expect(result[1].isVisible).toBe(false); // [AUDIO] 消息2（较新的）
      expect(result[1].text).toBe('[AUDIO] 消息2');
    });
  });

  describe('updateLogVisibility', () => {
    it('should make logs visible when their time comes', () => {
      const baseTime = Date.now();
      const logs = [
        {
          ...createLog('[SONAR] 消息1', baseTime),
          isVisible: true,
          sequenceIndex: 0
        },
        {
          ...createLog('[AUDIO] 消息2', baseTime + 800),
          isVisible: false,
          sequenceIndex: 1
        }
      ];

      // 模拟时间过去了900ms
      const currentTime = baseTime + 900;
      const result = StorySequencer.updateLogVisibility(logs, currentTime);

      expect(result[0].isVisible).toBe(true);
      expect(result[1].isVisible).toBe(true); // 应该变为可见
    });

    it('should not make logs visible before their time', () => {
      const baseTime = Date.now();
      const logs = [
        {
          ...createLog('[SONAR] 消息1', baseTime),
          isVisible: true,
          sequenceIndex: 0
        },
        {
          ...createLog('[AUDIO] 消息2', baseTime + 800),
          isVisible: false,
          sequenceIndex: 1
        }
      ];

      // 模拟时间只过去了500ms
      const currentTime = baseTime + 500;
      const result = StorySequencer.updateLogVisibility(logs, currentTime);

      expect(result[0].isVisible).toBe(true);
      expect(result[1].isVisible).toBe(false); // 应该仍然隐藏
    });
  });

  describe('isStoryBatch detection', () => {
    it('should detect story batch with SONAR keywords', () => {
      const logs = [
        createLog('[SONAR] 脉冲发送...'),
        createLog('[SONAR] 等待回波...'),
        createLog('[SONAR] 结果：检测到回音'),
      ];

      const result = StorySequencer.processStorySequence(logs);
      
      // 应该被识别为剧情批次并序列化
      // 最旧的消息（最后一个）应该立即可见
      expect(result[2].isVisible).toBe(true);  // [SONAR] 脉冲发送（最旧的）
      expect(result[1].isVisible).toBe(false); // [SONAR] 等待回波
      expect(result[0].isVisible).toBe(false); // [SONAR] 结果（最新的）
    });

    it('should detect story batch with mixed story keywords', () => {
      const logs = [
        createLog('[DECODER] 摩斯电码：S.O.S.'),
        createLog('[LOG] 听起来像是敲击声'),
        createLog('[ANALYSIS] 冲击模式分析'),
      ];

      const result = StorySequencer.processStorySequence(logs);
      
      // 应该被识别为剧情批次
      // 最旧的消息（最后一个）应该立即可见
      expect(result[2].isVisible).toBe(true);  // [DECODER] 摩斯电码（最旧的）
      expect(result[1].isVisible).toBe(false); // [LOG] 听起来像是敲击声
      expect(result[0].isVisible).toBe(false); // [ANALYSIS] 冲击模式分析（最新的）
    });

    it('should not detect story batch without enough story keywords', () => {
      const logs = [
        createLog('普通消息1'),
        createLog('[SONAR] 只有一条剧情消息'),
        createLog('普通消息3'),
      ];

      const result = StorySequencer.processStorySequence(logs);
      
      // 不应该被识别为剧情批次
      result.forEach(log => {
        expect(log.isVisible).toBe(true);
      });
    });
  });
});