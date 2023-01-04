import axios from "axios";
import { env } from "./env";

type Options =
  | {
      to: string;
      subject: string;
      body: string;
    }
  | {
      to: string;
      subject: string;
      htmlBody: string;
    };

export const sendMail = async (data: Options) => {
  const res = await axios.post(env.MAIL_APP_ENDPOINT, {
    ...data,
    token: env.MAIL_APP_TOKEN,
  });
  return res;
};
