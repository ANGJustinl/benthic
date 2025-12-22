// Chapter 3: "深渊的胎动" (The Fetal Movement of the Abyss)
// Core theme: UI Corruption, Metamorphosis, Transcendence

export interface Chapter3State {
  // Stage progression
  chapter3Stage: 'fever' | 'molt' | 'encounter' | 'ascension' | 'complete';
  
  // Fever stage - resource overflow
  resourceOverflow: boolean;
  metabolismAccelerated: boolean;
  coreTemperatureOrganic: number; // 38.5°C style organic temperature
  neuralVoltage: number; // Replaces power display
  
  // Molt stage - shedding the shell
  structuralIntegrity: number; // 0-100, drops to 0 then transforms
  carapaceDensity: 'softening' | 'hardening' | 'complete';
  shellShed: boolean;
  
  // Map transformation
  mapOrganicized: boolean;
  organicZones: {
    [key: string]: {
      oldName: string;
      newName: string;
      status: 'mechanical' | 'transforming' | 'organic';
    };
  };
  
  // Encounter stage - Poseidon submarine
  poseidonDetected: boolean;
  poseidonApproaching: boolean;
  poseidonAssimilated: boolean;
  hasSung: boolean;
  
  // Ascension stage - final choice
  finalChoiceAvailable: boolean;
  chosenEnding: 'deep' | 'spore' | 'beacon' | null;
  
  // UI corruption level (0-100)
  uiCorruptionLevel: number;
  
  // Flags
  coolantInjected: boolean;
  emergencyReinforceAttempted: boolean;
  poseidonSongSent: boolean;
  epilogueTriggered?: boolean; // 尾声是否已触发（用于延迟黑屏）
}

export interface Chapter3Action {
  type: 'CHAPTER3_ACTION';
  payload: {
    action: 
      | 'INJECT_COOLANT'           // Fever: transforms to "Accelerate Metabolism"
      | 'ACCELERATE_METABOLISM'    // Fever: organic version
      | 'TRIGGER_MOLT_WARNING'     // Auto: molt warning sequence
      | 'EMERGENCY_REINFORCE'      // Molt: fails, triggers shell shedding
      | 'TRIGGER_SHELL_SHED'       // Auto: shell shed sequence
      | 'CONTINUE_MOLT'            // Molt: progress the shedding
      | 'TRIGGER_INTERPRET'        // Auto: interpretation sequence
      | 'TRIGGER_ENCOUNTER'        // Auto: encounter sequence
      | 'SING'                     // Encounter: communicate with Poseidon
      | 'TRIGGER_POSEIDON_RESPONSE'// Auto: Poseidon response sequence
      | 'TRIGGER_ASCENSION_PROMPT' // Auto: ascension prompt sequence
      | 'CHOOSE_ENDING'            // Ascension: final choice
      | 'TRIGGER_EPILOGUE'         // Auto: epilogue sequence
      | 'COMPLETE_CHAPTER3';       // End game (delayed blackout)
    target?: string;
    ending?: 'deep' | 'spore' | 'beacon';
  };
}

// Ending descriptions
export interface EndingResult {
  title: string;
  titleChinese: string;
  description: string;
  narrative: string[];
  finalMessage: string;
}

// Zone transformation mapping
export interface ZoneTransformation {
  mechanical: string;
  organic: string;
  description: string;
}
