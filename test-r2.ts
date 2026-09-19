import dotenv from "dotenv";
dotenv.config();

import { uploadTempQRToR2 } from "./src/core/storage/r2-storage";

async function test() {
  try {
    const buffer = Buffer.from("test image content");
    const url = await uploadTempQRToR2(buffer, "temp-qr/test-upload.png");
    console.log("SUCCESS URL:", url);
  } catch (err) {
    console.error("R2 UPLOAD FAILED:", err);
  }
}

test();
