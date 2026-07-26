import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    url: env("WHATSAPP_DB_URL") || env("WHATSAPP_DB_UL") || "file:./whatsapp.db",
  },
});
