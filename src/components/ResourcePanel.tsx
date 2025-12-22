import React from 'react';
import { GameState, ResourceType, BuildingType } from '../types';

interface ResourcePanelProps {
  state: GameState;
}

const getResourceName = (res: ResourceType, phase: number) => {
    if (phase === 1) {
        if (res === ResourceType.OXYGEN) return "舱内空气";
        if (res === ResourceType.SCRAP) return "船体碎片";
        if (res === ResourceType.BIOMASS) return "有机废料";
        if (res === ResourceType.LUMENS) return "流明";
    }
    if (phase === 3) {
        if (res === ResourceType.OXYGEN) return "氧化";
        if (res === ResourceType.SCRAP) return "矿物质";
        if (res === ResourceType.BIOMASS) return "血肉";
        if (res === ResourceType.LUMENS) return "神经信号";
    }
    // Default / Phase 2
    switch(res) {
        case ResourceType.OXYGEN: return "氧气";
        case ResourceType.SCRAP: return "废料";
        case ResourceType.BIOMASS: return "生物质";
        case ResourceType.LUMENS: return "光照";
        case ResourceType.EVOLUTION: return "进化";
        default: return res;
    }
};

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ state }) => {
  const isHorror = state.phase === 3;
  const isChapter1 = state.phase === 1;
  
  // In Phase 1, only show oxygen until Light is found
  const showResources = state.flags.hasLight || state.phase > 1;
  
  return (
    <div className={`h-full border-l ${isHorror ? 'border-flesh-red bg-flesh-bg' : 'border-gray-800 bg-transparent'} p-4 transition-colors duration-1000`}>
      <h2 className={`text-sm font-bold mb-4 uppercase tracking-widest ${isHorror ? 'text-flesh-pink font-hand text-xl' : 'text-gray-500 font-mono'}`}>
        {isHorror ? '机体状态 (Organism)' : '船只状态 (Vessel)'}
      </h2>

      {/* Chapter 1 Specific Status Display */}
      {isChapter1 && (
        <div className="space-y-3 mb-6">
          {/* Oxygen Status */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-gray-400">氧气</span>
              <span className={`${state.flags.oxygenCrisis ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                {Math.floor(state.resources[ResourceType.OXYGEN])} / {state.maxOxygen}
              </span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  state.flags.oxygenCrisis ? 'bg-red-600 animate-pulse' : 'bg-cyan-600'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (state.resources[ResourceType.OXYGEN] / state.maxOxygen) * 100))}%` }}
              />
            </div>
          </div>

          {/* Chapter 1 Specific Resources */}
          {state.flags.hasLight && (
            <div className="text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">光照</span>
                <span className="text-yellow-400">{Math.floor(state.resources[ResourceType.LUMENS])}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">生物质</span>
                <span className="text-green-400">{Math.floor(state.resources[ResourceType.BIOMASS])}</span>
              </div>
            </div>
          )}

          {/* Chapter 1 Status Indicators */}
          <div className="text-xs space-y-1 mt-4 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-400">核心温度</span>
              <span className={`${state.coreTemperature < 10 ? 'text-blue-400' : state.coreTemperature > 25 ? 'text-red-400' : 'text-green-400'}`}>
                {state.coreTemperature}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">电力</span>
              <span className="text-yellow-400">{state.power}</span>
            </div>
            {state.flags.filtersUnlocked && (
              <div className="flex justify-between">
                <span className="text-gray-400">滤芯废料</span>
                <span className="text-orange-400">{state.filterWaste.toFixed(1)} kg</span>
              </div>
            )}
            {state.flags.impactOccurred && (
              <div className="flex justify-between">
                <span className="text-gray-400">船体完整性</span>
                <span className={`${state.hullIntegrity < 50 ? 'text-red-400' : state.hullIntegrity < 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {state.hullIntegrity}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chapter 2 Specific Status Display */}
      {state.phase === 2 && state.chapter2 && (
        <div className="space-y-3 mb-6">
          {/* Standard Resources */}
          <div className="text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-400">氧气</span>
              <span className="text-cyan-400">{Math.floor(state.resources[ResourceType.OXYGEN])} / {state.maxOxygen}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">废料</span>
              <span className="text-gray-400">{Math.floor(state.resources[ResourceType.SCRAP])}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">生物质</span>
              <span className="text-green-400">{Math.floor(state.resources[ResourceType.BIOMASS])}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">光照</span>
              <span className="text-yellow-400">{Math.floor(state.resources[ResourceType.LUMENS])}</span>
            </div>
          </div>

          {/* Chapter 2 Specific Resources */}
          <div className="text-xs space-y-2 font-mono border-t border-gray-700 pt-2">
            <div className="flex justify-between">
              <span className="text-blue-400">精密电路板</span>
              <span className="text-blue-400">{state.chapter2.circuits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">钛合金</span>
              <span className="text-gray-300">{state.chapter2.titanium}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400">算力</span>
              <span className="text-purple-400">{state.chapter2.computePower}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-400">网络节点</span>
              <span className="text-cyan-400">{state.chapter2.networkNodes}</span>
            </div>
          </div>

          {/* Chapter 2 Status */}
          <div className="text-xs space-y-1 mt-4 font-mono border-t border-gray-700 pt-2">
            <div className="flex justify-between">
              <span className="text-gray-400">电力</span>
              <span className="text-yellow-400">{state.power}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">阶段</span>
              <span className="text-cyan-400">{state.chapter2.chapter2Stage}</span>
            </div>
            {state.chapter2.rov.assembled && (
              <div className="flex justify-between">
                <span className="text-gray-400">ROV 状态</span>
                <span className={`${
                  state.chapter2.rov.destroyed ? 'text-red-400' :
                  state.chapter2.rov.deployed ? 'text-green-400' :
                  'text-yellow-400'
                }`}>
                  {state.chapter2.rov.destroyed ? '已销毁' : 
                   state.chapter2.rov.deployed ? '已部署' : '待命'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Resources */}
      <div className="space-y-2 mb-8">
        {/* Only show resources for Phase 2+ or when light is available in Phase 1 */}
        {(state.phase > 1 || showResources) && (Object.entries(state.resources) as [string, number][]).map(([key, value]) => {
           // Skip oxygen display for Chapter 1 and 2 (already shown above)
           if (key === ResourceType.OXYGEN && (isChapter1 || state.phase === 2)) return null;
           // If we have light, show non-zero resources or key resources
           if (value === 0 && key !== ResourceType.OXYGEN && key !== ResourceType.LUMENS) return null;

           // Oxygen Bar Special Display (Phase 3+)
           if (key === ResourceType.OXYGEN && state.phase >= 3) {
               const pct = (value / state.maxOxygen) * 100;
               return (
                   <div key={key} className="mb-4">
                       <div className="flex justify-between text-xs mb-1 font-mono">
                           <span className={isHorror ? 'text-flesh-pink' : 'text-term-green'}>{getResourceName(key as ResourceType, state.phase)}</span>
                           <span className={value < 20 ? 'text-red-500 animate-pulse' : 'text-gray-400'}>{Math.floor(value)} / {state.maxOxygen}</span>
                       </div>
                       <div className="w-full h-2 bg-gray-900 rounded overflow-hidden border border-gray-800">
                           <div 
                                className={`h-full transition-all duration-500 ${value < 20 ? 'bg-red-600' : (isHorror ? 'bg-flesh-red' : 'bg-cyan-600')}`} 
                                style={{ width: `${pct}%` }}
                           />
                       </div>
                   </div>
               )
           }

           return (
             <div key={key} className="flex justify-between items-center text-sm font-mono border-b border-gray-900 pb-1">
                <span className={isHorror ? 'text-red-300' : 'text-gray-400'}>{getResourceName(key as ResourceType, state.phase)}</span>
                <span className={isHorror ? 'text-flesh-pink font-bold' : 'text-term-green'}>{Math.floor(value)}</span>
             </div>
           );
        })}
      </div>

      {/* Buildings / Organs */}
      {state.phase > 1 && (
          <div>
            <h3 className={`text-xs font-bold mb-3 uppercase tracking-widest ${isHorror ? 'text-red-500 font-hand' : 'text-gray-600'}`}>
                {isHorror ? '突变 (Mutations)' : '系统模块 (Systems)'}
            </h3>
            <div className="space-y-2">
                {Object.entries(state.buildings).map(([key, value]) => {
                    if (value === 0) return null;
                    let name = key;
                    switch(key) {
                        case BuildingType.PUMP: name = isHorror ? "肺叶组织" : "氧气泵"; break;
                        case BuildingType.BIO_FILTER: name = isHorror ? "鳃裂" : "生物过滤器"; break;
                        case BuildingType.NODE: name = isHorror ? "神经节点" : "管道节点"; break;
                        case BuildingType.COMMS_ARRAY: name = "通讯阵列"; break;
                    }

                    return (
                        <div key={key} className="flex justify-between text-sm font-mono text-gray-400">
                            <span>{name}</span>
                            <span className="text-white">{value}</span>
                        </div>
                    );
                })}
            </div>
          </div>
      )}

      {/* Chapter 1 Stage Indicator */}
      {isChapter1 && (
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
      )}
    </div>
  );
};