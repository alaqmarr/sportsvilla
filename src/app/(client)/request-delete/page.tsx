import RequestDeleteClient from "./RequestDeleteClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Account Deletion",
};

export default function RequestDeletePage() {
  return <RequestDeleteClient />;
}
