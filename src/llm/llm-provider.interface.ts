export interface LlmProvider {

  generateJson(systemPrompt: string, userPrompt: string): Promise<string>;
}

export const LLM_PROVIDER = Symbol("LLM_PROVIDER");