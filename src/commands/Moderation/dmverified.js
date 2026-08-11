import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { successEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { replyUserError, ErrorTypes } from '../../utils/errorHandler.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
    data: new SlashCommandBuilder()
        .setName('dmverified')
        .setDescription('إرسال رسالة خاصة لجميع الأعضاء اللي عندهم رول Verified')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: 'moderation',

    async execute(interaction, config, client) {
        const deferSuccess = await InteractionHelper.safeDefer(interaction, {
            flags: MessageFlags.Ephemeral,
        });
        
        if (!deferSuccess) {
            logger.warn('DM Verified interaction defer failed', {
                userId: interaction.user.id,
                guildId: interaction.guildId,
                commandName: 'dmverified',
            });
            return;
        }

        const role = interaction.guild.roles.cache.find((r) => r.name === 'Verified');
        if (!role) {
            return await replyUserError(interaction, {
                type: ErrorTypes.USER_INPUT,
                message: "الرول 'Verified' مالقيتهاش فالسيرفر!",
            });
        }

        await interaction.guild.members.fetch();
        const membersWithRole = role.members;

        let successCount = 0;
        let failCount = 0;

        await InteractionHelper.safeEditReply(interaction, {
            embeds: [
                successEmbed(
                    'جاري الإرسال...',
                    `بدأ الإرسال لـ **${membersWithRole.size}** عضو عندهم رول Verified.`
                )
            ],
            flags: MessageFlags.Ephemeral,
        });

        for (const [id, member] of membersWithRole) {
            if (member.user.bot) continue;

            try {
                await member.send("Welcome to the server!\nhttps://discord.gg/caFbSZwJa");
                successCount++;
            } catch (err) {
                failCount++;
            }

            await wait(1000); // مهلة لحماية البوت من Rate Limit
        }

        await InteractionHelper.safeEditReply(interaction, {
            embeds: [
                successEmbed(
                    '✅ تم الإرسال بنجاح!',
                    `• **وصلات لـ:** ${successCount}\n• **فشلات (الخاص مغلق):** ${failCount}`
                )
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
};