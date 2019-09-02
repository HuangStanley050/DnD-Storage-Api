import express from "express";

import logger from "morgan";

import authRouter from "./routes/auth";
import dataRouter from "./routes/data";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", authRouter);
app.use("/api/data", dataRouter);

export default app;
