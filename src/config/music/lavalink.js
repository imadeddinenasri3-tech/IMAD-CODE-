import { SlashCommandBuilder } from 'discord.js';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- 1. CONFIGURATION DYAL LAVALINK ---
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function parseBoolean(value, defaultValue = false) {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }
    return ['true', '1', 'yes'].includes(String(value).toLowerCase());
}

function parseNodesFromEnv() {
    const raw = process.env.LAVALINK_NODES?.trim();
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : null;
    } catch (error) {
        console.error("❌ L-ghalat f parsing dyal LAVALINK_NODES men .env:", error.message);
        return null;
    }
}

function parseNodesPayload(parsed) {
    if (Array.isArray(parsed)) {
        return parsed;
    }
    if (Array.isArray(parsed?.nodes)) {
        return parsed.nodes;
    }
    return null;
}

function loadNodesFromFile() {
    const nodesFile = process.env.LAVALINK_NODES_FILE?.trim()
        || path.join(projectRoot, 'lavalink', 'nodes.json');

    if (!existsSync(nodesFile)) {
        return null;
    }

    try {
        const parsed = JSON.parse(readFileSync(nodesFile, 'utf8'));
        return parseNodesPayload(parsed);
    } catch (error) {
        console.error("❌ L-ghalat f parsing dyal nodes.json:", error.message);
        return null;
    }
}

export function getLavalinkNodes() {
    const fromJson = parseNodesFromEnv();
    if (fromJson?.length) {
        return fromJson;
    }

    const fromFile = loadNodesFromFile();
    if (fromFile?.length) {
        return fromFile;
    }

    const host = process.env.LAVALINK_HOST || 'localhost';
    const port = Number(process.env.LAVALINK_PORT || 2333);
    const password = process.env.LAVALINK_PASSWORD || 'youshallnotpass';
    const secure = parseBoolean(process.env.LAVALINK_SECURE, false);

    return [{
        host,
        port,
        password,
        secure,
        name: process.env.LAVALINK_NAME || 'Main',
    }];
}

export const lavalinkConfig = {
    nodes: getLavalinkNodes(),
    defaultSearchPlatform: process.env.LAVALINK_SEARCH_PLATFORM || 'ytmsearch',
    restVersion: process.env.LAVALINK_REST_VERSION || 'v4',
};

// --- 2. DISCORD SLASH COMMAND (PLAY) ---
export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Kheddem l-mousiqa wla l-link')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Ism ola Link dyal l-mousiqa')
                .setRequired(true)),

    async execute(interaction) {
        // ضروري باش Discord ما يعطicish Error ديال Timeout (3 ثواني)
        await interaction.deferReply();

        try {
            const query = interaction.options.getString('query');

            // --- Hna katzid l-mantiq (logic) dyal l-player dyalek (Mithal: shoukaku / poru / discord-player) ---
            // Mithal: const player = ...
            // await player.play(...)

            // Mor ma tkhdm l-mousiqa b naja7:
            await interaction.editReply({ content: `🎵 Bdat l-mousiqa: **${query}**` });

        } catch (error) {
            console.error("❌ Mochkil f command play:", error);
            await interaction.editReply({ content: '❌ W9e3 mochkil mli kont kan-khddem l-mousiqa.' });
        }
    },
};
