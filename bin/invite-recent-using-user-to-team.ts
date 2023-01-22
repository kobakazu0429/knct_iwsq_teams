import * as remove from "just-remove";
import { getTeamMembers, inviteUserToTeam } from "../src/teams";
import { env } from "../src/env";
import { getHistory } from "../src/access-history";
import { getStudentList } from "../src/student-list";

const main = async () => {
  const credentials = {
    client_email: env.GOOGLE_SERVICE_CLIENT_EMAIL,
    private_key: env.GOOGLE_SERVICE_PRIVATE_KEY,
  };

  const studentList = await getStudentList(credentials);
  const studentNos = Array.from(await getHistory(credentials)).map((v) =>
    v.slice(0, -1)
  );

  const userIds = studentNos.map((no) => {
    const student = studentList.find((student) => student["学籍番号"] === no);
    if (!student) {
      throw new Error(`not found user id by student no (${no}), check list !`);
    }
    return student.ID;
  });

  const teamMembers = await getTeamMembers(env.TEAM_ID);
  const needInvitingUserIds =
    // @ts-expect-error
    remove(
      userIds,
      teamMembers.map((v) => v.userId)
    );
  console.log(needInvitingUserIds);

  const res = await inviteUserToTeam(needInvitingUserIds, false);
  console.log(res.statusText);
};

main();
