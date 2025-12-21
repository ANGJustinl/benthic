import { useReducer, useEffect } from 'react';
import { GameState, GameAction, ResourceType, BuildingType, LogEntry } from '../types';
import { COSTS, PRODUCTION, SCALING_FACTOR, STORY_EVENTS, OXYGEN_DECAY_BASE, INITIAL_MAX_OXYGEN, createStorySequence } from '../constants';

// Helper function to generate unique log IDs
let logIdCounter = 0;
function generateLogId(): string {
  return `${Date.now()}-${++logIdCounter}`;
}

const initialState: GameState = {
  resources: {
    [ResourceType.OXYGEN]: 3.8, // Start at critical level
    [ResourceType.LUMENS]: 0,
    [ResourceType.BIOMASS]: 0,
    [ResourceType.SCRAP]: 0,
    [ResourceType.EVOLUTION]: 0,
  },
  buildings: {
    [BuildingType.PUMP]: 0,
    [BuildingType.BIO_FILTER]: 0,
    [BuildingType.NODE]: 0,
    [BuildingType.NEURAL_LINK]: 0,
    [BuildingType.COMMS_ARRAY]: 0,
  },
  flags: {
    gameStarted: false,
    hasLight: false,
    hasScavenged: false,
    inspectedJam: false,
    commsRepaired: false,
    oxygenCrisis: true, // Start in crisis
    revealedTruth: false,
    // Chapter 1 specific flags
    systemBooted: true, // System should be booted at start
    crankStarted: false,
    filtersUnlocked: false,
    sonarUnlocked: false,
    impactOccurred: false,
    sosReceived: false,
    // Stage specific flags
    overheated: false,
    lowTempWarning: false,
    coldWeldingDiscovered: false,
    damageControlActive: false,
    furnaceUnlocked: false,
  },
  phase: 1,
  chapter1Stage: 'boot',
  logs: [], // Start with empty logs, will be populated by boot sequence
  lastTick: Date.now(),
  totalClicks: 0,
  lastCrankTime: Date.now() - 2000, // Set to 2 seconds ago so button is immediately available
  lastFilterTime: Date.now() - 3000, // 3 seconds ago
  lastFurnaceTime: Date.now() - 4000, // 4 seconds ago
  lastSonarTime: Date.now() - 8000, // 8 seconds ago
  lastDiagnosticsTime: Date.now() - 10000, // 10 seconds ago
  maxOxygen: INITIAL_MAX_OXYGEN,
  // Chapter 1 specific state
  coreTemperature: 2, // Start cold
  power: 0,
  filterWaste: 0,
  crankClicks: 0,
  furnaceUses: 0, // Track furnace usage for progressive messages
  sonarPings: 0,
  hullIntegrity: 100,
  damageControlTimer: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TICK': {
      const newState = { ...state, lastTick: action.payload.now };
      
      // Boot sequence handling
      if (!state.flags.systemBooted && state.logs.length === 0) {
        // Start boot sequence
        const bootLogs = createStorySequence('BOOT_SEQUENCE', generateLogId);
        newState.logs = bootLogs;
        return newState;
      }
      
      // Calculate production
      let oxygenGen = state.buildings[BuildingType.PUMP] * PRODUCTION[BuildingType.PUMP][ResourceType.OXYGEN] || 0;
      let biomassGen = state.buildings[BuildingType.BIO_FILTER] * (PRODUCTION[BuildingType.BIO_FILTER][ResourceType.BIOMASS] || 0);
      
      // Phase 3 Evolution gen
      if (state.phase === 3) {
         biomassGen += state.buildings[BuildingType.NODE] * 0.2; 
      }

      // Base Consumption (Entropy) - reduced for Chapter 1 to make it more playable
      const oxygenConsumption = state.phase === 1 ? OXYGEN_DECAY_BASE * 0.8 : OXYGEN_DECAY_BASE;
      
      // Update Resources
      let newOxygen = state.resources[ResourceType.OXYGEN] + oxygenGen - oxygenConsumption;
      
      // Cap Oxygen
      if (newOxygen > state.maxOxygen) newOxygen = state.maxOxygen;
      
      // Oxygen Crisis Check - Chapter 1 specific
      if (newOxygen <= 1 && state.chapter1Stage === 'boot' && !state.flags.oxygenCrisis) {
        newState.flags.oxygenCrisis = true;
        newState.logs = [
          ...createStorySequence('OXYGEN_CRISIS_SEQUENCE', generateLogId),
          ...state.logs
        ];
      } else if (newOxygen > 5) {
        newState.flags.oxygenCrisis = false;
      }
      
      // Ensure oxygen doesn't go below 0
      if (newOxygen <= 0) {
        newOxygen = 0;
      }

      newState.resources = {
        ...state.resources,
        [ResourceType.OXYGEN]: newOxygen,
        [ResourceType.BIOMASS]: state.resources[ResourceType.BIOMASS] + biomassGen,
      };

      // Temperature effects
      if (state.coreTemperature < 5 && !state.flags.lowTempWarning) {
        newState.flags.lowTempWarning = true;
        newState.logs = [
          ...createStorySequence('LOW_TEMP_SEQUENCE', generateLogId),
          ...newState.logs
        ];
      }

      // Damage control timer
      if (state.damageControlTimer > 0) {
        newState.damageControlTimer = Math.max(0, state.damageControlTimer - 1);
        if (newState.damageControlTimer === 0) {
          newState.flags.damageControlActive = false;
        }
      }
      
      // Overheat cooldown - reset after 5 seconds
      if (state.flags.overheated && action.payload.now - state.lastCrankTime > 5000) {
        newState.flags.overheated = false;
      }
      
      return newState;
    }

    case 'MANUAL_CRANK': {
        const now = Date.now();
        
        // Check if overheated - if so, block the action
        if (state.flags.overheated) {
            return state; // Don't allow cranking while overheated
        }
        
        if (now - state.lastCrankTime < 1000) return state; // 1s Cooldown enforced

        const gain = 3; // Oxygen gain per crank
        let newLogs = state.logs;
        const newCrankClicks = state.crankClicks + 1;
        let newFlags = { ...state.flags };
        let newChapter1Stage = state.chapter1Stage;
        
        // Track clicking frequency for overheat detection
        const timeSinceLastClick = now - state.lastCrankTime;
        const isRapidClicking = timeSinceLastClick < 2000;
        
        // Mark system as started
        if (!state.flags.crankStarted) {
            newFlags.crankStarted = true;
            newFlags.gameStarted = true;
        }
        
        // Check for overheat BEFORE adding regular messages
        if (isRapidClicking && newCrankClicks > 10 && !state.flags.overheated) {
            newFlags.overheated = true;
            // Add overheat sequence and return immediately, don't process the crank
            return {
                ...state,
                flags: newFlags,
                crankClicks: newCrankClicks,
                lastCrankTime: now,
                logs: [
                    ...createStorySequence('OVERHEAT_SEQUENCE', generateLogId),
                    ...state.logs
                ]
            };
        }
        
        // Check for stage transition first
        let isStageTransition = false;
        if (state.chapter1Stage === 'boot' && state.resources[ResourceType.OXYGEN] + gain > 20 && newCrankClicks > 15) {
            newChapter1Stage = 'rust';
            newFlags.filtersUnlocked = true;
            newLogs = [
                ...createStorySequence('RUST_STAGE_TRANSITION', generateLogId),
                ...state.logs
            ];
            isStageTransition = true;
        }
        
        // Only show regular crank messages if not transitioning stages
        if (!isStageTransition) {
            // Different responses based on click count
            if (newCrankClicks <= 5) {
                // Rust phase
                const rustMessages = [STORY_EVENTS.CRANK_RUST_1, STORY_EVENTS.CRANK_RUST_2, STORY_EVENTS.CRANK_RUST_3];
                const randomMessage = rustMessages[Math.floor(Math.random() * rustMessages.length)];
                newLogs = [{
                    id: generateLogId(),
                    text: randomMessage,
                    type: 'warning' as const,
                    timestamp: now
                }, ...state.logs];
            } else if (newCrankClicks <= 15) {
                // Hope phase
                const hopeMessages = [STORY_EVENTS.CRANK_HOPE_1, STORY_EVENTS.CRANK_HOPE_2];
                const randomMessage = hopeMessages[Math.floor(Math.random() * hopeMessages.length)];
                newLogs = [{
                    id: generateLogId(),
                    text: randomMessage,
                    type: 'info' as const,
                    timestamp: now
                }, ...state.logs];
            } else if (newCrankClicks <= 30) {
                // Recovery phase
                const recoveryMessages = [STORY_EVENTS.CRANK_RECOVERY_1, STORY_EVENTS.CRANK_RECOVERY_2, STORY_EVENTS.CRANK_RECOVERY_3];
                const randomMessage = recoveryMessages[Math.floor(Math.random() * recoveryMessages.length)];
                newLogs = [{
                    id: generateLogId(),
                    text: randomMessage,
                    type: 'info' as const,
                    timestamp: now
                }, ...state.logs];
            }
        }

        return {
            ...state,
            resources: {
                ...state.resources,
                [ResourceType.OXYGEN]: Math.min(state.resources[ResourceType.OXYGEN] + gain, state.maxOxygen)
            },
            flags: newFlags,
            chapter1Stage: newChapter1Stage,
            crankClicks: newCrankClicks,
            lastCrankTime: now,
            logs: newLogs
        };
    }

    case 'MANUAL_BREATHE': {
        const now = Date.now();
        if (now - state.lastCrankTime < 1000) return state; // 1s Cooldown enforced

        const gain = 5; // Oxygen gain per breath
        let newLogs = state.logs;
        let newFlags = { ...state.flags };
        
        // Mark system as started
        if (!state.flags.gameStarted) {
            newFlags.gameStarted = true;
            newLogs = [{
                id: generateLogId(),
                text: STORY_EVENTS.FIRST_BREATH,
                type: 'info',
                timestamp: now
            }, ...state.logs];
        }

        return {
            ...state,
            resources: {
                ...state.resources,
                [ResourceType.OXYGEN]: Math.min(state.resources[ResourceType.OXYGEN] + gain, state.maxOxygen)
            },
            flags: newFlags,
            totalClicks: state.totalClicks + 1,
            lastCrankTime: now,
            logs: newLogs
        };
    }

    case 'SCRUB_FILTERS': {
        if (!state.flags.filtersUnlocked) return state;
        
        const now = Date.now();
        if (now - state.lastFilterTime < 2000) return state; // 2秒冷却时间
        
        const wasteGain = Math.random() * 2 + 1; // 1-3 kg
        const newWasteTotal = state.filterWaste + wasteGain;
        let newFlags = { ...state.flags };
        
        // 选择消息
        let message = '';
        if (!state.flags.furnaceUnlocked && newWasteTotal >= 3) {
            // 当废料达到3kg且还没解锁燃烧室时，显示科学备注
            message = STORY_EVENTS.FILTER_SCIENCE;
            newFlags.furnaceUnlocked = true;
        } else {
            // 其他情况显示常规消息
            const regularMessages = [STORY_EVENTS.FILTER_SCRUB_1, STORY_EVENTS.FILTER_SCRUB_2, STORY_EVENTS.FILTER_SCRUB_3];
            message = regularMessages[Math.floor(Math.random() * regularMessages.length)];
        }
        
        return {
            ...state,
            filterWaste: newWasteTotal,
            flags: newFlags,
            lastFilterTime: now,
            logs: [{
                id: generateLogId(),
                text: message,
                type: 'info' as const,
                timestamp: now
            }, ...state.logs]
        };
    }

    case 'FEED_FURNACE': {
        if (state.filterWaste < 1) return state;
        
        const now = Date.now();
        if (now - state.lastFurnaceTime < 3000) return state; // 3秒冷却时间
        
        const powerGain = 15;
        const tempGain = 2;
        const wasteConsumed = 1;
        const newFurnaceUses = state.furnaceUses + 1;
        
        // 根据使用次数显示不同的消息
        let furnaceMessage = '';
        let messageType: 'info' | 'success' | 'warning' = 'info';
        
        if (newFurnaceUses === 1) {
            furnaceMessage = STORY_EVENTS.FURNACE_FIRST_USE;
            messageType = 'info';
        } else if (newFurnaceUses === 3) {
            furnaceMessage = STORY_EVENTS.FURNACE_WARMING_UP;
            messageType = 'info';
        } else if (newFurnaceUses === 5) {
            furnaceMessage = STORY_EVENTS.FURNACE_STABLE_BURN;
            messageType = 'warning';
        } else if (newFurnaceUses === 7) {
            furnaceMessage = STORY_EVENTS.FURNACE_EFFICIENT;
            messageType = 'success';
        } else if (newFurnaceUses === 10) {
            furnaceMessage = STORY_EVENTS.FURNACE_OPTIMAL;
            messageType = 'success';
        }
        
        // 只在特定次数显示消息
        let newLogs = state.logs;
        if (furnaceMessage) {
            newLogs = [{
                id: generateLogId(),
                text: furnaceMessage,
                type: messageType,
                timestamp: now
            }, ...state.logs];
        }

        const newTemp = state.coreTemperature + tempGain;
        let newFlags = { ...state.flags };
        let newChapter1Stage = state.chapter1Stage;

        // Check for optimal temperature
        if (newTemp >= 20 && state.coreTemperature < 20) {
            const warmSequence = createStorySequence('WARM_SEQUENCE', generateLogId);
            newLogs = [
                ...warmSequence,
                ...newLogs
            ];
        }

        // Transition to ghost stage when power is sufficient
        if (state.chapter1Stage === 'rust' && state.power + powerGain >= 60) {
            newChapter1Stage = 'ghost';
            newFlags.sonarUnlocked = true;
            newLogs = [
                {
                    id: generateLogId(),
                    text: STORY_EVENTS.SONAR_UNLOCK,
                    type: 'success' as const,
                    timestamp: now
                },
                ...newLogs
            ];
        }

        return {
            ...state,
            filterWaste: state.filterWaste - wasteConsumed,
            power: state.power + powerGain,
            coreTemperature: newTemp,
            furnaceUses: newFurnaceUses,
            flags: newFlags,
            chapter1Stage: newChapter1Stage,
            lastFurnaceTime: now,
            logs: newLogs
        };
    }

    case 'SONAR_PING': {
        if (!state.flags.sonarUnlocked || state.power < 20) return state;
        
        const now = Date.now();
        if (now - state.lastSonarTime < 4000) return state; // 4秒冷却时间
        
        const newPings = state.sonarPings + 1;
        let newLogs = state.logs;
        let newFlags = { ...state.flags };
        let newChapter1Stage = state.chapter1Stage;

        console.log(`SONAR_PING: newPings = ${newPings}, current sonarPings = ${state.sonarPings}`);

        if (newPings === 1) {
            // First ping - empty
            console.log('Creating SONAR_PING_1 sequence');
            const sonarSequence = createStorySequence('SONAR_PING_1', generateLogId);
            newLogs = [
                ...sonarSequence,
                ...state.logs
            ];
        } else if (newPings === 2) {
            // Second ping - terrain
            console.log('Creating SONAR_PING_2 sequence');
            const sonarSequence = createStorySequence('SONAR_PING_2', generateLogId);
            newLogs = [
                ...sonarSequence,
                ...state.logs
            ];
        } else if (newPings === 3) {
            // Third ping - anomaly
            console.log('Creating SONAR_PING_3 sequence');
            const sonarSequence = createStorySequence('SONAR_PING_3', generateLogId);
            newLogs = [
                ...sonarSequence,
                ...state.logs
            ];
        }

        return {
            ...state,
            power: state.power - 20,
            sonarPings: newPings,
            flags: newFlags,
            chapter1Stage: newChapter1Stage,
            lastSonarTime: now,
            logs: newLogs
        };
    }

    case 'FULL_DIAGNOSTICS': {
        if (!state.flags.sonarUnlocked || state.flags.coldWeldingDiscovered) return state;
        
        const now = Date.now();
        if (now - state.lastDiagnosticsTime < 8000) return state; // 8秒冷却时间
        
        let newFlags = { ...state.flags };
        let newChapter1Stage = state.chapter1Stage;
        
        // 使用序列化的诊断日志
        const diagnosticLogs = createStorySequence('DIAGNOSTIC_SEQUENCE', generateLogId);

        newFlags.coldWeldingDiscovered = true;

        // Random chance to trigger impact after diagnostics
        if (Math.random() < 0.3) {
            newChapter1Stage = 'impact';
            newFlags.impactOccurred = true;
            newFlags.damageControlActive = true;
            
            const impactLogs = createStorySequence('IMPACT_SEQUENCE', generateLogId);
            
            // 确保撞击序列的时间戳在诊断序列之后
            const adjustedImpactLogs = impactLogs.map((log, index) => ({
                ...log,
                timestamp: now + (index * 100) // 撞击序列在诊断序列之后显示
            }));
            
            return {
                ...state,
                hullIntegrity: 62,
                damageControlTimer: 60, // 60 seconds
                flags: newFlags,
                chapter1Stage: newChapter1Stage,
                lastDiagnosticsTime: now,
                logs: [...adjustedImpactLogs, ...diagnosticLogs, ...state.logs]
            };
        }

        return {
            ...state,
            flags: newFlags,
            lastDiagnosticsTime: now,
            logs: [...diagnosticLogs, ...state.logs]
        };
    }

    case 'DAMAGE_CONTROL': {
        if (!state.flags.damageControlActive) return state;
        
        const actionType = action.payload.action;
        let success = false;
        let message = '';
        
        switch (actionType) {
            case 'seal_a':
                success = Math.random() < 0.3; // 30% success rate
                message = success ? STORY_EVENTS.SEAL_B_SUCCESS : STORY_EVENTS.SEAL_A_FAIL;
                break;
            case 'seal_b':
                success = true;
                message = STORY_EVENTS.SEAL_B_SUCCESS;
                break;
            case 'pump':
                success = true;
                message = STORY_EVENTS.PUMP_OVERCLOCK;
                break;
            case 'hardener':
                success = true;
                message = STORY_EVENTS.HARDENER_RELEASE;
                break;
        }

        let newHullIntegrity = state.hullIntegrity;
        if (success) {
            newHullIntegrity = Math.min(100, state.hullIntegrity + 10);
        }

        // Check if damage control is complete
        if (newHullIntegrity >= 80 || state.damageControlTimer <= 10) {
            // Damage control successful, trigger SOS sequence
            const sosLogs = createStorySequence('SOS_SEQUENCE', generateLogId);

            return {
                ...state,
                chapter1Stage: 'complete',
                phase: 2, // Transition to phase 2
                hullIntegrity: newHullIntegrity,
                resources: {
                    ...state.resources,
                    [ResourceType.SCRAP]: state.resources[ResourceType.SCRAP] + 20, // Give some starting scrap
                    [ResourceType.BIOMASS]: state.resources[ResourceType.BIOMASS] + 10, // Give some starting biomass
                },
                flags: { 
                    ...state.flags, 
                    sosReceived: true,
                    damageControlActive: false,
                    revealedTruth: true,
                    hasLight: true, // Ensure light is available for Phase 2
                },
                damageControlTimer: 0,
                logs: [
                    {
                        id: generateLogId(),
                        text: "系统重启完成。进入标准操作模式。",
                        type: 'success' as const,
                        timestamp: Date.now() + 100
                    },
                    ...sosLogs,
                    {
                        id: generateLogId(),
                        text: message,
                        type: success ? 'success' as const : 'warning' as const,
                        timestamp: Date.now() - 1200
                    },
                    ...state.logs
                ]
            };
        }

        return {
            ...state,
            hullIntegrity: newHullIntegrity,
            logs: [{
                id: generateLogId(),
                text: message,
                type: success ? 'success' as const : 'warning' as const,
                timestamp: Date.now()
            }, ...state.logs]
        };
    }

    case 'IGNITE_FLARE': {
        if (state.flags.hasLight || state.resources[ResourceType.OXYGEN] < 10) return state;
        
        return {
            ...state,
            resources: {
                ...state.resources,
                [ResourceType.OXYGEN]: state.resources[ResourceType.OXYGEN] - 10
            },
            flags: {
                ...state.flags,
                hasLight: true
            },
            logs: [{
                id: generateLogId(),
                text: STORY_EVENTS.LIGHT_ON,
                type: 'success',
                timestamp: Date.now()
            }, ...state.logs]
        };
    }

    case 'SCAVENGE': {
        if (!state.flags.hasLight) return state;
        
        // Generate random resources based on what the scraper finds
        const resourceTypes = [ResourceType.BIOMASS, ResourceType.SCRAP, ResourceType.LUMENS];
        const randomResource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
        
        let resourceGain = 0;
        let logMessage = STORY_EVENTS.DISCOVERY_BIOMASS;
        
        switch (randomResource) {
            case ResourceType.BIOMASS:
                resourceGain = Math.random() * 2 + 1; // biomass
                logMessage = STORY_EVENTS.DISCOVERY_BIOMASS;
                break;
            case ResourceType.SCRAP:
                resourceGain = Math.random() * 3 + 2; // scrap
                logMessage = "刮削器返回：金属碎片。可回收利用。";
                break;
            case ResourceType.LUMENS:
                resourceGain = Math.random() * 1 + 0.5; // 0.5-1.5 lumens
                logMessage = "刮削器返回：发光藻类。生物荧光微弱但稳定。";
                break;
        }
        
        let newLogs = [{
            id: generateLogId(),
            text: logMessage,
            type: 'info' as const,
            timestamp: Date.now()
        }, ...state.logs];
        
        let newFlags = { ...state.flags };
        
        // Trigger jam event at 10+ total scavenged resources
        const totalScavenged = state.resources[ResourceType.BIOMASS] + state.resources[ResourceType.SCRAP];
        if (totalScavenged + resourceGain >= 10 && !state.flags.hasScavenged) {
            newFlags.hasScavenged = true;
            newLogs = [{
                id: generateLogId(),
                text: STORY_EVENTS.SCRAPER_JAMMED,
                type: 'warning',
                timestamp: Date.now()
            }, ...newLogs];
        }
        
        return {
            ...state,
            resources: {
                ...state.resources,
                [randomResource]: state.resources[randomResource] + resourceGain
            },
            flags: newFlags,
            logs: newLogs
        };
    }

    case 'INSPECT_JAM': {
        if (state.flags.inspectedJam) return state;
        
        return {
            ...state,
            flags: {
                ...state.flags,
                inspectedJam: true
            },
            logs: [{
                id: generateLogId(),
                text: STORY_EVENTS.INSPECT_JAM,
                type: 'story',
                timestamp: Date.now()
            }, ...state.logs]
        };
    }

    case 'REPAIR_COMMS': {
        const building = BuildingType.COMMS_ARRAY;
        const costConfig = COSTS[building];
        const currentCount = state.buildings[building];
        
        // Verify resources
        const canAfford = Object.entries(costConfig).every(([res, amount]) => {
            const scaledCost = Math.floor(amount * Math.pow(SCALING_FACTOR, currentCount));
            return state.resources[res as ResourceType] >= scaledCost;
        });

        if (!canAfford || state.flags.commsRepaired) return state;

        // Deduct resources
        const newResources = { ...state.resources };
        Object.entries(costConfig).forEach(([res, amount]) => {
            const scaledCost = Math.floor(amount * Math.pow(SCALING_FACTOR, currentCount));
            newResources[res as ResourceType] -= scaledCost;
        });

        return {
            ...state,
            phase: 2, // Transition to Phase 2 after communications repair
            resources: {
                ...newResources,
                // Give starting resources for Phase 2
                [ResourceType.SCRAP]: newResources[ResourceType.SCRAP] + 15, // Enough for first pump
                [ResourceType.BIOMASS]: newResources[ResourceType.BIOMASS] + 10, // Enough for first pump
                [ResourceType.LUMENS]: newResources[ResourceType.LUMENS] + 5, // Some lumens to start
            },
            buildings: {
                ...state.buildings,
                [BuildingType.COMMS_ARRAY]: currentCount + 1
            },
            flags: {
                ...state.flags,
                commsRepaired: true,
                revealedTruth: true,
                hasLight: true, // Ensure light is available for Phase 2
            },
            logs: [
                ...createStorySequence('COMMS_REPAIR_SEQUENCE', generateLogId),
                {
                    id: generateLogId(),
                    text: "系统重启中... 检测到新的可用资源。",
                    type: 'info' as const,
                    timestamp: Date.now() - 200
                },
                ...state.logs
            ]
        };
    }

    case 'BUILD': {
        const building = action.payload.building;
        const currentCount = state.buildings[building];
        const costConfig = COSTS[building];
        
        // Verify resources
        const canAfford = Object.entries(costConfig).every(([res, amount]) => {
            const scaledCost = Math.floor(amount * Math.pow(SCALING_FACTOR, currentCount));
            return state.resources[res as ResourceType] >= scaledCost;
        });

        if (!canAfford) return state;

        // Deduct resources
        const newResources = { ...state.resources };
        Object.entries(costConfig).forEach(([res, amount]) => {
            const scaledCost = Math.floor(amount * Math.pow(SCALING_FACTOR, currentCount));
            newResources[res as ResourceType] -= scaledCost;
        });

        // Add building
        const newBuildings = { ...state.buildings, [building]: currentCount + 1 };
        
        let newPhase = state.phase;
        let newLogs = state.logs;

        // Check Phase 3 transition (Example logic, might need adjustment based on Chapter 1)
        if (building === BuildingType.NODE && newBuildings[BuildingType.NODE] >= 5 && state.phase === 2) {
             newPhase = 3;
             newLogs = [{
                id: generateLogId(),
                text: STORY_EVENTS.PHASE_3_START,
                type: 'horror' as const,
                timestamp: Date.now()
            }, ...state.logs];
        }

        return {
            ...state,
            resources: newResources,
            buildings: newBuildings,
            phase: newPhase,
            logs: newLogs
        };
    }

    case 'LOAD_GAME':
        return action.payload;
    
    case 'RESET_GAME':
        return initialState;

    default:
        return state;
  }
}

export function useGameEngine() {
    // Load initial state from local storage if exists
    const init = () => {
        const saved = localStorage.getItem('benthic_save');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Simple migration check: if chapter1Stage undefined, reset or add default
                if (typeof parsed.chapter1Stage === 'undefined') {
                    return initialState;
                }
                return parsed;
            } catch (e) {
                console.error("Save file corrupted");
                return initialState;
            }
        }
        return initialState;
    };

    const [state, dispatch] = useReducer(gameReducer, undefined, init);

    // Game Loop
    useEffect(() => {
        const timer = setInterval(() => {
            dispatch({ type: 'TICK', payload: { now: Date.now() } });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-save
    useEffect(() => {
        localStorage.setItem('benthic_save', JSON.stringify(state));
    }, [state]);

    return { state, dispatch };
}