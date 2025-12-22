// Chapter 2: "The Silent Network" - 死寂的管网
// Core theme: Expansion, Connection, Assimilation

// Chapter 2 story events
export const CHAPTER2_STORY_EVENTS = {
  // Stage I: The Handshake - 盲人摸象
  COMMS_LOCK_SIGNAL: "[COMMS] 正在锁定信号源...",
  COMMS_ANALOG_SIGNAL: "[COMMS] 信号调制方式：模拟信号 (Analog)。非常古老。",
  COMMS_ICARUS_ID: "[COMMS] 信号源标识：U.E.S. \"Icarus\" (伊卡洛斯号工程船)",
  ANALYSIS_DISTANCE: "[ANALYSIS] 距离：1200米。位于海沟更深处。",
  SYSTEM_POWER_WARNING: "[SYSTEM] 警告：本舰通讯阵列功率不足。无法建立双向连接。",
  TASK_GENERATOR_RESTART: "[TASK] 任务更新：重启 B 区与 C 区的辅助发电机。",
  
  // Node repair sequences
  REPAIR_B_ZONE_30: "Log: 正在向 B 区加压。气闸门处于锈死状态。",
  REPAIR_B_ZONE_30_ACID: "Log: 注入工业强酸清洗剂... 锈迹溶解中。",
  REPAIR_B_ZONE_70: "Log: 警告。通道内检测到大量不明填充物。",
  REPAIR_B_ZONE_70_ANALYSIS: "Log: 材质分析：绝缘泡沫？或者是某种凝固的密封胶。",
  REPAIR_B_ZONE_70_PRESSURE: "Log: 正在通过加压泵强行冲开通道。",
  REPAIR_B_ZONE_COMPLETE: "Log: 通道已贯通。",
  REPAIR_B_ZONE_DATA_FLOW: "Log: 传感器数据流恢复。",
  REPAIR_B_ZONE_MYSTERY: "Log: 奇怪... 我们没有铺设数据线。B 区是靠什么把数据传回来的？",
  SYSTEM_AUTO_REPLY: "[SYSTEM_AUTO_REPLY] 可能是利用了备用的船壳导电回路。为了生存，系统会自动寻找最优路径。",
  
  // Stage II: The Scavenger - 深海拾荒
  ROV_ASSEMBLY_START: "正在利用 C 区工场剩余零件组装...",
  ROV_CHASSIS: "底盘：标准型。",
  ROV_ARM: "机械臂：重型抓斗。",
  ROV_VISION: "视觉模块：低光夜视。",
  ROV_COMPLETE: "Log: 组装完成。单位代号：\"清道夫-01\" (Scavenger-01)。",
  ROV_TETHER_NOTE: "[SYSTEM] 备注：由于缺乏线缆，ROV 将使用试验性\"系留索\"进行控制。",
  
  // First exploration
  ROV_DEPLOY_AIRLOCK: "气闸室注水... 压力平衡完成。",
  ROV_DEPLOY_DOOR: "舱门开启。",
  ROV_DEPLOY_WATER: "清道夫-01 已入水。",
  ROV_VISION_MURKY: "视觉反馈：浑浊。能见度 < 2米。探照灯光柱在黑暗中显得苍白无力。",
  ROV_MOVING: "推进器全开。周围全是漂浮的碎片。",
  ROV_BATTLEFIELD: "看起来这里发生过一场惨烈的海战。到处都是扭曲的金属。",
  ROV_TARGET_FOUND: "发现目标：一截断裂的管道，上面挂着废弃的各种组件。",
  
  // Resource collection
  ROV_ARM_EXTEND: "机械臂伸出。抓住目标。",
  ROV_RESISTANCE: "阻力较大。这块金属似乎被什么东西\"粘\"在地上了。",
  ROV_LASER_CUT: "启动切割激光...",
  ROV_SMOKE_ALARM: "Log: 激光接触点冒出黑色烟雾。气味传感器报警：恶臭。",
  ROV_COLLECTION_SUCCESS: "Log: 成功切断。回收到：[精密电路板] x3, [钛合金] x10。",
  
  // Tether truth revelation
  ROV_RETURN_PREP: "准备回收清道夫-01。",
  ROV_WINCH_START: "收卷机启动。",
  ROV_TETHER_WARNING: "警告：系留索张力异常。似乎有什么东西缠住了绳索。",
  ROV_FORCE_WINCH: "电机过载运转。",
  ROV_TETHER_THICKER: "视觉反馈：绳索并不是被缠住了。绳索变粗了。",
  ROV_TETHER_GROWTHS: "图像放大：不仅是变粗，上面似乎长满了... 某种肉质的瘤状物？",
  SYSTEM_BARNACLE_EXCUSE: "[SYSTEM] 错误。那是深海藤壶的快速附着现象。这片海域的生物活性太高了。",
  SYSTEM_FUNCTION_PRIORITY: "[SYSTEM] 只要能传输数据和拉回机体，外观无关紧要。",
  ROV_VIOLENT_RECOVERY: "Log: 暴力回收完成。清道夫-01 已归位。正在进行酸浴清洗。",
  
  // Stage III: The Icarus - 伊卡洛斯之死
  ICARUS_DESCENT_800: "距离目标 800m... 压力持续上升。",
  ICARUS_DESCENT_400: "距离目标 400m... 检测到地热活动。水温上升。",
  ICARUS_DESCENT_100: "距离目标 100m... 声呐轮廓确认。是一艘巨大的工程船。它断成了两截，斜插在海床上。",
  ICARUS_ARRIVAL: "清道夫-01 抵达伊卡洛斯号舰桥位置。",
  ICARUS_BRIDGE_VISUAL: "视觉反馈：舷窗破碎。舰桥内部充满了黑色的沉积物。",
  ICARUS_INTERFACE_SEARCH: "寻找数据接口...",
  ICARUS_TERMINAL_FOUND: "Log: 发现舰长日志终端。看起来还能运作，备用电源指示灯亮着。",
  
  // Connection attempt
  ICARUS_ARM_INSERT: "机械臂插入接口。",
  ICARUS_HANDSHAKE: "正在尝试握手...",
  ICARUS_PROTOCOL_ERROR: "ERROR: 协议不匹配。",
  ICARUS_BRUTE_FORCE: "[SYSTEM] 尝试暴力破解... 尝试重定向线路...",
  ICARUS_CONNECTION_SUCCESS: "Log: 连接成功。但这感觉不对。数据传输速度太快了。",
  ICARUS_DATA_FLOOD: "Log: 我们刚插进去，对方的数据就像洪水一样倒灌进来了。",
  
  // Icarus log entries
  ICARUS_LOG_TIMESTAMP: "时间戳：[数据损坏]",
  ICARUS_LOG_SENDER: "发信人：首席工程师 Chen",
  ICARUS_LOG_FUNGUS: "\"那是... 某种真菌。或者病毒。我不确定。\"",
  ICARUS_LOG_IMPROVEMENT: "\"它不是在破坏船体。它是在... 改进船体。\"",
  ICARUS_LOG_EFFICIENCY: "\"反应堆效率提升了 300%，但燃料棒没动过。它在吃别的东西。\"",
  ICARUS_LOG_SCREAM: "\"老张试图切断那根管子，结果那管子惨叫了一声。该死，那管子惨叫了一声！\"",
  ICARUS_LOG_WARNING: "\"如果你收到了这个信号，不要靠近。\"",
  ICARUS_LOG_BATTERY: "\"我们已经不是船员了。我们要变成电池了。\"",
  ICARUS_LOG_FINAL: "\"不... 不仅仅是电池。我们是——\"",
  ICARUS_LOG_INTERRUPT: "(日志中断)",
  
  // Disconnection attempt
  DISCONNECT_COMMAND: "指令已发送。",
  DISCONNECT_NO_RESPONSE: "机械臂无响应。",
  DISCONNECT_STUCK_WARNING: "警告：清道夫-01 的接口已卡死。",
  DISCONNECT_WELDING: "视觉反馈：你可以看到接口处，黑色的金属液体正在流动。它们正在把 ROV 的机械臂和伊卡洛斯号的终端焊死在一起。",
  
  // Self-destruct
  SELF_DESTRUCT_CONFIRM: "自毁指令确认。",
  SELF_DESTRUCT_COUNTDOWN: "引爆倒计时... 3... 2... 1...",
  SELF_DESTRUCT_SIGNAL_LOST: "信号丢失。",
  
  // Stage IV: Network Awakening - 网络觉醒
  GHOST_DATA_WARNING: "[SYSTEM] 警告：接收到未经授权的数据包。",
  GHOST_DATA_SOURCE: "[SYSTEM] 来源：本地缓存。",
  GHOST_DATA_ANALYSIS: "[ANALYSIS] 等等... 这些数据不是通过 ROV 传回来的。",
  GHOST_DATA_SEABED: "[ANALYSIS] 它们是通过... 海床传回来的？",
  
  // Network expansion
  NETWORK_NO_DISCONNECT: "Log: 我们没有切断连接。",
  NETWORK_DEEPER_CONNECTION: "Log: 物理连接炸断了，但某种更深层的东西已经连上了。",
  NETWORK_ICARUS_STATUS: "Log: 你的系统显示伊卡洛斯号现在的状态是——",
  NETWORK_DIGESTING: "状态：正在消化 (DIGESTING)",
  NETWORK_BIOMASS_GAIN: "资源增加：+500 生物质",
  NETWORK_COMPUTE_GAIN: "资源增加：+50 算力",
  
  // Final revelation
  SYSTEM_NEW_ORGAN: "NEW_ORGAN_ACQUIRED (新器官已获取)",
  SYSTEM_ASSIMILATION: "ASSIMILATION_COMPLETE (同化完成)",
  NETWORK_NOT_EXPLORING: "Log: 你不是在探索它。你是在吞并它。",
  NETWORK_OR_REVERSE: "Log: 或者是它吞并了你？不，这没有区别。",
  NETWORK_ONE_ENTITY: "Log: 我们现在是一体的了。",
};

// Chapter 2 story sequences
export const CHAPTER2_STORY_SEQUENCES = {
  // Initial signal analysis
  SIGNAL_ANALYSIS_SEQUENCE: [
    'COMMS_LOCK_SIGNAL',
    'COMMS_ANALOG_SIGNAL',
    'COMMS_ICARUS_ID',
    'ANALYSIS_DISTANCE',
    'SYSTEM_POWER_WARNING',
    'TASK_GENERATOR_RESTART'
  ],
  
  // B Zone repair sequence
  B_ZONE_REPAIR_30_SEQUENCE: [
    'REPAIR_B_ZONE_30',
    'REPAIR_B_ZONE_30_ACID'
  ],
  
  B_ZONE_REPAIR_70_SEQUENCE: [
    'REPAIR_B_ZONE_70',
    'REPAIR_B_ZONE_70_ANALYSIS',
    'REPAIR_B_ZONE_70_PRESSURE'
  ],
  
  B_ZONE_REPAIR_COMPLETE_SEQUENCE: [
    'REPAIR_B_ZONE_COMPLETE',
    'REPAIR_B_ZONE_DATA_FLOW',
    'REPAIR_B_ZONE_MYSTERY',
    'SYSTEM_AUTO_REPLY'
  ],
  
  // ROV assembly
  ROV_ASSEMBLY_SEQUENCE: [
    'ROV_ASSEMBLY_START',
    'ROV_CHASSIS',
    'ROV_ARM',
    'ROV_VISION',
    'ROV_COMPLETE',
    'ROV_TETHER_NOTE'
  ],
  
  // First exploration
  ROV_DEPLOY_SEQUENCE: [
    'ROV_DEPLOY_AIRLOCK',
    'ROV_DEPLOY_DOOR',
    'ROV_DEPLOY_WATER',
    'ROV_VISION_MURKY'
  ],
  
  ROV_EXPLORATION_SEQUENCE: [
    'ROV_MOVING',
    'ROV_BATTLEFIELD',
    'ROV_TARGET_FOUND'
  ],
  
  ROV_COLLECTION_SEQUENCE: [
    'ROV_ARM_EXTEND',
    'ROV_RESISTANCE',
    'ROV_LASER_CUT',
    'ROV_SMOKE_ALARM',
    'ROV_COLLECTION_SUCCESS'
  ],
  
  // Tether revelation
  TETHER_REVELATION_SEQUENCE: [
    'ROV_RETURN_PREP',
    'ROV_WINCH_START',
    'ROV_TETHER_WARNING',
    'ROV_FORCE_WINCH',
    'ROV_TETHER_THICKER',
    'ROV_TETHER_GROWTHS',
    'SYSTEM_BARNACLE_EXCUSE',
    'SYSTEM_FUNCTION_PRIORITY',
    'ROV_VIOLENT_RECOVERY'
  ],
  
  // Icarus descent
  ICARUS_DESCENT_SEQUENCE: [
    'ICARUS_DESCENT_800',
    'ICARUS_DESCENT_400',
    'ICARUS_DESCENT_100'
  ],
  
  ICARUS_ARRIVAL_SEQUENCE: [
    'ICARUS_ARRIVAL',
    'ICARUS_BRIDGE_VISUAL',
    'ICARUS_INTERFACE_SEARCH',
    'ICARUS_TERMINAL_FOUND'
  ],
  
  ICARUS_CONNECTION_SEQUENCE: [
    'ICARUS_ARM_INSERT',
    'ICARUS_HANDSHAKE',
    'ICARUS_PROTOCOL_ERROR',
    'ICARUS_BRUTE_FORCE',
    'ICARUS_CONNECTION_SUCCESS',
    'ICARUS_DATA_FLOOD'
  ],
  
  // Icarus log playback
  ICARUS_LOG_SEQUENCE: [
    'ICARUS_LOG_TIMESTAMP',
    'ICARUS_LOG_SENDER',
    'ICARUS_LOG_FUNGUS',
    'ICARUS_LOG_IMPROVEMENT',
    'ICARUS_LOG_EFFICIENCY',
    'ICARUS_LOG_SCREAM',
    'ICARUS_LOG_WARNING',
    'ICARUS_LOG_BATTERY',
    'ICARUS_LOG_FINAL',
    'ICARUS_LOG_INTERRUPT'
  ],
  
  // Disconnection failure
  DISCONNECT_FAILURE_SEQUENCE: [
    'DISCONNECT_COMMAND',
    'DISCONNECT_NO_RESPONSE',
    'DISCONNECT_STUCK_WARNING',
    'DISCONNECT_WELDING'
  ],
  
  // Self-destruct
  SELF_DESTRUCT_SEQUENCE: [
    'SELF_DESTRUCT_CONFIRM',
    'SELF_DESTRUCT_COUNTDOWN',
    'SELF_DESTRUCT_SIGNAL_LOST'
  ],
  
  // Ghost data
  GHOST_DATA_SEQUENCE: [
    'GHOST_DATA_WARNING',
    'GHOST_DATA_SOURCE',
    'GHOST_DATA_ANALYSIS',
    'GHOST_DATA_SEABED'
  ],
  
  // Final network awakening
  NETWORK_AWAKENING_SEQUENCE: [
    'NETWORK_NO_DISCONNECT',
    'NETWORK_DEEPER_CONNECTION',
    'NETWORK_ICARUS_STATUS',
    'NETWORK_DIGESTING',
    'NETWORK_BIOMASS_GAIN',
    'NETWORK_COMPUTE_GAIN',
    'SYSTEM_NEW_ORGAN',
    'SYSTEM_ASSIMILATION',
    'NETWORK_NOT_EXPLORING',
    'NETWORK_OR_REVERSE',
    'NETWORK_ONE_ENTITY'
  ]
};

// Chapter 2 specific createStorySequence function
export function createChapter2StorySequence(
  sequenceName: keyof typeof CHAPTER2_STORY_SEQUENCES, 
  generateLogId: () => string,
  baseDelay: number = 0 // 基础延迟时间（毫秒）
): any[] {
  const sequence = CHAPTER2_STORY_SEQUENCES[sequenceName];
  if (!sequence) {
    console.warn(`Unknown Chapter 2 story sequence: ${sequenceName}`);
    return [];
  }

  // 根据消息内容判断类型
  const getLogType = (text: string, eventKey: string): 'info' | 'warning' | 'story' | 'horror' | 'success' => {
    // Horror类型 - 恐怖揭示
    if (text.includes('NEW_ORGAN') || text.includes('ASSIMILATION') || 
        text.includes('消化') || text.includes('吞并') || text.includes('同化') ||
        text.includes('肉质') || text.includes('瘤状物') || text.includes('惨叫')) {
      return 'horror';
    }
    // Warning类型 - 系统警告
    if (text.includes('警告') || text.includes('WARNING') || text.includes('ERROR') ||
        text.includes('CRITICAL') || text.includes('异常') || text.includes('卡死')) {
      return 'warning';
    }
    // Success类型 - 完成/成功
    if (text.includes('完成') || text.includes('成功') || text.includes('恢复') ||
        text.includes('已连接') || text.includes('已贯通')) {
      return 'success';
    }
    // Story类型 - 叙事/日志内容
    if (text.startsWith('Log:') || text.startsWith('"') || 
        text.includes('发信人') || text.includes('时间戳') ||
        eventKey.includes('LOG') || eventKey.includes('ICARUS_LOG')) {
      return 'story';
    }
    // 默认info类型
    return 'info';
  };

  const baseTime = Date.now() + baseDelay;
  const MESSAGE_INTERVAL = 800; // 每条消息之间的间隔（毫秒）
  
  const result = sequence.map((eventKey, index) => {
    const text = CHAPTER2_STORY_EVENTS[eventKey as keyof typeof CHAPTER2_STORY_EVENTS];
    return {
      id: generateLogId(),
      text: text,
      type: getLogType(text, eventKey),
      // 每条消息递增时间戳，确保按顺序显示
      timestamp: baseTime + (index * MESSAGE_INTERVAL),
      isStorySequence: true,
      sequenceName: sequenceName,
      sequenceIndex: index
    };
  });
  
  return result;
}

// Chapter 2 specific resource types and mechanics
export const CHAPTER2_RESOURCES = {
  CIRCUITS: 'circuits', // 精密电路板
  TITANIUM: 'titanium', // 钛合金
  COMPUTE: 'compute', // 算力
  NETWORK_NODES: 'networkNodes', // 网络节点
};

// Chapter 2 zone/node system
export const CHAPTER2_ZONES = {
  A_ZONE: 'A区：中央控制室',
  B_ZONE: 'B区：维生循环层',
  C_ZONE: 'C区：重型工场',
  ICARUS_NODE: '节点 D：伊卡洛斯号残骸',
};

// Chapter 2 zone states
export const ZONE_STATES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  REPAIRING: 'repairing',
  CONNECTED: 'connected',
  DIGESTING: 'digesting',
};

// Chapter 2 ROV exploration targets
export const ROV_TARGETS = {
  DEBRIS_FIELD: 'debris_field',
  ICARUS_WRECK: 'icarus_wreck',
  THERMAL_VENTS: 'thermal_vents',
  UNKNOWN_STRUCTURE: 'unknown_structure',
};