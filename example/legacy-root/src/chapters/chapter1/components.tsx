import React from 'react';
import { GameState, GameAction, BuildingType, ResourceType } from '../../types';
import { COSTS, SCALING_FACTOR } from '../../constants';

interface ComponentProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

// 基础资源面板
export function BasicResourcesPanel({ state }: ComponentProps) {
  return (
    <div className="p-2 bg-gray-900/30 rounded border border-gray-800">
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-gray-500">电力:</span>
          <span className="text-yellow-400">{state.power}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">废料:</span>
          <span className="text-gray-300">{state.filterWaste.toFixed(1)}kg</span>
        </div>
      </div>
    </div>
  );
}

// 手动摇柄按钮
export function ManualCrankButton({ state, dispatch }: ComponentProps) {
  const now = Date.now();
  const crankCooldown = Math.max(0, 1000 - (now - state.lastCrankTime));
  const isCrankCoolingDown = crankCooldown > 0;

  return (
    <button
      onClick={() => dispatch({ type: 'MANUAL_CRANK' })}
      disabled={isCrankCoolingDown || state.flags.overheated}
      className={`
        w-full py-6 text-xl font-bold tracking-widest border-2 transition-all duration-100 relative overflow-hidden
        ${isCrankCoolingDown || state.flags.overheated ? 'opacity-50 cursor-not-allowed border-gray-800' : 'active:scale-95'}
        ${state.flags.oxygenCrisis 
            ? 'border-red-600 text-red-400 animate-pulse bg-red-900/20' 
            : state.flags.overheated
            ? 'border-orange-600 text-orange-400 bg-orange-900/20'
            : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
        } font-mono
      `}
    >
      {isCrankCoolingDown && (
        <div className="absolute inset-0 bg-gray-800/50 origin-left transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${crankCooldown/1000})` }} />
      )}
      <span className="relative z-10">
        {state.flags.overheated ? '[ 系统过热 - 冷却中 ]' : '[ 手动摇柄：应急进气阀 ]'}
      </span>
    </button>
  );
}

// 清理滤芯按钮
export function ScrubFiltersButton({ state, dispatch }: ComponentProps) {
  const now = Date.now();
  const filterCooldown = Math.max(0, 2000 - (now - state.lastFilterTime));
  const isFilterCoolingDown = filterCooldown > 0;

  return (
    <button
      onClick={() => dispatch({ type: 'SCRUB_FILTERS' })}
      disabled={isFilterCoolingDown}
      className={`
        w-full py-3 text-sm font-bold tracking-wider border transition-all duration-200 font-mono relative overflow-hidden
        ${isFilterCoolingDown 
          ? 'opacity-50 cursor-not-allowed border-gray-800' 
          : 'border-cyan-900 text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 hover:bg-cyan-900/10'
        }
      `}
    >
      {isFilterCoolingDown && (
        <div className="absolute inset-0 bg-gray-800/50 origin-left transition-transform duration-100 ease-linear" style={{ transform: `scaleX(${filterCooldown/2000})` }} />
      )}
      <span className="relative z-10">
        [ 清理滤芯 (Scrub Filters) ]
        {isFilterCoolingDown && ` - ${Math.ceil(filterCooldown/1000)}s`}
      </span>
    </button>
  );
}

// 燃烧室按钮
export function FeedFurnaceButton({ state, dispatch }: ComponentProps) {
  const now = Date.now();
  const furnaceCooldown = Math.max(0, 3000 - (now - state.lastFurnaceTime));
  const isFurnaceCoolingDown = furnaceCooldown > 0;

  // 只要解锁了就显示，即使没有废料也显示（但禁用）
  if (!state.flags.furnaceUnlocked) {
    return null;
  }

  const hasEnoughWaste = state.filterWaste >= 1;

  return (
    <button
      onClick={() => dispatch({ type: 'FEED_FURNACE' })}
      disabled={!hasEnoughWaste || isFurnaceCoolingDown}
      className={`
        w-full py-3 text-sm font-bold tracking-wider border transition-all duration-200 font-mono relative overflow-hidden
        ${!hasEnoughWaste || isFurnaceCoolingDown
          ? 'opacity-50 cursor-not-allowed border-gray-800'
          : 'border-orange-900 text-orange-700 hover:text-orange-500 hover:border-orange-500 hover:bg-orange-900/10'
        }
      `}
    >
      {isFurnaceCoolingDown && (
        <div className="absolute inset-0 bg-gray-800/50 origin-left transition-transform duration-100 ease-linear" style={{ transform: `scaleX(${furnaceCooldown/3000})` }} />
      )}
      <span className="relative z-10">
        [ 填装燃烧室 (Feed Furnace) ] - {state.filterWaste.toFixed(1)}kg
        {isFurnaceCoolingDown && ` - ${Math.ceil(furnaceCooldown/1000)}s`}
      </span>
    </button>
  );
}

// 搜寻残骸按钮 - 主动获取废料/生物质/光照
export function CollectResourcesButton({ state, dispatch }: ComponentProps) {
  const now = Date.now();
  const collectCooldown = Math.max(0, 3000 - (now - (state.lastCollectTime || 0)));
  const isCollectCoolingDown = collectCooldown > 0;

  // 有光后显示
  if (!state.flags.hasLight) {
    return null;
  }

  return (
    <button
      onClick={() => dispatch({ type: 'COLLECT_RESOURCES' })}
      disabled={isCollectCoolingDown}
      className={`
        w-full py-2 text-sm font-mono border transition-all duration-200 relative overflow-hidden
        ${isCollectCoolingDown
          ? 'opacity-50 cursor-not-allowed border-gray-800 text-gray-600'
          : 'border-amber-900 text-amber-600 hover:text-amber-400 hover:border-amber-500 hover:bg-amber-900/10'
        }
      `}
    >
      {isCollectCoolingDown && (
        <div className="absolute inset-0 bg-gray-800/50 origin-left transition-transform duration-100 ease-linear" style={{ transform: `scaleX(${collectCooldown/8000})` }} />
      )}
      <span className="relative z-10">
        [ 搜寻残骸 (Scavenge Debris) ]
        {isCollectCoolingDown && ` - ${Math.ceil(collectCooldown/1000)}s`}
      </span>
    </button>
  );
}
export function SonarPingButton({ state, dispatch }: ComponentProps) {
  const now = Date.now();
  const sonarCooldown = Math.max(0, 4000 - (now - state.lastSonarTime));
  const isSonarCoolingDown = sonarCooldown > 0;

  return (
    <button
      onClick={() => dispatch({ type: 'SONAR_PING' })}
      disabled={state.power < 20 || isSonarCoolingDown}
      className={`
        w-full py-3 text-sm font-bold tracking-wider border transition-all duration-200 font-mono relative overflow-hidden
        ${state.power >= 20 && !isSonarCoolingDown
            ? 'border-green-900 text-green-700 hover:text-green-500 hover:border-green-500 hover:bg-green-900/10' 
            : 'border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
        }
      `}
    >
      {isSonarCoolingDown && (
        <div className="absolute inset-0 bg-gray-800/50 origin-left transition-transform duration-100 ease-linear" style={{ transform: `scaleX(${sonarCooldown/4000})` }} />
      )}
      <span className="relative z-10">
        [ 发送主动脉冲 (Ping) ] - 消耗 20 电力
        {isSonarCoolingDown && ` - ${Math.ceil(sonarCooldown/1000)}s`}
      </span>
    </button>
  );
}

// 全船诊断按钮
export function FullDiagnosticsButton({ state, dispatch }: ComponentProps) {
  const now = Date.now();
  const diagnosticsCooldown = Math.max(0, 8000 - (now - state.lastDiagnosticsTime));
  const isDiagnosticsCoolingDown = diagnosticsCooldown > 0;

  if (state.sonarPings < 3 || state.flags.coldWeldingDiscovered) {
    return null;
  }

  return (
    <button
      onClick={() => dispatch({ type: 'FULL_DIAGNOSTICS' })}
      disabled={isDiagnosticsCoolingDown}
      className={`
        w-full py-3 text-sm border font-mono transition-all relative overflow-hidden
        ${isDiagnosticsCoolingDown
          ? 'opacity-50 cursor-not-allowed border-gray-800 text-gray-600'
          : 'border-yellow-900 text-yellow-600 hover:bg-yellow-900/20 hover:text-yellow-300 animate-pulse'
        }
      `}
    >
      {isDiagnosticsCoolingDown && (
        <div className="absolute inset-0 bg-gray-800/50 origin-left transition-transform duration-100 ease-linear" style={{ transform: `scaleX(${diagnosticsCooldown/8000})` }} />
      )}
      <span className="relative z-10">
        [ 全船诊断 (Full Diagnostics) ]
        {isDiagnosticsCoolingDown && ` - ${Math.ceil(diagnosticsCooldown/1000)}s`}
      </span>
    </button>
  );
}

// 损伤控制面板
export function DamageControlPanel({ state, dispatch }: ComponentProps) {
  if (!state.flags.damageControlActive) {
    return null;
  }

  return (
    <div className="space-y-3">
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

// Impact阶段背景文字
export function ImpactBackgroundText() {
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


// 建造面板 - 放置类游戏核心机制
export function BuildingPanel({ state, dispatch }: ComponentProps) {
  // 计算建筑成本（带缩放）
  const calculateCost = (building: BuildingType) => {
    const baseCost = COSTS[building];
    const currentCount = state.buildings[building];
    const scaledCost: Record<string, number> = {};
    
    for (const [resource, cost] of Object.entries(baseCost)) {
      scaledCost[resource] = Math.floor(cost * Math.pow(SCALING_FACTOR, currentCount));
    }
    return scaledCost;
  };

  // 检查是否能负担建筑
  const canAfford = (building: BuildingType) => {
    const cost = calculateCost(building);
    for (const [resource, amount] of Object.entries(cost)) {
      if ((state.resources[resource as ResourceType] || 0) < amount) {
        return false;
      }
    }
    return true;
  };

  // 格式化成本显示
  const formatCost = (cost: Record<string, number>) => {
    const parts: string[] = [];
    if (cost[ResourceType.SCRAP]) parts.push(`${cost[ResourceType.SCRAP]}废料`);
    if (cost[ResourceType.BIOMASS]) parts.push(`${cost[ResourceType.BIOMASS]}生物质`);
    if (cost[ResourceType.LUMENS]) parts.push(`${cost[ResourceType.LUMENS]}光照`);
    return parts.join(', ');
  };

  // 建筑配置
  const buildings = [
    { 
      type: BuildingType.PUMP, 
      name: '氧气泵', 
      desc: '自动产氧 +1/秒',
      unlocked: state.flags.hasLight // 需要有光才能看到建造选项
    },
    { 
      type: BuildingType.BIO_FILTER, 
      name: '生物过滤器', 
      desc: '被动收集废料/生物质/光照',
      unlocked: state.flags.hasLight && state.buildings[BuildingType.PUMP] >= 1
    },
  ];

  // 如果没有解锁任何建筑，不显示面板
  const unlockedBuildings = buildings.filter(b => b.unlocked);
  if (unlockedBuildings.length === 0) return null;

  return (
    <div className="p-2 bg-gray-900/30 rounded border border-gray-800 space-y-2">
      <div className="text-xs text-gray-500 font-mono mb-1">[ 系统模块 ]</div>
      {unlockedBuildings.map(building => {
        const cost = calculateCost(building.type);
        const affordable = canAfford(building.type);
        const count = state.buildings[building.type];
        
        return (
          <button
            key={building.type}
            onClick={() => dispatch({ type: 'BUILD', payload: { building: building.type } })}
            disabled={!affordable}
            className={`
              w-full px-2 py-2 text-xs font-mono rounded border transition-colors text-left
              ${affordable
                ? 'bg-green-900/20 hover:bg-green-800/30 text-green-400 border-green-800'
                : 'bg-gray-800/30 text-gray-600 border-gray-700 cursor-not-allowed'
              }
            `}
          >
            <div className="flex justify-between items-center">
              <span>{building.name} ({count})</span>
              <span className="text-gray-500">{building.desc}</span>
            </div>
            <div className="text-xs mt-1 text-gray-500">
              成本: {formatCost(cost)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
