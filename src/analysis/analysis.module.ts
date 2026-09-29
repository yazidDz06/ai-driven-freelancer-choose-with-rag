import { Module } from "@nestjs/common";
import { AnalysisService } from "./analysis.service";
import { AnalysisController } from "./analysis.controller";
import { RetrievalModule } from "../retrieval/retrieval.module";
import { LlmModule } from "../llm/llm.module";
import { EstimationModule } from "../estimation/estimation.module";

@Module({
  imports: [RetrievalModule, LlmModule, EstimationModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}