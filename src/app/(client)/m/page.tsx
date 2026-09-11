import MClient from "./MClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SportsVilla Login",
};

export default function MPage() {
  return <MClient />;
}
