import { EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

export function basariEmbed(baslik, aciklama) {
  return new EmbedBuilder()
    .setColor(config.basariRenk)
    .setTitle(`✅ ${baslik}`)
    .setDescription(aciklama && aciklama.length > 0 ? aciklama : null)
    .setTimestamp();
}

export function hataEmbed(baslik, aciklama) {
  return new EmbedBuilder()
    .setColor(config.hataRenk)
    .setTitle(`❌ ${baslik}`)
    .setDescription(aciklama && aciklama.length > 0 ? aciklama : null)
    .setTimestamp();
}

export function uyariEmbed(baslik, aciklama) {
  return new EmbedBuilder()
    .setColor(config.uyariRenk)
    .setTitle(`⚠️ ${baslik}`)
    .setDescription(aciklama && aciklama.length > 0 ? aciklama : null)
    .setTimestamp();
}

export function bilgiEmbed(baslik, aciklama) {
  return new EmbedBuilder()
    .setColor(config.anaRenk)
    .setTitle(baslik)
    .setDescription(aciklama && aciklama.length > 0 ? aciklama : null)
    .setTimestamp();
}
