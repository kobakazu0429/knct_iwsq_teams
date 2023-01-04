import { getAllChannels } from "../src/teams";
import { sendMail } from "../src/mail";
import { env } from "../src/env";

const main = async () => {
  const channels = (await getAllChannels(env.TEAM_ID))
    .map(({ displayName }) => "・" + displayName)
    .join("\n");

  const message = `【BOTによる自動投稿】
現在このチームには次のチャネルが存在しています。
参加したい場合は参加メンバーもしくはTAまでご連絡ください。

${channels}
`;

  sendMail({
    to: env.GENERAL_CHANNEL_MAIL_ADDRESS,
    subject: "",
    htmlBody: message.replaceAll("\n", "<br>"),
  });
};

main();
