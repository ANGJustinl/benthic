# 章节系统 (Chapter System)

## 概述

章节系统将游戏的不同章节逻辑分离到独立的模块中，使代码更加模块化和易于维护。

## 目录结构

```
src/chapters/
├── index.ts              # 章节系统主导出
├── types.ts              # 章节系统类型定义
├── README.md             # 本文档
└── chapter1/             # 第一章模块
    ├── index.ts          # 第一章导出
    ├── types.ts          # 第一章类型
    ├── constants.ts      # 第一章常量（故事文本等）
    ├── actions.ts        # 第一章动作处理器
    ├── ui.tsx            # 第一章UI组件
    └── handler.ts        # 第一章主处理器
```

## 章节模块结构

每个章节模块包含以下部分：

### 1. Types (`types.ts`)
定义章节特定的类型，如阶段、状态、标志等。

```typescript
export type Chapter1Stage = 'boot' | 'crank' | 'rust' | 'ghost' | 'impact' | 'complete';

export interface Chapter1State {
  stage: Chapter1Stage;
  coreTemperature: number;
  power: number;
  // ...
}
```

### 2. Constants (`constants.ts`)
包含章节特定的常量，主要是故事文本。

```typescript
export const CHAPTER1_STORY_EVENTS = {
  NEURAL_INTERFACE: "检测到神经接口接入...",
  // ...
};
```

### 3. Actions (`actions.ts`)
处理章节特定的游戏动作。

```typescript
export class Chapter1Actions {
  static handleManualCrank(state: GameState): GameState {
    // 处理手动摇柄动作
  }
  
  static handleScrubFilters(state: GameState): GameState {
    // 处理清理过滤器动作
  }
  // ...
}
```

### 4. UI (`ui.tsx`)
渲染章节特定的UI组件。

```typescript
export class Chapter1UI {
  static renderControlPanelActions(state: GameState, dispatch: Dispatch): ReactNode[] {
    // 返回控制面板按钮数组
  }
  
  static renderResourceDisplay(state: GameState): ReactNode[] {
    // 返回资源显示组件数组
  }
  
  static renderBackgroundEffects(state: GameState): ReactNode {
    // 返回背景效果
  }
}
```

### 5. Handler (`handler.ts`)
章节的主处理器，实现 `ChapterHandler` 接口。

```typescript
export class Chapter1Handler implements ChapterHandler {
  shouldHandle(state: GameState): boolean {
    return state.phase === 1;
  }

  handleAction(state: GameState, action: GameAction): GameState | null {
    // 根据动作类型调用相应的处理器
  }

  getControlPanelActions(state: GameState): ReactNode[] {
    return Chapter1UI.renderControlPanelActions(state, dispatch);
  }

  getResourceDisplay(state: GameState): ReactNode[] {
    return Chapter1UI.renderResourceDisplay(state);
  }
}
```

## 使用章节系统

### 在 useGameEngine 中集成

```typescript
import { ChapterManager } from '../chapters';

const chapterManager = new ChapterManager();

function gameReducer(state: GameState, action: GameAction): GameState {
  // 首先尝试让章节系统处理动作
  const chapterResult = chapterManager.handleAction(state, action);
  if (chapterResult !== null) {
    return chapterResult;
  }

  // 如果章节系统没有处理，使用通用逻辑
  switch (action.type) {
    case 'TICK':
      // ...
    case 'BUILD':
      // ...
    // ...
  }
}
```

### 在 ControlPanel 中使用

```typescript
import { ChapterManager } from '../chapters';

const chapterManager = new ChapterManager();

export const ControlPanel: React.FC<Props> = ({ state, dispatch }) => {
  // 获取章节特定的动作按钮
  const chapterActions = chapterManager.getControlPanelActions(state, dispatch);

  return (
    <div>
      {/* 渲染章节特定的按钮 */}
      {chapterActions}
      
      {/* 渲染通用按钮 */}
      {/* ... */}
    </div>
  );
};
```

### 在 ResourcePanel 中使用

```typescript
import { ChapterManager } from '../chapters';

const chapterManager = new ChapterManager();

export const ResourcePanel: React.FC<Props> = ({ state }) => {
  // 获取章节特定的资源显示
  const chapterDisplay = chapterManager.getResourceDisplay(state);

  return (
    <div>
      {/* 渲染章节特定的资源显示 */}
      {chapterDisplay}
      
      {/* 渲染通用资源显示 */}
      {/* ... */}
    </div>
  );
};
```

## 添加新章节

要添加新章节，按照以下步骤：

1. 创建新的章节目录：`src/chapters/chapter2/`

2. 创建必要的文件：
   - `types.ts` - 章节类型
   - `constants.ts` - 章节常量
   - `actions.ts` - 动作处理器
   - `ui.tsx` - UI组件
   - `handler.ts` - 主处理器
   - `index.ts` - 导出

3. 在 `src/chapters/index.ts` 中注册新章节：

```typescript
import { Chapter2Handler } from './chapter2';

export const CHAPTER_HANDLERS: ChapterHandler[] = [
  new Chapter1Handler(),
  new Chapter2Handler(), // 添加新章节
];
```

## 优势

1. **模块化**：每个章节的逻辑独立，易于维护
2. **可扩展**：添加新章节不影响现有代码
3. **清晰的职责分离**：动作处理、UI渲染、常量管理分离
4. **类型安全**：TypeScript 提供完整的类型检查
5. **易于测试**：每个模块可以独立测试

## 迁移策略

当前代码已经创建了章节系统的基础结构，但还没有完全集成到主游戏引擎中。

建议的迁移步骤：

1. ✅ 创建章节系统结构（已完成）
2. ✅ 将第一章逻辑提取到独立模块（已完成）
3. ⏳ 在 useGameEngine 中集成章节管理器
4. ⏳ 在 ControlPanel 中使用章节UI
5. ⏳ 在 ResourcePanel 中使用章节显示
6. ⏳ 测试并验证功能
7. ⏳ 逐步迁移其他章节

## 注意事项

- 章节系统与现有代码可以共存
- 可以逐步迁移，不需要一次性重构
- 保持向后兼容性，确保游戏功能正常
