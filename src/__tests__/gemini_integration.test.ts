import { describe, it, expect } from 'vitest';
import { GeminiScopeInterpreter, getDeterministicScope } from '../../server/geminiService.ts';

describe('Gemini AI Scope Interpreter & Fallback Engine', () => {
  it('reports fallback_mode when GEMINI_API_KEY is not configured', () => {
    const interpreter = new GeminiScopeInterpreter(undefined, 'gemini-2.5-flash');
    const health = interpreter.getHealth();

    expect(health.status).toBe('fallback_mode');
    expect(health.provider).toBe('deterministic_rules');
    expect(health.model).toBe('gemini-2.5-flash');
    expect(health.hasApiKey).toBe(false);
  });

  it('reports operational status when valid GEMINI_API_KEY is provided', () => {
    const interpreter = new GeminiScopeInterpreter('mock-api-key-for-test-12345', 'gemini-2.5-flash');
    const health = interpreter.getHealth();

    expect(health.status).toBe('operational');
    expect(health.provider).toBe('gemini');
    expect(health.model).toBe('gemini-2.5-flash');
    expect(health.hasApiKey).toBe(true);
  });

  it('correctly classifies a new construction requirement in deterministic fallback', async () => {
    const scope = getDeterministicScope({
      userPrompt: 'I want to build a 2400 sq ft house in Hyderabad with premium finishes',
      projectCity: 'hyderabad',
    });

    expect(scope.detectedCategory).toBe('New Construction');
    expect(scope.recommendedAreaSqFt).toBe(2400);
    expect(scope.recommendedTier).toBe('Premium');
    expect(scope.isAiGenerated).toBe(false);
    expect(scope.inclusions.length).toBeGreaterThan(0);
    expect(scope.targetedQuestions.length).toBeGreaterThan(0);
  });

  it('correctly classifies an apartment renovation requirement in deterministic fallback', async () => {
    const scope = getDeterministicScope({
      userPrompt: 'Full renovation of 3BHK flat with budget civil work',
      projectCity: 'pune',
    });

    expect(scope.detectedCategory).toBe('Home Renovation');
    expect(scope.recommendedTier).toBe('Basic');
    expect(scope.isAiGenerated).toBe(false);
  });

  it('gracefully handles missing area and supplies sensible defaults', async () => {
    const scope = getDeterministicScope({
      userPrompt: 'Bathroom remodeling and tile fixing',
      projectCity: 'bengaluru',
    });

    expect(scope.detectedCategory).toBe('Room Improvement');
    expect(scope.recommendedAreaSqFt).toBe(600);
    expect(scope.recommendedTier).toBe('Standard');
  });

  it('never outputs financial totals or rates in scope extraction', () => {
    const scope = getDeterministicScope({
      userPrompt: 'Construct 1500 sq ft villa',
      projectCity: 'mumbai',
    });

    // Verification: Scope extraction must not fabricate monetary amounts
    expect((scope as any).totalPrice).toBeUndefined();
    expect((scope as any).ratePerSqFt).toBeUndefined();
  });
});
