import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";
import { Priority, Region } from "@prisma/client"; // générés depuis les enums de schema.prisma


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

  @IsEnum(Region)
  region: Region;
}