import {
  type ActionView,
  type ContentCommand,
  type EngineState,
  type IdleGameViewModel,
  type IdlePack,
} from '@benthic/idle-core/contracts';
import {
  canAffordCosts,
  getBuildingCosts,
} from '@benthic/idle-core/economy';

export type BenthicResourceId = 'oxygen' | 'scrap' | 'biomass' | 'lumens';
export type BenthicBuildingId = 'pump' | 'bio_filter';
export type BenthicStage = 'boot' | 'salvage' | 'systems' | 'sonar' | 'diagnostics';

export interface BenthicContentState {
  stage: BenthicStage;
  hasLight: boolean;
  filtersUnlocked: boolean;
  furnaceUnlocked: boolean;
  sonarUnlocked: boolean;
  diagnosticsComplete: boolean;
  crankCount: number;
  scavengeCount: number;
  filterWaste: number;
  coreTemperature: number;
  power: number;
  sonarPings: number;
  lastScavenge?: 'scrap' | 'biomass' | 'lumens';
}

export type BenthicCommand =
  | ContentCommand
  | { id: 'benthic.story.boot' }
  | { id: 'benthic.story.oxygen_warning' }
  | { id: 'benthic.story.salvage_online' }
  | { id: 'benthic.story.filters_unlock' }
  | { id: 'benthic.story.furnace_unlock' }
  | { id: 'benthic.story.warm_threshold' }
  | { id: 'benthic.story.sonar_unlock' }
  | { id: 'benthic.manual_crank' }
  | { id: 'benthic.ignite_flare' }
  | { id: 'benthic.scavenge' }
  | { id: 'benthic.scrub_filters' }
  | { id: 'benthic.feed_furnace' }
  | { id: 'benthic.sonar_ping' }
  | { id: 'benthic.full_diagnostics' };

export type BenthicState = EngineState<
  BenthicContentState,
  BenthicResourceId,
  BenthicBuildingId,
  BenthicCommand
>;

export const benthicPackMeta = {
  id: 'benthic',
  title: 'Benthic',
  version: '0.2.0',
  description: 'Promotional vertical slice for a pack that owns pacing, economy, and descriptors through idle-core.',
};

const resourceLabels: Record<BenthicResourceId, string> = {
  oxygen: '氧气',
  scrap: '废料',
  biomass: '生物质',
  lumens: '流明',
};

const buildingLabels: Record<BenthicBuildingId, { name: string; description: string }> = {
  pump: {
    name: '氧气泵',
    description: '被动产氧 +1/秒',
  },
  bio_filter: {
    name: '生物过滤器',
    description: '被动回收废料、生物质与流明',
  },
};

const crankLogs = [
  '摇柄发出刺耳金属摩擦声，氧气回流仍然有效。',
  '阀门重新咬合，压强表终于抬头。',
  '应急进气阀缓慢响应，但至少你还活着。',
];

const scavengeLogs = {
  scrap: [
    '搜寻返回了可用金属碎片。',
    '残骸缝隙里还留着可拆解的壳板。',
  ],
  biomass: [
    '搜寻返回了湿冷的有机残余。',
    '过滤网里卡着仍可燃烧的生物废料。',
  ],
  lumens: [
    '搜寻捕获到微弱但稳定的荧光团。',
    '发光藻膜剥落下来，勉强能作为照明储备。',
  ],
} as const;

const scrubLogs = [
  '滤芯外层的黏腻物被刮落下来。',
  '过滤网上凝结的废料被收集进回收槽。',
  '呼吸循环恢复了一点点效率。',
];

const furnaceLogs = [
  '燃烧室重新吃进废料，热量沿旧管路扩散。',
  '火焰比预想更稳定，供能系统开始回升。',
  '炉壁发出低沉回响，像是系统在重新醒来。',
];

const sonarLogs = [
  '第一道声呐脉冲穿过外壳，只返回空旷深压。',
  '第二道脉冲绘出了模糊地形，废墟在远处堆叠。',
  '第三道脉冲带回了不规则回波，像是某种结构在回应。',
];

function pick<T>(items: readonly T[], roll: number): T {
  return items[Math.min(items.length - 1, Math.floor(roll * items.length))];
}

function remainingCooldownMs(state: BenthicState, id: string, now: number): number {
  return Math.max(0, (state.cooldowns[id] ?? 0) - now);
}

function formatCooldownLabel(base: string, remainingMs: number): string {
  if (remainingMs <= 0) {
    return base;
  }

  return `${base} (${Math.max(1, Math.ceil(remainingMs / 1000))}s)`;
}

function createBuildAction(
  state: BenthicState,
  buildingId: BenthicBuildingId,
): ActionView {
  const costs = getBuildingCosts(
    benthicPack.manifest,
    buildingId,
    state.buildings[buildingId] ?? 0,
  );
  const affordable = canAffordCosts(state.resources, costs);
  const costLabel = Object.entries(costs)
    .map(([resourceId, amount]) => `${amount}${resourceLabels[resourceId as BenthicResourceId]}`)
    .join(' / ');

  return {
    id: `build:${buildingId}`,
    label: `建造 ${buildingLabels[buildingId].name}`,
    description: `${buildingLabels[buildingId].description} | 成本 ${costLabel}`,
    disabled: !affordable,
    command: {
      kind: 'engine',
      id: 'engine.build',
      args: { buildingId },
    },
  };
}

function appendStoryLog(state: BenthicState): IdleGameViewModel['logs']['entries'] {
  return [...state.logs]
    .slice()
    .reverse()
    .map((entry) => ({
      id: entry.id,
      text: entry.message,
      tone:
        entry.level === 'warn'
          ? 'warning'
          : entry.source === 'system'
            ? 'accent'
            : 'default',
      prefix: entry.source?.toUpperCase(),
    }));
}

function createSurvivalActions(state: BenthicState, now: number): ActionView[] {
  const oxygen = state.resources.oxygen ?? 0;
  const manualCrankCooldown = remainingCooldownMs(state, 'manual-crank', now);
  const scavengeCooldown = remainingCooldownMs(state, 'scavenge', now);

  const actions: ActionView[] = [
    {
      id: 'manual-crank',
      label: formatCooldownLabel('手动摇柄', manualCrankCooldown),
      description: '应急进气阀。恢复少量氧气。',
      disabled: manualCrankCooldown > 0,
      emphasis: oxygen <= 8 ? 'primary' : 'normal',
      cooldown: {
        remainingMs: manualCrankCooldown,
        totalMs: 1000,
      },
      command: {
        kind: 'content',
        id: 'benthic.manual_crank',
      },
    },
  ];

  if (!state.content.hasLight) {
    actions.push({
      id: 'ignite-flare',
      label: '点燃照明弹',
      description: '消耗 10 氧气以打开搜索视野。',
      disabled: oxygen < 10,
      emphasis: oxygen >= 10 ? 'primary' : 'normal',
      command: {
        kind: 'content',
        id: 'benthic.ignite_flare',
      },
    });
  } else {
    actions.push({
      id: 'scavenge',
      label: formatCooldownLabel('搜寻残骸', scavengeCooldown),
      description: '回收废料、生物质或流明。',
      disabled: scavengeCooldown > 0,
      cooldown: {
        remainingMs: scavengeCooldown,
        totalMs: 3000,
      },
      command: {
        kind: 'content',
        id: 'benthic.scavenge',
      },
    });
  }

  return actions;
}

function createSystemsActions(state: BenthicState, now: number): ActionView[] {
  const filterCooldown = remainingCooldownMs(state, 'scrub-filters', now);
  const furnaceCooldown = remainingCooldownMs(state, 'feed-furnace', now);
  const sonarCooldown = remainingCooldownMs(state, 'sonar-ping', now);
  const diagnosticsCooldown = remainingCooldownMs(state, 'full-diagnostics', now);
  const actions: ActionView[] = [];

  if (state.content.filtersUnlocked) {
    actions.push({
      id: 'scrub-filters',
      label: formatCooldownLabel('清理滤芯', filterCooldown),
      description: '从呼吸循环中回收滤芯废料。',
      disabled: filterCooldown > 0,
      cooldown: {
        remainingMs: filterCooldown,
        totalMs: 2000,
      },
      command: {
        kind: 'content',
        id: 'benthic.scrub_filters',
      },
    });
  }

  if (state.content.furnaceUnlocked) {
    actions.push({
      id: 'feed-furnace',
      label: formatCooldownLabel('填装燃烧室', furnaceCooldown),
      description: `消耗 1 废料，提升温度与电力。当前废料 ${state.content.filterWaste.toFixed(1)}kg`,
      disabled: state.content.filterWaste < 1 || furnaceCooldown > 0,
      cooldown: {
        remainingMs: furnaceCooldown,
        totalMs: 3000,
      },
      command: {
        kind: 'content',
        id: 'benthic.feed_furnace',
      },
    });
  }

  if (state.content.sonarUnlocked) {
    actions.push({
      id: 'sonar-ping',
      label: formatCooldownLabel('发送主动脉冲', sonarCooldown),
      description: '消耗 20 电力，侦测周围深海结构。',
      disabled: state.content.power < 20 || sonarCooldown > 0,
      cooldown: {
        remainingMs: sonarCooldown,
        totalMs: 4000,
      },
      command: {
        kind: 'content',
        id: 'benthic.sonar_ping',
      },
    });

    actions.push({
      id: 'full-diagnostics',
      label: formatCooldownLabel('全船诊断', diagnosticsCooldown),
      description:
        state.content.diagnosticsComplete
          ? '诊断已完成。更多章节迁移时会从这里继续展开。'
          : '完成 3 次脉冲后可执行一次深度诊断。',
      disabled:
        state.content.diagnosticsComplete
        || state.content.sonarPings < 3
        || diagnosticsCooldown > 0,
      emphasis:
        state.content.sonarPings >= 3 && !state.content.diagnosticsComplete
          ? 'primary'
          : 'normal',
      cooldown: {
        remainingMs: diagnosticsCooldown,
        totalMs: 8000,
      },
      command: {
        kind: 'content',
        id: 'benthic.full_diagnostics',
      },
    });
  }

  return actions;
}

export function buildBenthicViewModel(
  state: BenthicState,
  now: number,
): IdleGameViewModel {
  const oxygen = state.resources.oxygen ?? 0;
  const hasLight = state.content.hasLight;
  const buildActions = hasLight
    ? (['pump', ...(state.buildings.pump > 0 ? ['bio_filter'] : [])] as BenthicBuildingId[])
      .map((buildingId) => createBuildAction(state, buildingId))
    : [];
  const systemsActions = createSystemsActions(state, now);
  const theme =
    state.content.diagnosticsComplete ? 'horror' : hasLight ? 'rust' : 'abyss';

  return {
    shell: {
      title: benthicPackMeta.title,
      subtitle:
        state.content.stage === 'diagnostics'
          ? '诊断已经触及更深层的异常。后续章节将继续从这里接上。'
          : hasLight
            ? '船体系统逐步苏醒，放置循环开始接管生存压力。'
            : '深渊中只剩一口气。先活下来。',
      theme,
      badges: [
        'idle-core runtime',
        'benthic demo',
        state.content.stage,
      ],
    },
    logs: {
      title: state.content.diagnosticsComplete ? '深压诊断日志' : '系统日志',
      entries: appendStoryLog(state),
    },
    center: [
      {
        kind: 'notice',
        id: 'narrative',
        title: '状态摘要',
        tone: oxygen <= 8 ? 'warning' : 'accent',
        lines:
          state.content.stage === 'boot'
            ? [
                '黑暗仍在。先用手动摇柄换取呼吸空间。',
                '氧气足够时，点燃照明弹，进入搜寻与建造循环。',
              ]
            : state.content.stage === 'salvage'
              ? [
                  '照明恢复，搜寻与基础建造已经可用。',
                  '搜两轮残骸后，呼吸系统维护模块会重新解锁。',
                ]
              : state.content.stage === 'systems'
                ? [
                    '滤芯维护与燃烧室已经接管中层循环。',
                    '把电力推到 60，才能把声呐子系统重新拉起来。',
                  ]
                : state.content.stage === 'sonar'
                  ? [
                      '声呐子系统已经恢复。',
                      '至少完成 3 次主动脉冲，再尝试全船诊断。',
                    ]
                  : [
                      '深层诊断已完成。',
                      '这一段 demo 先收口在这里，后续会把 Chapter 2/3 接进同一套 pack runtime。',
                    ],
      },
      {
        kind: 'actions',
        id: 'survival-actions',
        title: '生存操作',
        actions: createSurvivalActions(state, now),
      },
      ...(systemsActions.length > 0
        ? [
            {
              kind: 'actions' as const,
              id: 'systems-actions',
              title: '工程操作',
              actions: systemsActions,
            },
          ]
        : []),
      ...(buildActions.length > 0
        ? [
            {
              kind: 'actions' as const,
              id: 'build-actions',
              title: '系统模块',
              actions: buildActions,
            },
          ]
        : []),
    ],
    right: [
      {
        kind: 'stats',
        id: 'resources',
        title: '资源状态',
        rows: [
          {
            kind: 'meter',
            id: 'oxygen',
            label: '氧气',
            value: Number(oxygen.toFixed(1)),
            max: 100,
            tone: oxygen <= 8 ? 'warning' : 'accent',
          },
          {
            kind: 'value',
            id: 'scrap',
            label: '废料',
            value: Math.floor(state.resources.scrap ?? 0),
          },
          {
            kind: 'value',
            id: 'biomass',
            label: '生物质',
            value: Math.floor(state.resources.biomass ?? 0),
          },
          {
            kind: 'value',
            id: 'lumens',
            label: '流明',
            value: Math.floor(state.resources.lumens ?? 0),
          },
        ],
      },
      {
        kind: 'stats',
        id: 'systems',
        title: '工程读数',
        rows: [
          {
            kind: 'value',
            id: 'stage',
            label: '阶段',
            value: state.content.stage,
          },
          {
            kind: 'value',
            id: 'power',
            label: '电力',
            value: Math.floor(state.content.power),
          },
          {
            kind: 'value',
            id: 'temperature',
            label: '核心温度',
            value: `${state.content.coreTemperature.toFixed(1)}°C`,
          },
          {
            kind: 'value',
            id: 'waste',
            label: '滤芯废料',
            value: `${state.content.filterWaste.toFixed(1)}kg`,
          },
          {
            kind: 'value',
            id: 'pings',
            label: '声呐脉冲',
            value: state.content.sonarPings,
          },
        ],
      },
      {
        kind: 'entityList',
        id: 'subsystems',
        title: '子系统',
        items: [
          {
            id: 'light',
            label: '照明系统',
            sublabel: '残骸搜索前置条件',
            status: state.content.hasLight ? 'online' : 'offline',
          },
          {
            id: 'filters',
            label: '滤芯维护',
            sublabel: '解锁后可回收滤芯废料',
            status: state.content.filtersUnlocked ? 'online' : 'offline',
          },
          {
            id: 'furnace',
            label: '燃烧室',
            sublabel: '把废料转成温度与电力',
            status: state.content.furnaceUnlocked ? 'online' : 'offline',
          },
          {
            id: 'sonar',
            label: '声呐阵列',
            sublabel: '高阶侦测与诊断入口',
            status: state.content.sonarUnlocked ? 'online' : 'offline',
          },
        ],
      },
      {
        kind: 'entityList',
        id: 'buildings',
        title: '已部署模块',
        items: (['pump', 'bio_filter'] as BenthicBuildingId[]).map((buildingId) => ({
          id: buildingId,
          label: buildingLabels[buildingId].name,
          sublabel: buildingLabels[buildingId].description,
          value: `${state.buildings[buildingId] ?? 0}`,
          status: (state.buildings[buildingId] ?? 0) > 0 ? 'online' : 'offline',
        })),
      },
      {
        kind: 'actions',
        id: 'runtime-actions',
        title: '运行时',
        actions: [
          {
            id: 'reset',
            label: '重置 Demo',
            description: '清空当前会话并重新初始化 runtime。',
            command: {
              kind: 'engine',
              id: 'engine.reset',
            },
          },
        ],
      },
    ],
  };
}

export const benthicPack: IdlePack<
  BenthicContentState,
  BenthicCommand,
  BenthicResourceId,
  BenthicBuildingId
> = {
  id: benthicPackMeta.id,
  version: 2,
  manifest: {
    resources: {
      oxygen: { initialAmount: 4, min: 0, max: 100 },
      scrap: { initialAmount: 0, min: 0 },
      biomass: { initialAmount: 0, min: 0 },
      lumens: { initialAmount: 0, min: 0 },
    },
    buildings: {
      pump: {
        initialCount: 0,
        baseCost: { scrap: 10, biomass: 5 },
        costScale: 1.3,
        passiveProduction: { oxygen: 1 },
      },
      bio_filter: {
        initialCount: 0,
        baseCost: { scrap: 25, biomass: 10, lumens: 3 },
        costScale: 1.25,
        passiveProduction: {
          scrap: 0.15,
          biomass: 0.2,
          lumens: 0.08,
        },
      },
    },
  },
  createInitialContentState() {
    return {
      stage: 'boot',
      hasLight: false,
      filtersUnlocked: false,
      furnaceUnlocked: false,
      sonarUnlocked: false,
      diagnosticsComplete: false,
      crankCount: 0,
      scavengeCount: 0,
      filterWaste: 0,
      coreTemperature: 2,
      power: 0,
      sonarPings: 0,
    };
  },
  handleCommand(state, command, services) {
    switch (command.id) {
      case 'benthic.story.boot':
        services.appendLog({
          message: '系统启动。深压稳定。氧储量危急。',
          source: 'system',
        });
        services.appendLog({
          message: '黑暗中仅剩应急进气阀可用。',
          source: 'system',
        });
        return;

      case 'benthic.story.oxygen_warning':
        services.appendLog({
          message: '氧含量持续下滑。必须立刻维持呼吸循环。',
          level: 'warn',
          source: 'system',
        });
        return;

      case 'benthic.story.salvage_online':
        services.appendLog({
          message: '照明恢复。残骸搜索与基础模块建造已经上线。',
          source: 'system',
        });
        return {
          ...state.content,
          stage: 'salvage',
        };

      case 'benthic.story.filters_unlock':
        services.appendLog({
          message: '呼吸循环维护面板恢复，滤芯清理重新可用。',
          source: 'system',
        });
        return {
          ...state.content,
          stage: 'systems',
          filtersUnlocked: true,
        };

      case 'benthic.story.furnace_unlock':
        services.appendLog({
          message: '废料累积已足以启动燃烧室。',
          source: 'system',
        });
        return {
          ...state.content,
          furnaceUnlocked: true,
        };

      case 'benthic.story.warm_threshold':
        services.appendLog({
          message: '温度越过阈值，船体内部的回响变得不再纯粹是机械噪音。',
          source: 'system',
        });
        return;

      case 'benthic.story.sonar_unlock':
        services.appendLog({
          message: '电力恢复到最低工作线。声呐阵列重新上线。',
          source: 'system',
        });
        return {
          ...state.content,
          stage: 'sonar',
          sonarUnlocked: true,
        };

      case 'benthic.manual_crank': {
        if ((state.cooldowns['manual-crank'] ?? 0) > services.now) {
          return;
        }

        services.addResource('oxygen', 3);
        services.setCooldown('manual-crank', services.now + 1000);
        services.appendLog({
          message: pick(crankLogs, services.random()),
          source: 'operator',
        });

        return {
          ...state.content,
          crankCount: state.content.crankCount + 1,
        };
      }

      case 'benthic.ignite_flare':
        if (state.content.hasLight || (state.resources.oxygen ?? 0) < 10) {
          return;
        }

        services.addResource('oxygen', -10);
        services.appendLog({
          message: '照明弹点燃。残骸轮廓开始浮现。',
          source: 'operator',
        });

        return {
          ...state.content,
          hasLight: true,
        };

      case 'benthic.scavenge': {
        if (!state.content.hasLight || (state.cooldowns.scavenge ?? 0) > services.now) {
          return;
        }

        services.setCooldown('scavenge', services.now + 3000);
        const roll = services.random();

        if (roll < 0.45) {
          services.addResource('scrap', 4);
          services.appendLog({
            message: pick(scavengeLogs.scrap, services.random()),
            source: 'operator',
          });

          return {
            ...state.content,
            scavengeCount: state.content.scavengeCount + 1,
            lastScavenge: 'scrap',
          };
        }

        if (roll < 0.8) {
          services.addResource('biomass', 3);
          services.appendLog({
            message: pick(scavengeLogs.biomass, services.random()),
            source: 'operator',
          });

          return {
            ...state.content,
            scavengeCount: state.content.scavengeCount + 1,
            lastScavenge: 'biomass',
          };
        }

        services.addResource('lumens', 2);
        services.appendLog({
          message: pick(scavengeLogs.lumens, services.random()),
          source: 'operator',
        });

        return {
          ...state.content,
          scavengeCount: state.content.scavengeCount + 1,
          lastScavenge: 'lumens',
        };
      }

      case 'benthic.scrub_filters': {
        if (!state.content.filtersUnlocked || (state.cooldowns['scrub-filters'] ?? 0) > services.now) {
          return;
        }

        const wasteGain = 1 + services.random() * 2;
        services.setCooldown('scrub-filters', services.now + 2000);
        services.appendLog({
          message: pick(scrubLogs, services.random()),
          source: 'operator',
        });

        return {
          ...state.content,
          filterWaste: Number((state.content.filterWaste + wasteGain).toFixed(1)),
        };
      }

      case 'benthic.feed_furnace': {
        if (
          !state.content.furnaceUnlocked
          || state.content.filterWaste < 1
          || (state.cooldowns['feed-furnace'] ?? 0) > services.now
        ) {
          return;
        }

        services.setCooldown('feed-furnace', services.now + 3000);
        services.appendLog({
          message: pick(furnaceLogs, services.random()),
          source: 'operator',
        });

        return {
          ...state.content,
          filterWaste: Number(Math.max(0, state.content.filterWaste - 1).toFixed(1)),
          power: state.content.power + 15,
          coreTemperature: Number((state.content.coreTemperature + 2).toFixed(1)),
        };
      }

      case 'benthic.sonar_ping': {
        if (
          !state.content.sonarUnlocked
          || state.content.power < 20
          || (state.cooldowns['sonar-ping'] ?? 0) > services.now
        ) {
          return;
        }

        const nextPings = state.content.sonarPings + 1;
        services.setCooldown('sonar-ping', services.now + 4000);
        services.appendLog({
          message: sonarLogs[Math.min(sonarLogs.length - 1, nextPings - 1)],
          source: 'system',
        });

        return {
          ...state.content,
          power: state.content.power - 20,
          sonarPings: nextPings,
        };
      }

      case 'benthic.full_diagnostics': {
        if (
          !state.content.sonarUnlocked
          || state.content.diagnosticsComplete
          || state.content.sonarPings < 3
          || (state.cooldowns['full-diagnostics'] ?? 0) > services.now
        ) {
          return;
        }

        services.setCooldown('full-diagnostics', services.now + 8000);
        services.appendLog({
          message: '全船诊断开始。外壳厚度、焊接层与回波曲线正在交叉比对。',
          source: 'system',
        });
        services.appendLog({
          message: '诊断结论：船体外存在非自然扰动痕迹，深层结构响应异常。',
          level: 'warn',
          source: 'system',
        });
        services.appendLog({
          message: '更多章节迁移后，这里会继续接出完整的事故与异化线。',
          source: 'system',
        });

        return {
          ...state.content,
          stage: 'diagnostics',
          diagnosticsComplete: true,
        };
      }

      default:
        return;
    }
  },
  handleTick(state, deltaMs, services) {
    const decayPerSecond = state.content.hasLight ? 0.6 : 0.35;
    services.addResource('oxygen', -(deltaMs / 1000) * decayPerSecond);

    if (state.content.coreTemperature > 2) {
      const nextTemperature = Math.max(
        2,
        Number((state.content.coreTemperature - (deltaMs / 1000) * 0.08).toFixed(1)),
      );

      return {
        ...state.content,
        coreTemperature: nextTemperature,
      };
    }

    return;
  },
  syncAutomation(state, cause, services) {
    if (cause.type === 'reset') {
      services.scheduleCommand({
        dueAt: services.now,
        onceKey: 'story.boot',
        command: { id: 'benthic.story.boot' },
      });
    }

    if ((state.resources.oxygen ?? 0) <= 5) {
      services.scheduleCommand({
        dueAt: services.now + 400,
        onceKey: 'warning.oxygen.low',
        command: { id: 'benthic.story.oxygen_warning' },
      });
    }

    if (state.content.hasLight) {
      services.scheduleCommand({
        dueAt: services.now,
        onceKey: 'story.salvage_online',
        command: { id: 'benthic.story.salvage_online' },
      });
    }

    if (
      state.content.hasLight
      && !state.content.filtersUnlocked
      && state.content.scavengeCount >= 2
    ) {
      services.scheduleCommand({
        dueAt: services.now,
        onceKey: 'story.filters_unlock',
        command: { id: 'benthic.story.filters_unlock' },
      });
    }

    if (
      state.content.filtersUnlocked
      && !state.content.furnaceUnlocked
      && state.content.filterWaste >= 3
    ) {
      services.scheduleCommand({
        dueAt: services.now,
        onceKey: 'story.furnace_unlock',
        command: { id: 'benthic.story.furnace_unlock' },
      });
    }

    if (state.content.coreTemperature >= 20) {
      services.scheduleCommand({
        dueAt: services.now,
        onceKey: 'story.warm_threshold',
        command: { id: 'benthic.story.warm_threshold' },
      });
    }

    if (
      state.content.furnaceUnlocked
      && !state.content.sonarUnlocked
      && state.content.power >= 60
    ) {
      services.scheduleCommand({
        dueAt: services.now,
        onceKey: 'story.sonar_unlock',
        command: { id: 'benthic.story.sonar_unlock' },
      });
    }
  },
  buildViewModel(state, options) {
    return buildBenthicViewModel(state, options.now);
  },
};
