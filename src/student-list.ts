import {
  GoogleSpreadsheet,
  type ServiceAccountCredentials,
} from "google-spreadsheet";
import { env } from "./env";

export const getStudentList = async (
  credentials: ServiceAccountCredentials
) => {
  const doc = new GoogleSpreadsheet(env.STUDENT_LIST_SSID);
  await doc.useServiceAccountAuth(credentials);
  await doc.loadInfo();
  const list = await doc.sheetsByTitle["名簿"].getRows();
  return list;
};
