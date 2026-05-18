import { redirect } from "next/navigation";

export default function TerenRedirectPage() {
	redirect("/lucrari?filter=teren");
}
