import { compareVersions } from "compare-versions";
import { type Client, EmbedBuilder } from "discord.js";

let currentVersion = await Bun.file("current-version.txt").text();

export const setupReleases = (client: Client) => {
  setInterval(async () => {
    try {
      const res = await fetch(
        "https://api.github.com/repos/NateXS/Scratch-Everywhere/releases/latest",
      );
      if (!res.ok) return;
      const release = await res.json();
      if (
        compareVersions(
          (release as { tag_name: string }).tag_name.trim(),
          currentVersion.trim(),
        )
      ) {
        const embed = new EmbedBuilder().setColor(0x754D75).setTitle(
          (release as { name: string }).name,
        ).setDescription((release as { body: string }).body);
        client.channels.cache.get(Bun.env.UPDATES_CHANNEL_ID).send({
          embeds: [embed],
        });
        currentVersion = (release as { tag_name: string }).tag_name.trim();
        await Bun.write(
          "current-version.txt",
          currentVersion,
        );
      }
    } catch (e) {
      console.warn(
        "An error occured when attempting to check for updates: " + e,
      );
    }
  }, 150000);
};
