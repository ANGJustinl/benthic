import React from 'react';
import { GameState, GameAction } from '../../types';
import {
  BasicResourcesPanel,
  ManualCrankButton,
  ScrubFiltersButton,
  FeedFurnaceButton,
  SonarPingButton,
  FullDiagnosticsButton,
  DamageControlPanel,
  ImpactBackgroundText,
  BuildingPanel
} from './components';

interface Chapter1UIProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

/**
 * 第一章UI - 基础组件
 * 这些组件会在所有后续章节中继续显示（叠加式）
 * 每个组件内部自己判断是否应该显示
 * 
 * 重要：放置类游戏的核心资源获取机制（滤芯、燃烧室）在后续章节必须继续可用！
 */
export function Chapter1UI({ state, dispatch }: Chapter1UIProps) {
  // 判断是否在第一章的特定阶段（非complete状态）
  const isInChapter1ActiveStage = state.chapter1Stage !== 'complete';
  
  return (
    <>
      {/* Impact阶段背景文字 */}
      {state.chapter1Stage === 'impact' && <ImpactBackgroundText />}

      {/* 基础资源面板 - 始终显示 */}
      <BasicResourcesPanel state={state} dispatch={dispatch} />

      {/* 手动摇柄 - 只在boot阶段显示 */}
      {state.chapter1Stage === 'boot' && (
        <ManualCrankButton state={state} dispatch={dispatch} />
      )}

      {/* 清理滤芯 - 解锁后永久显示（包括Phase 2+） */}
      {state.flags.filtersUnlocked && (
        <ScrubFiltersButton state={state} dispatch={dispatch} />
      )}

      {/* 燃烧室 - 解锁后永久显示（包括Phase 2+），只要有废料就显示 */}
      {state.flags.furnaceUnlocked && (
        <FeedFurnaceButton state={state} dispatch={dispatch} />
      )}

      {/* 建造面板 - 有光后显示，放置类游戏核心机制 */}
      <BuildingPanel state={state} dispatch={dispatch} />

      {/* 声呐 - 只在ghost阶段显示 */}
      {state.chapter1Stage === 'ghost' && (
        <>
          <SonarPingButton state={state} dispatch={dispatch} />
          <FullDiagnosticsButton state={state} dispatch={dispatch} />
        </>
      )}

      {/* 损伤控制 - 只在impact阶段显示 */}
      {state.chapter1Stage === 'impact' && (
        <DamageControlPanel state={state} dispatch={dispatch} />
      )}
    </>
  );
}
