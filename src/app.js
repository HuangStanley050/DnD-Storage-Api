import express from "express";
import cors from "cors";
import logger from "morgan";
import * as admin from "firebase-admin";
import serviceAccount from "./pwagram-bd625-firebase-adminsdk-ew3ye-db17bc2116.json";
import authRouter from "./routes/auth";
import dataRouter from "./routes/data";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://pwagram-bd625.appspot.com/"
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

export default app;
