import { describe, it, expect } from 'vitest';
import { calculateConstructionEstimate } from '../lib/pricing/pricingEngine';
import { calculateMaterialQuantities } from '../lib/pricing/quantityCalculator';
import { calculateCriticalPathSchedule, recalculateScheduleWithDelays } from '../lib/pricing/schedulingEngine';
import { aiEstimationService } from '../lib/pricing/aiEstimationService';

describe('Pricing Engine & Unit Calculations', () => {
  it('correctly calculates construction estimate for 2,000 sq. ft in Mumbai Standard tier', () => {
    const estimate = calculateConstructionEstimate(2000, 'Standard', 'mumbai');
    expect(estimate.builtUpAreaSqFt).toBe(2000);
    expect(estimate.city.name).toBe('Mumbai');
    expect(estimate.baseConstructionCost).toBeGreaterThan(0);
    expect(estimate.statutoryGst).toBe(Math.round(estimate.baseConstructionCost * 0.18));
    expect(estimate.contingencyReserve).toBe(Math.round(estimate.baseConstructionCost * 0.05));
    expect(estimate.architecturalFee).toBe(Math.round(estimate.baseConstructionCost * 0.035));
    expect(estimate.totalEstimatedCostINR).toBe(
      estimate.baseConstructionCost + estimate.statutoryGst + estimate.contingencyReserve + estimate.architecturalFee
    );
  });

  it('normalizes minimum area bound to prevent zero or negative divisions', () => {
    const lowEst = calculateConstructionEstimate(-500, 'Standard', 'mumbai');
    expect(lowEst.builtUpAreaSqFt).toBe(100);
  });

  it('calculates CPWD-compliant material quantities with waste margins', () => {
    const boq = calculateMaterialQuantities({ builtUpAreaSqFt: 1000, wasteMarginPercent: 7 }, 'mumbai');
    expect(boq.builtUpAreaSqFt).toBe(1000);
    // ~0.40 bags/sq.ft * 1.07 = ~428 bags
    expect(boq.cementBags).toBeGreaterThanOrEqual(400);
    expect(boq.steelKg).toBeGreaterThanOrEqual(3800);
    expect(boq.estimatedMaterialCostINR).toBeGreaterThan(0);
    expect(boq.assumptions.length).toBeGreaterThan(0);
  });
});

describe('Critical-Path Scheduling Engine', () => {
  it('computes realistic CPM timeline with mandatory concrete curing days', () => {
    const schedule = calculateCriticalPathSchedule(2000);
    expect(schedule.tasks.length).toBe(10);
    expect(schedule.curingBufferDaysTotal).toBeGreaterThan(20);
    expect(schedule.criticalPathTaskIds.length).toBeGreaterThan(0);
    expect(schedule.totalCalendarDays).toBeGreaterThan(schedule.totalWorkingDays);
    expect(schedule.totalMonthsEstimate).toBeGreaterThanOrEqual(5);
  });

  it('correctly recalculates completion target when critical-path task encounters delay', () => {
    const baseSchedule = calculateCriticalPathSchedule(2000);
    const criticalTask = baseSchedule.criticalPathTaskIds[0];

    const delayed = recalculateScheduleWithDelays(baseSchedule, [
      { taskId: criticalTask, delayDays: 14 }
    ]);

    expect(delayed.criticalDelayDaysAdded).toBe(14);
    expect(delayed.revisedCalendarDays).toBe(baseSchedule.totalCalendarDays + 14);
    expect(delayed.impactSummary).toContain('Critical path delayed');
  });

  it('does not inflate project finish date when delay occurs on task with float', () => {
    const baseSchedule = calculateCriticalPathSchedule(2000);
    const nonCriticalTask = baseSchedule.tasks.find((t) => !t.isCriticalPath);

    if (nonCriticalTask) {
      const delayed = recalculateScheduleWithDelays(baseSchedule, [
        { taskId: nonCriticalTask.id, delayDays: 2 }
      ]);
      expect(delayed.criticalDelayDaysAdded).toBe(0);
      expect(delayed.revisedCalendarDays).toBe(baseSchedule.totalCalendarDays);
    }
  });
});

describe('AI Estimation Service Deterministic Authority', () => {
  it('interprets renovation prompts and extracts stated measurements', () => {
    const result = aiEstimationService.interpretRequirement({
      userPrompt: 'Need complete interior renovation for my 1500 sq ft 3bhk apartment in Mumbai with premium tiles'
    });

    expect(result.detectedCategory).toBe('Home Renovation');
    expect(result.recommendedAreaSqFt).toBe(1500);
    expect(result.recommendedTier).toBe('Premium');
    expect(result.targetedQuestions.length).toBe(3);
    expect(result.isDeterministicFallback).toBe(true);
  });

  it('generates complete verified estimate without fabricating live prices', () => {
    const fullEstimate = aiEstimationService.generateCompleteEstimate({
      userPrompt: 'Constructing 2400 sq ft independent house in Delhi NCR',
      projectCity: 'delhi-ncr'
    });

    expect(fullEstimate.financialEstimate.city.id).toBe('delhi-ncr');
    expect(fullEstimate.materialQuantities.builtUpAreaSqFt).toBe(2400);
    expect(fullEstimate.scheduleForecast.totalMonthsEstimate).toBeGreaterThan(6);
    expect(fullEstimate.aiExplanation).toContain('indicative budget benchmark');
  });
});
