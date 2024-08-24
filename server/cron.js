import { createRequire } from "module";
const require = createRequire(import.meta.url);

import cron from "cron";
import https from "https";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(".env") });

const backendUrl = process.env.RENDER_BACKEND_URL;
const generateImageUrl = `${backendUrl}/api/generateImage`;

// Function to send POST request
function postImageGeneration(prompt, model) {
  const postData = JSON.stringify({
    prompt: prompt,
    settings: {
      model: model,
    },
  });

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": postData.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(generateImageUrl, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log(`Image generated with model: ${model}`);
          resolve(data);
        } else {
          console.error(
            `Failed to generate image with status code: ${res.statusCode}`
          );
          reject(new Error(`Status Code: ${res.statusCode}`));
        }
      });
    });

    req.on("error", (err) => {
      console.error("Error during image generation:", err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Function to generate image with retries
async function generateImageWithRetries() {
  try {
    await postImageGeneration("Hi", "sauravtechno/black-forest-labs-FLUX.1-dev");
    await postImageGeneration("Hi", "sauravtechno/alvdansen-flux-koda");
  } catch (error) {
    console.error("Error during first attempt:", error.message);
    console.log("Retrying image generation...");
    try {
      await postImageGeneration("Hi", "sauravtechno/black-forest-labs-FLUX.1-dev");
      await postImageGeneration("Hi", "sauravtechno/alvdansen-flux-koda");
    } catch (finalError) {
      console.error("Failed after retries:", finalError.message);
    }
  }
}

// Cron job to ping the backend server every 13 minutes
export const pingJob = new cron.CronJob("0 */13 * * * *", function () {
  try {
    https
      .get(backendUrl, (res) => {
        if (res.statusCode === 200) {
          console.log("Server successfully pinged");
        } else {
          console.error(
            `Failed to ping server with status code: ${res.statusCode}`
          );
        }
        res.resume();
      })
      .on("error", (err) => {
        console.error("Error during pinging server:", err.message);
      });
  } catch (err) {
    console.error("Unexpected error in ping job:", err.message);
  }
});

// Cron job to generate images every 12 hours
export const imageGenerationJob = new cron.CronJob("0 0 */12 * * *", async function () {
  try {
    await generateImageWithRetries();
  } catch (err) {
    console.error("Unexpected error in image generation job:", err.message);
  }
});
