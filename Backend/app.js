import express from "express";
import db_connect from "./Database/dbconnect.js";
import router from "./routes/routing.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
const app=express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));





await db_connect();


app.use("/",router);


app.listen(3000,()=>{
    console.log(`Server is running on 3000`);
})