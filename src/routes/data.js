import express from "express";
import DataController from "../controllers/data";
import Multer from "multer";
const router = express.Router();
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});

router.post("/datastore", multer.array("files"), DataController.storeFiles);

export default router;
