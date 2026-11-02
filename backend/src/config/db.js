import mongoose from "mongoose";

async function connectDB() {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing from environment variables.");
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DB_NAME || "julley-kanban",
            serverSelectionTimeoutMS: 10000,
        });
        console.log("DB Connected");
    } catch (error) {
        console.error("DB Connection Failed", error.message);
        throw error;
    }
}

export {
    connectDB
}
