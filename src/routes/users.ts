import express, { Application, RequestHandler } from "express";
import { hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";

import { AppDataSource } from "../appDataSource";
import { User } from "../entity/user.entity";
import { signedCookie } from "cookie-parser";
import { UsingJoinTableIsNotAllowedError } from "typeorm";
const router = express.Router();

const saltRounds = process.env.SALT_ROUNDS ?? 10;
const secret = process.env.SECRET;
async function checkUsernameExists(username: string): Promise<boolean> {
  const users = await AppDataSource.getRepository(User).find({
    where: {
      username: username,
    },
  });

  return users.length > 0;
}

/* GET users listing. */
router.get("/", async function (req, res) {
  const users = await AppDataSource.getRepository(User).find({
    select: ["id", "username", "level"],
  });
  res.json(users);
} as RequestHandler);

router.post("/login", async function (req, res) {
  const user = await AppDataSource.getRepository(User).findOne({
    where: {
      username: req.body.username,
    },
  });
  const match = await compare(req.body.password, user?.hash ?? "");

  if (secret == null) {
    res
      .status(500)
      .json({ error: true, message: "SECRET has not been set in .env" });
  } else if (process.env.LAZY_AUTH || match) {
    const token = await sign({ user: user }, secret, { expiresIn: "1d" });
    res.json({ token: token });

    return;
  }
  res
    .status(400)
    .json({ error: true, message: "Username and Password do not match" });
} as RequestHandler);

const addUser = async function (req, res) {
  if (await checkUsernameExists(req.body.username)) {
    res.status(400).json({
      error: true,
      message: "A user with that name already exists",
    });
    return;
  }

  const user = new User();
  const password = req.body.password ?? "password";

  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.username = req.body.username;
  user.hash = await hash(password, saltRounds);

  try {
    await AppDataSource.getRepository(User).save(user);
    res.status(201).json({ message: "User added successfully" });
  } catch (e) {
    res.status(500).json({ error: e, message: "Failed to add user" });
  }
} as RequestHandler;

router.post("/register", async function (req, res, next) {
  if (req.body.password && process.env.LAZY_AUTH) {
    await addUser(req, res, next);
  } else {
    res.json({
      error: true,
      message: "A password must be specified",
    });
  }
} as RequestHandler);

router.post("/add", async function (req, res, next) {
  if (process.env.LAZY_AUTH) {
    await addUser(req, res, next);
  } else {
    res.json({
      error: true,
      message:
        "The /user/register endpoint must be used when auth is not set to lazy",
    });
  }
}) as RequestHandler;

export default router;
