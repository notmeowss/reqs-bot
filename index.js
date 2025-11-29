require("dotenv").config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

// ----------------------------
// Create the client
// ----------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ----------------------------
// Command collection
// ----------------------------
client.commands = new Collection();

// ----------------------------
// Ensure commands folder exists
// ----------------------------
const commandsPath = path.join(__dirname, "commands");
if (!fs.existsSync(commandsPath)) {
  fs.mkdirSync(commandsPath);
  console.log("Created 'commands' folder because it was missing.");
}

// ----------------------------
// Load command files safely
// ----------------------------
const commands = [];
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  try {
    const command = require(filePath);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      console.warn(`Command file ${file} is missing "data" or "execute" property.`);
    }
  } catch (err) {
    console.error(`Error loading command file ${file}:`, err);
  }
}

// ----------------------------
// Register slash commands
// ----------------------------
const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log("Refreshing slash commands…");

    if (process.env.GUILD_ID) {
      // Guild-specific commands (instant updates)
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
    } else {
      // Global commands (may take up to 1 hour)
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
    }

    console.log("Slash commands loaded successfully!");
  } catch (err) {
    console.error("Error registering slash commands:", err);
  }
})();

// ----------------------------
// Bot ready + interval message
// ----------------------------
client.once("clientReady", () => {
  console.log(`${client.user.tag} is online!`);

  const channelId = process.env.HIGHERUPS_CHANNEL_ID;
  if (!channelId) return;

  setInterval(() => {
    const channel = client.channels.cache.get(channelId);
    if (!channel) return console.log("Higherups channel not found.");

    channel.send("bigbossdaddyhannie").catch(console.error);
  }, 30 * 60 * 1000); // every 30 minutes
});

// ----------------------------
// Handle slash commands
// ----------------------------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(`Error executing command ${interaction.commandName}:`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: "There was an error running this command.", ephemeral: true });
    } else {
      await interaction.followUp({ content: "There was an error running this command.", ephemeral: true });
    }
  }
});

// ----------------------------
// Login
// ----------------------------
client.login(process.env.BOT_TOKEN);