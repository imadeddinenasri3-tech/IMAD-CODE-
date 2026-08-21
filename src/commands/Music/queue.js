import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { buildQueueReply } from '../../services/music/musicActions.js';

export default {
    slashOnly: true,
    category: 'Music',

    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue')
        .addIntegerOption((opt) =>
            opt
                .setName('page')
                .setDescription('Page number')
                .setMinValue(1),
        ),

    async execute(interaction, config, client) {
        const deferred = await InteractionHelper.safeDefer(interaction, {
            flags: MessageFlags.Ephemeral,
        });

        if (!deferred) {
            return;
        }

        try {
            const page =
                (interaction.options.getInteger('page') || 1) - 1;

            const payload = buildQueueReply(
                client,
                interaction.guild.id,
                page,
            );

            await InteractionHelper.safeEditReply(interaction, {
                embeds: payload?.embeds || [],
                components: payload?.components || [],
                content: payload?.content || undefined,
            });
        } catch (error) {
            console.error('[MUSIC /QUEUE ERROR]', error);

            await InteractionHelper.safeEditReply(interaction, {
                content:
                    '❌ I could not load the music queue.',
                embeds: [],
                components: [],
            }).catch(() => {});
        }
    },
};
