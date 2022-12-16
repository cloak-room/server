import express from "express";
import path from "path";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import logger from "morgan";
const cors = require("cors");
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("./swagger_output.json");

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import itemsRouter from "./routes/items";
import itemTypesRouter from "./routes/itemTypes";
import paymentMethodsRouter from "./routes/paymentMethods";

import { AppDataSource } from "../appDataSource";

const port = process.env.PORT ?? 3000;

swaggerDocument.host = `localhost:${port}`;
const app: express.Application = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/docs", swaggerUI.serve);
app.get("/docs", swaggerUI.setup(swaggerDocument));

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/items", itemsRouter);
app.use("/item_types", itemTypesRouter);
app.use("/payment_methods", paymentMethodsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
