import { Events, ActivityType } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export function execute(client) {
  console.log(`✅ ${client.user.tag} olarak giriş yapıldı. Muhammed hazır! 🚀`);

  client.user.setPresence({
    activities: [{ name: 'custom', state: '/konuş yazın kanka 😄', type: ActivityType.Custom }],
    status: 'online',
  });
}
