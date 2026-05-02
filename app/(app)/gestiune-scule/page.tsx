import { redirect } from "next/navigation";

export default function GestiuneSculeRedirectPage() {
  redirect("/materiale?tab=scule");
}
