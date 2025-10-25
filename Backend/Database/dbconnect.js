import mongoose from "mongoose";

const db_connect=async()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/quiz")
        console.log("Mongodb connection successful");
        
    } catch (error) {

        console.log(error.message);
        
    }
}
export default db_connect;