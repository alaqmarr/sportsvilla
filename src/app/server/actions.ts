"use server";

import si from "systeminformation";

export interface ServerStats {
  cpu: {
    manufacturer: string;
    brand: string;
    speed: string | number;
    cores: number;
    currentLoad: number;
  };
  mem: {
    total: number;
    active: number;
    free: number;
    usedPercent: number;
  };
  os: {
    platform: string;
    distro: string;
    uptime: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usedPercent: number;
  }[];
}

export async function fetchServerStats(): Promise<ServerStats> {
  try {
    const [cpu, currentLoad, mem, os, disk] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
      si.mem(),
      si.osInfo(),
      si.fsSize(),
    ]);

    return {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        speed: cpu.speed,
        cores: cpu.cores,
        currentLoad: currentLoad.currentLoad,
      },
      mem: {
        total: mem.total,
        active: mem.active,
        free: mem.free,
        usedPercent: (mem.active / mem.total) * 100,
      },
      os: {
        platform: os.platform,
        distro: os.distro,
        uptime: si.time().uptime,
      },
      disk: disk.map((d) => ({
        total: d.size,
        used: d.used,
        free: d.available,
        usedPercent: d.use,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch server stats:", error);
    throw new Error("Failed to fetch server stats");
  }
}
