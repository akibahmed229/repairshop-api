import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/models",
  out: "./drizzle",
  dbCredentials: {
    host: "localhost",
    port: 5033,
    database: "repairshop",
    user: "repair_shop",
    password: "repair123",
    ssl: false,
  },
});
