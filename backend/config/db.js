// import mongoose from "mongoose"

// export const connectDB = async () => {
//     await mongoose.connect('mongodb+srv://Sakshi:Homease@cluster0.jum4d.mongodb.net/Homease').then(()=>console.log("DB Connected"));
// }


import mongoose from "mongoose";

export const connectDB = async () => {
    const MONGODB_URI = "mongodb+srv://quickiechores:JmWdV5zswVMG3DRO@quickiechores.wnv7w5b.mongodb.net/?retryWrites=true&w=majority&appName=Quickiechores";

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ DB Connected Successfully");
    } catch (error) {
        console.error("❌ DB Connection Failed:", error);
        process.exit(1);
    }
};
