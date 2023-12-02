import express, { Application } from "express";
import { AppDataSource } from "../../appDataSource";
import { Item } from "../entity/item.entity";
import { ItemType } from "../entity/itemType.entity";
import { User } from "../entity/user.entity";
import { textSearchByFields } from "typeorm-text-search";
import fs from "fs";
import { In } from "typeorm";
import env from "../parsedEnv";

const cors = require("cors");

const router = express.Router();

router.get(
  "/",
  async function (req: express.Request, res: express.Response): Promise<void> {
    const { from, to, q, p, showCollected, perPage, id } = req.query;

    const page = parseInt((p && "1") as string);
    const parsePerPage = parseInt((perPage && `${env.pageSize}`) as string);
    const parseShowCollected = parseInt((showCollected && "0") as string);

    try {
      const queryBuilder = () => {
        const queryBuilder = AppDataSource.createQueryBuilder(Item, "item");
        textSearchByFields<Item>(queryBuilder, (q ?? "%") as string, [
          "item.ownerName",
          "item.ownerPhoneNumber",
          "item.comments",
          "item.storageLocation",
        ]);

        if (from) {
          queryBuilder.andWhere("item.createdAt > :from", { from: from });
        }
        if (to) {
          queryBuilder.andWhere("item.createdAt < :to", { to: to });
        }

        if (parseShowCollected == 0) {
          queryBuilder.andWhere("item.collected IS NULL");
        }

        if (id != null) {
          queryBuilder.andWhere("item.id = :id", { id: id });
        }

        const items = queryBuilder
          .leftJoinAndSelect("item.itemType", "itemType")
          .leftJoinAndSelect("item.paymentMethod", "paymentMethod")
          .leftJoinAndSelect("item.user", "user")
          .leftJoinAndSelect("item.refundedBy", "refundedBy");
        return items;
      };

      const limitItems = await queryBuilder()
        .orderBy("item.createdAt", "DESC")
        .limit(parsePerPage)
        .offset((page - 1) * parsePerPage)
        .getManyAndCount();
      // const stats = queryBuilder()
      //   .select("COUNT(item.id)", "count")
      //   .getRawOne();

      const result = {
        pageSize: parsePerPage,
        pageNumber: page,
        pageCount: Math.ceil(limitItems[1] / parsePerPage),
        count: limitItems[1],
        // stats: await stats,
        data: limitItems[0],
      };
      res.json(result);
    } catch (e) {
      console.log(e);
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
        collected: req.body.reset ? null : new Date().toISOString(),
      });
      res.status(201).json({
        message: req.body.reset
          ? "Collection reset successfully"
          : "Item collected successfully",
      });
    } catch (e) {
      res.status(500).json({ error: e, message: "Failed to collect item" });
    }
  }
);

router.post(
  "/refund",
  async function (req: express.Request, res: express.Response): Promise<void> {
    try {
      const item = await AppDataSource.getRepository(Item).save({
        id: req.body.id,
        refundedBy: req.body.user,
        refunded: req.body.reset ? null : new Date().toISOString(),
      });
      res.status(201).json({
        message: req.body.reset
          ? "Refund reset successfully"
          : "Item refunded successfully",
      });
    } catch (e) {
      res.status(500).json({ error: e, message: "Failed to refund item" });
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
      userId,
      ownerName,
      ownerPhoneNumber,
      comments,
      photo,
      //itemType: itemTypeID,
      cart,
      storageLocation,
      bagNumber,
      paymentMethod,
      dryRun,
    } = req.body;

    const createdAt = new Date().toISOString();

    const user = await AppDataSource.getRepository(User).findOne({
      where: {
        id: userId,
      },
    });

    console.log(user);

    if (!user && !id) {
      res.status(400).json({
        error: true,
        message: `User with id ${userId} does not exist`,
      });
      return;
    }

    if (!storageLocation && !id && env.locationRequired) {
      res.status(400).json({
        error: true,
        message: `Please specify a storage location`,
      });
      return;
    }

    const bagNumberValid = /^[0-9]*$/.test(bagNumber);
    if (!bagNumberValid && !id) {
      res.status(400).json({
        error: true,
        message: `Bag number must consist of numbers only`,
      });
      return;
    }

    if (!bagNumber && !id) {
      res.status(400).json({
        error: true,
        message: `Please specify a bag number`,
      });
      return;
    }

    if (!paymentMethod && !id) {
      res.status(400).json({
        error: true,
        message: `Please specify a payment method`,
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

    let photoFilename: string | undefined = undefined;

    if (!photo && !id) {
      res.status(400).json({
        error: true,
        message: `Please take a photo of collected items`,
      });
      return;
    } else {
      try {
        if (photo && photo != "") {
          const fileExt = photo.split(";")[0].split("/")[1]; // TODO use regex for this
          photoFilename = `${ownerName}_${createdAt}.${fileExt}`;

          fs.mkdirSync(env.photoStorageDir, { recursive: true });
          fs.writeFileSync(
            `${env.photoStorageDir}/${photoFilename}`,
            Buffer.from(photo.split(",")[1], "base64")
          );
        }
      } catch (err) {
        res.status(500).json({
          error: true,
          message: `Failed to write photo to disk`,
        });
        return;
      }
    }

    if (cart.length < 1 && !id) {
      res.status(400).json({
        error: true,
        message: `At least 1 item must be added`,
        body: req.body,
      });
      return;
    }

    cart.forEach(async (itemTypeID: number) => {
      console.log(itemTypeID);
      const itemType = await AppDataSource.getRepository(ItemType).findOne({
        where: {
          id: itemTypeID,
        },
      });

      if ((!itemType || itemType == null) && !id) {
        res.status(400).json({
          error: true,
          message: `Item Type ${itemTypeID} does not exist`,
        });
        return;
      }

      Object.assign(item, {
        id,
        user,
        ownerName,
        bagNumber,
        ownerPhoneNumber,
        comments,
        itemType,
        storageLocation,
        paymentMethod,
        imageLocation: photoFilename,
        createdAt,
      });

      try {
        if (!dryRun) {
          await AppDataSource.getRepository(Item).save(item);
        }
      } catch (e) {
        res.status(500).json({ error: e, message: "Failed to add item" });
        return;
      }
    });
    res.status(201).json({
      message: id ? "Item updated successfully" : "Item added successfully",
    });
  }
);

export default router;
