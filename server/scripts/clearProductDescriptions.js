require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("[DB] Connected:", mongoose.connection.name);

  const result = await mongoose.connection
    .collection("products")
    .updateMany({}, { $unset: { description: "" } });

  console.log(`[Done] Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
