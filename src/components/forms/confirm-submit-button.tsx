"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/src/components/ui/button";

export function ConfirmSubmitButton({
	text,
	confirmMessage: _confirmMessage,
	variant = "secondary",
	size = "sm",
}: {
	text: string;
	confirmMessage: string;
	variant?: "default" | "secondary" | "destructive" | "ghost";
	size?: "default" | "sm";
}) {
	const { pending } = useFormStatus();
	const [confirming, setConfirming] = useState(false);

	if (confirming) {
		return (
			<div className="flex items-center gap-2">
				<Button
					type="submit"
					variant={variant === "destructive" ? "destructive" : "default"}
					size={size}
					disabled={pending}
				>
					{pending ? "Se proceseaza..." : "Confirm"}
				</Button>
				<Button
					type="button"
					variant="secondary"
					size={size}
					onClick={() => setConfirming(false)}
				>
					Anuleaza
				</Button>
			</div>
		);
	}

	return (
		<Button
			type="button"
			variant={variant}
			size={size}
			disabled={pending}
			onClick={() => setConfirming(true)}
		>
			{text}
		</Button>
	);
}
