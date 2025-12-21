# 日志聚合系统 (Log Aggregation System)

## 概述

日志聚合系统解决了游戏中重复消息快速堆叠的问题，通过智能合并相同或相似的日志条目，提供更清晰的用户体验。

## 功能特性

### 🔄 时间窗口聚合
- 在指定时间窗口内（默认5秒）的相同消息会被合并
- 显示重复次数和时间范围
- 保留最早和最晚的时间戳

### 📊 智能计数显示
- 重复消息显示 `×N` 计数标识
- 显示消息重复的时间跨度
- 特殊的视觉样式突出聚合消息

### ⚙️ 可配置设置
- 启用/禁用聚合功能
- 调整时间窗口大小（1-30秒）
- 设置最大连续显示数量
- 按消息类型分别聚合

### 🎨 用户界面
- 右上角设置按钮
- 实时配置调整
- 预设配置选项
- 聚合状态指示器

## 使用方式

### 基本用法

```typescript
import { LogProcessor, DEFAULT_DEDUPLICATION_CONFIG } from '../utils/logAggregator';

// 创建处理器
const processor = new LogProcessor(DEFAULT_DEDUPLICATION_CONFIG);

// 处理日志
const aggregatedLogs = processor.process(originalLogs);
```

### 自定义配置

```typescript
import { LogProcessor, LogDeduplicationConfig } from '../utils/logAggregator';

const customConfig: LogDeduplicationConfig = {
  enabled: true,
  timeWindow: 3000,      // 3秒时间窗口
  maxConsecutive: 2,     // 最多显示2条连续消息
  aggregateByType: true  // 按类型分别聚合
};

const processor = new LogProcessor(customConfig);
```

### 在组件中使用

```typescript
import { LogViewer } from '../components/LogViewer';

// LogViewer 组件已经集成了日志聚合功能
<LogViewer logs={gameLogs} phase={gamePhase} />
```

## 配置选项

### LogDeduplicationConfig

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `enabled` | boolean | true | 是否启用聚合功能 |
| `timeWindow` | number | 5000 | 时间窗口（毫秒） |
| `maxConsecutive` | number | 3 | 最大连续显示数量 |
| `aggregateByType` | boolean | true | 是否按类型分别聚合 |

### 预设配置

#### 关闭聚合
```typescript
{ enabled: false, timeWindow: 5000, maxConsecutive: 3, aggregateByType: true }
```

#### 激进聚合
```typescript
{ enabled: true, timeWindow: 3000, maxConsecutive: 2, aggregateByType: true }
```

#### 默认设置
```typescript
{ enabled: true, timeWindow: 5000, maxConsecutive: 3, aggregateByType: true }
```

#### 宽松聚合
```typescript
{ enabled: true, timeWindow: 10000, maxConsecutive: 5, aggregateByType: false }
```

## 聚合算法

### 时间窗口聚合

1. **消息识别**：使用消息文本和类型作为唯一键
2. **时间检查**：检查消息是否在时间窗口内
3. **计数累加**：相同消息的计数递增
4. **时间戳更新**：记录最后出现时间

### 连续消息合并

1. **分组识别**：识别连续的相同消息
2. **阈值检查**：超过阈值的消息组进行合并
3. **汇总生成**：生成 `[省略 N 条相似消息]` 汇总
4. **保留策略**：保留前几条和最后一条

## 视觉效果

### 聚合消息样式
- 黄色左边框突出显示
- 右上角显示重复计数 `×N`
- 显示时间跨度（如"5秒内"）
- 底部提示"重复消息已聚合"

### 设置面板
- 齿轮图标触发设置面板
- 滑块调整数值参数
- 复选框控制布尔选项
- 快速预设按钮

### 状态指示器
- 显示聚合前后的消息数量对比
- 底部状态栏显示聚合统计

## 性能优化

### 内存管理
- 使用 Map 数据结构快速查找
- 及时清理过期的消息引用
- 避免深度复制大量数据

### 计算优化
- 使用 useMemo 缓存处理结果
- 只在日志或配置变化时重新计算
- 延迟处理非关键更新

## 测试覆盖

### 单元测试
- ✅ 时间窗口内消息聚合
- ✅ 时间窗口外消息分离
- ✅ 不同类型消息区分
- ✅ 格式化文本生成
- ✅ 连续消息合并
- ✅ 配置禁用处理

### 集成测试
- ✅ LogViewer 组件渲染
- ✅ 设置面板交互
- ✅ 实时配置更新

## 使用场景

### 游戏中的应用

1. **重复动作反馈**
   ```
   刮削器返回：有机废料。燃烧效率尚可。 (×5)
   ```

2. **系统状态更新**
   ```
   [SYSTEM] 氧气浓度：临界 (×3)
   ```

3. **错误消息聚合**
   ```
   警告：液压油粘度增加 (×7)
   ```

### 配置建议

- **新手玩家**：使用默认配置，平衡清晰度和信息量
- **经验玩家**：使用激进聚合，减少信息噪音
- **调试模式**：关闭聚合，查看所有原始消息
- **演示模式**：使用宽松聚合，保留更多细节

## 扩展性

### 添加新的聚合策略
```typescript
export class CustomLogMerger {
  static mergeByPattern(logs: LogEntry[], pattern: RegExp): LogEntry[] {
    // 自定义合并逻辑
  }
}
```

### 自定义格式化
```typescript
export class CustomFormatter {
  static formatCount(count: number): string {
    return count > 99 ? '99+' : `×${count}`;
  }
}
```

### 持久化配置
```typescript
// 保存到 localStorage
localStorage.setItem('logConfig', JSON.stringify(config));

// 从 localStorage 加载
const savedConfig = JSON.parse(localStorage.getItem('logConfig') || '{}');
```

## 最佳实践

1. **合理设置时间窗口**：根据游戏节奏调整，快节奏游戏使用较短窗口
2. **保留重要消息**：错误和警告消息应该有更宽松的聚合策略
3. **用户可控**：提供设置选项让玩家自定义体验
4. **性能监控**：在大量日志时监控处理性能
5. **测试覆盖**：确保各种边界情况都有测试覆盖

## 故障排除

### 常见问题

**Q: 聚合后消息丢失？**
A: 检查时间窗口设置，确保不会过度聚合重要消息。

**Q: 性能问题？**
A: 减少时间窗口大小，或者限制同时处理的日志数量。

**Q: 设置不生效？**
A: 确保使用了正确的配置对象，并且组件正确响应配置变化。

**Q: 测试失败？**
A: 检查时间戳生成和比较逻辑，确保测试环境的时间一致性。