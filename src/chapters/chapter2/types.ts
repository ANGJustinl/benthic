// Chapter 2 specific types and interfaces

export interface Chapter2State {
  // Zone system
  zones: {
    [key: string]: {
      name: string;
      status: 'online' | 'offline' | 'repairing' | 'connected' | 'digesting' | 'organic';
      repairProgress: number; // 0-100
      powerRequired: number;
      scrapRequired: number;
      unlocked: boolean;
    };
  };
  
  // ROV system
  rov: {
    assembled: boolean;
    deployed: boolean;
    currentTarget: string | null;
    explorationProgress: number; // 0-100
    destroyed: boolean;
    tetherCorrupted: boolean;
  };
  
  // Network system
  networkNodes: number;
  computePower: number;
  dataPackets: number;
  ghostDataReceived: boolean;
  
  // Chapter 2 specific resources
  circuits: number;
  titanium: number;
  
  // Chapter 2 flags
  signalAnalyzed: boolean;
  bZoneRepaired: boolean;
  cZoneRepaired: boolean;
  rovFirstDeployment: boolean;
  tetherTruthRevealed: boolean;
  icarusLogRead: boolean;
  icarusAssimilated: boolean;
  networkAwakened: boolean;
  
  // Chapter 2 stage progression
  chapter2Stage: 'handshake' | 'scavenger' | 'icarus' | 'awakening' | 'complete';
}

export interface Chapter2Action {
  type: 'CHAPTER2_ACTION';
  payload: {
    action: 'ANALYZE_SIGNAL' | 'REPAIR_ZONE' | 'ASSEMBLE_ROV' | 'DEPLOY_ROV' | 
            'EXPLORE_TARGET' | 'READ_ICARUS_LOG' | 'DISCONNECT_ROV' | 'SELF_DESTRUCT_ROV' |
            'PROCESS_GHOST_DATA' | 'COMPLETE_CHAPTER2';
    target?: string;
    progress?: number;
  };
}

// ROV exploration results
export interface ExplorationResult {
  success: boolean;
  resources: {
    circuits?: number;
    titanium?: number;
    biomass?: number;
    scrap?: number;
  };
  narrative: string[];
  corruption?: boolean; // Whether this exploration causes tether corruption
}

// Zone repair requirements
export interface ZoneRepairCost {
  power: number;
  scrap: number;
  time: number; // in seconds
}

// Network node connection
export interface NetworkConnection {
  sourceNode: string;
  targetNode: string;
  connectionType: 'physical' | 'neural' | 'assimilated';
  dataFlow: number;
  corruptionLevel: number; // 0-100, higher = more biological
}