import { getAllChannels, getChannelMembers } from "../src/teams";
import { getTAEmails } from "../src/ta";
import { env } from "../src/env";

type ChannelId = string;
type MemberEmails = string[];
type ChannelMembers = Record<ChannelId, MemberEmails>;

const main = async () => {
  const channels = await getAllChannels(env.TEAM_ID);
  const privateChannels = channels.filter(({ type }) => type === "private");
  const channelMembers: ChannelMembers = Object.fromEntries(
    await Promise.all(
      privateChannels.map(async (channel) => [
        channel.id,
        await getChannelMembers(env.TEAM_ID, channel.id),
      ])
    )
  );

  const taEmails = await getTAEmails({
    client_email: env.GOOGLE_SERVICE_CLIENT_EMAIL,
    private_key: env.GOOGLE_SERVICE_PRIVATE_KEY,
  });

  for (const channel of privateChannels) {
    console.log("----------------");
    console.log(channel.displayName, `(${channel.id})`);
    for (const email of taEmails) {
      const status = channelMembers[channel.id].includes(email)
        ? "　所属"
        : "未所属";
      console.log(`${status}: `, email);
    }
  }
};

main();
