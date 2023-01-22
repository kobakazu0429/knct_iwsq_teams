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

const request = async <Response>(
  url?: string,
  result: Response[] = [],
  length: number = -1
): Promise<Response[]> => {
  if (!url || url === "") return result;

  const res = await client.get<{
    "@odata.context": string;
    "@odata.count": number;
    "@odata.nextLink": string;
    value: Response[];
  }>(url, {
    headers: {
      ConsistencyLevel: "eventual",
    },
  });

  result.push(...res.data.value);

  if (length === -1) length = res.data["@odata.count"];
  console.log(`${result.length} / ${length}`);

  if (res.data.value.length !== 0) {
    return request(res.data["@odata.nextLink"], result, length);
  } else {
    return result;
  }
};

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

export const getTeamMembers = async (teamId: string) => {
  const members = await request<Member>(`teams/${teamId}/members`);
  return members!;
};

export const getUsers = async (emailDomain: string) => {
  if (!emailDomain.startsWith("@")) {
    throw new Error("`emailDomain` must start with @");
  }
  const users = await request<User>(
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

export const inviteUserToTeam = async (userIds: string[], isOwner: boolean) => {
  const payload = {
    users: userIds.map((userId) => ({
      mri: `8:orgid:${userId}`,
      role: Number(isOwner),
    })),
    groupId: env.TEAM_ID,
  };

  const res = await axios.put(
    `https://teams.microsoft.com/api/mt/apac/beta/teams/${env.GENERAL_CHANNEL_ID}/bulkUpdateRoledMembers?allowBotsInChannel=true`,
    payload,
    {
      headers: {
        authorization: `Bearer ${env.TEAMS_AUTHTOKEN}`,
        "x-skypetoken": env.TEAMS_SKYPETOKEN_ASM,
      },
    }
  );

  return res;
};
