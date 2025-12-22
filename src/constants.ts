import { BuildingType, ResourceType } from './types';
import { CHAPTER1_STORY_EVENTS, CHAPTER1_STORY_SEQUENCES, createChapter1StorySequence } from './chapters/chapter1/constants';
import { CHAPTER2_STORY_EVENTS, CHAPTER2_STORY_SEQUENCES, createChapter2StorySequence } from './chapters/chapter2/constants';

export const INITIAL_MAX_OXYGEN = 100;
export const TICK_RATE_MS = 1000;
export const OXYGEN_DECAY_BASE = 0.6;

export const COSTS = {
  [BuildingType.PUMP]: {
    [ResourceType.SCRAP]: 10,
    [ResourceType.BIOMASS]: 5,
  },
  [BuildingType.BIO_FILTER]: {
    [ResourceType.SCRAP]: 25,
    [ResourceType.BIOMASS]: 20,
    [ResourceType.LUMENS]: 5,
  },
  [BuildingType.NODE]: {
    [ResourceType.SCRAP]: 100,
    [ResourceType.BIOMASS]: 50,
    [ResourceType.LUMENS]: 20,
  },
  [BuildingType.NEURAL_LINK]: {
    [ResourceType.BIOMASS]: 200,
    [ResourceType.EVOLUTION]: 10,
  },
  [BuildingType.COMMS_ARRAY]: {
    [ResourceType.SCRAP]: 50,
    [ResourceType.BIOMASS]: 30,
    [ResourceType.LUMENS]: 20,
  }
};

export const PRODUCTION = {
  [BuildingType.PUMP]: {
    [ResourceType.OXYGEN]: 1, 
  },
  [BuildingType.BIO_FILTER]: {
    // Bio filter now works like manual scavenger - produces random resources
    // The actual logic is handled in the game engine TICK case
    [ResourceType.BIOMASS]: 0, // Placeholder - actual production is randomized
  },
  [BuildingType.NODE]: {
    [ResourceType.EVOLUTION]: 0.1,
  },
  [BuildingType.COMMS_ARRAY]: {},
  [BuildingType.NEURAL_LINK]: {},
};

export const SCALING_FACTOR = 1.3; 

export const STORY_EVENTS = {
  // Re-export Chapter 1 events for compatibility
  ...CHAPTER1_STORY_EVENTS,
  
  // Re-export Chapter 2 events
  ...CHAPTER2_STORY_EVENTS,
  
  // Future chapters will be added here
  // CHAPTER3_EVENTS: {},
};

// 定义哪些事件序列应该被序列化显示
export const STORY_SEQUENCES = {
  // Re-export Chapter 1 sequences for compatibility
  ...CHAPTER1_STORY_SEQUENCES,
  
  // Re-export Chapter 2 sequences
  ...CHAPTER2_STORY_SEQUENCES,
  
  // Future chapters will be added here
  // CHAPTER3_SEQUENCES: {},
};

// 辅助函数：创建序列化的故事日志
export function createStorySequence(sequenceName: keyof typeof STORY_SEQUENCES, generateLogId: () => string): any[] {
  // Check if it's a Chapter 1 sequence
  if (sequenceName in CHAPTER1_STORY_SEQUENCES) {
    return createChapter1StorySequence(sequenceName as keyof typeof CHAPTER1_STORY_SEQUENCES, generateLogId);
  }
  
  // Check if it's a Chapter 2 sequence
  if (sequenceName in CHAPTER2_STORY_SEQUENCES) {
    return createChapter2StorySequence(sequenceName as keyof typeof CHAPTER2_STORY_SEQUENCES, generateLogId);
  }
  
  // Future chapters will be handled here
  // if (sequenceName in CHAPTER3_SEQUENCES) {
  //   return createChapter3StorySequence(sequenceName, generateLogId);
  // }
  
  console.warn(`Unknown story sequence: ${sequenceName}`);
  return [];
}
// 故事序列配置
export const STORY_SEQUENCE_CONFIG = {
  // 延迟配置
  SEQUENCE_DELAY: 1400, // 每条消息间隔1400ms
  BATCH_TIME_THRESHOLD: 2000, // 2秒内的消息被认为是一批
  VISIBILITY_CHECK_INTERVAL: 100, // 每100ms检查一次可见性
  
  // 关键词配置
  STORY_KEYWORDS: [
    '[SONAR]', '[AUDIO]', '[LOG]', '[DECODER]', '[ANALYSIS]',
    '[SYSTEM]', '[STATUS]', '[ENV]', '[OBSERVATION]', '[IMG_PROCESS]',
    '[DETAIL]', '[ANOMALY]', '[PHYSICS_LOG]', '[DATABASE]', '[CONCLUSION]',
    '敲击', '摩斯', 'SOS', '信号', '声音', '监听', '回波', '脉冲',
    // 添加更多通用的故事关键词
    '解锁', '舱内', '过滤网', '进气', '效率', '温度', '压力', '系统',
    '警告', '检测', '分析', '状态', '模式', '序列', '启动'
  ]
};

// 日志聚合配置
export const LOG_AGGREGATION_CONFIG = {
  // 去重配置
  DEFAULT_TIME_WINDOW: 5000, // 5秒时间窗口
  DEFAULT_MAX_COUNT: 10, // 最大聚合数量
  
  // 动画配置
  PULSE_ANIMATION_CLASS: 'animate-pulse-slow', // 重复消息的脉冲动画
};

// 日志样式配置
export const LOG_STYLE_CONFIG = {
  // 基础样式
  BASE_CLASSES: 'text-sm leading-relaxed p-2 rounded relative',
  
  // 动画样式
  ANIMATIONS: {
    NEW_MESSAGE: 'animate-pulse', // 新消息动画
    REPEATED_MESSAGE: 'animate-pulse-slow', // 重复消息动画
    OPACITY_NORMAL: 'opacity-80', // 普通消息透明度
  },
  
  // 消息类型样式
  MESSAGE_TYPES: {
    WARNING: {
      NORMAL: 'text-red-500 border-l-2 border-red-900 bg-red-900/10',
      IMPACT: 'text-red-400 border-l-2 border-red-700 bg-red-900/20',
    },
    STORY: {
      NORMAL: 'text-cyan-400',
      PHASE_3: 'text-flesh-pink',
      IMPACT: 'text-red-300',
    },
    HORROR: 'text-flesh-red font-hand text-lg border-l-4 border-flesh-red bg-flesh-red/20',
    INFO: {
      NORMAL: 'text-term-green',
      PHASE_3: 'text-red-300',
      IMPACT: 'text-red-200',
    },
    SUCCESS: {
      NORMAL: 'text-green-500',
      IMPACT: 'text-green-400',
    }
  },
  
  // 时间戳样式
  TIMESTAMP: {
    BASE: 'opacity-50 text-xs block mb-1 font-mono',
    NORMAL: '[T-{timestamp}] ',
    PHASE_3: '>> ',
    IMPACT: '[EMERGENCY] ',
  },
  
  // 容器样式
  CONTAINER: {
    BASE: 'h-full flex flex-col border-r p-4 transition-colors duration-1000 overflow-hidden relative',
    NORMAL: 'border-gray-800 bg-term-bg',
    PHASE_3: 'border-flesh-red bg-flesh-bg',
    IMPACT: 'border-red-800 bg-red-950/20',
  },
  
  // 标题样式
  TITLE: {
    BASE: 'text-sm font-bold uppercase tracking-widest',
    NORMAL: 'text-gray-500 font-mono',
    PHASE_3: 'text-flesh-pink font-hand text-xl',
    IMPACT: 'text-red-400 font-mono animate-pulse',
  },
  
  // 标题文本
  TITLE_TEXT: {
    NORMAL: '系统日志 (System Log)',
    PHASE_3: '内心的呢喃 (Internal Monologue)',
    IMPACT: '紧急警报 (EMERGENCY ALERT)',
  }
};

// 颜色主题配置
export const COLOR_THEMES = {
  // 终端主题（正常状态）
  TERMINAL: {
    PRIMARY: 'text-term-green',
    SECONDARY: 'text-gray-500',
    BACKGROUND: 'bg-term-bg',
    BORDER: 'border-gray-800',
  },
  
  // 血肉主题（第三阶段）
  FLESH: {
    PRIMARY: 'text-flesh-pink',
    SECONDARY: 'text-flesh-red',
    BACKGROUND: 'bg-flesh-bg',
    BORDER: 'border-flesh-red',
    ACCENT: 'text-red-300',
  },
  
  // 紧急主题（撞击状态）
  EMERGENCY: {
    PRIMARY: 'text-red-400',
    SECONDARY: 'text-red-200',
    BACKGROUND: 'bg-red-950/20',
    BORDER: 'border-red-800',
    WARNING: 'text-red-700',
  }
};

// 字体配置
export const FONT_CONFIG = {
  // 基础字体
  MONO: 'font-mono',
  HAND: 'font-hand', // 手写字体（用于恐怖效果）
  
  // 字体大小
  SIZES: {
    XS: 'text-xs',
    SM: 'text-sm',
    BASE: 'text-base',
    LG: 'text-lg',
    XL: 'text-xl',
  },
  
  // 字体权重
  WEIGHTS: {
    NORMAL: 'font-normal',
    BOLD: 'font-bold',
  }
};