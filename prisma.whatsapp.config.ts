import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/whatsapp.prisma",
  datasource: {
    url: process.env.WHATSAPP_DB_URL || "file:./whatsapp.db",
  },
});
