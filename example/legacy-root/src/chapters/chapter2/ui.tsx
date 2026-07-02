import React from 'react';
import { GameState, GameAction } from '../../types';
import { Chapter2State } from './types';
import {
  Chapter2ResourcesPanel,
  AnalyzeSignalButton,
  ZoneManagementPanel,
  AssembleROVButton,
  DeployROVButton,
  ROVExplorationPanel,
  ProcessGhostDataButton,
  NetworkAwakenedPanel
} from './components';

interface Chapter2UIProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

/**
 * 第二章UI - 新增组件
 * 只包含第二章新增的组件，不重复第一章的组件
 * 这些组件会叠加在第一章组件之后显示
 */
export function Chapter2UI({ state, dispatch }: Chapter2UIProps) {
  const chapter2 = state.chapter2 as Chapter2State;
  
  if (!chapter2) {
    return null;
  }

  return (
    <>
      {/* 第二章资源面板 - 显示新增资源 */}
      <Chapter2ResourcesPanel state={state} dispatch={dispatch} />

      {/* 第二章操作面板 */}
      <div className="p-2 bg-gray-900/30 rounded border border-gray-800 space-y-2">
        {/* 信号分析 */}
        <AnalyzeSignalButton state={state} dispatch={dispatch} />

        {/* 区域管理 */}
        <ZoneManagementPanel state={state} dispatch={dispatch} />

        {/* ROV组装 */}
        <AssembleROVButton state={state} dispatch={dispatch} />

        {/* ROV部署 */}
        <DeployROVButton state={state} dispatch={dispatch} />

        {/* ROV探索 */}
        <ROVExplorationPanel state={state} dispatch={dispatch} />

        {/* 幽灵数据处理 */}
        <ProcessGhostDataButton state={state} dispatch={dispatch} />

        {/* 网络觉醒状态 */}
        <NetworkAwakenedPanel state={state} dispatch={dispatch} />
      </div>
    </>
  );
}
