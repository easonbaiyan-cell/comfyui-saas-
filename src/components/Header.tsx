"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface NavLink {
  label: string;
  type: "redirect" | "modal";
  url?: string;
  content?: string;
}

export function Header({ logoUrl, navLinks = [] }: { logoUrl?: string, navLinks?: NavLink[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string, body: string}>({ title: "", body: "" });

  const handleLinkClick = (link: NavLink) => {
    if (link.type === "modal") {
      setModalContent({ title: link.label, body: link.content || "" });
      setModalOpen(true);
    }
  };

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              {logoUrl ? (
                <Image src={logoUrl} alt="Logo" width={120} height={40} className="object-contain" />
              ) : (
                <span className="text-xl font-bold">papagaga</span>
              )}
            </Link>
            <nav className="hidden md:flex gap-6">
              {navLinks.map((link, i) => (
                link.type === "redirect" ? (
                  <Link
                    key={i}
                    href={link.url || "#"}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={i}
                    onClick={() => handleLinkClick(link)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </button>
                )
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">Log In</Button>
            <Button size="sm">Sign Up</Button>
          </div>
        </div>
      </header>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalContent.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-sm whitespace-pre-wrap">
            {modalContent.body}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
