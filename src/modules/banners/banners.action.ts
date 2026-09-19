"use server";

import { revalidatePath } from "next/cache";
import {
  createBannerCore,
  toggleBannerStatusCore,
  deleteBannerCore,
  getAdminPresignedUrlCore,
  CreateBannerInput,
} from "./banners.lib";

export async function createBanner(data: CreateBannerInput) {
  const banner = await createBannerCore(data);
  revalidatePath("/", "layout");
  return banner;
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
  await toggleBannerStatusCore(id, isActive);
  revalidatePath("/", "layout");
}

export async function deleteBanner(id: string) {
  await deleteBannerCore(id);
  revalidatePath("/", "layout");
}

export async function getAdminPresignedUrl(
  contentType: string,
  fileExtension: string
) {
  return await getAdminPresignedUrlCore(contentType, fileExtension);
}
