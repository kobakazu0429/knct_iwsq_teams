import axios from "axios";
import type { User, Channel, Member } from "./types";
import { env } from "./env";

export const client = axios.create({
  baseURL: "https://graph.microsoft.com/beta/",
  headers: {
    Authorization: `Bearer ${env.GRAPH_EXPLORER_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
});

export const getAllChannels = async (teamId: string) => {
  const GROUP_ORDER_PREFIXS = ["部活", "IWテーマ", "授業"];

  const res = await client.get<{ value: Channel[] }>(
    `teams/${teamId}/channels`
  );
  const channels = res.data.value
    .filter(({ displayName }) => displayName !== "General")
    .map(({ id, displayName, membershipType }) => ({
      id,
      displayName,
      type: membershipType,
    }))
    .sort((a, b) => {
      if (a.type === "standard" && b.type === "private") return 1;
      if (a.type === "private" && b.type === "standard") return -1;

      const aIndex = GROUP_ORDER_PREFIXS.findIndex((groupPrefix) =>
        a.displayName.startsWith(groupPrefix)
      );
      const bIndex = GROUP_ORDER_PREFIXS.findIndex((groupPrefix) =>
        b.displayName.startsWith(groupPrefix)
      );
      if (aIndex > bIndex) return 1;
      if (aIndex < bIndex) return -1;

      return a.displayName.localeCompare(b.displayName, "ja");
    });

  return channels;
};

export const getChannelMembers = async (teamId: string, channelId: string) => {
  const res = await client.get<{ value: Member[] }>(
    `teams/${teamId}/channels/${channelId}/members`
  );
  const members = res.data.value.map((user) => user.email.toLowerCase());
  return members;
};

export const getUsers = async (emailDomain: string) => {
  if (!emailDomain.startsWith("@")) {
    throw new Error("`emailDomain` must start with @");
  }

  const users: User[] = [];
  let length = -1;

  const request = async (url: string) => {
    if (!url || url === "") return;

    const res = await client.get<{
      "@odata.context": string;
      "@odata.count": number;
      "@odata.nextLink": string;
      value: User[];
    }>(url, {
      headers: {
        ConsistencyLevel: "eventual",
      },
    });

    users.push(...res.data.value);

    if (length === -1) length = res.data["@odata.count"];
    console.log(`${users.length} / ${length}`);

    if (res.data.value.length !== 0) {
      await request(res.data["@odata.nextLink"]);
    }
  };

  await request(
    `/users?$filter=endswith(mail,'${emailDomain}')&$orderby=userPrincipalName&$count=true`
  );

  return users;
};

export const inviteUserToChannel = async (
  teamId: string,
  channelId: string,
  userEmail: string,
  isOwner: boolean
) => {
  if (!userEmail.endsWith(env.DOMAIN)) {
    throw new Error(`\`userEmail\` must end with ${env.DOMAIN}`);
  }

  const res = await client.post(
    `teams/${teamId}/channels/${channelId}/members`,
    {
      "@odata.type": "#microsoft.graph.aadUserConversationMember",
      roles: isOwner ? ["owner"] : [],
      "user@odata.bind": `https://graph.microsoft.com/beta/users('${userEmail}')`,
    }
  );
};
