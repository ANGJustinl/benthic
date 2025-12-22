import React, { useEffect, useRef } from 'react';
import { GameState, GameAction } from '../../types';
import { Chapter3State } from './types';
import {
  Chapter3OrganicResourcePanel,
  CoolantMetabolismButton,
  EmergencyReinforceButton,
  ContinueMoltButton,
  SingButton,
  FinalChoicePanel,
  EndingPanel,
  PoseidonAssimilatedPanel
} from './components';
import { ZoneManagementPanel } from '../chapter2/components';

interface Chapter3UIProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

/**
 * 第三章UI - 深渊的胎动
 * 
 * 核心设计：UI腐化 - 这不是叠加，而是**完全替换**
 * 第三章的UI会完全覆盖之前的章节UI
 * 旧的按钮被重新定义，旧的显示被有机化
 * 
 * 设计理念：
 * - 资源栏的异变：数字变得不稳定，显示有机化名称
 * - 按钮功能重定义：同一位置的按钮，文字和功能都变了
 * - 没有任何教程提示：玩家需要自己发现变化
 */
export function Chapter3UI({ state, dispatch }: Chapter3UIProps) {
  const chapter3 = state.chapter3 as Chapter3State;
  
  // 用于追踪已触发的序列，避免重复触发
  const triggeredSequences = useRef<Set<string>>(new Set());
  
  if (!chapter3) {
    return null;
  }

  // 自动触发序列的 useEffect
  useEffect(() => {
    // 1. 蜕皮警告：进入 molt 阶段且结构完整性为 100
    if (chapter3.chapter3Stage === 'molt' && 
        chapter3.structuralIntegrity === 100 && 
        !triggeredSequences.current.has('molt_warning')) {
      triggeredSequences.current.add('molt_warning');
      const timer = setTimeout(() => {
        dispatch({ type: 'CHAPTER3_ACTION', payload: { action: 'TRIGGER_MOLT_WARNING' } });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [chapter3.chapter3Stage, chapter3.structuralIntegrity, dispatch]);

  useEffect(() => {
    // 2. 外壳脱落：紧急加固失败后
    if (chapter3.emergencyReinforceAttempted && 
        chapter3.structuralIntegrity === 0 &&
        chapter3.carapaceDensity === 'softening' &&
        !triggeredSequences.current.has('shell_shed')) {
      triggeredSequences.current.add('shell_shed');
      const timer = setTimeout(() => {
        dispatch({ type: 'CHAPTER3_ACTION', payload: { action: 'TRIGGER_SHELL_SHED' } });
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [chapter3.emergencyReinforceAttempted, chapter3.structuralIntegrity, chapter3.carapaceDensity, dispatch]);

  useEffect(() => {
    // 3. 解释序列：蜕皮完成后
    if (chapter3.shellShed && 
        chapter3.mapOrganicized &&
        !chapter3.poseidonDetected &&
        !triggeredSequences.current.has('interpret')) {
      triggeredSequences.current.add('interpret');
      const timer = setTimeout(() => {
        dispatch({ type: 'CHAPTER3_ACTION', payload: { action: 'TRIGGER_INTERPRET' } });
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [chapter3.shellShed, chapter3.mapOrganicized, chapter3.poseidonDetected, dispatch]);

  useEffect(() => {
    // 4. 遭遇序列：解释序列后
    if (chapter3.shellShed && 
        chapter3.mapOrganicized &&
        !chapter3.poseidonDetected &&
        triggeredSequences.current.has('interpret') &&
        !triggeredSequences.current.has('encounter')) {
      triggeredSequences.current.add('encounter');
      const timer = setTimeout(() => {
        dispatch({ type: 'CHAPTER3_ACTION', payload: { action: 'TRIGGER_ENCOUNTER' } });
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [chapter3.shellShed, chapter3.mapOrganicized, chapter3.poseidonDetected, dispatch]);

  useEffect(() => {
    // 5. 波塞冬响应：歌唱后
    if (chapter3.hasSung && 
        !chapter3.poseidonAssimilated &&
        !triggeredSequences.current.has('poseidon_response')) {
      triggeredSequences.current.add('poseidon_response');
      const timer = setTimeout(() => {
        dispatch({ type: 'CHAPTER3_ACTION', payload: { action: 'TRIGGER_POSEIDON_RESPONSE' } });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [chapter3.hasSung, chapter3.poseidonAssimilated, dispatch]);

  useEffect(() => {
    // 6. 飞升提示：波塞冬同化后
    if (chapter3.poseidonAssimilated && 
        !chapter3.finalChoiceAvailable &&
        !triggeredSequences.current.has('ascension_prompt')) {
      triggeredSequences.current.add('ascension_prompt');
      const timer = setTimeout(() => {
        dispatch({ type: 'CHAPTER3_ACTION', payload: { action: 'TRIGGER_ASCENSION_PROMPT' } });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [chapter3.poseidonAssimilated, chapter3.finalChoiceAvailable, dispatch]);

  useEffect(() => {
    // 7. 尾声：选择结局后（延迟更长，让用户看完结局文字）
    if (chapter3.chosenEnding && 
        chapter3.chapter3Stage !== 'complete' &&
        !triggeredSequences.current.has('epilogue')) {
      triggeredSequences.current.add('epilogue');
      const timer = setTimeout(() => {
        dispatch({ type: 'CHAPTER3_ACTION', payload: { action: 'TRIGGER_EPILOGUE' } });
      }, 12000); // 12秒后触发尾声，给用户足够时间阅读结局
      return () => clearTimeout(timer);
    }
  }, [chapter3.chosenEnding, chapter3.chapter3Stage, dispatch]);

  useEffect(() => {
    // 8. 最终黑屏：尾声显示后再延迟显示黑屏
    if (chapter3.chapter3Stage === 'ascension' && 
        chapter3.chosenEnding &&
        triggeredSequences.current.has('epilogue') &&
        !triggeredSequences.current.has('final_blackout')) {
      triggeredSequences.current.add('final_blackout');
      const timer = setTimeout(() => {
        dispatch({ type: 'CHAPTER3_ACTION', payload: { action: 'COMPLETE_CHAPTER3' } });
      }, 8000); // 尾声后再等8秒才显示黑屏
      return () => clearTimeout(timer);
    }
  }, [chapter3.chapter3Stage, chapter3.chosenEnding, dispatch]);

  const isComplete = chapter3.chapter3Stage === 'complete';
  const corruptionLevel = chapter3.uiCorruptionLevel || 0;

  // 游戏完成后只显示结局 - 带淡入动画
  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 animate-fade-in-slow">
        <div className="text-center animate-fade-in-delayed">
          <div className="text-6xl text-red-500 animate-pulse mb-8">
            ♥
          </div>
          <p className="text-gray-600 font-mono text-sm opacity-0 animate-fade-in-text-1">System Halted.</p>
          <p className="text-red-400 font-mono text-sm mt-2 opacity-0 animate-fade-in-text-2">Life Initiated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 transition-all duration-1000 ${
      corruptionLevel > 70 ? 'animate-pulse-slow' : ''
    }`}>
      {/* 有机化资源面板 - 替换之前所有的资源显示 */}
      <Chapter3OrganicResourcePanel state={state} dispatch={dispatch} />

      {/* 操作面板 */}
      <div className={`p-3 rounded border space-y-2 transition-all duration-1000 ${
        corruptionLevel > 50 
          ? 'bg-red-900/20 border-red-800' 
          : 'bg-gray-900/30 border-gray-800'
      }`}>
        {/* 阶段 I: 高烧 - 冷却液/代谢按钮（替换原来的冷却功能） */}
        <CoolantMetabolismButton state={state} dispatch={dispatch} />

        {/* 阶段 II: 蜕皮 - 紧急加固按钮（会失败） */}
        <EmergencyReinforceButton state={state} dispatch={dispatch} />
        
        {/* 阶段 II: 蜕皮 - 继续蜕变 */}
        <ContinueMoltButton state={state} dispatch={dispatch} />

        {/* 继承第二章的区域面板 - 有机化显示 */}
        {chapter3.mapOrganicized && (
          <ZoneManagementPanel state={state} dispatch={dispatch} />
        )}

        {/* 阶段 III: 遭遇 - 歌唱按钮（唯一选择） */}
        <SingButton state={state} dispatch={dispatch} />
        
        {/* 波塞冬同化状态 */}
        <PoseidonAssimilatedPanel state={state} dispatch={dispatch} />

        {/* 阶段 IV: 飞升 - 最终选择 */}
        <FinalChoicePanel state={state} dispatch={dispatch} />

        {/* 结局显示 */}
        <EndingPanel state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}
