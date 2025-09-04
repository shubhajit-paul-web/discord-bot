const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			trim: true,
			required: true,
		},
		role: {
			type: String,
			enum: ["user", "model"],
			required: true,
		},
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
