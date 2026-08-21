import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { buildNowPlayingReply } from '../../services/music/musicActions.js';

export default {
    slashOnly: true,
    category: 'Music',

    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the currently playing track'),

    async execute(interaction, config, client) {
        const deferred = await InteractionHelper.safeDefer(interaction, {
            flags: MessageFlags.Ephemeral,
        });

        if (!deferred) {
            return;
        }

        try {
            const payload = buildNowPlayingReply(
                client,
                interaction.guild.id,
            );

            await InteractionHelper.safeEditReply(
                interaction,
                payload,
            );
        } catch (error) {
            console.error(
                '[MUSIC /NOWPLAYING ERROR]',
                error,
            );

            await InteractionHelper.safeEditReply(interaction, {
                content:
                    '❌ I could not get the currently playing track.',
                embeds: [],
                components: [],
            }).catch(() => {});
        }
    },
};
