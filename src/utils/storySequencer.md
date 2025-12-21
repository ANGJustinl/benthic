# 剧情序列器 (Story Sequencer)

## 概述

剧情序列器为游戏中的多条剧情消息添加逐条显示的延迟效果，增强剧情的戏剧性和沉浸感。当游戏一次性添加多条相关的剧情消息时，它们会按顺序逐渐出现，而不是一次性全部显示。

## 功能特性

### 🎭 智能剧情检测
- 自动识别包含剧情关键词的消息批次
- 区分剧情消息和普通游戏消息
- 支持多种剧情标签：`[SONAR]`、`[AUDIO]`、`[LOG]`、`[DECODER]` 等

### ⏱️ 时间批次分组
- 将时间接近的消息（2秒内）分组为批次
- 只对剧情批次应用序列化显示
- 普通消息保持即时显示

### 🎬 渐进式显示
- 第一条消息立即显示
- 后续消息按800ms间隔逐条出现
- 保持原有的时间戳顺序

### 🔄 实时更新
- 使用React Hook自动管理显示状态
- 100ms间隔检查待显示消息
- 自动清理完成的序列

## 使用示例

### 剧情序列效果

**输入（一次性添加的多条消息）**：
```
[T-176624559] [SONAR] 被动监听模式开启。
[T-176624559] [SONAR] 捕捉到规律信号。
[T-176624559] [AUDIO] 正在放大信号增益...
[T-176624559] [LOG] 听起来像是敲击声。有人在用金属物敲击我们的船壳。
[T-176624559] [DECODER] 摩斯电码：S.O.S.
[T-176624559] 敲击节奏识别：
[T-176624559] ... --- ...
```

**显示效果**：
```
时间 0ms:    [SONAR] 被动监听模式开启。
时间 800ms:  [SONAR] 捕捉到规律信号。
时间 1600ms: [AUDIO] 正在放大信号增益...
时间 2400ms: [LOG] 听起来像是敲击声。有人在用金属物敲击我们的船壳。
时间 3200ms: [DECODER] 摩斯电码：S.O.S.
时间 4000ms: 敲击节奏识别：
时间 4800ms: ... --- ...
```

## 技术实现

### 核心算法

1. **批次分组**：按时间窗口（2秒）将消息分组
2. **剧情检测**：检查批次中包含剧情关键词的消息比例
3. **序列化处理**：为剧情批次设置延迟显示时间戳
4. **实时更新**：定期检查并更新消息可见性

### 关键参数

```typescript
const SEQUENCE_DELAY = 800;        // 消息间隔800ms
const BATCH_TIME_THRESHOLD = 2000; // 2秒内的消息为一批
const CHECK_INTERVAL = 100;        // 100ms检查一次
```

### 剧情关键词

```typescript
const storyKeywords = [
  '[SONAR]', '[AUDIO]', '[LOG]', '[DECODER]', '[ANALYSIS]',
  '[SYSTEM]', '[STATUS]', '[ENV]', '[OBSERVATION]',
  '敲击', '摩斯', 'SOS', '信号', '声音', '监听'
];
```

## React Hook 使用

### 基本用法

```typescript
import { useStorySequencer } from '../utils/storySequencer';

function LogViewer({ logs }) {
  // 自动处理剧情序列
  const sequencedLogs = useStorySequencer(logs);
  
  return (
    <div>
      {sequencedLogs.map(log => (
        <div key={log.id}>{log.text}</div>
      ))}
    </div>
  );
}
```

### 高级用法

```typescript
import { StorySequencer } from '../utils/storySequencer';

// 手动处理
const processedLogs = StorySequencer.processStorySequence(logs);

// 手动更新可见性
const updatedLogs = StorySequencer.updateLogVisibility(
  processedLogs, 
  Date.now()
);
```

## 配置选项

### 自定义延迟时间

```typescript
// 修改 storySequencer.ts 中的常量
private static readonly SEQUENCE_DELAY = 1000; // 改为1秒间隔
```

### 自定义批次阈值

```typescript
private static readonly BATCH_TIME_THRESHOLD = 3000; // 改为3秒窗口
```

### 添加新的剧情关键词

```typescript
const storyKeywords = [
  // 现有关键词...
  '[CUSTOM]', '自定义关键词', // 添加新关键词
];
```

## 性能优化

### 内存管理
- 使用 `useRef` 管理定时器引用
- 自动清理完成的序列定时器
- 避免不必要的状态更新

### 计算优化
- 使用 `useMemo` 缓存处理结果
- 只在日志变化时重新处理
- 高效的批次分组算法

### 渲染优化
- 只渲染可见的日志条目
- 避免频繁的DOM更新
- 使用稳定的key值

## 测试覆盖

### 单元测试
- ✅ 单条消息处理
- ✅ 剧情批次序列化
- ✅ 非剧情批次直接显示
- ✅ 时间批次分组
- ✅ 消息可见性更新
- ✅ 剧情关键词检测

### 集成测试
- ✅ React Hook 功能
- ✅ 组件渲染正确性
- ✅ 定时器管理

## 使用场景

### 适用情况
- 多条相关的剧情消息
- 系统诊断序列
- 通讯解码过程
- 声呐扫描结果
- 损伤控制报告

### 不适用情况
- 单条消息
- 用户操作反馈
- 资源变化通知
- 错误警告消息

## 最佳实践

1. **合理设置延迟**：根据消息内容调整间隔时间
2. **保持关键词更新**：随着游戏内容增加更新关键词列表
3. **测试用户体验**：确保序列显示不会影响游戏流畅性
4. **性能监控**：在大量消息时监控性能表现
5. **可配置性**：为不同玩家提供速度选项

## 故障排除

### 常见问题

**Q: 消息没有按序列显示？**
A: 检查消息是否包含足够的剧情关键词，或者时间间隔是否超过批次阈值。

**Q: 序列显示太慢/太快？**
A: 调整 `SEQUENCE_DELAY` 常量来改变消息间隔。

**Q: 内存泄漏？**
A: 确保组件卸载时正确清理定时器，检查 `useEffect` 的清理函数。

**Q: 消息顺序错乱？**
A: 检查时间戳排序逻辑，确保消息按正确顺序处理。

## 扩展性

### 添加新的序列类型
```typescript
export class CustomSequencer extends StorySequencer {
  static processCustomSequence(logs: LogEntry[]): SequencedLogEntry[] {
    // 自定义序列逻辑
  }
}
```

### 动态配置
```typescript
interface SequencerConfig {
  delay: number;
  batchThreshold: number;
  keywords: string[];
}

export class ConfigurableSequencer {
  constructor(private config: SequencerConfig) {}
  // ...
}
```

### 动画效果
```typescript
// 添加淡入动画
const fadeInClass = log.sequenceIndex === 0 ? '' : 'animate-fadeIn';
```

这个剧情序列器大大增强了游戏的叙事体验，让重要的剧情时刻更加引人入胜！