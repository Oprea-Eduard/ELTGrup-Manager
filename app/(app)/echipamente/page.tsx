import { redirect } from "next/navigation";

export default function EchipamenteRedirectPage() {
  redirect("/materiale?tab=echipamente");
}
