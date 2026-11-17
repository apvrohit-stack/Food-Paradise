const connectMongoDB = require("./mongo");
const mongoose = require("mongoose");

async function testConnection() {
    try {
        await connectMongoDB();
        console.log("MongoDB connection test passed!");
    } catch (error) {
        console.error("Connection test failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

testConnection();