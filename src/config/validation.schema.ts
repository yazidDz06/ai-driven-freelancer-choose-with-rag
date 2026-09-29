import * as Joi from "joi";

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),

  PORT: Joi.number().default(3001),

  
  DATABASE_URL: Joi.string().required(),

  GEMINI_API_KEY: Joi.string().required(),
  GEMINI_GENERATION_MODEL: Joi.string().default("gemini-2.0-flash-lite"),

  CORS_ORIGIN: Joi.string().required(),
});