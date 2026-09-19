import { formatWhatsAppNumber, sendWhatsAppMessage } from "./whatsapp.service";

export async function sendWhatsAppPlayerJoinedNotification(
  hostPhone: string,
  hostName: string,
  playerName: string,
  sportName: string,
  courtName: string,
  dateStr: string,
  spotsLeft: number
) {
  const formattedPhone = formatWhatsAppNumber(hostPhone);
  const templateRes = await sendWhatsAppMessage({
    to: formattedPhone,
    type: "template",
    templateName: "sportsvilla_player_joined_v1",
    languageCode: "en",
    templateComponents: [
      {
        type: "body",
        parameters: [
          { type: "text", text: hostName },
          { type: "text", text: playerName },
          { type: "text", text: sportName },
          { type: "text", text: courtName },
          { type: "text", text: dateStr },
          { type: "text", text: String(spotsLeft) },
        ],
      },
    ],
    metadata: { purpose: "PLAYER_JOINED_GAME" },
  });

  if (!templateRes.success) {
    console.log("Template sportsvilla_player_joined_v1 fallback to text for host:", formattedPhone);
    return await sendWhatsAppMessage({
      to: formattedPhone,
      type: "text",
      text: `🎉 *New Player Joined!*\n\nHi ${hostName}, *${playerName}* has joined your *${sportName}* match at *${courtName}* on *${dateStr}*.\n\nSpots remaining: *${spotsLeft}*.\nGet ready for an exciting game! 🏆`,
      metadata: { purpose: "PLAYER_JOINED_GAME_FALLBACK" },
    });
  }
  return templateRes;
}
