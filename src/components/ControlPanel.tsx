import React from 'react';
import { GameState, GameAction, BuildingType, ResourceType } from '../types';
import { COSTS, SCALING_FACTOR } from '../constants';

interface ControlPanelProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ state, dispatch }) => {
  const isHorror = state.phase === 3;
  const isChapter1 = state.phase === 1;

  const canAfford = (building: BuildingType) => {
    const costConfig = COSTS[building];
    const currentCount = state.buildings[building];
    return Object.entries(costConfig).every(([res, amount]) => {
         const scaledCost = Math.floor(amount * Math.pow(SCALING_FACTOR, currentCount));
         return state.resources[res as ResourceType] >= scaledCost;
    });
  };

  const getCostString = (building: BuildingType) => {
      const costConfig = COSTS[building];
      const currentCount = state.buildings[building];
      return Object.entries(costConfig).map(([res, amount]) => {
          const scaledCost = Math.floor(amount * Math.pow(SCALING_FACTOR, currentCount));
          
          let resName = res;
          switch(res) {
              case ResourceType.SCRAP: resName = "废料"; break;
              case ResourceType.BIOMASS: resName = "生物质"; break;
              case ResourceType.LUMENS: resName = "流明"; break;
              case ResourceType.OXYGEN: resName = "氧气"; break;
          }
          
          return `${scaledCost} ${resName}`;
      }).join(', ');
  }

  // Cooldown calculations
  const now = Date.now();
  const crankCooldown = Math.max(0, 1000 - (now - state.lastCrankTime));
  const filterCooldown = Math.max(0, 2000 - (now - state.lastFilterTime));
  const furnaceCooldown = Math.max(0, 3000 - (now - state.lastFurnaceTime));
  const sonarCooldown = Math.max(0, 4000 - (now - state.lastSonarTime));
  const diagnosticsCooldown = Math.max(0, 8000 - (now - state.lastDiagnosticsTime));
  
  const isCrankCoolingDown = crankCooldown > 0;
  const isFilterCoolingDown = filterCooldown > 0;
  const isFurnaceCoolingDown = furnaceCooldown > 0;
  const isSonarCoolingDown = sonarCooldown > 0;
  const isDiagnosticsCoolingDown = diagnosticsCooldown > 0;

  return (
    <div className={`h-full flex flex-col items-center justify-center p-8 transition-colors duration-1000 relative ${isHorror ? 'bg-flesh-bg' : 'bg-transparent'}`}>
      
      {/* Background Ambience */}
      {isHorror && (
          <div className="absolute inset-0 pointer-events-none opacity-10 animate-pulse-slow">
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900 via-black to-black"></div>
          </div>
      )}

      {/* Chapter 1 Impact Phase Background Text */}
      {isChapter1 && state.chapter1Stage === 'impact' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
              <div className="animate-pulse text-red-900 text-xs font-mono absolute top-4 left-4">HULL_BREACH_DETECTED</div>
              <div className="animate-pulse text-red-900 text-xs font-mono absolute top-8 right-8">PRESSURE_CRITICAL</div>
              <div className="animate-pulse text-red-900 text-xs font-mono absolute bottom-12 left-8">STRUCTURAL_INTEGRITY</div>
              <div className="animate-pulse text-red-900 text-xs font-mono absolute bottom-4 right-4">BRACE FOR IMPACT</div>
              <div className="animate-pulse text-red-900 text-xs font-mono absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">CRITICAL</div>
          </div>
      )}

      <div className="w-full max-w-md space-y-6 z-10">
        
        {/* Chapter 1 Stage-specific UI */}
        {isChapter1 && (
          <>
            {/* Stage I: Boot - Manual Crank */}
            {state.chapter1Stage === 'boot' && (
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
            )}

            {/* Stage II: Rust Lung - Filter and Furnace */}
            {state.chapter1Stage === 'rust' && (
              <>
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

                {state.filterWaste > 0 && state.flags.furnaceUnlocked && (
                  <button
                    onClick={() => dispatch({ type: 'FEED_FURNACE' })}
                    disabled={state.filterWaste < 1 || isFurnaceCoolingDown}
                    className={`
                      w-full py-3 text-sm font-bold tracking-wider border transition-all duration-200 font-mono relative overflow-hidden
                      ${state.filterWaste < 1 || isFurnaceCoolingDown
                        ? 'opacity-50 cursor-not-allowed border-gray-800'
                        : 'border-orange-900 text-orange-700 hover:text-orange-500 hover:border-orange-500 hover:bg-orange-900/10'
                      }
                    `}
                  >
                    {isFurnaceCoolingDown && (
                      <div className="absolute inset-0 bg-gray-800/50 origin-left transition-transform duration-100 ease-linear" style={{ transform: `scaleX(${furnaceCooldown/3000})` }} />
                    )}
                    <span className="relative z-10">
                      [ 填装燃烧室 (Feed Furnace) ]
                      {isFurnaceCoolingDown && ` - ${Math.ceil(furnaceCooldown/1000)}s`}
                    </span>
                  </button>
                )}
              </>
            )}

            {/* Stage III: Ghost - Sonar Operations */}
            {state.chapter1Stage === 'ghost' && (
              <>
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

                {state.sonarPings >= 3 && !state.flags.coldWeldingDiscovered && (
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
                )}
              </>
            )}

            {/* Stage IV: Impact - Damage Control */}
            {state.chapter1Stage === 'impact' && state.flags.damageControlActive && (
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
            )}
          </>
        )}

        {/* Legacy actions for non-Chapter 1 phases */}
        {!isChapter1 && (
          <>
            {/* ACTION: MANUAL CYCLE (The Gasp) */}
            <button
              onClick={() => dispatch({ type: 'MANUAL_BREATHE' })}
              disabled={isCrankCoolingDown}
              className={`
                w-full py-4 text-lg font-bold tracking-widest border-2 transition-all duration-100 relative overflow-hidden
                ${isCrankCoolingDown ? 'opacity-50 cursor-not-allowed border-gray-800' : 'active:scale-95'}
                ${isHorror 
                    ? 'border-flesh-red text-flesh-pink hover:bg-flesh-red/20 font-hand animate-heartbeat' 
                    : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white font-mono'
                }
              `}
            >
              {isCrankCoolingDown && (
                  <div className="absolute inset-0 bg-gray-800/50 origin-left transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${crankCooldown/1000})` }} />
              )}
              <span className="relative z-10">{isHorror ? '吞噬空气' : '手动循环'}</span>
            </button>

            {/* ACTION: IGNITE FLARE (The Spark) */}
            {!state.flags.hasLight && state.totalClicks > 20 && (
                 <button
                 onClick={() => dispatch({ type: 'IGNITE_FLARE' })}
                 disabled={state.resources[ResourceType.OXYGEN] < 10}
                 className={`w-full py-2 text-sm border font-mono transition-all
                    ${state.resources[ResourceType.OXYGEN] >= 10 
                        ? 'border-yellow-900 text-yellow-600 hover:text-yellow-400 hover:bg-yellow-900/10 hover:border-yellow-600 cursor-pointer' 
                        : 'border-gray-900 text-gray-700 cursor-not-allowed'}
                 `}
                 >
                 点燃照明弹 (消耗: 10 氧气)
                 </button>
            )}

            {/* ACTION: DEPLOY SCRAPER (The Scavenger) */}
            {state.flags.hasLight && (
                <button
                onClick={() => dispatch({ type: 'SCAVENGE' })}
                // Disable scavenge if Jam event is active and not inspected (only in Phase 1)
                disabled={state.phase === 1 && state.resources[ResourceType.BIOMASS] >= 10 && !state.flags.inspectedJam}
                className={`
                    w-full py-2 text-sm font-bold tracking-wider border transition-all duration-200 font-mono
                    ${isHorror
                        ? 'border-red-900 text-red-700 hover:text-red-500 hover:border-red-500'
                        : 'border-cyan-900 text-cyan-700 hover:text-cyan-500 hover:border-cyan-500 hover:bg-cyan-900/10'
                    }
                    ${state.phase === 1 && state.resources[ResourceType.BIOMASS] >= 10 && !state.flags.inspectedJam ? 'opacity-30 cursor-not-allowed' : ''}
                `}
                >
                {isHorror ? '延伸触手' : '部署刮削器'}
                </button>
            )}

            {/* ACTION: INSPECT JAM (The Hook) - Only in Phase 1 */}
            {state.phase === 1 && state.resources[ResourceType.BIOMASS] >= 10 && !state.flags.inspectedJam && (
                <button
                 onClick={() => dispatch({ type: 'INSPECT_JAM' })}
                 className="w-full py-3 text-sm border border-red-900 text-red-500 hover:bg-red-900/20 hover:text-red-300 font-mono animate-pulse"
                 >
                 ! 警告：刮削器卡住 [检查]
                 </button>
            )}

            {/* ACTION: REPAIR COMMS (The Cliffhanger) - Only in Phase 1 */}
            {state.phase === 1 && state.flags.inspectedJam && !state.flags.commsRepaired && (
                 <button
                 onClick={() => dispatch({ type: 'REPAIR_COMMS' })}
                 disabled={!canAfford(BuildingType.COMMS_ARRAY)}
                 className={`w-full py-3 text-sm border font-mono transition-all
                    ${canAfford(BuildingType.COMMS_ARRAY)
                        ? 'border-green-900 text-green-600 hover:text-green-400 hover:bg-green-900/10 hover:border-green-500 cursor-pointer'
                        : 'border-gray-800 text-gray-600 cursor-not-allowed'
                    }
                 `}
                 >
                 修复通讯阵列 (消耗: {getCostString(BuildingType.COMMS_ARRAY)})
                 </button>
            )}
          </>
        )}

        {/* Building Construction Area (Phase 2+) */}
        {state.phase >= 2 && (
            <div className={`mt-8 pt-8 border-t ${isHorror ? 'border-red-900' : 'border-gray-900'}`}>
                <h3 className={`text-center mb-4 text-xs uppercase ${isHorror ? 'text-flesh-pink' : 'text-gray-600'}`}>
                    {isHorror ? '进化' : '系统升级'}
                </h3>
                
                <div className="grid grid-cols-1 gap-3">
                    {/* Pump / Lung */}
                    <button
                        disabled={!canAfford(BuildingType.PUMP)}
                        onClick={() => dispatch({ type: 'BUILD', payload: { building: BuildingType.PUMP } })}
                        className={`p-3 text-left border text-sm transition-all
                            ${isHorror 
                                ? 'border-red-900 bg-red-950/30 text-red-300 disabled:opacity-30' 
                                : 'border-gray-800 bg-gray-900/50 text-gray-300 disabled:opacity-50'
                            }
                            ${canAfford(BuildingType.PUMP) ? 'hover:border-cyan-500 cursor-pointer' : 'cursor-not-allowed'}
                        `}
                    >
                        <div className="font-bold">{isHorror ? '增生肺叶组织' : '修复氧气泵'}</div>
                        <div className="text-xs opacity-60 mt-1">消耗: {getCostString(BuildingType.PUMP)}</div>
                    </button>

                    {/* Filter / Gills */}
                    <button
                        disabled={!canAfford(BuildingType.BIO_FILTER)}
                        onClick={() => dispatch({ type: 'BUILD', payload: { building: BuildingType.BIO_FILTER } })}
                        className={`p-3 text-left border text-sm transition-all
                            ${isHorror 
                                ? 'border-red-900 bg-red-950/30 text-red-300 disabled:opacity-30' 
                                : 'border-gray-800 bg-gray-900/50 text-gray-300 disabled:opacity-50'
                            }
                             ${canAfford(BuildingType.BIO_FILTER) ? 'hover:border-cyan-500 cursor-pointer' : 'cursor-not-allowed'}
                        `}
                    >
                        <div className="font-bold">{isHorror ? '发育鳃裂' : '安装生物过滤器'}</div>
                        <div className="text-xs opacity-60 mt-1">消耗: {getCostString(BuildingType.BIO_FILTER)}</div>
                    </button>

                    {/* Nodes / Nervous System */}
                     <button
                        disabled={!canAfford(BuildingType.NODE)}
                        onClick={() => dispatch({ type: 'BUILD', payload: { building: BuildingType.NODE } })}
                        className={`p-3 text-left border text-sm transition-all
                            ${isHorror 
                                ? 'border-red-900 bg-red-950/30 text-red-300 disabled:opacity-30' 
                                : 'border-gray-800 bg-gray-900/50 text-gray-300 disabled:opacity-50'
                            }
                             ${canAfford(BuildingType.NODE) ? 'hover:border-cyan-500 cursor-pointer' : 'cursor-not-allowed'}
                        `}
                    >
                        <div className="font-bold">{isHorror ? '扩张神经系统' : '连接管道节点'}</div>
                        <div className="text-xs opacity-60 mt-1">消耗: {getCostString(BuildingType.NODE)}</div>
                    </button>
                </div>
            </div>
        )}

      </div>
      
      {/* Reset Button (Hidden-ish) */}
      <button 
        onClick={() => { if(confirm("确定要删除存档重置吗? (Wipe save?)")) dispatch({type: 'RESET_GAME'}) }}
        className="absolute bottom-4 right-4 text-xs text-gray-800 hover:text-red-900 z-50"
      >
        强制重置 (HARD RESET)
      </button>
    </div>
  );
};