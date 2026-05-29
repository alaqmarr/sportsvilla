#!/bin/bash

echo "====================================="
echo "   SPORTSVILLA DATABASE RESET TOOL   "
echo "====================================="

echo "[1/5] Stopping the application to release database locks..."
pm2 stop sportsvilla

echo "[2/5] Deleting the existing SQLite database..."
rm -f prisma/dev.db
rm -f prisma/dev.db-journal

echo "[3/5] Rebuilding a fresh database schema..."
npx prisma db push

echo "[4/5] Clearing Next.js static caches..."
rm -rf .next/cache

echo "[5/5] Restarting the application..."
pm2 restart sportsvilla

echo "====================================="
echo "✅ Database reset & Cache cleared!    "
echo "====================================="
