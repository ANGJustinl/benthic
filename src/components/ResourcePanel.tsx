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
              <span className="text-term-green">氧气浓度</span>
              <span className={`${state.resources[ResourceType.OXYGEN] < 10 ? 'text-red-500 animate-pulse font-bold' : 'text-gray-400'}`}>
                {state.resources[ResourceType.OXYGEN] < 10 ? 'CRITICAL' : `${Math.floor(state.resources[ResourceType.OXYGEN])}%`}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-900 rounded overflow-hidden border border-gray-800">
              <div 
                className={`h-full transition-all duration-500 ${state.resources[ResourceType.OXYGEN] < 10 ? 'bg-red-600 animate-pulse' : 'bg-cyan-600'}`} 
                style={{ width: `${Math.min(100, (state.resources[ResourceType.OXYGEN] / state.maxOxygen) * 100)}%` }}
              />
            </div>
          </div>

          {/* Core Temperature (shown after rust stage) */}
          {state.chapter1Stage !== 'boot' && (
            <div className="mb-4">
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
          )}

          {/* Power (shown after rust stage) */}
          {state.chapter1Stage !== 'boot' && (
            <div className="flex justify-between items-center text-sm font-mono border-b border-gray-900 pb-1">
              <span className="text-gray-400">电力</span>
              <span className="text-term-green">{Math.floor(state.power)}</span>
            </div>
          )}

          {/* Filter Waste (shown during rust stage) */}
          {state.chapter1Stage === 'rust' && state.filterWaste > 0 && (
            <div className="flex justify-between items-center text-sm font-mono border-b border-gray-900 pb-1">
              <span className="text-gray-400">过滤网残渣</span>
              <span className="text-term-green">{Math.floor(state.filterWaste)} kg</span>
            </div>
          )}

          {/* Hull Integrity (shown during impact) */}
          {state.chapter1Stage === 'impact' && (
            <div className="mb-4">
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
          )}

          {/* Sonar Pings (shown during ghost stage) */}
          {state.chapter1Stage === 'ghost' && (
            <div className="flex justify-between items-center text-sm font-mono border-b border-gray-900 pb-1">
              <span className="text-gray-400">声呐脉冲</span>
              <span className="text-term-green">{state.sonarPings}/3</span>
            </div>
          )}
        </div>
      )}

      {/* Resources */}
      <div className="space-y-2 mb-8">
        {(Object.entries(state.resources) as [string, number][]).map(([key, value]) => {
           // Hide other resources initially in Chapter 1
           if (isChapter1 && key !== ResourceType.OXYGEN && !showResources) return null;
           // If we have light, show non-zero resources or key resources
           if (value === 0 && key !== ResourceType.OXYGEN && key !== ResourceType.LUMENS) return null;
           
           // Skip oxygen display for Chapter 1 (already shown above)
           if (key === ResourceType.OXYGEN && isChapter1) return null;

           // Oxygen Bar Special Display (non-Chapter 1)
           if (key === ResourceType.OXYGEN && !isChapter1) {
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