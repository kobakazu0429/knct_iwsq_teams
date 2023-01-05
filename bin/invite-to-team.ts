import { parseArgs } from "node:util";
import { getUsers, inviteUserToTeam } from "../src/teams";
import { env } from "../src/env";

const main = async () => {
  const { values: arg } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "dry-run": {
        type: "boolean",
        multiple: false,
        default: false,
      },
      "user-id": {
        type: "string",
        multiple: false,
      },
      "user-email": {
        type: "string",
        multiple: false,
      },
    },
  });

  if (!(arg["user-id"] || arg["user-email"])) {
    throw new Error(
      "`--user-id=uuid1,uuid2,...` or `--user-id=foo@example.com,bar@example.com` must to set."
    );
  }

  const userIds = arg["user-id"]?.split(",") ?? [];
  const userEmails = arg["user-email"]
    ?.split(",")
    .map((email) => (email.endsWith(env.DOMAIN) ? email : email + env.DOMAIN));

  console.log({ userIds, userEmails });

  if (userEmails) {
    const users = await getUsers(env.DOMAIN);
    const userEmailsToIds = userEmails
      .map(
        (email) => users.find((user) => user.mail.toLowerCase() === email)?.id
      )
      .filter((id) => id) as string[];
    userIds.push(...userEmailsToIds);
  }

  if (userIds.length === 0) {
    throw new Error("users are not found");
  }

  console.log(userIds);

  if (!arg["dry-run"]) {
    const res = await inviteUserToTeam(userIds, false);
    console.log(res.statusText);
  }
};

main();
