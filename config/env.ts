import dotenv from "dotenv";

dotenv.config();

export const env = {
  baseUrl: process.env.BASE_URL ?? "https://www.saucedemo.com/",
  headless: process.env.HEADLESS === "true"
};
