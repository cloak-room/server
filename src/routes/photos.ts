import express from "express";
import fs from "fs";

import { photoStorageDir } from "../parsedEnv";

const router = express.Router();

/* GET home page. */
router.get("/:filename", function (req, res) {
  const { filename } = req.params;
  res.sendFile(`${photoStorageDir}/${filename}`, { root: process.cwd() });
});

export default router;
