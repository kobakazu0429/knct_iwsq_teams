import {
  GoogleSpreadsheet,
  type ServiceAccountCredentials,
} from "google-spreadsheet";
import { env } from "./env";

export const getTAEmails = async (credentials: ServiceAccountCredentials) => {
  const doc = new GoogleSpreadsheet(env.TA_SSID);
  await doc.useServiceAccountAuth(credentials);
  await doc.loadInfo();

  const today = new Date();

  const sheet = doc.sheetsByTitle["一覧"];
  const rawValues = await sheet.getRows();

  const values = rawValues
    .filter((row) => {
      return (
        !(
          row["本科メールアドレス"] === "" && row["専攻科メールアドレス"] === ""
        ) &&
        !(
          row["本科メールアドレス"] === "-" &&
          row["専攻科メールアドレス"] === "-"
        )
      );
    })
    .filter((row) => {
      if (!row["TA終了"]) return true;
      return today <= new Date(row["TA終了"]);
    });

  const emails = values
    .map((row) => {
      if (
        row["専攻科メールアドレス"] !== "" &&
        row["専攻科メールアドレス"] !== "-"
      )
        return row["専攻科メールアドレス"];
      return row["本科メールアドレス"];
    })
    .map((principal) => principal + env.DOMAIN)
    .map((email) => email.toLowerCase());

  return emails;
};
