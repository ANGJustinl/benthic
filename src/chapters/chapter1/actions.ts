import { GameState, GameAction, ResourceType, BuildingType } from '../../types';
import { CHAPTER1_STORY_EVENTS } from './constants';
import { COSTS, SCALING_FACTOR } from '../../constants';

// Helper function to generate unique log IDs
let logIdCounter = 0;
function generateLogId(): string {
  return `${Date.now()}-${++logIdCounter}`;
}

export class Chapter1Actions {
  static handleManualCrank(state: GameState): GameState {
    const now = Date.now();
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
    
    // Different responses based on click count
    if (newCrankClicks <= 5) {
        // Rust phase
        const rustMessages = [CHAPTER1_STORY_EVENTS.CRANK_RUST_1, CHAPTER1_STORY_EVENTS.CRANK_RUST_2, CHAPTER1_STORY_EVENTS.CRANK_RUST_3];
        const randomMessage = rustMessages[Math.floor(Math.random() * rustMessages.length)];
        newLogs = [{
            id: generateLogId(),
            text: randomMessage,
            type: 'warning' as const,
            timestamp: now
        }, ...state.logs];
    } else if (newCrankClicks <= 15) {
        // Hope phase
        const hopeMessages = [CHAPTER1_STORY_EVENTS.CRANK_HOPE_1, CHAPTER1_STORY_EVENTS.CRANK_HOPE_2];
        const randomMessage = hopeMessages[Math.floor(Math.random() * hopeMessages.length)];
        newLogs = [{
            id: generateLogId(),
            text: randomMessage,
            type: 'info' as const,
            timestamp: now
        }, ...state.logs];
    } else if (newCrankClicks <= 30) {
        // Recovery phase
        const recoveryMessages = [CHAPTER1_STORY_EVENTS.CRANK_RECOVERY_1, CHAPTER1_STORY_EVENTS.CRANK_RECOVERY_2, CHAPTER1_STORY_EVENTS.CRANK_RECOVERY_3];
        const randomMessage = recoveryMessages[Math.floor(Math.random() * recoveryMessages.length)];
        newLogs = [{
            id: generateLogId(),
            text: randomMessage,
            type: 'info' as const,
            timestamp: now
        }, ...state.logs];
    }
    
    // Overheat warning for rapid clicking
    if (isRapidClicking && newCrankClicks > 10 && !state.flags.overheated) {
        newFlags.overheated = true;
        newLogs = [
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.RHYTHM_TIP,
                type: 'warning' as const,
                timestamp: now
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.FORCED_COOLING,
                type: 'warning' as const,
                timestamp: now - 100
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.OVERHEAT_WARNING,
                type: 'warning' as const,
                timestamp: now - 200
            },
            ...newLogs
        ];
    }

    // Transition to rust lung stage
    if (state.chapter1Stage === 'boot' && state.resources[ResourceType.OXYGEN] + gain > 20 && newCrankClicks > 15) {
        newChapter1Stage = 'rust';
        newFlags.filtersUnlocked = true;
        newLogs = [
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.COLD_ENVIRONMENT,
                type: 'info' as const,
                timestamp: now
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.ENGINEERING_UNLOCK,
                type: 'success' as const,
                timestamp: now - 100
            },
            ...newLogs
        ];
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

  static handleScrubFilters(state: GameState): GameState {
    if (!state.flags.filtersUnlocked) return state;
    
    const wasteGain = Math.random() * 2 + 1; // 1-3 kg
    const messages = [CHAPTER1_STORY_EVENTS.FILTER_SCRUB_1, CHAPTER1_STORY_EVENTS.FILTER_SCRUB_2, CHAPTER1_STORY_EVENTS.FILTER_SCRUB_3, CHAPTER1_STORY_EVENTS.FILTER_SCIENCE];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return {
        ...state,
        filterWaste: state.filterWaste + wasteGain,
        logs: [{
            id: generateLogId(),
            text: randomMessage,
            type: 'info' as const,
            timestamp: Date.now()
        }, ...state.logs]
    };
  }

  static handleFeedFurnace(state: GameState): GameState {
    if (state.filterWaste < 1) return state;
    
    const powerGain = 15;
    const tempGain = 2;
    const wasteConsumed = 1;
    
    let newLogs = [
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.FURNACE_IMPACT,
            type: 'info' as const,
            timestamp: Date.now()
        },
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.FURNACE_BURN,
            type: 'info' as const,
            timestamp: Date.now() - 100
        },
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.FURNACE_IGNITE,
            type: 'info' as const,
            timestamp: Date.now() - 200
        },
        ...state.logs
    ];

    const newTemp = state.coreTemperature + tempGain;
    let newFlags = { ...state.flags };
    let newChapter1Stage = state.chapter1Stage;

    // Check for optimal temperature
    if (newTemp >= 20 && state.coreTemperature < 20) {
        newLogs = [
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.DONT_ANTHROPOMORPHIZE,
                type: 'info' as const,
                timestamp: Date.now()
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.WARM_SOUNDS,
                type: 'story' as const,
                timestamp: Date.now() - 100
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.WARM_LIGHT,
                type: 'info' as const,
                timestamp: Date.now() - 200
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.OPTIMAL_TEMP,
                type: 'success' as const,
                timestamp: Date.now() - 300
            },
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
                text: CHAPTER1_STORY_EVENTS.SONAR_UNLOCK,
                type: 'success' as const,
                timestamp: Date.now()
            },
            ...newLogs
        ];
    }

    return {
        ...state,
        filterWaste: state.filterWaste - wasteConsumed,
        power: state.power + powerGain,
        coreTemperature: newTemp,
        flags: newFlags,
        chapter1Stage: newChapter1Stage,
        logs: newLogs
    };
  }

  static handleSonarPing(state: GameState): GameState {
    if (!state.flags.sonarUnlocked || state.power < 20) return state;
    
    const newPings = state.sonarPings + 1;
    let newLogs = state.logs;
    let newFlags = { ...state.flags };
    let newChapter1Stage = state.chapter1Stage;

    if (newPings === 1) {
        // First ping - empty
        newLogs = [
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PING_1_ENV,
                type: 'info' as const,
                timestamp: Date.now()
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PING_1_RESULT,
                type: 'info' as const,
                timestamp: Date.now() - 100
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PING_1_WAIT,
                type: 'info' as const,
                timestamp: Date.now() - 200
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PING_1_SEND,
                type: 'info' as const,
                timestamp: Date.now() - 300
            },
            ...state.logs
        ];
    } else if (newPings === 2) {
        // Second ping - terrain
        newLogs = [
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PING_2_ANALYSIS,
                type: 'info' as const,
                timestamp: Date.now()
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PING_2_RESULT,
                type: 'info' as const,
                timestamp: Date.now() - 100
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PING_1_SEND,
                type: 'info' as const,
                timestamp: Date.now() - 200
            },
            ...state.logs
        ];
    } else if (newPings === 3) {
        // Third ping - anomaly
        newLogs = [
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PING_3_INTERNAL,
                type: 'warning' as const,
                timestamp: Date.now()
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PING_3_LOCATION,
                type: 'warning' as const,
                timestamp: Date.now() - 100
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PING_3_DISTANCE,
                type: 'warning' as const,
                timestamp: Date.now() - 200
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PING_3_WARNING,
                type: 'warning' as const,
                timestamp: Date.now() - 300
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PING_1_SEND,
                type: 'info' as const,
                timestamp: Date.now() - 400
            },
            ...state.logs
        ];
    }

    return {
        ...state,
        power: state.power - 20,
        sonarPings: newPings,
        flags: newFlags,
        chapter1Stage: newChapter1Stage,
        logs: newLogs
    };
  }

  static handleFullDiagnostics(state: GameState): GameState {
    if (!state.flags.sonarUnlocked) return state;
    
    let newFlags = { ...state.flags };
    let newChapter1Stage = state.chapter1Stage;
    
    const diagnosticLogs = [
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.CONCLUSION,
            type: 'info' as const,
            timestamp: Date.now()
        },
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.DATABASE,
            type: 'info' as const,
            timestamp: Date.now() - 100
        },
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.PHYSICS_LOG,
            type: 'info' as const,
            timestamp: Date.now() - 200
        },
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.ANOMALY,
            type: 'warning' as const,
            timestamp: Date.now() - 300
        },
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.DETAIL,
            type: 'info' as const,
            timestamp: Date.now() - 400
        },
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.OBSERVATION,
            type: 'info' as const,
            timestamp: Date.now() - 500
        },
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.IMG_PROCESS,
            type: 'info' as const,
            timestamp: Date.now() - 600
        },
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.DRONE_CAMERA,
            type: 'info' as const,
            timestamp: Date.now() - 700
        },
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.WALL_THICKNESS,
            type: 'warning' as const,
            timestamp: Date.now() - 800
        },
        {
            id: generateLogId(),
            text: CHAPTER1_STORY_EVENTS.DIAGNOSTIC_ALERT,
            type: 'warning' as const,
            timestamp: Date.now() - 900
        },
        ...state.logs
    ];

    newFlags.coldWeldingDiscovered = true;

    // Random chance to trigger impact after diagnostics
    if (Math.random() < 0.3) {
        newChapter1Stage = 'impact';
        newFlags.impactOccurred = true;
        newFlags.damageControlActive = true;
        
        const impactLogs = [
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.WATER_INTRUSION,
                type: 'warning' as const,
                timestamp: Date.now()
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.HULL_DAMAGE,
                type: 'warning' as const,
                timestamp: Date.now() - 100
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.IMPACT_WARNING,
                type: 'warning' as const,
                timestamp: Date.now() - 200
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.VIBRATION_DETECT,
                type: 'warning' as const,
                timestamp: Date.now() - 300
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.SYSTEM_INTERRUPT,
                type: 'warning' as const,
                timestamp: Date.now() - 400
            },
            ...diagnosticLogs
        ];
        
        return {
            ...state,
            hullIntegrity: 30, // Start at critical 30%
            damageControlTimer: 60, // 60 seconds
            damageControlProgress: {
                seal_a: false,
                seal_b: false,
                pump: false,
                hardener: false
            },
            flags: newFlags,
            chapter1Stage: newChapter1Stage,
            logs: impactLogs
        };
    }

    return {
        ...state,
        flags: newFlags,
        logs: diagnosticLogs
    };
  }

  static handleDamageControl(state: GameState, action: string): GameState {
    if (!state.flags.damageControlActive) return state;
    
    // Track which actions have been successfully completed
    const damageControlProgress = state.damageControlProgress || {
      seal_a: false,
      seal_b: false,
      pump: false,
      hardener: false
    };
    
    // If this action was already completed, ignore
    if (damageControlProgress[action as keyof typeof damageControlProgress]) {
      return {
        ...state,
        logs: [{
          id: generateLogId(),
          text: "该系统已经完成操作。",
          type: 'info' as const,
          timestamp: Date.now()
        }, ...state.logs]
      };
    }
    
    let success = false;
    let message = '';
    let integrityGain = 0;
    
    switch (action) {
        case 'seal_a':
            success = Math.random() < 0.4; // 40% success rate
            message = success ? CHAPTER1_STORY_EVENTS.SEAL_B_SUCCESS : CHAPTER1_STORY_EVENTS.SEAL_A_FAIL;
            integrityGain = success ? 5 : 0; // Reduced from 8
            break;
        case 'seal_b':
            success = Math.random() < 0.6; // 60% success rate
            message = success ? CHAPTER1_STORY_EVENTS.SEAL_B_SUCCESS : CHAPTER1_STORY_EVENTS.SEAL_A_FAIL;
            integrityGain = success ? 5 : 0; // Reduced from 8
            break;
        case 'pump':
            success = Math.random() < 0.7; // 70% success rate
            message = success ? CHAPTER1_STORY_EVENTS.PUMP_OVERCLOCK : "排水泵启动失败！电机过载！";
            integrityGain = success ? 5 : 0; // Reduced from 7
            break;
        case 'hardener':
            success = Math.random() < 0.8; // 80% success rate
            message = success ? CHAPTER1_STORY_EVENTS.HARDENER_RELEASE : "凝胶喷射系统堵塞！";
            integrityGain = success ? 5 : 0; // Reduced from 7
            break;
    }

    let newHullIntegrity = state.hullIntegrity;
    let newDamageControlProgress = { ...damageControlProgress };
    
    if (success) {
        newHullIntegrity = Math.min(100, state.hullIntegrity + integrityGain);
        newDamageControlProgress[action as keyof typeof damageControlProgress] = true;
    }

    // Check if ALL damage control actions are complete
    const allActionsComplete = Object.values(newDamageControlProgress).every(v => v === true);
    
    if (allActionsComplete) {
        // Damage control successful, trigger SOS sequence
        const sosLogs = [
            {
                id: generateLogId(),
                text: "系统重启完成。进入标准操作模式。",
                type: 'success' as const,
                timestamp: Date.now() + 100
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.FINAL_QUESTION,
                type: 'horror' as const,
                timestamp: Date.now()
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.DECODER_SOS,
                type: 'warning' as const,
                timestamp: Date.now() - 100
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.MORSE_SOS,
                type: 'info' as const,
                timestamp: Date.now() - 200
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.MORSE_PATTERN,
                type: 'info' as const,
                timestamp: Date.now() - 300
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.KNOCKING_SOUND,
                type: 'story' as const,
                timestamp: Date.now() - 400
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.AUDIO_AMPLIFY,
                type: 'info' as const,
                timestamp: Date.now() - 500
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.SIGNAL_CAPTURED,
                type: 'info' as const,
                timestamp: Date.now() - 600
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.PASSIVE_LISTEN,
                type: 'info' as const,
                timestamp: Date.now() - 700
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.FORCE_ANALYSIS,
                type: 'story' as const,
                timestamp: Date.now() - 800
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.NOT_EARTHQUAKE,
                type: 'info' as const,
                timestamp: Date.now() - 900
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.WATER_CONTROLLED,
                type: 'success' as const,
                timestamp: Date.now() - 1000
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.IMPACT_STOPPED,
                type: 'success' as const,
                timestamp: Date.now() - 1100
            },
            {
                id: generateLogId(),
                text: message,
                type: success ? 'success' as const : 'warning' as const,
                timestamp: Date.now() - 1200
            },
            ...state.logs
        ];

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
            damageControlProgress: undefined, // Reset for future use
            logs: sosLogs
        };
    }

    return {
        ...state,
        hullIntegrity: newHullIntegrity,
        damageControlProgress: newDamageControlProgress,
        logs: [{
            id: generateLogId(),
            text: message,
            type: success ? 'success' as const : 'warning' as const,
            timestamp: Date.now()
        }, ...state.logs]
    };
  }

  static handleRepairComms(state: GameState): GameState {
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
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.ENDING_C1,
                type: 'horror' as const,
                timestamp: Date.now()
            },
            {
                id: generateLogId(),
                text: CHAPTER1_STORY_EVENTS.COMMS_REPAIRED,
                type: 'success' as const,
                timestamp: Date.now() - 100
            },
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
}