import { parseArgs } from "node:util";
import {
  getAllChannels,
  getChannelMembers,
  inviteUserToChannel,
} from "../src/teams";
import { getTAEmails } from "../src/ta";
import { env } from "../src/env";

type ChannelId = string;
type MemberEmails = string[];
type ChannelMembers = Record<ChannelId, MemberEmails>;

const main = async () => {
  const { values: arg } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "dry-run": {
        type: "boolean",
        multiple: false,
        default: false,
      },
    },
  });

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

  for (const email of taEmails) {
    for (const channel of privateChannels) {
      if (!channelMembers[channel.id].includes(email)) {
        if (!arg["dry-run"]) {
          inviteUserToChannel(env.TEAM_ID, channel.id, email, true);
        }
        console.log(email, "→", channel.displayName, `(${channel.id})`);
      }
    }
  }
};

main();
