import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AnalysisService } from "./analysis.service";
import { CreateProjectDto } from "./dto/create-project.dto";

@Controller("api/analysis")
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}


  // c'est le seul qui consommequota Gemini gratuit,
 
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) 
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.analysisService.createAndAnalyze(dto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.analysisService.getById(id);
  }
}