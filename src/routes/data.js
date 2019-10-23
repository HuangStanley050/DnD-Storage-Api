import express from "express";
import Multer from "multer";
import DataController from "../controllers/data";
import Middleware from "../middlewares/checkTokenAuth";

const router = express.Router();
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});

router
  .delete("/datastore", Middleware.checkAuth, DataController.deleteFile)
  .post(
    "/datastore",
    Middleware.checkAuth,
    multer.array("files"),
    DataController.storeFiles
  )
  .get("/datastore", Middleware.checkAuth, DataController.getFiles)
  .get(
    "/datastore/download/:id",
    Middleware.checkAuth,
    DataController.downloadFile
  );

export default router;
