const Discord = require("discord.js");
const client = new Discord.Client({
    intents: [
        "GUILDS", 
        "GUILD_MESSAGES", 
        "GUILD_MEMBERS",   // Privileged Intent (make sure it's enabled)
        "MESSAGE_CONTENT"  // Privileged Intent (make sure it's enabled)
    ],
    partials: ["CHANNEL", "MESSAGE"]
});

// Load your token from environment variable
const token = ("MTI4Nzc4NTIzODI2NDU0OTQ2Nw.GsVxqW.K4lSQhQixGrQXJK-_d9YaFggmmKz6wuykRSutY"); // your bot token here

// Track user messages for anti-spam
const userMessages = {};

client.on('ready', async () => {
    console.log(`Client has been initiated! ${client.user.username}`);
});

client.on('messageCreate', async (message) => {
    // Ignore bot's own messages
    if (message.author.bot) return;

    const userId = message.author.id;
    const now = Date.now();

    // Check if the user exists in the spam tracking object
    if (!userMessages[userId]) {
        userMessages[userId] = [];
    }

    // Add the timestamp of the new message
    userMessages[userId].push(now);

    // Remove messages older than 5 seconds
    userMessages[userId] = userMessages[userId].filter(timestamp => now - timestamp < 5000);

    // Check if the user sent 5 or more messages in less than 5 seconds
    if (userMessages[userId].length >= 5) {
        message.reply("You're sending messages too quickly, please slow down!");
        userMessages[userId] = []; // Reset the message count for the user

        const guildMember = message.guild.members.cache.get(userId);
        if (guildMember) {
            guildMember.timeout(10 * 1000, 'Spamming messages') // Timeout for 10 seconds
                .then(() => {
                    message.channel.send(`${message.author} has been timed out for 10 seconds due to spamming.`);
                })
                .catch(err => {
                    if (err.code === 50013) { // 50013: Missing Permissions
                        message.channel.send(`I don't have permission to timeout ${message.author}.`);
                    } else {
                        console.error('Failed to timeout user:', err);
                    }
                });
        }  
    }
});

client.login(token);