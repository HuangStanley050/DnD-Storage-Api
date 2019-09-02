import express from "express";
const router = express.Router();

router.get("/datastore", function(req, res, next) {
  res.send("data router");
});

export default router;
