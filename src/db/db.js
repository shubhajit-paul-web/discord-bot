const mongoose = require("mongoose");

async function connectDB() {
	try {
		await mongoose.connect(`${process.env.MONGODB_URI}/discord-bot-ghost`);
		console.log("MongoDB is connected !!");
	} catch (error) {
		console.error("MongoDB connection Error:", error);
		process.exit(1);
	}
}

module.exports = connectDB;
