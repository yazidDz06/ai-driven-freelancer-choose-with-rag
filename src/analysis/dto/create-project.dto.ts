import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";
import { Priority } from "@prisma/client";

// Ce DTO est la seule porte d'entrée du endpoint public
export class CreateProjectDto {
  @IsString()
  @MinLength(20, { message: "Décris ton projet en au moins 20 caractères." })
  description: string;

  @IsDateString()
  deadline: string;

  @IsNumber()
  @IsPositive()
  budget: number;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority; 
}