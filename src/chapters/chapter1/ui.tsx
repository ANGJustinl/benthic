import React from 'react';
import { GameState, GameAction } from '../../types';

interface Chapter1UIProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export class Chapter1UI {
  static renderControlPanelActions(state: GameState, dispatch: React.Dispatch<GameAction>): React.ReactNode[] {
    const actions: React.ReactNode[] = [];
    const now = Date.now();
    const crankCooldown = Math.max(0, 1000 - (now - state.lastCrankTime));
    const isCrankCoolingDown = crankCooldown > 0;

    // Stage I: Boot - Manual Crank
    if (state.chapter1Stage === 'boot') {
      actions.push(
        <button
          key="manual-crank"
          onClick={() => dispatch({ type: 'MANUAL_CRANK' })}
          disabled={isCrankCoolingDown}
          className={`
            w-full py-6 text-xl font-bold tracking-widest border-2 transition-all duration-100 relative overflow-hidden
            ${isCrankCoolingDown ? 'opacity-50 cursor-not-allowed border-gray-800' : 'active:scale-95'}
            ${state.flags.oxygenCrisis 
                ? 'border-red-600 text-red-400 animate-pulse bg-red-900/20' 
                : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
            } font-mono
          `}
        >
          {isCrankCoolingDown && (
              <div className="absolute inset-0 bg-gray-800/50 origin-left transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${crankCooldown/1000})` }} />
          )}
          <span className="relative z-10">
            [ 手动摇柄：应急进气阀 ]
          </span>
        </button>
      );
    }

    // Stage II: Rust Lung - Filter and Furnace
    if (state.chapter1Stage === 'rust') {
      actions.push(
        <button
          key="scrub-filters"
          onClick={() => dispatch({ type: 'SCRUB_FILTERS' })}
          className="w-full py-3 text-sm font-bold tracking-wider border border-cyan-900 text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 hover:bg-cyan-900/10 font-mono transition-all duration-200"
        >
          [ 清理滤芯 (Scrub Filters) ]
        </button>
      );

      if (state.filterWaste > 0) {
        actions.push(
          <button
            key="feed-furnace"
            onClick={() => dispatch({ type: 'FEED_FURNACE' })}
            disabled={state.filterWaste < 1}
            className="w-full py-3 text-sm font-bold tracking-wider border border-orange-900 text-orange-700 hover:text-orange-500 hover:border-orange-500 hover:bg-orange-900/10 font-mono transition-all duration-200"
          >
            [ 填装燃烧室 (Feed Furnace) ]
          </button>
        );
      }
    }

    // Stage III: Ghost - Sonar Operations
    if (state.chapter1Stage === 'ghost') {
      actions.push(
        <button
          key="sonar-ping"
          onClick={() => dispatch({ type: 'SONAR_PING' })}
          disabled={state.power < 20}
          className={`
            w-full py-3 text-sm font-bold tracking-wider border transition-all duration-200 font-mono
            ${state.power >= 20 
                ? 'border-green-900 text-green-700 hover:text-green-500 hover:border-green-500 hover:bg-green-900/10' 
                : 'border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
            }
          `}
        >
          [ 发送主动脉冲 (Ping) ] - 消耗 20 电力
        </button>
      );

      if (state.sonarPings >= 3) {
        actions.push(
          <button
            key="full-diagnostics"
            onClick={() => dispatch({ type: 'FULL_DIAGNOSTICS' })}
            className="w-full py-3 text-sm border border-yellow-900 text-yellow-600 hover:bg-yellow-900/20 hover:text-yellow-300 font-mono animate-pulse"
          >
            [ 全船诊断 (Full Diagnostics) ]
          </button>
        );
      }
    }

    // Stage IV: Impact - Damage Control
    if (state.chapter1Stage === 'impact' && state.flags.damageControlActive) {
      actions.push(
        <div key="damage-control" className="space-y-3">
          <div className="text-center text-red-400 font-mono text-sm mb-4">
            舱体压溃倒计时：{Math.floor(state.damageControlTimer / 60)}:{(state.damageControlTimer % 60).toString().padStart(2, '0')}
          </div>
          
          <button
            onClick={() => dispatch({ type: 'DAMAGE_CONTROL', payload: { action: 'seal_a' } })}
            className="w-full py-2 text-sm border border-blue-900 text-blue-600 hover:bg-blue-900/20 hover:text-blue-300 font-mono"
          >
            [ 封闭隔舱 A ]
          </button>
          
          <button
            onClick={() => dispatch({ type: 'DAMAGE_CONTROL', payload: { action: 'seal_b' } })}
            className="w-full py-2 text-sm border border-blue-900 text-blue-600 hover:bg-blue-900/20 hover:text-blue-300 font-mono"
          >
            [ 封闭隔舱 B ]
          </button>
          
          <button
            onClick={() => dispatch({ type: 'DAMAGE_CONTROL', payload: { action: 'pump' } })}
            className="w-full py-2 text-sm border border-yellow-900 text-yellow-600 hover:bg-yellow-900/20 hover:text-yellow-300 font-mono"
          >
            [ 超频排水泵 ]
          </button>
          
          <button
            onClick={() => dispatch({ type: 'DAMAGE_CONTROL', payload: { action: 'hardener' } })}
            className="w-full py-2 text-sm border border-green-900 text-green-600 hover:bg-green-900/20 hover:text-green-300 font-mono"
          >
            [ 释放快速硬化剂 ]
          </button>
        </div>
      );
    }

    return actions;
  }

  static renderResourceDisplay(state: GameState): React.ReactNode[] {
    const displays: React.ReactNode[] = [];

    // Oxygen Status
    displays.push(
      <div key="oxygen-status" className="mb-4">
        <div className="flex justify-between text-xs mb-1 font-mono">
          <span className="text-term-green">氧气浓度</span>
          <span className={`${state.resources.oxygen < 10 ? 'text-red-500 animate-pulse font-bold' : 'text-gray-400'}`}>
            {state.resources.oxygen < 10 ? 'CRITICAL' : `${Math.floor(state.resources.oxygen)}%`}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-900 rounded overflow-hidden border border-gray-800">
          <div 
            className={`h-full transition-all duration-500 ${state.resources.oxygen < 10 ? 'bg-red-600 animate-pulse' : 'bg-cyan-600'}`} 
            style={{ width: `${Math.min(100, (state.resources.oxygen / state.maxOxygen) * 100)}%` }}
          />
        </div>
      </div>
    );

    // Core Temperature (shown after rust stage)
    if (state.chapter1Stage !== 'boot') {
      displays.push(
        <div key="core-temperature" className="mb-4">
          <div className="flex justify-between text-xs mb-1 font-mono">
            <span className="text-term-green">核心温度</span>
            <span className={`${state.coreTemperature < 5 ? 'text-blue-400' : (state.coreTemperature >= 20 ? 'text-green-400' : 'text-gray-400')}`}>
              {Math.floor(state.coreTemperature)}°C
            </span>
          </div>
          <div className="w-full h-2 bg-gray-900 rounded overflow-hidden border border-gray-800">
            <div 
              className={`h-full transition-all duration-500 ${state.coreTemperature < 5 ? 'bg-blue-600' : (state.coreTemperature >= 20 ? 'bg-green-600' : 'bg-yellow-600')}`} 
              style={{ width: `${Math.min(100, (state.coreTemperature / 30) * 100)}%` }}
            />
          </div>
        </div>
      );
    }

    // Power (shown after rust stage)
    if (state.chapter1Stage !== 'boot') {
      displays.push(
        <div key="power" className="flex justify-between items-center text-sm font-mono border-b border-gray-900 pb-1">
          <span className="text-gray-400">电力</span>
          <span className="text-term-green">{Math.floor(state.power)}</span>
        </div>
      );
    }

    // Filter Waste (shown during rust stage)
    if (state.chapter1Stage === 'rust' && state.filterWaste > 0) {
      displays.push(
        <div key="filter-waste" className="flex justify-between items-center text-sm font-mono border-b border-gray-900 pb-1">
          <span className="text-gray-400">过滤网残渣</span>
          <span className="text-term-green">{Math.floor(state.filterWaste)} kg</span>
        </div>
      );
    }

    // Hull Integrity (shown during impact)
    if (state.chapter1Stage === 'impact') {
      displays.push(
        <div key="hull-integrity" className="mb-4">
          <div className="flex justify-between text-xs mb-1 font-mono">
            <span className="text-term-green">外壳完整性</span>
            <span className={`${state.hullIntegrity < 60 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
              {Math.floor(state.hullIntegrity)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-900 rounded overflow-hidden border border-gray-800">
            <div 
              className={`h-full transition-all duration-500 ${state.hullIntegrity < 60 ? 'bg-red-600' : 'bg-green-600'}`} 
              style={{ width: `${state.hullIntegrity}%` }}
            />
          </div>
        </div>
      );
    }

    // Sonar Pings (shown during ghost stage)
    if (state.chapter1Stage === 'ghost') {
      displays.push(
        <div key="sonar-pings" className="flex justify-between items-center text-sm font-mono border-b border-gray-900 pb-1">
          <span className="text-gray-400">声呐脉冲</span>
          <span className="text-term-green">{state.sonarPings}/3</span>
        </div>
      );
    }

    return displays;
  }

  static renderBackgroundEffects(state: GameState): React.ReactNode {
    // Chapter 1 Impact Phase Background Text
    if (state.chapter1Stage === 'impact') {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="animate-pulse text-red-900 text-xs font-mono absolute top-4 left-4">HULL_BREACH_DETECTED</div>
          <div className="animate-pulse text-red-900 text-xs font-mono absolute top-8 right-8">PRESSURE_CRITICAL</div>
          <div className="animate-pulse text-red-900 text-xs font-mono absolute bottom-12 left-8">STRUCTURAL_INTEGRITY</div>
          <div className="animate-pulse text-red-900 text-xs font-mono absolute bottom-4 right-4">BRACE FOR IMPACT</div>
          <div className="animate-pulse text-red-900 text-xs font-mono absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">CRITICAL</div>
        </div>
      );
    }

    return null;
  }

  static renderStageIndicator(state: GameState): React.ReactNode {
    return (
      <div className="mt-6 pt-4 border-t border-gray-900">
        <div className="text-xs text-gray-600 font-mono">
          Stage: {state.chapter1Stage?.toUpperCase() || 'UNKNOWN'}
        </div>
        {state.chapter1Stage === 'impact' && state.flags.damageControlActive && (
          <div className="text-xs text-red-500 font-mono animate-pulse mt-1">
            DAMAGE CONTROL ACTIVE
          </div>
        )}
        {state.flags.overheated && (
          <div className="text-xs text-yellow-500 font-mono mt-1">
            OVERHEAT WARNING
          </div>
        )}
      </div>
    );
  }
}