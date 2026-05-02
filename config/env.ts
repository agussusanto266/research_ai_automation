import dotenv from "dotenv";

dotenv.config();

export const env = {
  baseUrl: process.env.BASE_URL ?? "https://www.saucedemo.com/",
  orangehrmBaseUrl: process.env.ORANGEHRM_BASE_URL ?? "https://opensource-demo.orangehrmlive.com",
  todoMvcBaseUrl: process.env.TODOMVC_BASE_URL ?? "https://todomvc.com/examples/react/dist",
  headless: process.env.HEADLESS === "true"
};
