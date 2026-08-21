import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { playQuery, replyMusicSuccess } from '../../services/music/musicActions.js';

export default {
    slashOnly: true,
    category: 'Music',

    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song or add it to the queue')
        .addStringOption((opt) =>
            opt
                .setName('query')
                .setDescription('Song name or URL')
                .setRequired(true),
        ),

    async execute(interaction, config, client) {
        const deferred = await InteractionHelper.safeDefer(interaction, {
            flags: MessageFlags.Ephemeral,
        });

        if (!deferred) {
            return;
        }

        try {
            const query = interaction.options
                .getString('query', true)
                .trim();

            if (!query) {
                await InteractionHelper.safeEditReply(interaction, {
                    content: '❌ Please provide a song name or URL.',
                });
                return;
            }

            const result = await playQuery(
                client,
                interaction,
                query,
            );

            if (!result) {
                await InteractionHelper.safeEditReply(interaction, {
                    content: '❌ I could not find or play that track.',
                });
                return;
            }

            if (result.embed) {
                await replyMusicSuccess(
                    interaction,
                    result.embed,
                );
            } else {
                await InteractionHelper.safeEditReply(interaction, {
                    content: '🎵 Track added successfully.',
                });
            }
        } catch (error) {
            console.error('[MUSIC /PLAY ERROR]', error);

            await InteractionHelper.safeEditReply(interaction, {
                content:
                    '❌ An error occurred while trying to play the music. Please try again.',
            }).catch(() => {});
        }
    },
};
