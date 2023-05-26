import * as dotenv from "dotenv";
import {
  getGoalParams,
  getProfileUri,
  parseTransactionMessagePostedEvent as parseTransactionWithMessagePostedEvent,
} from "../utils/contracts";
import { sendEmailToGoalAuthorWhenMessagePosted } from "../utils/email";
import { loadProfileUriDataFromIpfs } from "../utils/ipfs";

dotenv.config();

async function main() {
  // Check args
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error("❌ Arguments are incorrect!");
    return;
  }

  const transactionHash = args[0];
  console.log(
    `💪 Handle a message posted event for the transaction "${transactionHash}"`
  );

  // Define goal id and message author from transaction
  const { goalId, goalMessageAuthor } =
    await parseTransactionWithMessagePostedEvent(transactionHash);
  if (!goalId || !goalMessageAuthor) {
    console.log("⛔ Goal's ID or goal's message author are undefined");
    return;
  }
  console.log("🔹 Goal's ID:", goalId);
  console.log("🔹 Goal's message author:", goalMessageAuthor);

  // Define goal params
  const { goalAuthor, goalDescription } = await getGoalParams(goalId);
  if (!goalAuthor || !goalDescription) {
    console.log("⛔ Goal's author or description are undefined");
    return;
  }
  console.log("🔹 Goal's author:", goalAuthor);
  console.log("🔹 Goal's description:", goalDescription.replace("\n", " "));

  // Skip if message posted by goal author
  if (goalMessageAuthor === goalAuthor) {
    console.log("⛔ Message posted by goal's author");
    return;
  }

  // Define goal author profile uri
  const { profileUri: goalAuthorProfileUri } = await getProfileUri(goalAuthor);
  if (!goalAuthorProfileUri) {
    console.log("⛔ Goal's author does not have a profile");
    return;
  }

  // Define if goal author enabled notifications
  const {
    isProfileEnabledNotifications: isGoalAuthorEnabledNotifications,
    profileEmail: goalAuthorEmail,
  } = await loadProfileUriDataFromIpfs(goalAuthorProfileUri);
  console.log(
    "🔹 Goal's author enabled notifications:",
    isGoalAuthorEnabledNotifications
  );
  console.log("🔹 Goal's author email:", goalAuthorEmail);

  // Skip if goal author does not enabled notifications or email
  if (!isGoalAuthorEnabledNotifications || !goalAuthorEmail) {
    console.log(
      "⛔ Goal's author does not have enabled notifications or email"
    );
    return;
  }

  // Send email to goal author
  sendEmailToGoalAuthorWhenMessagePosted(
    goalId,
    goalDescription,
    goalAuthorEmail
  );
  console.log("✅ Email sent to goal's author");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
