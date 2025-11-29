const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot send a message')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Optional: Channel to send the message in')
        .setRequired(false)
    ),

  async execute(interaction) {
    // Role IDs for supervisor/admin
    const SUPERVISOR_ROLE_ID = process.env.SUPERVISOR_ROLE_ID;
    const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;

    const member = interaction.member;

    // Check if member has supervisor or admin role
    if (
      !member.roles.cache.has(SUPERVISOR_ROLE_ID) &&
      !member.roles.cache.has(ADMIN_ROLE_ID)
    ) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true
      });
    }

    const messageContent = interaction.options.getString('message');
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    // Check if the channel is a text-based channel
    if (!targetChannel.isTextBased()) {
      return interaction.reply({
        content: "I can't send messages in that channel.",
        ephemeral: true
      });
    }

    try {
      await targetChannel.send(messageContent);
      await interaction.reply({
        content: `Message sent${targetChannel.id !== interaction.channel.id ? ` in ${targetChannel}` : ''}!`,
        ephemeral: true
      });
    } catch (err) {
      console.error('Error sending message:', err);
      await interaction.reply({
        content: "Failed to send the message.",
        ephemeral: true
      });
    }
  }
};