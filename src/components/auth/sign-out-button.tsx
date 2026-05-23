"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/src/components/ui/button";

export function SignOutButton() {
	return (
		<Button
			onClick={() => signOut({ callbackUrl: "/autentificare" })}
			variant="ghost"
			className="h-7 gap-1 px-2 text-[8px]"
		>
			<LogOut className="size-3" />
			<span className="hidden sm:inline">IESIRE</span>
		</Button>
	);
}
