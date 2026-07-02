import { describe, it, expect } from 'vitest';
import { LogAggregator, SmartLogMerger, LogProcessor } from './logAggregator';
import { LogEntry } from '../types';

describe('LogAggregator', () => {
  const createLog = (text: string, type: 'info' | 'warning' | 'story' | 'horror' | 'success' = 'info', timestamp: number = Date.now()): LogEntry => ({
    id: `log-${Math.random()}`,
    text,
    type,
    timestamp
  });

  describe('aggregate', () => {
    it('should aggregate duplicate messages within time window', () => {
      const now = Date.now();
      const logs = [
        createLog('重复消息', 'info', now),
        createLog('重复消息', 'info', now + 1000),
        createLog('重复消息', 'info', now + 2000),
        createLog('不同消息', 'info', now + 3000),
      ];

      const result = LogAggregator.aggregate(logs, 5000);

      expect(result).toHaveLength(2);
      expect(result[0].count).toBe(3);
      expect(result[0].text).toBe('重复消息');
      expect(result[1].count).toBe(1);
      expect(result[1].text).toBe('不同消息');
    });

    it('should not aggregate messages outside time window', () => {
      const now = Date.now();
      const logs = [
        createLog('消息', 'info', now),
        createLog('消息', 'info', now + 6000), // 超出5秒窗口
      ];

      const result = LogAggregator.aggregate(logs, 5000);

      expect(result).toHaveLength(2);
      expect(result[0].count).toBe(1);
      expect(result[1].count).toBe(1);
    });

    it('should treat different types as different messages', () => {
      const now = Date.now();
      const logs = [
        createLog('消息', 'info', now),
        createLog('消息', 'warning', now + 1000),
      ];

      const result = LogAggregator.aggregate(logs, 5000);

      expect(result).toHaveLength(2);
      expect(result[0].count).toBe(1);
      expect(result[1].count).toBe(1);
    });
  });

  describe('formatLogText', () => {
    it('should return original text without count suffix', () => {
      const log = { ...createLog('测试消息'), count: 3 };
      const result = LogAggregator.formatLogText(log);
      expect(result).toBe('测试消息');
    });

    it('should return original text for single messages', () => {
      const log = { ...createLog('测试消息'), count: 1 };
      const result = LogAggregator.formatLogText(log);
      expect(result).toBe('测试消息');
    });
  });
});

describe('SmartLogMerger', () => {
  const createLog = (text: string, timestamp: number = Date.now()): LogEntry => ({
    id: `log-${Math.random()}`,
    text,
    type: 'info',
    timestamp
  });

  describe('mergeConsecutive', () => {
    it('should merge consecutive duplicate messages', () => {
      const logs = [
        createLog('重复'),
        createLog('重复'),
        createLog('重复'),
        createLog('重复'),
        createLog('重复'),
        createLog('不同'),
      ];

      const result = SmartLogMerger.mergeConsecutive(logs, 3);

      expect(result).toHaveLength(5); // 2个重复 + 1个汇总 + 1个最后的重复 + 1个不同
      expect(result[2].text).toContain('省略');
    });

    it('should not merge if under threshold', () => {
      const logs = [
        createLog('重复'),
        createLog('重复'),
        createLog('不同'),
      ];

      const result = SmartLogMerger.mergeConsecutive(logs, 3);

      expect(result).toHaveLength(3);
      expect(result.every(log => !log.text.includes('省略'))).toBe(true);
    });
  });
});

describe('LogProcessor', () => {
  const createLog = (text: string, type: 'info' | 'warning' | 'story' | 'horror' | 'success' = 'info', timestamp: number = Date.now()): LogEntry => ({
    id: `log-${Math.random()}`,
    text,
    type,
    timestamp
  });

  it('should process logs with default configuration', () => {
    const processor = new LogProcessor();
    const now = Date.now();
    const logs = [
      createLog('重复消息', 'info', now),
      createLog('重复消息', 'info', now + 1000),
      createLog('重复消息', 'info', now + 2000),
    ];

    const result = processor.process(logs);

    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(3);
  });

  it('should respect disabled configuration', () => {
    const processor = new LogProcessor({
      enabled: false,
      timeWindow: 5000,
      maxConsecutive: 3,
      aggregateByType: true
    });

    const logs = [
      createLog('重复消息'),
      createLog('重复消息'),
    ];

    const result = processor.process(logs);

    expect(result).toHaveLength(2);
    expect(result[0].count).toBe(1);
    expect(result[1].count).toBe(1);
  });
});