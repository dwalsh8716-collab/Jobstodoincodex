import { createReadStream } from "node:fs";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-06-09" });
const imagePath = "public/assets/images/david-walsh-founder.jpg";

async function main() {
  const asset = await client.assets.upload("image", createReadStream(imagePath), {
    filename: "david-walsh-founder-essential-resourcing.jpg",
    title: "David Walsh founder photo",
  });

  await client
    .patch("homePage")
    .set({
      "premiumVideo.title": "David Walsh, founder of Essential Resourcing",
      "premiumVideo.stillImage": {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
        alt: "David Walsh, founder of Essential Resourcing and marketing recruitment specialist in Manchester",
      },
    })
    .commit();

  console.log(`Homepage founder image set: ${asset.url}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
