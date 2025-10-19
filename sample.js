import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import "dotenv/config";

const token = process.env["GITHUB_TOKEN"];
if (!token) {
  throw new Error("Set GITHUB_TOKEN in your environment or .env file before running sample.js");
}

const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1-mini";

const filename = fileURLToPath(import.meta.url);
const currentDir = dirname(filename);
const imagePath = resolve(currentDir, "contoso_layout_sketch.jpg");

export async function main() {
  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  const imageBuffer = fs.readFileSync(imagePath);
  const imageBase64 = imageBuffer.toString("base64");

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        {
          role: "system",
          content: "You are an expert front-end developer who translates sketches into production-ready markup.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Write HTML and CSS code for a webpage based on the following hand-drawn sketch.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.7,
      top_p: 1,
      model,
    },
  });

  if (isUnexpected(response)) {
    throw response.body.error;
  }

  console.log(response.body.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});

