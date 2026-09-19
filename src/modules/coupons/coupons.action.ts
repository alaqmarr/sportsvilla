"use server";

import { revalidatePath } from "next/cache";
import {
  createCouponCore,
  toggleCouponStatusCore,
  CreateCouponInput,
} from "./coupons.lib";

export async function createCoupon(data: CreateCouponInput) {
  const coupon = await createCouponCore(data);
  revalidatePath("/", "layout");
  return coupon;
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  await toggleCouponStatusCore(id, isActive);
  revalidatePath("/", "layout");
}
