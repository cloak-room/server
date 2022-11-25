import { DataSource } from "typeorm";
import "express";

declare module "express" {
  export interface Request {
    appDataSource: DataSource;
  }
}
