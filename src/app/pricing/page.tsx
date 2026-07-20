"use client";

import React, { useState } from "react";
import PricingModal from "@/components/PricingModal";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0d13]">
      {isModalOpen && (
        <PricingModal onClose={handleClose} />
      )}
    </div>
  );
}
