import {
  GoogleSpreadsheet,
  type ServiceAccountCredentials,
} from "google-spreadsheet";
import { env } from "./env";

export const getLectureHistory = async (
  credentials: ServiceAccountCredentials
) => {
  const doc = new GoogleSpreadsheet(env.LECTURE_HISTORY_SSID);
  await doc.useServiceAccountAuth(credentials);
  await doc.loadInfo();

  const db = await doc.sheetsByTitle["DB"].getRows();
  return db;
};
