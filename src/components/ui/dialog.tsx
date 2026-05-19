"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { domAnimation, LazyMotion, m } from "framer-motion";
import { X } from "lucide-react";
import type * as React from "react";
import type { Ref } from "react";
import { cn } from "@/src/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
	className,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
	ref?: Ref<React.ElementRef<typeof DialogPrimitive.Overlay>>;
}) {
	return (
		<LazyMotion features={domAnimation}>
			<DialogPrimitive.Overlay asChild ref={ref} {...props}>
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15 }}
					className={cn("fixed inset-0 z-50 bg-black/80", className)}
				/>
			</DialogPrimitive.Overlay>
		</LazyMotion>
	);
}
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

function DialogContent({
	className,
	children,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
	ref?: Ref<React.ElementRef<typeof DialogPrimitive.Content>>;
}) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<LazyMotion features={domAnimation}>
				<DialogPrimitive.Content asChild ref={ref} {...props}>
					<m.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className={cn(
							"fixed left-[50%] top-[10%] z-50 mx-auto w-full max-w-lg -translate-x-1/2 gap-4 border border-[var(--border-visible)] bg-[var(--surface)] p-6 sm:rounded-[var(--radius-xl)] max-h-[80vh] overflow-y-auto",
							className,
						)}
					>
						{children}
						<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
							<X className="size-4" />
							<span className="sr-only">Close</span>
						</DialogPrimitive.Close>
					</m.div>
				</DialogPrimitive.Content>
			</LazyMotion>
		</DialogPortal>
	);
}
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-1.5",
			className,
		)}
		{...props}
	/>
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			className,
		)}
		{...props}
	/>
);
DialogFooter.displayName = "DialogFooter";

function DialogTitle({
	className,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
	ref?: Ref<React.ElementRef<typeof DialogPrimitive.Title>>;
}) {
	return (
		<DialogPrimitive.Title
			ref={ref}
			className={cn(
				"text-lg font-medium tracking-tight text-[var(--text-display)]",
				className,
			)}
			{...props}
		/>
	);
}
DialogTitle.displayName = DialogPrimitive.Title.displayName;

function DialogDescription({
	className,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
	ref?: Ref<React.ElementRef<typeof DialogPrimitive.Description>>;
}) {
	return (
		<DialogPrimitive.Description
			ref={ref}
			className={cn("text-sm text-[var(--text-secondary)]", className)}
			{...props}
		/>
	);
}
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
