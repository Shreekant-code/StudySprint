import express from "express";
import db_connect from "./Database/dbconnect.js";

const app=express();

app.use(express.json());

await db_connect();


app.get("/",(req,res)=>{
    res.send("all working");
})


app.listen(3000,()=>{
    console.log(`Server is running on 3000`);
})