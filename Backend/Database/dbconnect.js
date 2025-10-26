import mongoose from "mongoose";

const db_connect=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongodb connection successful");
        
    } catch (error) {

        console.log(error.message);
        
    }
}
export default db_connect;