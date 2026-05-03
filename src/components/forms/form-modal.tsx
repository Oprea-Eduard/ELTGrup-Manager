"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/src/components/ui/dialog";

export function FormModal({
  triggerLabel,
  title,
  description,
  children,
  triggerVariant = "default",
}: {
  triggerLabel: string;
  title: string;
  description?: string;
  children: ReactNode;
  triggerVariant?: "default" | "secondary" | "ghost" | "destructive";
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg text-[var(--foreground)]">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
