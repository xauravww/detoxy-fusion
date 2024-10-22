import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from "form-data";
import dotenv from 'dotenv';
import crypto from 'crypto'; 
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to create a unique hash from the prompt
const generateHash = (input) => {
  return crypto.createHash('md5').update(input).digest('hex');
};

export const generateImage = async (req, res) => {
  if (!req.body.prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  const { prompt } = req.body;

  const hash = generateHash(prompt);
  const formData = new FormData();
  formData.append("prompt", prompt);

  try {
    const response = await axios.post(process.env.FREE_IMG_GEN_API, formData, {
      headers: formData.getHeaders(),
      responseType: "arraybuffer",
    });

    if (response.data.byteLength === 0) {
      throw new Error("Received empty image data.");
    }

    const tempDir = path.join(__dirname, "temp_img");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Create a file path with the hash to ensure uniqueness
    const tempImagePath = path.join(tempDir, `${hash}.png`);
    fs.writeFileSync(tempImagePath, Buffer.from(response.data));

    const uploadResult = await cloudinary.uploader.upload(tempImagePath, {
      folder: 'generated_images',
    });

    return res.status(200).json({
      message: "Image generated and uploaded successfully",
      imageUrl: uploadResult.secure_url,
    });

  } catch (error) {
    return res.status(500).json({ message: "Error generating image", error: error.message });
  }
};
