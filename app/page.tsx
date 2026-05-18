import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "ELT Grup Manager",
	description: "Platforma de management operational",
};

export default function HomePage() {
	redirect("/panou");
}
