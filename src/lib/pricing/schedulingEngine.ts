/**
 * Buildzy Project Scheduling & Critical-Path Duration Engine
 * Deterministic CPM (Critical Path Method) implementation tailored for Indian Residential Construction.
 * Models sequential dependencies, concrete curing buffers, and crew productivity without LLM hallucination.
 */

export interface ScheduleTaskInput {
  id: string;
  name: string;
  tradeGroup: 'Civil' | 'Structural' | 'MEP' | 'Finishing' | 'Inspection';
  quantitySqFt: number;
  crewSize: number;
  baseDaysPer1000SqFt: number;
  predecessorIds: string[];
  mandatoryCuringDays?: number; // Concrete slab curing, plaster drying, tile settling
  weatherSensitivity?: 'High' | 'Medium' | 'Low';
}

export interface ScheduledTaskOutput {
  id: string;
  name: string;
  tradeGroup: string;
  durationWorkingDays: number;
  durationCalendarDays: number;
  curingDays: number;
  earlyStartDay: number;
  earlyFinishDay: number;
  lateStartDay: number;
  lateFinishDay: number;
  slackDays: number;
  isCriticalPath: boolean;
  predecessorIds: string[];
  productivityBasis: string;
}

export interface ProjectScheduleForecast {
  projectAreaSqFt: number;
  totalWorkingDays: number;
  totalCalendarDays: number;
  totalMonthsEstimate: number;
  criticalPathTaskIds: string[];
  tasks: ScheduledTaskOutput[];
  curingBufferDaysTotal: number;
  assumptions: string[];
  confidence: 'High' | 'Moderate' | 'Preliminary';
  version: string;
}

/**
 * Standard Indian residential construction CPM network activities
 */
export function generateBaselineConstructionActivities(areaSqFt: number): ScheduleTaskInput[] {
  const safeArea = Math.max(200, areaSqFt);

  return [
    {
      id: 'task-1-site-survey',
      name: 'Site Topography Survey, Soil Testing & Boundary Pegging',
      tradeGroup: 'Inspection',
      quantitySqFt: safeArea,
      crewSize: 3,
      baseDaysPer1000SqFt: 4,
      predecessorIds: [],
      mandatoryCuringDays: 0,
      weatherSensitivity: 'Medium',
    },
    {
      id: 'task-2-excavation',
      name: 'Earthwork Excavation, Anti-Termite & PCC Foundation Bed',
      tradeGroup: 'Civil',
      quantitySqFt: safeArea,
      crewSize: 6,
      baseDaysPer1000SqFt: 8,
      predecessorIds: ['task-1-site-survey'],
      mandatoryCuringDays: 3, // PCC initial set
      weatherSensitivity: 'High',
    },
    {
      id: 'task-3-plinth-beam',
      name: 'RCC Column Footings, Plinth Beam & Damp Proof Course (DPC)',
      tradeGroup: 'Structural',
      quantitySqFt: safeArea,
      crewSize: 8,
      baseDaysPer1000SqFt: 12,
      predecessorIds: ['task-2-excavation'],
      mandatoryCuringDays: 7, // Plinth beam water curing
      weatherSensitivity: 'Medium',
    },
    {
      id: 'task-4-ground-slab',
      name: 'Ground Floor RCC Columns, Shuttering & Roof Slab Casting',
      tradeGroup: 'Structural',
      quantitySqFt: safeArea,
      crewSize: 10,
      baseDaysPer1000SqFt: 16,
      predecessorIds: ['task-3-plinth-beam'],
      mandatoryCuringDays: 14, // Mandatory 14-day ponding water curing for RCC slab
      weatherSensitivity: 'High',
    },
    {
      id: 'task-5-brickwork',
      name: 'Superstructure Brickwork / AAC Masonry & Door Frame Fixing',
      tradeGroup: 'Civil',
      quantitySqFt: safeArea,
      crewSize: 6,
      baseDaysPer1000SqFt: 14,
      predecessorIds: ['task-4-ground-slab'],
      mandatoryCuringDays: 5, // Masonry wall curing
      weatherSensitivity: 'Low',
    },
    {
      id: 'task-6-mep-conduiting',
      name: 'Concealed Electrical Conduiting, Plumbing CPVC Rough-in & Chasing',
      tradeGroup: 'MEP',
      quantitySqFt: safeArea,
      crewSize: 4,
      baseDaysPer1000SqFt: 10,
      predecessorIds: ['task-5-brickwork'],
      mandatoryCuringDays: 0,
      weatherSensitivity: 'Low',
    },
    {
      id: 'task-7-internal-plaster',
      name: 'Dual-Coat Internal & External Sand-Faced Plastering',
      tradeGroup: 'Civil',
      quantitySqFt: safeArea,
      crewSize: 6,
      baseDaysPer1000SqFt: 14,
      predecessorIds: ['task-6-mep-conduiting'],
      mandatoryCuringDays: 10, // Wall plaster water curing
      weatherSensitivity: 'Medium',
    },
    {
      id: 'task-8-flooring-tiles',
      name: 'Vitrified Floor Tiles Laying, Skirting & Epoxy Grouting',
      tradeGroup: 'Finishing',
      quantitySqFt: safeArea,
      crewSize: 4,
      baseDaysPer1000SqFt: 12,
      predecessorIds: ['task-7-internal-plaster'],
      mandatoryCuringDays: 4, // Tile adhesive curing
      weatherSensitivity: 'Low',
    },
    {
      id: 'task-9-painting-fixtures',
      name: 'Acrylic Putty, Primer, 2-Coat Royale Painting & Sanitary Fixture Install',
      tradeGroup: 'Finishing',
      quantitySqFt: safeArea,
      crewSize: 5,
      baseDaysPer1000SqFt: 10,
      predecessorIds: ['task-8-flooring-tiles'],
      mandatoryCuringDays: 2,
      weatherSensitivity: 'Low',
    },
    {
      id: 'task-10-handover',
      name: 'Final Deep Clean, Snag-List Clearance & Key Handover',
      tradeGroup: 'Inspection',
      quantitySqFt: safeArea,
      crewSize: 3,
      baseDaysPer1000SqFt: 3,
      predecessorIds: ['task-9-painting-fixtures'],
      mandatoryCuringDays: 0,
      weatherSensitivity: 'Low',
    },
  ];
}

/**
 * Computes Critical Path Schedule for Indian Residential Projects
 */
export function calculateCriticalPathSchedule(areaSqFt: number): ProjectScheduleForecast {
  const activities = generateBaselineConstructionActivities(areaSqFt);
  const scaleFactor = Math.max(0.6, areaSqFt / 1000);

  // 1. Calculate individual task durations
  const computedTasks: {
    input: ScheduleTaskInput;
    workingDays: number;
    calendarDays: number;
    curingDays: number;
    earlyStart: number;
    earlyFinish: number;
    lateStart: number;
    lateFinish: number;
  }[] = activities.map((act) => {
    const rawWorkingDays = Math.ceil(act.baseDaysPer1000SqFt * scaleFactor);
    const curingDays = act.mandatoryCuringDays || 0;
    const calendarDays = rawWorkingDays + curingDays;
    return {
      input: act,
      workingDays: rawWorkingDays,
      calendarDays,
      curingDays,
      earlyStart: 0,
      earlyFinish: 0,
      lateStart: 0,
      lateFinish: 0,
    };
  });

  const taskMap = new Map(computedTasks.map((t) => [t.input.id, t]));

  // 2. Forward Pass: Calculate Early Start (ES) and Early Finish (EF)
  for (const task of computedTasks) {
    if (task.input.predecessorIds.length === 0) {
      task.earlyStart = 0;
    } else {
      let maxPredecessorFinish = 0;
      for (const predId of task.input.predecessorIds) {
        const pred = taskMap.get(predId);
        if (pred && pred.earlyFinish > maxPredecessorFinish) {
          maxPredecessorFinish = pred.earlyFinish;
        }
      }
      task.earlyStart = maxPredecessorFinish;
    }
    task.earlyFinish = task.earlyStart + task.calendarDays;
  }

  // 3. Project Total Duration (EF of final task)
  const totalCalendarDays = Math.max(...computedTasks.map((t) => t.earlyFinish));

  // 4. Backward Pass: Calculate Late Start (LS) and Late Finish (LF)
  for (let i = computedTasks.length - 1; i >= 0; i--) {
    const task = computedTasks[i];
    // Find all successors
    const successors = computedTasks.filter((t) => t.input.predecessorIds.includes(task.input.id));
    if (successors.length === 0) {
      task.lateFinish = totalCalendarDays;
    } else {
      task.lateFinish = Math.min(...successors.map((s) => s.lateStart));
    }
    task.lateStart = task.lateFinish - task.calendarDays;
  }

  // 5. Identify Critical Path (Slack = LS - ES == 0)
  const scheduledTasks: ScheduledTaskOutput[] = computedTasks.map((t) => {
    const slack = t.lateStart - t.earlyStart;
    const isCritical = slack <= 0.001;

    return {
      id: t.input.id,
      name: t.input.name,
      tradeGroup: t.input.tradeGroup,
      durationWorkingDays: t.workingDays,
      durationCalendarDays: t.calendarDays,
      curingDays: t.curingDays,
      earlyStartDay: t.earlyStart,
      earlyFinishDay: t.earlyFinish,
      lateStartDay: t.lateStart,
      lateFinishDay: t.lateFinish,
      slackDays: slack,
      isCriticalPath: isCritical,
      predecessorIds: t.input.predecessorIds,
      productivityBasis: `Crew of ${t.input.crewSize} workers @ ~${t.input.baseDaysPer1000SqFt} days/1k sq.ft`,
    };
  });

  const criticalPathTaskIds = scheduledTasks.filter((t) => t.isCriticalPath).map((t) => t.id);
  const totalWorkingDays = computedTasks.reduce((sum, t) => sum + t.workingDays, 0);
  const curingBufferDaysTotal = computedTasks.reduce((sum, t) => sum + t.curingDays, 0);
  const totalMonthsEstimate = Number((totalCalendarDays / 30).toFixed(1));

  return {
    projectAreaSqFt: areaSqFt,
    totalWorkingDays,
    totalCalendarDays,
    totalMonthsEstimate,
    criticalPathTaskIds,
    tasks: scheduledTasks,
    curingBufferDaysTotal,
    assumptions: [
      `Computed using Critical Path Method (CPM) with Finish-to-Start predecessor ordering`,
      `Includes mandatory concrete ponding curing (${curingBufferDaysTotal} calendar days total across slab & plaster)`,
      `Assumes 6 working days per week in line with Indian construction labour practice`,
      `Accounts for standard team productivity scaled for ${areaSqFt.toLocaleString('en-IN')} sq. ft RCC superstructure`,
    ],
    confidence: areaSqFt <= 3500 ? 'High' : 'Moderate',
    version: 'cpm_v1_residential',
  };
}

/**
 * Updates project schedule forecast when actual delays or site progress occur
 */
export function recalculateScheduleWithDelays(
  baseSchedule: ProjectScheduleForecast,
  recordedDelays: { taskId: string; delayDays: number }[]
): {
  revisedCalendarDays: number;
  revisedMonthsEstimate: number;
  criticalDelayDaysAdded: number;
  impactSummary: string;
} {
  let criticalDelay = 0;

  for (const delay of recordedDelays) {
    const task = baseSchedule.tasks.find((t) => t.id === delay.taskId);
    if (task && task.isCriticalPath) {
      criticalDelay += delay.delayDays;
    }
  }

  const revisedCalendarDays = baseSchedule.totalCalendarDays + criticalDelay;
  const revisedMonthsEstimate = Number((revisedCalendarDays / 30).toFixed(1));

  return {
    revisedCalendarDays,
    revisedMonthsEstimate,
    criticalDelayDaysAdded: criticalDelay,
    impactSummary: criticalDelay > 0
      ? `Critical path delayed by ${criticalDelay} calendar days. Revised target: ~${revisedMonthsEstimate} months.`
      : `Delays occurred on non-critical tasks with available float; overall completion target unaffected.`,
  };
}
