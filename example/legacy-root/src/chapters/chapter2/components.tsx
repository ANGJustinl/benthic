import React from 'react';
import { GameState, GameAction } from '../../types';
import { Chapter2State } from './types';
import { Chapter3State } from '../chapter3/types';
import { ROV_TARGETS } from './constants';

interface ComponentProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

// 第二章资源面板
export function Chapter2ResourcesPanel({ state }: ComponentProps) {
  const chapter2 = state.chapter2 as Chapter2State;
  
  return (
    <div className="p-2 bg-gray-900/30 rounded border border-gray-800">
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-gray-500">电路板:</span>
          <span className="text-blue-400">{chapter2.circuits || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">钛合金:</span>
          <span className="text-gray-300">{chapter2.titanium || 0}</span>
        </div>
        {chapter2.networkNodes > 0 && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-500">节点:</span>
              <span className="text-purple-400">{chapter2.networkNodes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">算力:</span>
              <span className="text-purple-400">{chapter2.computePower}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 信号分析按钮
export function AnalyzeSignalButton({ state, dispatch }: ComponentProps) {
  const chapter2 = state.chapter2 as Chapter2State;
  
  if (chapter2.signalAnalyzed) {
    return null;
  }

  return (
    <button
      onClick={() => dispatch({ type: 'CHAPTER2_ACTION', payload: { action: 'ANALYZE_SIGNAL' } })}
      className="w-full px-3 py-2 bg-cyan-900/30 hover:bg-cyan-800/40 text-cyan-300 rounded border border-cyan-800 transition-colors font-mono text-sm"
    >
      [ 分析外部信号 ]
    </button>
  );
}

// 区域状态指示器
export function ZoneStatusIndicator({ zone, isOrganic }: { zone: { status: string; name: string }, isOrganic?: boolean }) {
  const getStatusConfig = (status: string) => {
    // Phase 3 有机化状态
    if (isOrganic) {
      switch (status) {
        case 'online': 
          return { color: 'text-red-400', bg: 'bg-red-400', label: '活跃', animate: true };
        case 'digesting': 
          return { color: 'text-purple-400', bg: 'bg-purple-400', label: '消化中', animate: true };
        case 'organic':
          return { color: 'text-red-300', bg: 'bg-red-400', label: '有机', animate: true };
        default: 
          return { color: 'text-red-400', bg: 'bg-red-400', label: '融合', animate: true };
      }
    }
    
    // Phase 2 机械状态
    switch (status) {
      case 'online': 
        return { color: 'text-green-400', bg: 'bg-green-400', label: '在线' };
      case 'offline': 
        return { color: 'text-red-400', bg: 'bg-red-400', label: '离线' };
      case 'repairing': 
        return { color: 'text-yellow-400', bg: 'bg-yellow-400', label: '修复中', animate: true };
      case 'connected': 
        return { color: 'text-blue-400', bg: 'bg-blue-400', label: '已连接' };
      case 'digesting': 
        return { color: 'text-purple-400', bg: 'bg-purple-400', label: '消化中', animate: true };
      default: 
        return { color: 'text-gray-400', bg: 'bg-gray-400', label: status };
    }
  };

  const config = getStatusConfig(zone.status);

  return (
    <div className={`inline-flex items-center space-x-1 ml-2 ${config.color}`}>
      <div className={`w-2 h-2 rounded-full ${config.bg} ${config.animate ? 'animate-pulse' : ''}`} />
      <span className="text-xs uppercase font-mono">{config.label}</span>
    </div>
  );
}

// 有机化区域名称映射
const ORGANIC_ZONE_NAMES: { [key: string]: string } = {
  'A_ZONE': '大脑皮层 (Cortex)',
  'B_ZONE': '心肺系统 (Heart-Lung)',
  'C_ZONE': '消化腔 (Stomach)',
  'ICARUS_NODE': '共生囊 (Symbiote Sac)',
  'POSEIDON_NODE': '波塞冬号 - 已同化',
};

// 区域管理面板
export function ZoneManagementPanel({ state, dispatch }: ComponentProps) {
  const chapter2 = state.chapter2 as Chapter2State;
  const chapter3 = state.chapter3;
  
  if (!chapter2.signalAnalyzed) {
    return null;
  }

  // 检查是否进入 Phase 3 且地图已有机化
  const isOrganic = state.phase >= 3 && chapter3?.mapOrganicized;

  const canAffordZoneRepair = (zone: string) => {
    const zoneData = chapter2.zones?.[zone];
    if (!zoneData || zoneData.repairProgress >= 100) return false;
    if (zoneData.repairProgress === 0) {
      return state.power >= zoneData.powerRequired && state.resources.scrap >= zoneData.scrapRequired;
    }
    return true;
  };

  // 获取显示名称
  const getDisplayName = (zoneKey: string, originalName: string) => {
    if (isOrganic && ORGANIC_ZONE_NAMES[zoneKey]) {
      return ORGANIC_ZONE_NAMES[zoneKey];
    }
    return originalName;
  };

  // 合并 chapter2 和 chapter3 的区域
  const allZones = { ...chapter2.zones };
  // 只有在波塞冬被同化后才显示波塞冬节点
  if (isOrganic && chapter3?.poseidonAssimilated) {
    allZones['POSEIDON_NODE'] = {
      name: '波塞冬号核潜艇',
      status: 'organic',
      repairProgress: 100,
      powerRequired: 0,
      scrapRequired: 0,
      unlocked: true,
    };
  }

  return (
    <div className={`space-y-2 ${isOrganic ? 'transition-all duration-1000' : ''}`}>
      {/* Phase 3 有机化标题 */}
      {isOrganic && (
        <div className="text-xs text-red-400 font-mono mb-2 border-b border-red-800 pb-1">
          [ 器官分布 ]
        </div>
      )}
      
      {Object.entries(allZones).map(([zoneKey, zone]) => (
        <div key={zoneKey} className="mb-2 last:mb-0">
          <div className="flex justify-between items-center">
            {isOrganic ? (
              // Phase 3: 显示有机化名称，带删除线的旧名称
              <div className="flex flex-col">
                <span className="text-xs font-mono text-gray-600 line-through">{zone.name}</span>
                <span className="text-sm font-mono text-red-400">{getDisplayName(zoneKey, zone.name)}</span>
              </div>
            ) : (
              // Phase 2: 正常显示
              <span className="text-sm font-mono text-gray-300">{zone.name}</span>
            )}
            <ZoneStatusIndicator zone={zone} isOrganic={isOrganic} />
          </div>
          
          {/* Repair progress bar - 只在 Phase 2 显示 */}
          {!isOrganic && zone.status !== 'online' && zone.status !== 'digesting' && zone.repairProgress > 0 && zone.repairProgress < 100 && (
            <div className="mt-1">
              <div className="w-full h-1 bg-gray-800 rounded overflow-hidden">
                <div 
                  className="h-full bg-yellow-600 transition-all duration-300"
                  style={{ width: `${zone.repairProgress}%` }}
                />
              </div>
              <p className="text-xs text-yellow-600 font-mono mt-0.5">修复: {zone.repairProgress}%</p>
            </div>
          )}
          
          {/* Repair button - 只在 Phase 2 显示 */}
          {!isOrganic && (zone.status === 'offline' || (zone.status === 'repairing' && zone.repairProgress < 100)) && (
            <button
              onClick={() => dispatch({ type: 'CHAPTER2_ACTION', payload: { action: 'REPAIR_ZONE', target: zoneKey } })}
              disabled={!canAffordZoneRepair(zoneKey)}
              className={`
                mt-1 w-full px-2 py-1.5 text-xs font-mono rounded border transition-colors
                ${canAffordZoneRepair(zoneKey)
                  ? 'bg-yellow-900/30 hover:bg-yellow-800/40 text-yellow-300 border-yellow-800'
                  : 'bg-gray-800/30 text-gray-600 border-gray-700 cursor-not-allowed'
                }
              `}
            >
              {zone.repairProgress === 0 
                ? `修复 (${zone.powerRequired}⚡, ${zone.scrapRequired}废料)`
                : `继续 (${zone.repairProgress}%)`
              }
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ROV组装按钮
export function AssembleROVButton({ state, dispatch }: ComponentProps) {
  const chapter2 = state.chapter2 as Chapter2State;
  
  if (!chapter2.bZoneRepaired || chapter2.rov?.assembled) {
    return null;
  }

  const canAssemble = (chapter2.circuits || 0) >= 5 && (chapter2.titanium || 0) >= 20;

  return (
    <button
      onClick={() => dispatch({ type: 'CHAPTER2_ACTION', payload: { action: 'ASSEMBLE_ROV' } })}
      disabled={!canAssemble}
      className={`
        w-full px-3 py-2 text-sm font-mono rounded border transition-colors
        ${canAssemble
          ? 'bg-cyan-900/30 hover:bg-cyan-800/40 text-cyan-300 border-cyan-800'
          : 'bg-gray-800/30 text-gray-600 border-gray-700 cursor-not-allowed'
        }
      `}
    >
      [ 组装 ROV ] (5电路板, 20钛合金)
    </button>
  );
}

// ROV部署按钮
export function DeployROVButton({ state, dispatch }: ComponentProps) {
  const chapter2 = state.chapter2 as Chapter2State;
  
  if (!chapter2.rov?.assembled || chapter2.rov?.deployed || chapter2.rov?.destroyed) {
    return null;
  }

  return (
    <button
      onClick={() => dispatch({ type: 'CHAPTER2_ACTION', payload: { action: 'DEPLOY_ROV' } })}
      className="w-full px-3 py-2 bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 rounded border border-blue-800 transition-colors font-mono text-sm"
    >
      [ 部署 ROV ]
    </button>
  );
}

// ROV探索面板
export function ROVExplorationPanel({ state, dispatch }: ComponentProps) {
  const chapter2 = state.chapter2 as Chapter2State;
  
  if (!chapter2.rov?.deployed || chapter2.rov?.destroyed) {
    return null;
  }

  const now = Date.now();
  const lastExploreTime = chapter2.rov.lastExplorationTime || 0;
  const exploreCooldown = Math.max(0, 10000 - (now - lastExploreTime)); // 10秒冷却
  const isExploreCoolingDown = exploreCooldown > 0;

  return (
    <div className="space-y-1.5">
      <button
        onClick={() => dispatch({ type: 'CHAPTER2_ACTION', payload: { action: 'EXPLORE_TARGET', target: ROV_TARGETS.DEBRIS_FIELD } })}
        disabled={isExploreCoolingDown}
        className={`
          w-full px-2 py-1.5 rounded border text-xs font-mono transition-colors relative overflow-hidden
          ${isExploreCoolingDown
            ? 'opacity-50 cursor-not-allowed bg-gray-800/30 text-gray-600 border-gray-700'
            : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 border-gray-600'
          }
        `}
      >
        {isExploreCoolingDown && (
          <div className="absolute inset-0 bg-gray-800/50 origin-left transition-transform duration-100 ease-linear" style={{ transform: `scaleX(${exploreCooldown/10000})` }} />
        )}
        <span className="relative z-10">
          探索：残骸堆
          {isExploreCoolingDown && ` - ${Math.ceil(exploreCooldown/1000)}s`}
        </span>
      </button>
      
      <button
        onClick={() => dispatch({ type: 'CHAPTER2_ACTION', payload: { action: 'EXPLORE_TARGET', target: ROV_TARGETS.THERMAL_VENTS } })}
        disabled={isExploreCoolingDown}
        className={`
          w-full px-2 py-1.5 rounded border text-xs font-mono transition-colors relative overflow-hidden
          ${isExploreCoolingDown
            ? 'opacity-50 cursor-not-allowed bg-gray-800/30 text-gray-600 border-gray-700'
            : 'bg-orange-900/30 hover:bg-orange-800/40 text-orange-300 border-orange-800'
          }
        `}
      >
        {isExploreCoolingDown && (
          <div className="absolute inset-0 bg-gray-800/50 origin-left transition-transform duration-100 ease-linear" style={{ transform: `scaleX(${exploreCooldown/10000})` }} />
        )}
        <span className="relative z-10">
          探索：地热喷口
          {isExploreCoolingDown && ` - ${Math.ceil(exploreCooldown/1000)}s`}
        </span>
      </button>
      
      {chapter2.tetherTruthRevealed && !chapter2.icarusLogRead && (
        <button
          onClick={() => dispatch({ type: 'CHAPTER2_ACTION', payload: { action: 'EXPLORE_TARGET', target: ROV_TARGETS.ICARUS_WRECK } })}
          disabled={isExploreCoolingDown}
          className={`
            w-full px-2 py-1.5 rounded border text-xs font-mono transition-colors relative overflow-hidden
            ${isExploreCoolingDown
              ? 'opacity-50 cursor-not-allowed bg-gray-800/30 text-gray-600 border-gray-700'
              : 'bg-red-900/30 hover:bg-red-800/40 text-red-300 border-red-800 animate-pulse'
            }
          `}
        >
          {isExploreCoolingDown && (
            <div className="absolute inset-0 bg-gray-800/50 origin-left transition-transform duration-100 ease-linear" style={{ transform: `scaleX(${exploreCooldown/10000})` }} />
          )}
          <span className="relative z-10">
            探索：伊卡洛斯号 (1200m)
            {isExploreCoolingDown && ` - ${Math.ceil(exploreCooldown/1000)}s`}
          </span>
        </button>
      )}
      
      {/* Icarus Log Reading */}
      {chapter2.rov?.currentTarget === ROV_TARGETS.ICARUS_WRECK && !chapter2.icarusLogRead && (
        <button
          onClick={() => dispatch({ type: 'CHAPTER2_ACTION', payload: { action: 'READ_ICARUS_LOG' } })}
          className="w-full px-2 py-1.5 bg-yellow-900/30 hover:bg-yellow-800/40 text-yellow-300 rounded border border-yellow-800 text-xs font-mono transition-colors"
        >
          [ 接入物理接口 ]
        </button>
      )}
      
      {/* Disconnection Options */}
      {chapter2.icarusLogRead && chapter2.rov?.currentTarget === ROV_TARGETS.ICARUS_WRECK && (
        <div className="flex gap-1.5">
          <button
            onClick={() => dispatch({ type: 'CHAPTER2_ACTION', payload: { action: 'DISCONNECT_ROV' } })}
            className="flex-1 px-2 py-1.5 bg-yellow-900/30 hover:bg-yellow-800/40 text-yellow-300 rounded border border-yellow-800 text-xs font-mono transition-colors"
          >
            断开
          </button>
          <button
            onClick={() => dispatch({ type: 'CHAPTER2_ACTION', payload: { action: 'SELF_DESTRUCT_ROV' } })}
            className="flex-1 px-2 py-1.5 bg-red-900/30 hover:bg-red-800/40 text-red-300 rounded border border-red-800 text-xs font-mono transition-colors"
          >
            自毁
          </button>
        </div>
      )}
    </div>
  );
}

// 幽灵数据处理按钮
export function ProcessGhostDataButton({ state, dispatch }: ComponentProps) {
  const chapter2 = state.chapter2 as Chapter2State;
  
  if (!chapter2.ghostDataReceived || chapter2.networkAwakened) {
    return null;
  }

  return (
    <button
      onClick={() => dispatch({ type: 'CHAPTER2_ACTION', payload: { action: 'PROCESS_GHOST_DATA' } })}
      className="w-full px-3 py-2 bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 rounded border border-purple-800 transition-colors font-mono text-sm animate-pulse"
    >
      [ 处理未知数据包 ]
    </button>
  );
}

// 网络觉醒状态面板
export function NetworkAwakenedPanel({ state, dispatch }: ComponentProps) {
  const chapter2 = state.chapter2 as Chapter2State;
  
  if (!chapter2.networkAwakened) {
    return null;
  }

  // 如果已经进入第三章，不显示进入按钮
  const canEnterChapter3 = chapter2.chapter2Stage !== 'complete' && state.phase < 3;

  return (
    <div className="p-2 bg-red-900/20 border border-red-800 rounded">
      <div className="text-xs text-red-300 font-mono space-y-0.5">
        <p className="font-bold">网络已觉醒</p>
        <p>同化: {chapter2.icarusAssimilated ? '完成' : '进行中'}</p>
        <p>节点: {chapter2.networkNodes} | 算力: {chapter2.computePower}</p>
      </div>
      
      {/* 进入第三章按钮 */}
      {canEnterChapter3 && (
        <button
          onClick={() => dispatch({ type: 'CHAPTER2_ACTION', payload: { action: 'COMPLETE_CHAPTER2' } })}
          className="w-full mt-2 px-3 py-2 bg-red-900/40 hover:bg-red-800/50 text-red-300 rounded border border-red-700 transition-colors font-mono text-sm animate-pulse"
        >
          [ 接受蜕变 (Enter the Abyss) ]
        </button>
      )}
    </div>
  );
}
