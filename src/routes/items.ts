import express, { Application } from "express";
import { AppDataSource } from "../../appDataSource";
import { Item } from "../entity/item.entity";
import { ItemType } from "../entity/itemType.entity";
import { User } from "../entity/user.entity";
import { textSearchByFields } from "typeorm-text-search";
const router = express.Router();

router.get(
  "/",
  async function (req: express.Request, res: express.Response): Promise<void> {
    const { from, to, q } = req.query;

    try {
      const queryBuilder = await AppDataSource.createQueryBuilder(Item, "item");
      textSearchByFields<Item>(queryBuilder, (q ?? "%") as string, [
        "item.ownerName",
        "item.ownerPhoneNumber",
        "item.comments",
        "item.storageLocation",
      ]);

      if (from) {
        queryBuilder.where("item.createdAt > :from", { from: from });
      }
      if (to) {
        queryBuilder.where("item.createdAt < :to", { to: to });
      }

      const items = queryBuilder.getMany();

      res.json(await items);
    } catch (e) {
      res.status(500).json({ error: e, message: "Failed to get items" });
    }
  }
);

router.post(
  "/collect",
  async function (req: express.Request, res: express.Response): Promise<void> {
    try {
      const item = await AppDataSource.getRepository(Item).save({
        id: req.body.id,
        collected: true,
      });
      res.status(201).json({ message: "Item collected successfully" });
    } catch (e) {
      res.status(500).json({ error: e, message: "Failed to collect item" });
    }
  }
);

router.post(
  "/add",
  async function (req: express.Request, res: express.Response): Promise<void> {
    const item = new Item();
    console.log(req.body);

    const {
      id,
      userID,
      ownerName,
      ownerPhoneNumber,
      comments,
      itemTypeID,
      storageLocation,
    } = req.body;

    const user = await AppDataSource.getRepository(User).findOneBy({
      id: userID,
    });
    const itemType = await AppDataSource.getRepository(ItemType).findOneBy({
      id: itemTypeID,
    });

    if (!user && !id) {
      res.status(400).json({
        error: true,
        message: `User with id ${userID} does not exist`,
      });
      return;
    }

    if (!storageLocation && !id) {
      res.status(400).json({
        error: true,
        message: `Please specify a storage location`,
      });
      return;
    }

    if (!itemType && !id) {
      res.status(400).json({
        error: true,
        message: `Item Type ${itemTypeID} does not exist`,
      });
      return;
    }

    if (ownerName == null && !id) {
      res.status(400).json({
        error: true,
        message: `An owner name must be supplied`,
        body: req.body,
      });
      return;
    }

    Object.assign(item, {
      id,
      user,
      ownerName,
      ownerPhoneNumber,
      comments,
      itemType,
      storageLocation,
    });

    try {
      await AppDataSource.getRepository(Item).save(item);
      res.status(201).json({
        message: id ? "Item updated successfully" : "Item added successfully",
      });
    } catch (e) {
      res.status(500).json({ error: e, message: "Failed to add item" });
    }
  }
);

export default router;
