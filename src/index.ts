import {
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  Message,
  Partials,
} from "discord.js";
import commands from "./commands.json";

const prefixes = ["!", "."];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
  ],
});

client.on("messageCreate", async (message: Message) => {
  if (
    message.author.bot ||
    !prefixes.reduce(
      (a, prefix) => a || message.content.startsWith(prefix),
      false,
    )
  ) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  let command;
  if (commandName == "help") {
    command = {
      title: "Help",
      body: Object.entries(commands).map(([name, info]) =>
        `- \`${name}\`: ${info.description}\n`
      ).join(""),
    };
  } else command = commands[commandName as keyof typeof commands];

  if (command) {
    try {
      const embed = new EmbedBuilder().setColor(0x754D75).setTitle(
        command.title,
      )
        .setDescription(command.body);

      if (message.reference && message.reference.messageId) {
        message.channel.send({
          embeds: [embed],
          reply: {
            failIfNotExists: false,
            messageReference: message.reference.messageId,
          },
        });
        return;
      }
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply("There was an error while executing: " + commandName);
    }
  }
});

client.login(Bun.env.DISCORD_TOKEN);

client.once("ready", () => {
  console.log("Bot is online!");
});
