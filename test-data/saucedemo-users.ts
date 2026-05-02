import dotenv from "dotenv";
dotenv.config();

export const SAUCEDEMO_PASSWORD = process.env.SAUCEDEMO_PASSWORD ?? "secret_sauce";

export const SAUCEDEMO_USERS: Record<string, string> = {
  standard_user: SAUCEDEMO_PASSWORD,
  locked_out_user: SAUCEDEMO_PASSWORD,
  problem_user: SAUCEDEMO_PASSWORD,
  performance_glitch_user: SAUCEDEMO_PASSWORD,
};
