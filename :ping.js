const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bigboss") // no spaces or question mark
    .setDescription("Replies with daddy hannie!"),

  async execute(interaction) {
    // Optional: restrict to Supervisor/Admin
    const allowedRoles = ["Supervisor", "Admin"];
    const hasRole = interaction.member.roles.cache.some(role =>
      allowedRoles.includes(role.name)
    );

    if (!hasRole) {
      return interaction.reply({
        content: "❌ You do not have permission to use this command.",
        ephemeral: true
      });
    }

    await interaction.reply("daddy hannie!");
  },
};