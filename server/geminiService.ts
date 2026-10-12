import { GoogleGenAI } from '@google/genai';

export interface ScopeExtractionInput {
  userPrompt: string;
  projectCity?: string;
  estimatedAreaSqFt?: number;
  qualityTier?: 'Basic' | 'Standard' | 'Premium';
}

export interface ScopeClarificationQuestion {
  id: string;
  question: string;
  context: string;
  options: string[];
  defaultChoice: string;
}

export interface StructuredScopeResult {
  detectedCategory: 'New Construction' | 'Home Renovation' | 'Room Improvement' | 'Civil Maintenance';
  projectTitle: string;
  recommendedAreaSqFt: number;
  recommendedTier: 'Basic' | 'Standard' | 'Premium';
  inclusions: string[];
  exclusions: string[];
  unresolvedDecisions: string[];
  targetedQuestions: ScopeClarificationQuestion[];
  isAiGenerated: boolean;
  modelIdentifier: string;
}

export interface AiServiceHealth {
  status: 'operational' | 'fallback_mode';
  provider: 'gemini' | 'deterministic_rules';
  model: string;
  hasApiKey: boolean;
}

// Fallback rule-based interpreter
export function getDeterministicScope(input: ScopeExtractionInput): StructuredScopeResult {
  const prompt = (input.userPrompt || '').toLowerCase();

  let detectedCategory: StructuredScopeResult['detectedCategory'] = 'New Construction';
  let defaultArea = input.estimatedAreaSqFt || 2000;
  let defaultTier = input.qualityTier || 'Standard';

  if (prompt.includes('kitchen') || prompt.includes('bathroom') || prompt.includes('terrace') || prompt.includes('balcony')) {
    detectedCategory = 'Room Improvement';
    defaultArea = input.estimatedAreaSqFt || 600;
  } else if (prompt.includes('renovat') || prompt.includes('remodel') || prompt.includes('overhaul')) {
    detectedCategory = 'Home Renovation';
    defaultArea = input.estimatedAreaSqFt || 1400;
  } else if (prompt.includes('repair') || prompt.includes('leak') || prompt.includes('maintenance') || prompt.includes('crack')) {
    detectedCategory = 'Civil Maintenance';
    defaultArea = input.estimatedAreaSqFt || 300;
  }

  if (prompt.includes('luxury') || prompt.includes('premium') || prompt.includes('high end')) {
    defaultTier = 'Premium';
  } else if (prompt.includes('budget') || prompt.includes('economy') || prompt.includes('low cost')) {
    defaultTier = 'Basic';
  }

  const areaMatch = prompt.match(/(\d{3,5})\s*(?:sq|sqft|sq\s*ft|square\s*feet)/);
  if (areaMatch && areaMatch[1]) {
    const parsed = parseInt(areaMatch[1], 10);
    if (parsed >= 100 && parsed <= 25000) {
      defaultArea = parsed;
    }
  }

  return {
    detectedCategory,
    projectTitle: `${defaultTier} ${detectedCategory} (${defaultArea} sq. ft)`,
    recommendedAreaSqFt: defaultArea,
    recommendedTier: defaultTier,
    inclusions: [
      'Site layout demarcation and structural RCC superstructure',
      'Class-A brick masonry / AAC blocks with sand-faced plastering',
      'Concealed electrical conduits and CPVC/UPVC sanitary plumbing rough-in',
      '14-day mandatory concrete curing water protocol',
    ],
    exclusions: [
      'Municipal sanction scrutiny fees and electricity board grid tie-in fees',
      'Movable loose furniture and decorative soft furnishings',
      'Borewell drilling beyond plot boundary plinth',
    ],
    unresolvedDecisions: [
      'Selection between Red Clay Kiln Bricks vs. AAC lightweight blocks',
      'Epoxy vs. cementitious grout waterproofing for sanitary zones',
    ],
    targetedQuestions: [
      {
        id: 'q-soil',
        question: 'Has a soil-bearing capacity or structural foundation test been conducted on the site?',
        context: 'Affects foundation depth, RCC pile requirements, and initial civil contingency.',
        options: ['Yes, geotechnical report available', 'No, standard shallow footing assumed', 'Site is rocky / hard strata'],
        defaultChoice: 'No, standard shallow footing assumed',
      },
      {
        id: 'q-materials-handling',
        question: 'Is heavy cement/steel transit truck access permitted directly up to the plot boundary?',
        context: 'Manual double-handling by beldars increases labour expenditure if roads are narrow.',
        options: ['Direct road access (Transit mixer allowed)', 'Narrow road (Manual trolley carry required)', 'Restricted municipal entry hours'],
        defaultChoice: 'Direct road access (Transit mixer allowed)',
      },
    ],
    isAiGenerated: false,
    modelIdentifier: 'deterministic_rule_engine_v1',
  };
}

export class GeminiScopeInterpreter {
  private apiKey: string | undefined;
  private modelName: string;

  constructor(apiKey?: string, modelName: string = 'gemini-2.5-flash') {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || modelName;
  }

  getHealth(): AiServiceHealth {
    const hasKey = Boolean(this.apiKey && this.apiKey.trim().length > 5);
    return {
      status: hasKey ? 'operational' : 'fallback_mode',
      provider: hasKey ? 'gemini' : 'deterministic_rules',
      model: this.modelName,
      hasApiKey: hasKey,
    };
  }

  /**
   * Safe natural language scope interpreter using Gemini GenAI SDK.
   * If API key is missing or model fails, gracefully falls back to deterministic rule engine.
   */
  async interpretScope(input: ScopeExtractionInput): Promise<StructuredScopeResult> {
    if (!this.apiKey || this.apiKey.trim().length < 5) {
      return getDeterministicScope(input);
    }

    try {
      const ai = new GoogleGenAI({ apiKey: this.apiKey });
      const systemInstruction = `You are Buildzy's expert Indian Construction & Renovation Estimator.
Extract and classify the user's project requirements into strict, verified JSON without hallucinating rates or engineering guarantees.
DO NOT calculate monetary totals or final INR prices; only extract scope, dimensions, quality tier, inclusions, exclusions, and targeted clarification questions.
JSON response format:
{
  "detectedCategory": "New Construction" | "Home Renovation" | "Room Improvement" | "Civil Maintenance",
  "projectTitle": string,
  "recommendedAreaSqFt": number,
  "recommendedTier": "Basic" | "Standard" | "Premium",
  "inclusions": string[],
  "exclusions": string[],
  "unresolvedDecisions": string[],
  "targetedQuestions": [
    {
      "id": string,
      "question": string,
      "context": string,
      "options": string[],
      "defaultChoice": string
    }
  ]
}`;

      const userContent = `User Requirement: "${input.userPrompt}"
City Hint: ${input.projectCity || 'Not specified'}
Area Hint: ${input.estimatedAreaSqFt ? input.estimatedAreaSqFt + ' sq ft' : 'Not specified'}
Tier Hint: ${input.qualityTier || 'Not specified'}`;

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: [userContent],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        return getDeterministicScope(input);
      }

      const parsed = JSON.parse(responseText);

      // Validate parsed fields
      const validCategories = ['New Construction', 'Home Renovation', 'Room Improvement', 'Civil Maintenance'];
      const validTiers = ['Basic', 'Standard', 'Premium'];

      const detectedCategory = validCategories.includes(parsed.detectedCategory)
        ? parsed.detectedCategory
        : 'New Construction';

      const recommendedTier = validTiers.includes(parsed.recommendedTier)
        ? parsed.recommendedTier
        : 'Standard';

      const recommendedAreaSqFt = typeof parsed.recommendedAreaSqFt === 'number' && parsed.recommendedAreaSqFt > 50
        ? parsed.recommendedAreaSqFt
        : (input.estimatedAreaSqFt || 1800);

      return {
        detectedCategory,
        projectTitle: parsed.projectTitle || `${recommendedTier} ${detectedCategory} (${recommendedAreaSqFt} sq. ft)`,
        recommendedAreaSqFt,
        recommendedTier,
        inclusions: Array.isArray(parsed.inclusions) ? parsed.inclusions : [],
        exclusions: Array.isArray(parsed.exclusions) ? parsed.exclusions : [],
        unresolvedDecisions: Array.isArray(parsed.unresolvedDecisions) ? parsed.unresolvedDecisions : [],
        targetedQuestions: Array.isArray(parsed.targetedQuestions) ? parsed.targetedQuestions : [],
        isAiGenerated: true,
        modelIdentifier: this.modelName,
      };
    } catch (err) {
      console.warn('Gemini API call returned error or timeout, falling back to deterministic rules:', (err as Error).message);
      return getDeterministicScope(input);
    }
  }
}
