import { Module } from "@nestjs/common";
import { LlmService } from "./llm.service";
import { LLM_PROVIDER } from "./llm-provider.interface";
import { GeminiProvider } from "./providers/gemini.provider";

@Module({
  providers: [
    LlmService,
    { provide: LLM_PROVIDER, useClass: GeminiProvider },
  ],
  exports: [LlmService],
})
export class LlmModule {}
