// Chapter 3: "深渊的胎动" (The Fetal Movement of the Abyss)
// Core theme: UI Corruption, Metamorphosis, Transcendence

// Chapter 3 story events
export const CHAPTER3_STORY_EVENTS = {
  // === Stage I: The Fever (高烧) ===
  FEVER_RESOURCE_OVERFLOW: "Log: 资源溢出。系统处于亢奋状态。",
  FEVER_TEMPERATURE_CHANGE: "[SYSTEM] 核心体温：38.5°C (状态：舒适)",
  FEVER_NEURAL_VOLTAGE: "[SYSTEM] 神经电压：高频脉冲中",
  FEVER_NO_LIMIT: "Log: 不再有上限。能量不再存储在电池里，而是在神经网络中奔流。",
  
  // Coolant injection sequence
  COOLANT_INJECT_COMMAND: "指令执行：注入流体。",
  COOLANT_TANK_EMPTY: "系统警告：冷却液储罐已空。自动切换至备用源。",
  COOLANT_SEAWATER_MIX: "Log: 正在抽取周围海水... 正在混合内部体液...",
  COOLANT_VISCOUS: "Log: 循环系统已充满。感觉... 更加粘稠热烈。",
  COOLANT_NO_NEED: "[状态更新]：不再需要冷却。热量正在催化生长。",
  COOLANT_BUTTON_TRANSFORM: "[UI] 按钮功能已重定义：[促进代谢 (Accelerate Metabolism)]",
  
  // Metabolism acceleration
  METABOLISM_ACCELERATE: "Log: 代谢加速中... 细胞分裂速率提升 300%。",
  METABOLISM_GROWTH: "Log: 生长因子释放。组织正在重组。",
  METABOLISM_HEAT: "Log: 热量不再是敌人。它是催化剂。",
  
  // === Stage II: The Molt (蜕皮) ===
  MOLT_WARNING: "警告！结构完整性急剧下降！",
  MOLT_BREACH_RISK: "外壳破裂风险：100%",
  
  // Emergency reinforce sequence (fails)
  REINFORCE_ATTEMPT: "正在尝试紧急加固...",
  REINFORCE_FAIL_MATERIAL: "修复失败。材料不匹配。",
  REINFORCE_METAL_FALLING: "金属板正在脱落。铆钉正在崩飞。",
  REINFORCE_NOT_DAMAGE: "Log: 这不是损坏。",
  REINFORCE_SKIN_TIGHT: "Log: 旧的皮肤太紧了。它限制了我们的呼吸。",
  
  // Shell shedding
  SHELL_SHED_FLASH: "[VISUAL] 屏幕闪过一阵白光...",
  SHELL_SHED_RESET: "[SYSTEM] 数据重置中...",
  SHELL_CARAPACE_NEW: "[NEW METRIC] 甲壳硬度 (Carapace Density): 软化期",
  SHELL_CARAPACE_HARDENING: "[UPDATE] 甲壳硬度: 硬化中",
  SHELL_CARAPACE_COMPLETE: "[UPDATE] 甲壳硬度: 完成",
  
  // Map organicization
  MAP_TRANSFORM_START: "Log: 地图正在重新绘制...",
  MAP_CORTEX: "[节点更新] 中央控制室 → 大脑皮层 (Cortex)",
  MAP_HEART_LUNG: "[节点更新] 维生循环层 → 心肺系统 (Heart-Lung)",
  MAP_STOMACH: "[节点更新] 重型工场 → 消化腔 (Stomach)",
  MAP_SYMBIOTE: "[节点更新] 伊卡洛斯残骸 → 共生囊 (Symbiote Sac)",
  
  // New interpretation
  INTERPRET_FEED: "Log: 你不再是在\"生产\"资源。",
  INTERPRET_SCAVENGE: "Log: 你是在进食 (Scavenge → Feed)。",
  INTERPRET_BUILD: "Log: 你是在生长 (Build → Grow)。",
  INTERPRET_COMPUTE: "Log: 你是在做梦 (Compute → Dream)。",
  
  // === Stage III: The Encounter (第三类接触) ===
  ENCOUNTER_SONAR: "[SENSORS] 检测到高频声呐扫描。",
  ENCOUNTER_IDENTIFY: "[IDENTIFY] 目标：U.N.S. \"Poseidon\" (波塞冬号核潜艇)。",
  ENCOUNTER_THREAT: "[THREAT] 对方已开启鱼雷发射管。武器锁定中。",
  
  // Singing sequence
  SING_SEND: "Log: 发送广域调制信号...",
  SING_NOT_RADIO: "Log: 不是无线电。是直接通过海水传递的低频震动。",
  SING_PRESENCE: "Log: 包含信息：单纯的、庞大的存在感。",
  
  // Poseidon response
  POSEIDON_STOP: "[OBSERVATION] 波塞冬号停止了前进。",
  POSEIDON_CLOSE_TUBES: "[OBSERVATION] 鱼雷管关闭。",
  POSEIDON_INTERCEPT: "[INTERCEPT] 截获对方舰内通讯：",
  POSEIDON_QUOTE_1: "\"...上帝啊。它不是一艘船。整座海山... 都是它。\"",
  POSEIDON_QUOTE_2: "\"...它太美了。\"",
  POSEIDON_ENGINE_OFF: "Log: 对方主动关闭了引擎。",
  POSEIDON_SINKING: "Log: 它们正在下沉。它们想离我们更近一点。",
  POSEIDON_WELCOME: "Log: 准备接纳新成员。",
  POSEIDON_ASSIMILATED: "[MAP] 新增节点：[波塞冬号 - 已同化]",
  
  // === Stage IV: Ascension (飞升) ===
  ASCENSION_CRITICAL: "Log: 生长已达临界点。养分循环已闭环。",
  ASCENSION_WOMB: "Log: 我们是深渊的子宫。我们是旧世界的墓碑。",
  ASCENSION_PROMPT: "Log: 下一步指令？",
  
  // Ending A: The Deep (潜渊)
  ENDING_DEEP_1: "根系向下延伸。刺穿地壳。",
  ENDING_DEEP_2: "汲取地核的热量。我们不再需要太阳。",
  ENDING_DEEP_3: "我们将成为这颗星球永恒的、燃烧的心脏。",
  ENDING_DEEP_4: "人类？地表？那只是转瞬即逝的尘埃。",
  ENDING_DEEP_TITLE: "(结局：行星器官)",
  
  // Ending B: The Spore (播种)
  ENDING_SPORE_1: "加压舱开启。释放数以亿计的\"孩子\"。",
  ENDING_SPORE_2: "它们会随着洋流漂向世界的每一个角落。",
  ENDING_SPORE_3: "每一个海滩，每一条河流，每一杯饮用水。",
  ENDING_SPORE_4: "整个世界的生态系统将被重写。所有的生命都将与我们相连。",
  ENDING_SPORE_TITLE: "(结局：生态重塑)",
  
  // Ending C: The Beacon (灯塔)
  ENDING_BEACON_1: "将所有生物能转化为光。",
  ENDING_BEACON_2: "在这万米深渊之下，点亮一颗人造的太阳。",
  ENDING_BEACON_3: "不需要语言。不需要同化。",
  ENDING_BEACON_4: "我们在这里。这就足够了。",
  ENDING_BEACON_5: "看着那些黑暗中的生物像朝圣者一样聚集过来...",
  ENDING_BEACON_TITLE: "(结局：深海神话)",
  
  // Epilogue
  EPILOGUE_HALT: "System Halted.",
  EPILOGUE_LIFE: "Life Initiated.",
};

// Chapter 3 story sequences
export const CHAPTER3_STORY_SEQUENCES = {
  // Fever stage initialization
  FEVER_INIT_SEQUENCE: [
    'FEVER_RESOURCE_OVERFLOW',
    'FEVER_TEMPERATURE_CHANGE',
    'FEVER_NEURAL_VOLTAGE',
    'FEVER_NO_LIMIT'
  ],
  
  // Coolant injection (transforms button)
  COOLANT_SEQUENCE: [
    'COOLANT_INJECT_COMMAND',
    'COOLANT_TANK_EMPTY',
    'COOLANT_SEAWATER_MIX',
    'COOLANT_VISCOUS',
    'COOLANT_NO_NEED',
    'COOLANT_BUTTON_TRANSFORM'
  ],
  
  // Metabolism acceleration
  METABOLISM_SEQUENCE: [
    'METABOLISM_ACCELERATE',
    'METABOLISM_GROWTH',
    'METABOLISM_HEAT'
  ],
  
  // Molt warning
  MOLT_WARNING_SEQUENCE: [
    'MOLT_WARNING',
    'MOLT_BREACH_RISK'
  ],
  
  // Emergency reinforce failure
  REINFORCE_FAIL_SEQUENCE: [
    'REINFORCE_ATTEMPT',
    'REINFORCE_FAIL_MATERIAL',
    'REINFORCE_METAL_FALLING',
    'REINFORCE_NOT_DAMAGE',
    'REINFORCE_SKIN_TIGHT'
  ],
  
  // Shell shedding
  SHELL_SHED_SEQUENCE: [
    'SHELL_SHED_FLASH',
    'SHELL_SHED_RESET',
    'SHELL_CARAPACE_NEW'
  ],
  
  // Map transformation
  MAP_TRANSFORM_SEQUENCE: [
    'MAP_TRANSFORM_START',
    'MAP_CORTEX',
    'MAP_HEART_LUNG',
    'MAP_STOMACH',
    'MAP_SYMBIOTE'
  ],
  
  // New interpretation
  INTERPRET_SEQUENCE: [
    'INTERPRET_FEED',
    'INTERPRET_SCAVENGE',
    'INTERPRET_BUILD',
    'INTERPRET_COMPUTE'
  ],
  
  // Encounter detection
  ENCOUNTER_DETECT_SEQUENCE: [
    'ENCOUNTER_SONAR',
    'ENCOUNTER_IDENTIFY',
    'ENCOUNTER_THREAT'
  ],
  
  // Singing
  SING_SEQUENCE: [
    'SING_SEND',
    'SING_NOT_RADIO',
    'SING_PRESENCE'
  ],
  
  // Poseidon response
  POSEIDON_RESPONSE_SEQUENCE: [
    'POSEIDON_STOP',
    'POSEIDON_CLOSE_TUBES',
    'POSEIDON_INTERCEPT',
    'POSEIDON_QUOTE_1',
    'POSEIDON_QUOTE_2',
    'POSEIDON_ENGINE_OFF',
    'POSEIDON_SINKING',
    'POSEIDON_WELCOME',
    'POSEIDON_ASSIMILATED'
  ],
  
  // Ascension prompt
  ASCENSION_PROMPT_SEQUENCE: [
    'ASCENSION_CRITICAL',
    'ASCENSION_WOMB',
    'ASCENSION_PROMPT'
  ],
  
  // Ending sequences
  ENDING_DEEP_SEQUENCE: [
    'ENDING_DEEP_1',
    'ENDING_DEEP_2',
    'ENDING_DEEP_3',
    'ENDING_DEEP_4',
    'ENDING_DEEP_TITLE'
  ],
  
  ENDING_SPORE_SEQUENCE: [
    'ENDING_SPORE_1',
    'ENDING_SPORE_2',
    'ENDING_SPORE_3',
    'ENDING_SPORE_4',
    'ENDING_SPORE_TITLE'
  ],
  
  ENDING_BEACON_SEQUENCE: [
    'ENDING_BEACON_1',
    'ENDING_BEACON_2',
    'ENDING_BEACON_3',
    'ENDING_BEACON_4',
    'ENDING_BEACON_5',
    'ENDING_BEACON_TITLE'
  ],
  
  // Epilogue
  EPILOGUE_SEQUENCE: [
    'EPILOGUE_HALT',
    'EPILOGUE_LIFE'
  ]
};


// Chapter 3 specific createStorySequence function
export function createChapter3StorySequence(
  sequenceName: keyof typeof CHAPTER3_STORY_SEQUENCES, 
  generateLogId: () => string,
  baseDelay: number = 0
): any[] {
  const sequence = CHAPTER3_STORY_SEQUENCES[sequenceName];
  if (!sequence) {
    console.warn(`Unknown Chapter 3 story sequence: ${sequenceName}`);
    return [];
  }

  // 根据消息内容判断类型
  const getLogType = (text: string, eventKey: string): 'info' | 'warning' | 'story' | 'horror' | 'success' => {
    // Horror类型 - 恐怖/有机揭示
    if (text.includes('粘稠') || text.includes('热烈') || text.includes('催化') ||
        text.includes('蜕皮') || text.includes('皮肤') || text.includes('甲壳') ||
        text.includes('同化') || text.includes('吞并') || text.includes('进食') ||
        text.includes('生长') || text.includes('做梦') || text.includes('子宫') ||
        text.includes('墓碑') || text.includes('心脏') || text.includes('孩子') ||
        eventKey.includes('ENDING') || eventKey.includes('EPILOGUE')) {
      return 'horror';
    }
    // Warning类型 - 系统警告
    if (text.includes('警告') || text.includes('WARNING') || text.includes('风险') ||
        text.includes('失败') || text.includes('脱落') || text.includes('崩飞') ||
        text.includes('THREAT') || text.includes('武器')) {
      return 'warning';
    }
    // Success类型 - 完成/转变
    if (text.includes('完成') || text.includes('已充满') || text.includes('已同化') ||
        text.includes('新增节点') || text.includes('UPDATE')) {
      return 'success';
    }
    // Story类型 - 叙事/日志内容
    if (text.startsWith('Log:') || text.startsWith('"') || 
        text.includes('OBSERVATION') || text.includes('INTERCEPT')) {
      return 'story';
    }
    // 默认info类型
    return 'info';
  };

  const baseTime = Date.now() + baseDelay;
  const MESSAGE_INTERVAL = 1000; // 每条消息之间的间隔（毫秒）- 第三章更慢，更有仪式感
  
  const result = sequence.map((eventKey, index) => {
    const text = CHAPTER3_STORY_EVENTS[eventKey as keyof typeof CHAPTER3_STORY_EVENTS];
    return {
      id: generateLogId(),
      text: text,
      type: getLogType(text, eventKey),
      timestamp: baseTime + (index * MESSAGE_INTERVAL),
      isStorySequence: true,
      sequenceName: sequenceName,
      sequenceIndex: index
    };
  });
  
  return result;
}

// Zone transformation mapping
export const ZONE_TRANSFORMATIONS = {
  A_ZONE: {
    mechanical: 'A区：中央控制室',
    organic: '大脑皮层 (Cortex)',
    description: '神经中枢，处理所有感知和决策'
  },
  B_ZONE: {
    mechanical: 'B区：维生循环层',
    organic: '心肺系统 (Heart-Lung)',
    description: '循环与呼吸，维持生命的核心'
  },
  C_ZONE: {
    mechanical: 'C区：重型工场',
    organic: '消化腔 (Stomach)',
    description: '分解与吸收，将外物转化为自身'
  },
  ICARUS_NODE: {
    mechanical: '节点 D：伊卡洛斯号残骸',
    organic: '共生囊 (Symbiote Sac)',
    description: '第一个被同化的外来器官'
  },
  POSEIDON_NODE: {
    mechanical: '波塞冬号核潜艇',
    organic: '波塞冬号 - 已同化',
    description: '最新的共生体，带来了新的能力'
  }
};

// Ending configurations
export const ENDINGS = {
  deep: {
    title: 'The Deep',
    titleChinese: '潜渊',
    subtitle: '行星器官',
    description: '继续向下，扎根地幔。成为这颗星球永恒的、燃烧的心脏。'
  },
  spore: {
    title: 'The Spore',
    titleChinese: '播种',
    subtitle: '生态重塑',
    description: '释放无数个微小的孢子。整个世界的生态系统将被重写。'
  },
  beacon: {
    title: 'The Beacon',
    titleChinese: '灯塔',
    subtitle: '深海神话',
    description: '将所有生物能转化为光。在万米深渊之下，点亮一颗人造的太阳。'
  }
};
