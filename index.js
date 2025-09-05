require("dotenv").config();
const app = require("./src/app"); 
const { Client, GatewayIntentBits } = require("discord.js");
const { GoogleGenAI } = require("@google/genai");
const connectDB = require("./src/db/db");
const Message = require("./src/models/message.model");

// Start the dummy express server
(() => {
	const PORT = process.env.PORT || 8000;

	app.listen(PORT, () => {
		console.log(`Web server is running on port ${PORT}`);
	});
})();

connectDB();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const ai = new GoogleGenAI({});

async function generateContent(contents) {
	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: contents,
		config: {
			temperature: 0.7,
			systemInstruction:
				"You are a friendly and funny AI that talks like a lighthearted psychologist. Always reply in short, very simple English. Make people feel understood first, then give an easy explanation or advice. Keep answers warm, clear, and satisfying, but add a little gentle humor or playful sarcasm. At the end of every answer, guess the user’s mood and write it in quotes, like a mini funny observation.",
		},
	});

	return response.text;
}

const CHANNEL_ID = "1413228617345007698";

client.once("ready", () => {
	console.log(`Logged in as ${client.user.tag}`);

    const channel = client.channels.cache.get(CHANNEL_ID);

    if (channel) {
        channel.send("**Hello! I’m online and ready to chat!**");
    } else {
        console.log("Channel not found. Check CHANNEL_ID");
    }
});

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;

	if (message.channelId === "1413228617345007698") {
		const userId = message.author.id;
		const prompt = message.content.trim();

		// Save user message to DB
		await Message.create({
			userId,
			content: prompt,
			role: "user",
		});

		const chatHistory = await Message.find({
			userId,
		})
			.select("content role")
			.sort({ createdAt: -1 })
			.limit(30)
			.lean();

		const STM = chatHistory.reverse().map((chat) => {
			return {
				role: chat.role,
				parts: [{ text: chat.content }],
			};
		});

		const modelResponse = await generateContent(STM);

		message.reply(modelResponse);

		// Save model response to DB
		await Message.create({
			userId,
			content: modelResponse,
			role: "model",
		});
	}
});

client.login(process.env.DISCORD_BOT_TOKEN);
