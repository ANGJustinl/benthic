import React from 'react';
import { GameState, GameAction, ResourceType, BuildingType } from '../types';
import { Chapter1UI } from '../chapters/chapter1/ui';
import { Chapter2UI } from '../chapters/chapter2/ui';
import { Chapter3UI } from '../chapters/chapter3/ui';

interface ControlPanelProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ state, dispatch }) => {
  const isHorror = state.phase >= 3;

  return (
    <div className={`h-full flex flex-col items-center justify-center p-8 transition-colors duration-1000 relative ${isHorror ? 'bg-flesh-bg' : 'bg-transparent'}`}>
      
      {/* Background Ambience */}
      {isHorror && (
          <div className="absolute inset-0 pointer-events-none opacity-10 animate-pulse-slow">
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900 via-black to-black"></div>
          </div>
      )}

      <div className="w-full max-w-md space-y-3 z-10">
        
        {/* 
          第三章UI腐化设计：
          - Phase 1-2: 叠加式显示（第一章 + 第二章）
          - Phase 3: 第三章**完全替换**之前的UI，只显示有机化的界面
        */}
        
        {state.phase < 3 ? (
          <>
            {/* 第一章UI - Phase 1-2 显示 */}
            <Chapter1UI state={state} dispatch={dispatch} />
            
            {/* 第二章UI - Phase 2 叠加显示 */}
            {state.phase >= 2 && state.chapter2 && (
              <Chapter2UI state={state} dispatch={dispatch} />
            )}
          </>
        ) : (
          /* 第三章UI - Phase 3 完全替换之前的UI */
          state.chapter3 && (
            <Chapter3UI state={state} dispatch={dispatch} />
          )
        )}

      </div>
      
      {/* Reset Button */}
      <button 
        onClick={() => { 
          if(confirm("确定要删除存档重置吗? (Wipe save?)")) {
            dispatch({type: 'RESET_GAME'});
            window.location.reload();
          }
        }}
        className="absolute bottom-4 right-4 text-xs text-gray-800 hover:text-red-900 z-50"
      >
        强制重置 (HARD RESET)
      </button>
      
      {/* Chapter 2 Test Button (Development only) */}
      <button 
        onClick={() => { 
          if(confirm("跳转到第二章测试? (Jump to Chapter 2?)")) {
            dispatch({type: 'LOAD_GAME', payload: {
              ...state,
              phase: 2,
              chapter1Stage: 'complete',
              flags: { ...state.flags, commsRepaired: true, revealedTruth: true, hasLight: true, filtersUnlocked: true, furnaceUnlocked: true },
              resources: { 
                [ResourceType.OXYGEN]: 80, 
                [ResourceType.SCRAP]: 100, 
                [ResourceType.BIOMASS]: 50, 
                [ResourceType.LUMENS]: 20,
                [ResourceType.EVOLUTION]: 0
              },
              buildings: { 
                ...state.buildings, 
                [BuildingType.PUMP]: 2  // 给2个氧气泵保证氧气供应
              },
              power: 500, // 足够修复B区(300)和C区(500)
              filterWaste: 10, // 给一些滤芯废料
              chapter2: {
                zones: {
                  A_ZONE: { name: 'A区：中央控制室', status: 'online', repairProgress: 100, powerRequired: 0, scrapRequired: 0, unlocked: true },
                  B_ZONE: { name: 'B区：维生循环层', status: 'offline', repairProgress: 0, powerRequired: 300, scrapRequired: 50, unlocked: true },
                  C_ZONE: { name: 'C区：重型工场', status: 'offline', repairProgress: 0, powerRequired: 500, scrapRequired: 100, unlocked: true },
                },
                rov: { assembled: false, deployed: false, currentTarget: null, explorationProgress: 0, destroyed: false, tetherCorrupted: false },
                networkNodes: 0, computePower: 0, dataPackets: 0, ghostDataReceived: false,
                circuits: 10, titanium: 30,
                signalAnalyzed: false, bZoneRepaired: false, cZoneRepaired: false,
                rovFirstDeployment: false, tetherTruthRevealed: false, icarusLogRead: false,
                icarusAssimilated: false, networkAwakened: false, chapter2Stage: 'handshake'
              }
            }})
          }
        }}
        className="absolute bottom-4 left-4 text-xs text-blue-800 hover:text-blue-600 z-50"
      >
        测试第二章 (Test Ch2)
      </button>
      
      {/* Chapter 3 Test Button (Development only) */}
      <button 
        onClick={() => { 
          if(confirm("跳转到第三章测试? (Jump to Chapter 3?)")) {
            dispatch({type: 'LOAD_GAME', payload: {
              ...state,
              phase: 3,
              chapter1Stage: 'complete',
              flags: { ...state.flags, commsRepaired: true, revealedTruth: true, hasLight: true, filtersUnlocked: true, furnaceUnlocked: true },
              resources: { 
                [ResourceType.OXYGEN]: 100, 
                [ResourceType.SCRAP]: 200, 
                [ResourceType.BIOMASS]: 500, 
                [ResourceType.LUMENS]: 50,
                [ResourceType.EVOLUTION]: 0
              },
              buildings: { 
                ...state.buildings, 
                [BuildingType.PUMP]: 3
              },
              power: 1000,
              filterWaste: 20,
              chapter2: {
                zones: {
                  A_ZONE: { name: 'A区：中央控制室', status: 'online', repairProgress: 100, powerRequired: 0, scrapRequired: 0, unlocked: true },
                  B_ZONE: { name: 'B区：维生循环层', status: 'online', repairProgress: 100, powerRequired: 300, scrapRequired: 50, unlocked: true },
                  C_ZONE: { name: 'C区：重型工场', status: 'online', repairProgress: 100, powerRequired: 500, scrapRequired: 100, unlocked: true },
                  ICARUS_NODE: { name: '节点 D：伊卡洛斯号残骸', status: 'digesting', repairProgress: 100, powerRequired: 0, scrapRequired: 0, unlocked: true },
                },
                rov: { assembled: true, deployed: false, currentTarget: null, explorationProgress: 0, destroyed: true, tetherCorrupted: true },
                networkNodes: 1, computePower: 100, dataPackets: 0, ghostDataReceived: true,
                circuits: 50, titanium: 100,
                signalAnalyzed: true, bZoneRepaired: true, cZoneRepaired: true,
                rovFirstDeployment: true, tetherTruthRevealed: true, icarusLogRead: true,
                icarusAssimilated: true, networkAwakened: true, chapter2Stage: 'complete'
              },
              chapter3: {
                chapter3Stage: 'fever',
                resourceOverflow: true,
                metabolismAccelerated: false,
                coreTemperatureOrganic: 38.5,
                neuralVoltage: 100,
                structuralIntegrity: 100,
                carapaceDensity: 'softening',
                shellShed: false,
                mapOrganicized: false,
                organicZones: {},
                poseidonDetected: false,
                poseidonApproaching: false,
                poseidonAssimilated: false,
                hasSung: false,
                finalChoiceAvailable: false,
                chosenEnding: null,
                uiCorruptionLevel: 30,
                coolantInjected: false,
                emergencyReinforceAttempted: false,
                poseidonSongSent: false,
              }
            }})
          }
        }}
        className="absolute bottom-12 left-4 text-xs text-purple-800 hover:text-purple-600 z-50"
      >
        测试第三章 (Test Ch3)
      </button>
    </div>
  );
};
