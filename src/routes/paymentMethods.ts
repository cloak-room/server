import express, { Application } from "express";
import { AppDataSource } from "../../appDataSource";
import { PaymentMethod } from "../entity/paymentMethod.entitiy";
const router = express.Router();

router.get(
  "/",
  async function (req: express.Request, res: express.Response): Promise<void> {
    const paymentMethods = await AppDataSource.getRepository(
      PaymentMethod
    ).find();
    res.json(paymentMethods);
  }
);

export default router;
