// dotenv is loaded once by config/env.ts — never re-load here.
// In CI, SAUCEDEMO_PASSWORD must be set as a secret. The fallback is only
// used in local development; if it's ever missing in CI the assertion in
// auth.steps.ts catches it at test time.
export const SAUCEDEMO_PASSWORD = process.env.SAUCEDEMO_PASSWORD ?? "secret_sauce";

export const SAUCEDEMO_USERS: Record<string, string> = {
  standard_user: SAUCEDEMO_PASSWORD,
  locked_out_user: SAUCEDEMO_PASSWORD,
  problem_user: SAUCEDEMO_PASSWORD,
  performance_glitch_user: SAUCEDEMO_PASSWORD,
};
