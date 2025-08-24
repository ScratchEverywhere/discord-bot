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
      type: "text",
      title: "Help",
      body: args[0] == null
        ? Object.entries(commands).map(([name, info]) =>
          `- \`${name}\`: ${info.description}\n`
        ).join("")
        : `\`${args[0]}\`: ${
          commands[args[0] as keyof typeof commands].description
        }`,
    };
  } else {
    command = commands[commandName as keyof typeof commands];
    if (!command) return;
    if (args.length != command.args) {
      message.reply(
        "Incorrect number of arguments for: `" + commandName + "`.",
      );
      return;
    }
  }

  if (command) {
    try {
      const embed = new EmbedBuilder().setColor(0x754D75).setTitle(
        command.title,
      );
      switch (command.type) {
        case "text":
          embed.setDescription(
            args.reduce(
              (body, arg, i) => body.replaceAll(`{arg${i}}`, arg),
              command.body,
            ),
          );
          break;
        case "image":
          embed.setImage(command.body);
          break;
      }

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

client.once("clientReady", () => {
  console.log("Bot is online!");
});
