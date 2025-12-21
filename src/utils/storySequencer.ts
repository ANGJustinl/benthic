import { LogEntry } from '../types';
import { STORY_SEQUENCE_CONFIG } from '../constants';

export interface SequencedLogEntry extends LogEntry {
  isVisible?: boolean;
  sequenceIndex?: number;
  originalTimestamp?: number;
}

export class StorySequencer {
  private static readonly SEQUENCE_DELAY = STORY_SEQUENCE_CONFIG.SEQUENCE_DELAY;
  private static readonly BATCH_TIME_THRESHOLD = STORY_SEQUENCE_CONFIG.BATCH_TIME_THRESHOLD;

  /**
   * 检测并处理剧情序列
   * @param logs 日志数组
   * @returns 处理后的日志数组
   */
  static processStorySequence(logs: LogEntry[]): SequencedLogEntry[] {
    if (logs.length === 0) return [];

    console.log('StorySequencer.processStorySequence called with:', logs.map(l => ({ text: l.text, isStorySequence: (l as any).isStorySequence })));

    // 按时间戳排序，最新的在前（保持游戏中的显示顺序）
    const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
    
    const processedLogs: SequencedLogEntry[] = [];
    const batches = this.groupIntoBatches(sortedLogs);

    console.log('Grouped into batches:', batches.length);

    for (const batch of batches) {
      console.log('Processing batch:', batch.map(b => ({ text: b.text, isStorySequence: (b as any).isStorySequence })));
      
      if (batch.length > 1 && this.isStoryBatch(batch)) {
        console.log('This is a story batch, creating sequenced batch');
        // 这是一个剧情批次，需要序列化显示
        const sequencedBatch = this.createSequencedBatch(batch);
        console.log('Created sequenced batch:', sequencedBatch.map(s => ({ text: s.text, isVisible: s.isVisible, timestamp: s.timestamp })));
        processedLogs.push(...sequencedBatch);
      } else {
        console.log('This is not a story batch, marking as visible');
        // 单条消息或非剧情批次，直接显示
        processedLogs.push(...batch.map(log => ({ ...log, isVisible: true })));
      }
    }

    console.log('Final processed logs:', processedLogs.map(p => ({ text: p.text, isVisible: p.isVisible })));
    return processedLogs;
  }

  /**
   * 将日志按时间分组成批次
   * 改进的批次检测：检查连续的日志是否在短时间内创建，或者是否属于同一个故事序列
   */
  private static groupIntoBatches(logs: LogEntry[]): LogEntry[][] {
    if (logs.length === 0) return [];

    const batches: LogEntry[][] = [];
    let currentBatch: LogEntry[] = [logs[0]];

    for (let i = 1; i < logs.length; i++) {
      const currentLog = logs[i];
      const previousLog = logs[i-1];
      
      // 检查是否属于同一个故事序列
      const sameSequence = (currentLog as any).isStorySequence && 
                          (previousLog as any).isStorySequence &&
                          (currentLog as any).sequenceName === (previousLog as any).sequenceName;
      
      if (sameSequence) {
        // 属于同一个故事序列，加入当前批次
        currentBatch.push(currentLog);
      } else {
        // 计算时间差（注意logs已经按时间戳降序排列）
        const timeDiff = previousLog.timestamp - currentLog.timestamp;
        
        // 如果时间差在合理范围内（2秒），且都包含剧情关键词，则认为是同一批次
        if (timeDiff <= this.BATCH_TIME_THRESHOLD && timeDiff >= 0) {
          // 检查是否都是剧情相关的消息
          const bothAreStory = this.hasStoryKeywords(currentLog) && this.hasStoryKeywords(previousLog);
          
          if (bothAreStory) {
            currentBatch.push(currentLog);
          } else {
            // 不是剧情消息，开始新批次
            batches.push(currentBatch);
            currentBatch = [currentLog];
          }
        } else {
          // 时间差太大，开始新批次
          batches.push(currentBatch);
          currentBatch = [currentLog];
        }
      }
    }
    
    batches.push(currentBatch);
    return batches;
  }

  /**
   * 检查单条日志是否包含剧情关键词
   */
  private static hasStoryKeywords(log: LogEntry): boolean {
    return STORY_SEQUENCE_CONFIG.STORY_KEYWORDS.some(keyword => log.text.includes(keyword));
  }

  /**
   * 判断是否为剧情批次
   */
  private static isStoryBatch(batch: LogEntry[]): boolean {
    if (batch.length < 2) return false;

    // 暂时关闭自动识别，只处理明确标记为故事序列的日志
    const hasStorySequence = batch.some(log => (log as any).isStorySequence);
    return hasStorySequence;

    // 原来的自动识别逻辑（暂时注释）
    // // 检查是否包含剧情相关的关键词
    // const storyCount = batch.filter(log => this.hasStoryKeywords(log)).length;
    // // 如果超过一半的消息包含剧情关键词，认为是剧情批次
    // return storyCount >= Math.ceil(batch.length * 0.5);
  }

  /**
   * 创建序列化批次
   */
  private static createSequencedBatch(batch: LogEntry[]): SequencedLogEntry[] {
    // 按时间戳排序（最新的在前，保持显示顺序）
    const sortedBatch = [...batch].sort((a, b) => b.timestamp - a.timestamp);
    const currentTime = Date.now();
    
    // 找到最旧的消息（应该最先显示）
    const oldestIndex = sortedBatch.length - 1;
    
    return sortedBatch.map((log, index) => ({
      ...log,
      isVisible: index === oldestIndex, // 最旧的消息立即可见
      sequenceIndex: oldestIndex - index, // 反转序列索引，最旧的是0
      originalTimestamp: log.timestamp,
      // 为后续消息设置基于当前时间的延迟时间戳
      // 最旧的消息立即显示，较新的消息延迟显示
      timestamp: index === oldestIndex ? log.timestamp : currentTime + ((oldestIndex - index) * StorySequencer.SEQUENCE_DELAY)
    }));
  }

  /**
   * 获取下一个应该显示的消息
   */
  static getNextVisibleLog(logs: SequencedLogEntry[], currentTime: number): SequencedLogEntry | null {
    return logs.find(log => 
      !log.isVisible && 
      log.sequenceIndex !== undefined && 
      currentTime >= log.timestamp
    ) || null;
  }

  /**
   * 更新日志可见性
   */
  static updateLogVisibility(logs: SequencedLogEntry[], currentTime: number): SequencedLogEntry[] {
    return logs.map(log => {
      if (!log.isVisible && log.sequenceIndex !== undefined && currentTime >= log.timestamp) {
        return { ...log, isVisible: true };
      }
      return log;
    });
  }
}

/**
 * React Hook for story sequencing
 */
import { useState, useEffect, useRef } from 'react';

export function useStorySequencer(logs: LogEntry[]) {
  const [sequencedLogs, setSequencedLogs] = useState<SequencedLogEntry[]>([]);
  const [processedLogIds, setProcessedLogIds] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 只处理新的日志
    const newLogs = logs.filter(log => !processedLogIds.has(log.id));
    
    if (newLogs.length === 0) return;
    
    console.log('Processing new logs:', newLogs.map(l => ({ id: l.id, text: l.text, isStorySequence: (l as any).isStorySequence })));
    
    // 检查新日志中是否有故事序列
    const hasStorySequence = newLogs.some(log => (log as any).isStorySequence);
    
    console.log('Has story sequence:', hasStorySequence);
    
    let processed: SequencedLogEntry[];
    
    if (hasStorySequence) {
      // 如果有故事序列，处理所有新日志以保持序列完整性
      processed = StorySequencer.processStorySequence(newLogs);
      console.log('Processed story sequence:', processed.map(p => ({ text: p.text, isVisible: p.isVisible, timestamp: p.timestamp })));
    } else {
      // 如果没有故事序列，直接标记为可见
      processed = newLogs.map(log => ({ ...log, isVisible: true }));
    }
    
    // 更新已处理的日志ID集合
    const newProcessedIds = new Set(processedLogIds);
    newLogs.forEach(log => newProcessedIds.add(log.id));
    setProcessedLogIds(newProcessedIds);
    
    // 将新处理的日志添加到现有日志前面（保持最新在前的顺序）
    setSequencedLogs(prevLogs => [...processed, ...prevLogs]);

    // 清除之前的定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 检查是否有需要延迟显示的消息
    const hasHiddenLogs = processed.some(log => !log.isVisible);
    
    console.log('Has hidden logs:', hasHiddenLogs);
    
    if (hasHiddenLogs) {
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        setSequencedLogs(prevLogs => {
          const updatedLogs = StorySequencer.updateLogVisibility(prevLogs, currentTime);
          
          // 如果没有更多隐藏的日志，清除定时器
          const stillHasHidden = updatedLogs.some(log => !log.isVisible);
          if (!stillHasHidden && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
          }
          
          return updatedLogs;
        });
      }, STORY_SEQUENCE_CONFIG.VISIBILITY_CHECK_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [logs]); // 只依赖logs，不依赖processedLogIds

  // 返回所有日志，但只有可见的会被渲染
  const visibleLogs = sequencedLogs.filter(log => log.isVisible);
  console.log('Returning visible logs:', visibleLogs.map(l => ({ text: l.text, timestamp: l.timestamp })));
  
  return visibleLogs;
}