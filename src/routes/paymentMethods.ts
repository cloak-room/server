import express, { Application, RequestHandler } from "express";
import { AppDataSource } from "../appDataSource";
import { PaymentMethod } from "../entity/paymentMethod.entitiy";
const router = express.Router();

router.get("/", async function (req, res) {
  const paymentMethods = await AppDataSource.getRepository(
    PaymentMethod
  ).find();
  res.json(paymentMethods);
}) as RequestHandler;

export default router;
