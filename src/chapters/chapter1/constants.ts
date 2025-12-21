// Chapter 1 story events
export const CHAPTER1_STORY_EVENTS = {
  // Stage I - The Cold Boot
  NEURAL_INTERFACE: "检测到神经接口接入...",
  BIO_RECOGNITION_FAIL: "生物特征识别：失败 (数据已腐败)",
  FORCE_BOOT: "强制引导协议：启动",
  
  SYS_BOOT: "[SYS_BOOT] 正在挂载主分区...",
  HARDWARE_REACTOR: "[HARDWARE] 核心反应堆：<无响应>",
  HARDWARE_PUMP: "[HARDWARE] 维生循环泵：<无响应>",
  SENSOR_DEPTH: "[SENSOR] 深度计：######## (数据溢出)",
  ENV_PRESSURE: "[ENV] 外部压力监测：警告，读数超出量程。推测深度 > 8000m。",
  ENV_TEMP: "[ENV] 舱内温度：2°C",
  ALERT_SCRUBBER: "[ALERT] 空气洗涤器效率：0%。二氧化碳浓度正在上升。",
  CRITICAL_OXYGEN: "[CRITICAL] 氧气浓度：3.8% (临界值)",
  
  // Crank interactions
  CRANK_RUST_1: "液压杆发出令人牙酸的金属摩擦声。锈迹剥落。",
  CRANK_RUST_2: "阻尼过大。阀门纹丝不动。连杆承受压力：85%。",
  CRANK_RUST_3: "警告：检测到肌肉乳酸堆积。操作效率下降。",
  
  CRANK_HOPE_1: "听到了流体流动的咕噜声。液压油开始注入活塞。",
  CRANK_HOPE_2: "阀门转动 15 度。一股冰冷的气流喷在脸上，带着陈腐的机油味。",
  
  CRANK_RECOVERY_1: "进气扇叶开始旋转。轴承发出尖锐的啸叫。",
  CRANK_RECOVERY_2: "过滤网正在拦截大颗粒杂质。进气效率：12%。",
  CRANK_RECOVERY_3: "氧气浓度回升中... 肺部的灼烧感略微减轻。",
  
  OVERHEAT_WARNING: "警告：机械臂伺服电机过热 (120°C)。",
  FORCED_COOLING: "强制冷却中... 请勿操作。",
  RHYTHM_TIP: "系统提示：保持节奏。慌乱会加速耗氧。",
  
  // Critical failure
  CRITICAL_FAILURE: "CRITICAL_FAILURE",
  OXYGEN_DEPLETION: "OXYGEN_DEPLETION", 
  CORTICAL_PAUSE: "CORTICAL_FUNCTIONS_PAUSED",
  
  // Stage II - The Rust Lung
  ENGINEERING_UNLOCK: "解锁新区域：[动力室 (Engineering)]",
  COLD_ENVIRONMENT: "舱内极度寒冷。呼出的气凝结成霜。如果不尽快恢复供暖，电子元件将因低温失效。",
  
  FILTER_SCRUB_1: "刮下 2.4kg 灰黑色的沉积物。手感粘稠。",
  FILTER_SCRUB_2: "滤网上缠绕着一些半透明的纤维。可能是深海管水母的触须碎片。",
  FILTER_SCRUB_3: "清理出大块胶状污泥。分析显示含有高浓度的硫化物和油脂。深海雪 (Marine Snow) 在这个深度异常粘稠。",
  FILTER_SCIENCE: "系统备注：深海高压下，有机碎屑会发生聚合反应，形成这种类似沥青的物质。适合作为粗燃料。",
  
  FURNACE_IGNITE: "燃烧室舱门关闭。点火序列启动。",
  FURNACE_BURN: "听到沉闷的爆燃声。污泥中的油脂正在剧烈燃烧。",
  FURNACE_IMPACT: "燃烧室内壁传来不规则的撞击声。可能是未燃尽的硬壳类物质在撞击涡轮叶片。建议忽略。",
  
  LOW_TEMP_WARNING: "警告：液压油粘度增加。所有操作耗时增加 50%。",
  LCD_FREEZE: "警告：显示器刷新率下降。液晶凝固中。",
  OPTIMAL_TEMP: "系统状态：最佳。",
  WARM_LIGHT: "照明系统：完全恢复。卤素灯丝发出温暖的黄光。",
  WARM_SOUNDS: "这种温暖让人昏昏欲睡。甚至能听到管道里液体流动的声音变得... 欢快了一些？",
  DONT_ANTHROPOMORPHIZE: "系统自检：请勿拟人化机械噪音。那是热胀冷缩导致的金属应力释放。",
  
  // Stage III - The Ghost in the Machine
  SONAR_UNLOCK: "解锁模块：[声呐终端 (Sonar Terminal)]",
  
  PING_1_SEND: "[SONAR] 脉冲发送...",
  PING_1_WAIT: "[SONAR] 等待回波 (T+2.4s)...",
  PING_1_RESULT: "[SONAR] 结果：无显著回波。",
  PING_1_ENV: "[ENV] 只有死寂。深海连背景噪音都被压碎了。",
  
  PING_2_RESULT: "[SONAR] 结果：检测到漫反射。距离 400m。",
  PING_2_ANALYSIS: "[ANALYSIS] 地形识别：垂直岩壁。我们似乎停搁在一个巨大的海沟裂隙中。",
  
  PING_3_WARNING: "[SONAR] 警告：检测到极近距离金属回音！",
  PING_3_DISTANCE: "[SONAR] 距离：0米。",
  PING_3_LOCATION: "[SONAR] 信号源位置：正下方，龙骨外侧。",
  PING_3_INTERNAL: "[LOG] 并不是外部物体。声音来自... 船体结构内部？可能是龙骨断裂发出的呻吟。",
  
  DIAGNOSTIC_ALERT: "诊断警报：3号压载水舱 (Ballast Tank 3) 容量异常。",
  WALL_THICKNESS: "传感器读数显示舱壁厚度增加了 12mm。",
  DRONE_CAMERA: "正在调取维修无人机摄像头...",
  
  IMG_PROCESS: "[IMG_PROCESS] 图像噪点较高。正在锐化边缘...",
  OBSERVATION: "[OBSERVATION] 发现不明金属结构体嵌入舱壁。",
  DETAIL: "[DETAIL] 物体识别：看起来像是一把旧式的\"水下切割枪\"，型号属于上个世纪。",
  ANOMALY: "[ANOMALY] 切割枪并没有被\"卡\"在缝隙里。它和我们的船体外壳并没有接缝。",
  PHYSICS_LOG: "[PHYSICS_LOG] 现象分析：金属冷焊 (Cold Welding)。",
  DATABASE: "[DATABASE] 在真空或深海高压环境下，两块原本分离的金属若表面氧化层破裂并接触，原子会误以为它们属于同一块金属，从而发生完美的原子级融合。",
  CONCLUSION: "[CONCLUSION] 这把枪已经成为了潜艇外壳的一部分。原子结构已完全同化。",
  
  // Stage IV - Impact
  SYSTEM_INTERRUPT: "[SYSTEM_INTERRUPT]",
  VIBRATION_DETECT: "震动侦测：里氏 4.0 级 (震源距离极近)",
  IMPACT_WARNING: "警告：左舷 4 区受到剧烈物理撞击！",
  HULL_DAMAGE: "警告：外壳护盾完整性 100% -> 62%",
  WATER_INTRUSION: "警告：检测到高压水流入侵！",
  
  SEAL_A_FAIL: "液压泵卡死！无法关闭！",
  SEAL_B_SUCCESS: "成功闭锁。",
  PUMP_OVERCLOCK: "排水效率 120%。电机正在冒烟。",
  HARDENER_RELEASE: "正在向受损区域喷射工业凝胶...",
  
  IMPACT_STOPPED: "[SYSTEM] 冲击已停止。",
  WATER_CONTROLLED: "[STATUS] 进水已控制。受损区域已用凝胶封死。",
  NOT_EARTHQUAKE: "[ENV] 并不是地震。也不是撞击岩石。",
  FORCE_ANALYSIS: "[ANALYSIS] 冲击模式分析：受力点集中。就像是... 有什么东西试图把船壳像罐头一样\"撬开\"。",
  
  PASSIVE_LISTEN: "[SONAR] 被动监听模式开启。",
  SIGNAL_CAPTURED: "[SONAR] 捕捉到规律信号。",
  AUDIO_AMPLIFY: "[AUDIO] 正在放大信号增益...",
  KNOCKING_SOUND: "[LOG] 听起来像是敲击声。有人在用金属物敲击我们的船壳。就在刚才受损的地方。",
  
  MORSE_PATTERN: "敲击节奏识别：",
  MORSE_SOS: "... --- ...",
  DECODER_SOS: "[DECODER] 摩斯电码：S.O.S.",
  FINAL_QUESTION: "[SYSTEM] 疑问：如果你在潜艇里，那个敲门求救的人，在哪？",
  
  // Endings
  COMMS_REPAIRED: "通讯阵列上线。正在广播求救信号 (SOS)...",
  ENDING_C1: "信号解码。[音频：尖锐的鲸歌混合着人类的惨叫]。系统分析：同类 (Kin) 呼唤。",
};