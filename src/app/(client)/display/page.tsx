import DisplayClient from "./DisplayClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SportsVilla Display Session",
};

export default function DisplayPage() {
  return <DisplayClient />;
}
