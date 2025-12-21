import { LogEntry } from '../types';
import { LOG_AGGREGATION_CONFIG } from '../constants';

export interface AggregatedLogEntry extends LogEntry {
  count?: number; // 重复次数
  lastTimestamp?: number; // 最后一次出现的时间
}

export class LogAggregator {
  /**
   * 聚合重复的日志条目
   * @param logs 原始日志数组
   * @param timeWindow 时间窗口（毫秒），在此窗口内的相同消息会被聚合
   * @returns 聚合后的日志数组
   */
  static aggregate(logs: LogEntry[], timeWindow: number = 5000): AggregatedLogEntry[] {
    if (logs.length === 0) return [];

    const aggregated: AggregatedLogEntry[] = [];
    const recentMessages = new Map<string, AggregatedLogEntry>();

    for (const log of logs) {
      const key = this.getLogKey(log);
      const existing = recentMessages.get(key);

      if (existing && log.timestamp - existing.timestamp <= timeWindow) {
        // 在时间窗口内找到重复消息，增加计数
        existing.count = (existing.count || 1) + 1;
        existing.lastTimestamp = log.timestamp;
      } else {
        // 新消息或超出时间窗口
        const newEntry: AggregatedLogEntry = {
          ...log,
          count: 1,
          lastTimestamp: log.timestamp,
        };
        aggregated.push(newEntry);
        recentMessages.set(key, newEntry);
      }
    }

    return aggregated;
  }

  /**
   * 生成日志的唯一键（用于识别重复消息）
   */
  private static getLogKey(log: LogEntry): string {
    // 使用文本和类型作为键，忽略时间戳
    return `${log.text}|${log.type}`;
  }

  /**
   * 格式化聚合后的日志文本（简化版，不显示计数）
   */
  static formatLogText(log: AggregatedLogEntry): string {
    // 直接返回原始文本，不添加计数后缀
    return log.text;
  }

  /**
   * 检查是否应该显示重复计数
   */
  static shouldShowCount(log: AggregatedLogEntry): boolean {
    return (log.count || 1) > 1;
  }

  /**
   * 获取时间差描述
   */
  static getTimeDiff(log: AggregatedLogEntry): string | null {
    if (!log.lastTimestamp || !log.count || log.count <= 1) {
      return null;
    }

    const diff = log.lastTimestamp - log.timestamp;
    if (diff < 1000) {
      return '刚刚';
    } else if (diff < 60000) {
      return `${Math.floor(diff / 1000)}秒内`;
    } else {
      return `${Math.floor(diff / 60000)}分钟内`;
    }
  }
}

/**
 * 智能日志合并策略
 */
export class SmartLogMerger {
  /**
   * 合并连续的相似日志
   * @param logs 日志数组
   * @param maxConsecutive 最多保留多少条连续的相同消息
   */
  static mergeConsecutive(logs: LogEntry[], maxConsecutive: number = 3): LogEntry[] {
    if (logs.length === 0) return [];

    const result: LogEntry[] = [];
    let currentGroup: LogEntry[] = [];
    let lastKey = '';

    for (const log of logs) {
      const key = `${log.text}|${log.type}`;

      if (key === lastKey) {
        currentGroup.push(log);
      } else {
        // 处理上一组
        if (currentGroup.length > 0) {
          result.push(...this.processGroup(currentGroup, maxConsecutive));
        }
        // 开始新组
        currentGroup = [log];
        lastKey = key;
      }
    }

    // 处理最后一组
    if (currentGroup.length > 0) {
      result.push(...this.processGroup(currentGroup, maxConsecutive));
    }

    return result;
  }

  private static processGroup(group: LogEntry[], maxConsecutive: number): LogEntry[] {
    if (group.length <= maxConsecutive) {
      return group;
    }

    // 保留前几条和最后一条，中间用汇总消息替代
    const kept = group.slice(0, maxConsecutive - 1);
    const omitted = group.length - maxConsecutive + 1;
    const last = group[group.length - 1];

    const summaryLog: LogEntry = {
      id: `summary-${last.id}`,
      text: `[省略 ${omitted} 条相似消息]`,
      type: 'info',
      timestamp: group[maxConsecutive - 1].timestamp,
    };

    return [...kept, summaryLog, last];
  }
}

/**
 * 日志去重配置
 */
export interface LogDeduplicationConfig {
  enabled: boolean;
  timeWindow: number; // 时间窗口（毫秒）
  maxConsecutive: number; // 最多连续显示数量
  aggregateByType: boolean; // 是否按类型分别聚合
}

export const DEFAULT_DEDUPLICATION_CONFIG: LogDeduplicationConfig = {
  enabled: true,
  timeWindow: LOG_AGGREGATION_CONFIG.DEFAULT_TIME_WINDOW,
  maxConsecutive: 3, // 最多显示3条连续的相同消息
  aggregateByType: true,
};

/**
 * 主日志处理器
 */
export class LogProcessor {
  constructor(private config: LogDeduplicationConfig = DEFAULT_DEDUPLICATION_CONFIG) {}

  /**
   * 处理日志数组
   */
  process(logs: LogEntry[]): AggregatedLogEntry[] {
    if (!this.config.enabled) {
      return logs.map(log => ({ ...log, count: 1 }));
    }

    // 先聚合时间窗口内的重复消息
    const aggregated = LogAggregator.aggregate(logs, this.config.timeWindow);

    // 注意：不再进行连续消息合并，因为这会破坏聚合的计数
    // 如果需要限制连续显示，应该在UI层面处理
    return aggregated;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LogDeduplicationConfig>) {
    this.config = { ...this.config, ...config };
  }
}
