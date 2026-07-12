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
          {/* Left: Logo Only */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src={logoUrl || "/logo.png"} 
                alt="Logo" 
                width={120} 
                height={32} 
                className="h-8 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Right: Navigation and Actions */}
          <div className="flex items-center gap-6 ml-auto">
            {/* Navigation links moved to the right */}
            <nav className="hidden md:flex gap-6 items-center">
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

            <div className="flex items-center gap-4">
              {/* 
                // TODO: Conditional rendering for Logged-In User Status
                {isLoggedIn ? (
                  <>
                    <Button variant="outline" size="sm">Invite</Button>
                    <NotificationIcon />
                    <CustomerSupportIcon />
                    <Button size="sm">VIP Supermarket</Button>
                    <UserAvatarDropdown />
                  </>
                ) : (
              */}
              <Button variant="outline" size="sm">Log In</Button>
              <Button size="sm">Sign Up</Button>
              {/* )} */}
            </div>
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
