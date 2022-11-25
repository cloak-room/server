import express, { Application } from "express";
import { AppDataSource } from "../../appDataSource";
import { ItemType } from "../entity/itemType.entity";
const router = express.Router();

router.get(
  "/",
  async function (req: express.Request, res: express.Response): Promise<void> {
    const itemTypes = await AppDataSource.getRepository(ItemType).find();
    res.json(itemTypes);
  }
);

export default router;
