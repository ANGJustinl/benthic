import React from 'react';
import { GameState, GameAction, ResourceType } from '../../types';
import { Chapter3State } from './types';
import { ENDINGS } from './constants';

interface ComponentProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

// 第三章有机化资源面板 - 完全替换之前的资源显示
export function Chapter3OrganicResourcePanel({ state }: ComponentProps) {
  const chapter3 = state.chapter3 as Chapter3State;
  
  if (!chapter3) return null;
  
  const corruptionLevel = chapter3.uiCorruptionLevel || 0;
  const isHighCorruption = corruptionLevel > 50;
  
  return (
    <div className={`p-3 rounded border transition-all duration-1000 ${
      isHighCorruption 
        ? 'bg-red-900/20 border-red-800' 
        : 'bg-gray-900/30 border-gray-800'
    }`}>
      <div className="space-y-2 text-xs font-mono">
        {/* 有机化温度显示 - 从"核心温度"变为"核心体温" */}
        <div className="flex justify-between items-center">
          <span className={isHighCorruption ? 'text-red-400' : 'text-gray-500'}>
            {isHighCorruption ? '核心体温:' : '核心温度:'}
          </span>
          <span className={isHighCorruption ? 'text-red-300' : 'text-orange-400'}>
            {chapter3.coreTemperatureOrganic?.toFixed(1) || '38.5'}°C 
            <span className="text-[10px] ml-1 opacity-70">
              {isHighCorruption ? '(状态：舒适)' : '(警告：过热)'}
            </span>
          </span>
        </div>
        
        {/* 神经电压 - 从"电力"变为"神经电压" */}
        <div className="flex justify-between items-center">
          <span className={isHighCorruption ? 'text-purple-400' : 'text-gray-500'}>
            {isHighCorruption ? '神经电压:' : '电力:'}
          </span>
          <span className={isHighCorruption ? 'text-purple-300 animate-pulse' : 'text-yellow-400'}>
            {isHighCorruption ? '高频脉冲中' : `${state.power || 0}`}
          </span>
        </div>
        
        {/* 生物质 - 从"生物质"变为"养分" */}
        <div className="flex justify-between items-center">
          <span className={isHighCorruption ? 'text-green-400' : 'text-gray-500'}>
            {isHighCorruption ? '养分储备:' : '生物质:'}
          </span>
          <span className={isHighCorruption ? 'text-green-300' : 'text-green-400'}>
            {isHighCorruption ? '∞' : state.resources[ResourceType.BIOMASS].toFixed(0)}
          </span>
        </div>
        
        {/* 甲壳硬度 - 蜕皮阶段显示 */}
        {(chapter3.chapter3Stage === 'molt' || chapter3.shellShed) && (
          <div className="flex justify-between items-center pt-1 border-t border-gray-800">
            <span className="text-amber-400">甲壳硬度:</span>
            <span className={`${
              chapter3.carapaceDensity === 'complete' 
                ? 'text-green-400' 
                : 'text-amber-300 animate-pulse'
            }`}>
              {chapter3.carapaceDensity === 'softening' && '软化期'}
              {chapter3.carapaceDensity === 'hardening' && '硬化中'}
              {chapter3.carapaceDensity === 'complete' && '完成'}
            </span>
          </div>
        )}
        
        {/* 结构完整性 - 蜕皮前显示，会降到0 */}
        {chapter3.chapter3Stage === 'molt' && !chapter3.emergencyReinforceAttempted && (
          <div className="flex justify-between items-center">
            <span className="text-red-400 animate-pulse">结构完整性:</span>
            <span className="text-red-300 animate-pulse">
              {chapter3.structuralIntegrity}% (危险!)
            </span>
          </div>
        )}
        
        {/* UI腐化进度条 */}
        <div className="flex justify-between items-center pt-1 border-t border-gray-800">
          <span className="text-gray-600 text-[10px]">界面同化:</span>
          <div className="w-20 h-1.5 bg-gray-800 rounded overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-600 via-amber-600 to-red-600 transition-all duration-1000"
              style={{ width: `${corruptionLevel}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 冷却液注入 / 促进代谢 按钮
export function CoolantMetabolismButton({ state, dispatch }: ComponentProps) {
  const chapter3 = state.chapter3 as Chapter3State;
  
  if (!chapter3 || chapter3.chapter3Stage !== 'fever') return null;
  
  const isTransformed = chapter3.coolantInjected;
  
  return (
    <button
      onClick={() => dispatch({ 
        type: 'CHAPTER3_ACTION', 
        payload: { 
          action: isTransformed ? 'ACCELERATE_METABOLISM' : 'INJECT_COOLANT' 
        } 
      })}
      className={`
        w-full px-3 py-2 text-sm font-mono rounded border transition-all duration-500
        ${isTransformed
          ? 'bg-red-900/40 hover:bg-red-800/50 text-red-300 border-red-700 animate-pulse'
          : 'bg-cyan-900/30 hover:bg-cyan-800/40 text-cyan-300 border-cyan-800'
        }
      `}
    >
      {isTransformed 
        ? '[ 促进代谢 (Accelerate Metabolism) ]' 
        : '[ 注入冷却液 ]'
      }
    </button>
  );
}

// 紧急加固按钮 - 蜕皮阶段
export function EmergencyReinforceButton({ state, dispatch }: ComponentProps) {
  const chapter3 = state.chapter3 as Chapter3State;
  
  if (!chapter3 || chapter3.chapter3Stage !== 'molt') return null;
  if (chapter3.emergencyReinforceAttempted) return null;
  
  return (
    <button
      onClick={() => dispatch({ 
        type: 'CHAPTER3_ACTION', 
        payload: { action: 'EMERGENCY_REINFORCE' } 
      })}
      className="w-full px-3 py-2 bg-yellow-900/30 hover:bg-yellow-800/40 text-yellow-300 rounded border border-yellow-800 transition-colors font-mono text-sm animate-pulse"
    >
      [ 紧急加固 ]
    </button>
  );
}

// 继续蜕皮按钮
export function ContinueMoltButton({ state, dispatch }: ComponentProps) {
  const chapter3 = state.chapter3 as Chapter3State;
  
  if (!chapter3 || chapter3.chapter3Stage !== 'molt') return null;
  if (!chapter3.emergencyReinforceAttempted || chapter3.shellShed) return null;
  
  return (
    <button
      onClick={() => dispatch({ 
        type: 'CHAPTER3_ACTION', 
        payload: { action: 'CONTINUE_MOLT' } 
      })}
      className="w-full px-3 py-2 bg-amber-900/40 hover:bg-amber-800/50 text-amber-300 rounded border border-amber-700 transition-colors font-mono text-sm"
    >
      {chapter3.carapaceDensity === 'softening' && '[ 等待硬化... ]'}
      {chapter3.carapaceDensity === 'hardening' && '[ 完成蜕变 ]'}
    </button>
  );
}



// 歌唱按钮 - 遭遇阶段
export function SingButton({ state, dispatch }: ComponentProps) {
  const chapter3 = state.chapter3 as Chapter3State;
  
  if (!chapter3 || chapter3.chapter3Stage !== 'encounter') return null;
  if (!chapter3.poseidonDetected || chapter3.hasSung) return null;
  
  return (
    <div className="space-y-2">
      {/* 威胁提示 */}
      <div className="p-2 bg-red-900/30 border border-red-700 rounded animate-pulse">
        <p className="text-xs text-red-300 font-mono">
          [THREAT] 波塞冬号核潜艇 - 武器锁定中
        </p>
      </div>
      
      {/* 歌唱按钮 - 唯一的选择 */}
      <button
        onClick={() => dispatch({ 
          type: 'CHAPTER3_ACTION', 
          payload: { action: 'SING' } 
        })}
        className="w-full px-4 py-3 bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 rounded border border-purple-600 transition-all duration-300 font-mono text-lg animate-pulse"
        style={{
          animation: 'pulse 1.5s ease-in-out infinite',
          boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)'
        }}
      >
        ♪ [ 歌唱 (Sing) ] ♪
      </button>
    </div>
  );
}

// 最终选择面板 - 飞升阶段
export function FinalChoicePanel({ state, dispatch }: ComponentProps) {
  const chapter3 = state.chapter3 as Chapter3State;
  
  if (!chapter3 || chapter3.chapter3Stage !== 'ascension') return null;
  if (!chapter3.finalChoiceAvailable || chapter3.chosenEnding) return null;
  
  const handleChoice = (ending: 'deep' | 'spore' | 'beacon') => {
    dispatch({ 
      type: 'CHAPTER3_ACTION', 
      payload: { action: 'CHOOSE_ENDING', ending } 
    });
  };
  
  return (
    <div className="space-y-3 p-3 bg-black/50 border border-red-900 rounded">
      <p className="text-center text-red-300 font-mono text-sm mb-4">
        下一步指令？
      </p>
      
      {/* 选项 A: 潜渊 */}
      <button
        onClick={() => handleChoice('deep')}
        className="w-full px-3 py-3 bg-gray-900/50 hover:bg-gray-800/60 text-gray-200 rounded border border-gray-700 hover:border-gray-500 transition-all font-mono text-sm text-left"
      >
        <div className="font-bold text-blue-400 mb-1">
          [ 潜渊 (The Deep) ]
        </div>
        <div className="text-xs text-gray-400">
          {ENDINGS.deep.description}
        </div>
      </button>
      
      {/* 选项 B: 播种 */}
      <button
        onClick={() => handleChoice('spore')}
        className="w-full px-3 py-3 bg-gray-900/50 hover:bg-gray-800/60 text-gray-200 rounded border border-gray-700 hover:border-gray-500 transition-all font-mono text-sm text-left"
      >
        <div className="font-bold text-green-400 mb-1">
          [ 播种 (The Spore) ]
        </div>
        <div className="text-xs text-gray-400">
          {ENDINGS.spore.description}
        </div>
      </button>
      
      {/* 选项 C: 灯塔 */}
      <button
        onClick={() => handleChoice('beacon')}
        className="w-full px-3 py-3 bg-gray-900/50 hover:bg-gray-800/60 text-gray-200 rounded border border-gray-700 hover:border-gray-500 transition-all font-mono text-sm text-left"
      >
        <div className="font-bold text-yellow-400 mb-1">
          [ 灯塔 (The Beacon) ]
        </div>
        <div className="text-xs text-gray-400">
          {ENDINGS.beacon.description}
        </div>
      </button>
    </div>
  );
}

// 结局显示面板
export function EndingPanel({ state }: ComponentProps) {
  const chapter3 = state.chapter3 as Chapter3State;
  
  if (!chapter3 || !chapter3.chosenEnding) return null;
  
  const ending = ENDINGS[chapter3.chosenEnding];
  
  return (
    <div className="p-4 bg-black border border-red-900 rounded text-center">
      <div className="mb-4">
        <p className="text-2xl text-red-400 font-bold mb-1">
          {ending.titleChinese}
        </p>
        <p className="text-sm text-gray-500">
          {ending.title}
        </p>
        <p className="text-xs text-red-600 mt-2">
          ({ending.subtitle})
        </p>
      </div>
      
      {/* 心跳符号 */}
      <div className="mt-6 text-4xl text-red-500 animate-pulse">
        ♥
      </div>
      
      <div className="mt-4 space-y-1 text-xs font-mono">
        <p className="text-gray-600">System Halted.</p>
        <p className="text-red-400">Life Initiated.</p>
      </div>
    </div>
  );
}

// 波塞冬同化状态
export function PoseidonAssimilatedPanel({ state }: ComponentProps) {
  const chapter3 = state.chapter3 as Chapter3State;
  
  if (!chapter3 || !chapter3.poseidonAssimilated || chapter3.chosenEnding) return null;
  
  return (
    <div className="p-2 bg-purple-900/20 border border-purple-800 rounded">
      <div className="text-xs text-purple-300 font-mono space-y-0.5">
        <p className="font-bold">新成员已接纳</p>
        <p>波塞冬号 - 已同化</p>
        <p className="text-purple-400">等待最终指令...</p>
      </div>
    </div>
  );
}
