import express from "express";
import cors from "cors";
import logger from "morgan";
import * as admin from "firebase-admin";
import serviceAccount from "./graphql-gram-94075-firebase-adminsdk-ejim3-44c474bfe5.json";
import authRouter from "./routes/auth";
import dataRouter from "./routes/data";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://dining-out-94075.appspot.com"
});
const auth = admin.auth();
const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();

app.set("auth", auth);
app.set("db", db);
app.set("bucket", bucket);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/api/auth", authRouter);
app.use("/api/data", dataRouter);
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message });
});

export default app;
