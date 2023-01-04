import { parseArgs } from "node:util";
import { writeFile } from "node:fs/promises";
import { getUsers } from "../src/teams";
import { env } from "../src/env";

const main = async () => {
  const { values: arg } = parseArgs({
    args: process.argv.slice(2),
    options: {
      dest: {
        type: "string",
        multiple: false,
      },
    },
  });

  if (!arg.dest) throw new Error("--dest must to set");

  const users = await getUsers(env.DOMAIN);
  await writeFile(arg.dest, JSON.stringify(users), "utf-8");

  console.log(`Success: write to ${arg.dest}`);
  console.log(`e.g.) cat ${arg.dest} | jq '.[] | .mail + "\t" + .id' -r`);
};

main();
