"use client";

import { domAnimation, LazyMotion, m } from "framer-motion";
import type { ReactNode } from "react";

const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.05 } },
};

const item = {
	hidden: { opacity: 0, y: 12 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.35, ease: "easeOut" as const },
	},
};

export function Stagger({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<LazyMotion features={domAnimation}>
			<m.div
				variants={container}
				initial="hidden"
				animate="show"
				className={className}
			>
				{children}
			</m.div>
		</LazyMotion>
	);
}

export function StaggerItem({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<m.div variants={item} className={className}>
			{children}
		</m.div>
	);
}
