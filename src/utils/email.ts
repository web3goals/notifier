import axios from "axios";
import * as dotenv from "dotenv";
import FormData from "form-data";
import { EMAIL_SENDER } from "../constants/email";

dotenv.config();

export async function sendEmailToGoalAuthorWhenMessagePosted(
  goalId: string,
  goalDescription: string,
  goalAuthorEmail: string
) {
  return sendEmail(
    EMAIL_SENDER,
    goalAuthorEmail,
    "🔔 New message on your goal page",
    `
      <p>Aloha 👋 </p>
      <p>This is notification from the Web3 Goals project.</p>
      <p>Someone posted a message on your goal page "<a href="https://web3goals.space/goals/${goalId}">${goalDescription}</a>".</p>
    `,
    "new_message_on_your_goal_page"
  );
}

export async function sendEmail(
  from: string,
  to: string,
  subject: string,
  html: string,
  tag?: string
) {
  const data = new FormData();
  data.append("from", from);
  data.append("to", to);
  data.append("subject", subject);
  data.append("html", html);
  if (tag) data.append("o:tag", tag);
  await axios.post(
    "https://api.mailgun.net/v3/notifier.web3goals.space/messages",
    data,
    {
      auth: {
        username: "api",
        password: process.env.MAILGUN_API_KEY || "",
      },
    }
  );
}
