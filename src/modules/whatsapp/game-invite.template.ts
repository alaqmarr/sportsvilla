import { formatWhatsAppNumber, sendWhatsAppMessage } from "./whatsapp.service";

export async function sendWhatsAppGameInviteTemplate(
  toPhone: string,
  hostName: string,
  sportName: string,
  courtName: string,
  dateStr: string,
  inviteLinkOrCode: string,
  inviteeName?: string
) {
  const formattedPhone = formatWhatsAppNumber(toPhone);
  const inviteCode = inviteLinkOrCode.includes("/")
    ? inviteLinkOrCode.split("/").pop() || ""
    : inviteLinkOrCode;
  const inviteLink = inviteLinkOrCode.includes("http")
    ? inviteLinkOrCode
    : `https://sportsvilla.in/join/${inviteCode}`;

  const templateRes = await sendWhatsAppMessage({
    to: formattedPhone,
    type: "template",
    templateName: "sportsvilla_game_invite_v1",
    languageCode: "en",
    templateComponents: [
      {
        type: "body",
        parameters: [
          { type: "text", text: hostName },
          { type: "text", text: sportName },
          { type: "text", text: courtName },
          { type: "text", text: dateStr },
        ],
      },
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [
          {
            type: "text",
            text: inviteCode
          }
        ]
      }
    ],
    metadata: { purpose: "GAME_INVITATION" },
  });

  if (!templateRes.success) {
    console.log("Template sportsvilla_game_invite_v1 fallback to text for phone:", formattedPhone);
    const greeting = inviteeName ? `Hi ${inviteeName},\n\n` : "";
    return await sendWhatsAppMessage({
      to: formattedPhone,
      type: "text",
      text: `${greeting}🎉 *Game Invitation from ${hostName}*\n\nYou have been invited to play *${sportName}* at *${courtName}* on *${dateStr}*.\n\nTap below to join the game:\n${inviteLink}\n\nSee you on the court! 🏆`,
      metadata: { purpose: "GAME_INVITATION_FALLBACK" },
    });
  }
  return templateRes;
}
