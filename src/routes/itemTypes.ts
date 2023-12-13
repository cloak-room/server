import express, { Application, RequestHandler } from "express";
import { AppDataSource } from "../appDataSource";
import { ItemType } from "../entity/itemType.entity";
const router = express.Router();

router.get("/", async function (req, res) {
  const itemTypes = await AppDataSource.getRepository(ItemType).find();
  res.json(itemTypes);
} as RequestHandler);

export default router;
