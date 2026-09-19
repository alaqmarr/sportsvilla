"use server";

import { revalidatePath } from "next/cache";
import {
  createSportCore,
  updateSportCore,
  deleteSportCore,
  SportDataInput,
  TurfAssociationInput,
} from "./sports.lib";

export async function createSport(
  data: SportDataInput,
  turfs: TurfAssociationInput[]
) {
  const sport = await createSportCore(data, turfs);
  revalidatePath("/", "layout");
  return sport;
}

export async function updateSport(
  id: string,
  data: SportDataInput,
  turfs: TurfAssociationInput[]
) {
  const sport = await updateSportCore(id, data, turfs);
  revalidatePath("/", "layout");
  return sport;
}

export async function deleteSport(id: string) {
  await deleteSportCore(id);
  revalidatePath("/", "layout");
}
