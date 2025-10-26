import express from "express";
import db_connect from "./Database/dbconnect.js";
import router from "./routes/routing.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();

// CORS for any origin with credentials
app.use(
  cors({
    origin: true,        // allow all origins dynamically
    credentials: true,   // allow cookies
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await db_connect();

app.use("/", router);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
