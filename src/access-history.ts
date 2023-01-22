import {
  GoogleSpreadsheet,
  type ServiceAccountCredentials,
} from "google-spreadsheet";
import { env } from "./env";

export const getHistory = async (credentials: ServiceAccountCredentials) => {
  const doc = new GoogleSpreadsheet(env.ACCESS_HISTORY_SSID);
  await doc.useServiceAccountAuth(credentials);
  await doc.loadInfo();

  const lastMonth = new Date().setMonth(-1);

  const enter = await doc.sheetsByTitle["入室"].getRows();
  const leave = await doc.sheetsByTitle["退室"].getRows();

  const studentNos = new Set([
    ...enter
      .filter((v) => lastMonth < new Date(v["入室時間"]).getTime())
      .map((v) => v["学生番号"]),
    ...leave
      .filter((v) => lastMonth < new Date(v["退室時間"]).getTime())
      .map((v) => v["学生番号"]),
  ]);

  return studentNos;
};
