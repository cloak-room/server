import express, { Application } from "express";
import { AppDataSource } from "../../appDataSource";
import { User } from "../entity/user.entity";
const router = express.Router();

async function checkUsernameExists(username: string): Promise<boolean> {
  const users = await AppDataSource.getRepository(User).find({
    where: {
      username: username,
    },
  });

  return users.length > 0;
}

/* GET users listing. */
router.get(
  "/",
  async function (req: express.Request, res: express.Response): Promise<void> {
    const users = await AppDataSource.getRepository(User).find();
    res.json(users);
  }
);

router.post(
  "/add",
  async function (req: express.Request, res: express.Response): Promise<void> {
    if (await checkUsernameExists(req.body.username)) {
      res.status(400).json({
        error: true,
        message: "A user with that name already exists",
      });
      return;
    }

    const user = new User();

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.username = req.body.username;
    user.hash = undefined;

    try {
      await AppDataSource.getRepository(User).save(user);
      res.status(201).json({ message: "User added successfully" });
    } catch (e) {
      res.status(500).json({ error: e, message: "Failed to add user" });
    }
  }
);

export default router;
