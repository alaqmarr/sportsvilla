"use server";

import { revalidatePath } from "next/cache";
import {
  createTurfCore,
  updateTurfCore,
  deleteTurfCore,
  TurfInput,
} from "./turfs.lib";

export async function createTurf(data: TurfInput) {
  const turf = await createTurfCore(data);
  revalidatePath("/", "layout");
  return turf;
}

export async function updateTurf(id: string, data: TurfInput) {
  const turf = await updateTurfCore(id, data);
  revalidatePath("/", "layout");
  return turf;
}

export async function deleteTurf(id: string) {
  await deleteTurfCore(id);
  revalidatePath("/", "layout");
}
