import { NextFunction } from "express";
import { DataSource } from "typeorm";
import express from "express";

const port: number = parseInt(process.env.DB_PORT ?? "5432");
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: port,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE ?? "cloakroom",
  synchronize: true,
  logging: true,
  entities: ["src/entity/*.ts"],
  subscribers: [],
  migrations: [],
});
