declare module "bun" {
  interface Env {
    DISCORD_TOKEN: string;
    DISCORD_CLIENT_ID: string;
    UPDATES_CHANNEL_ID: string;
  }
}
