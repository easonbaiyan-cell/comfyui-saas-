"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import PricingModal from "@/components/PricingModal";

export default function TestPricingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0d13]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">计费弹窗独立测试页</h1>
        <Button onClick={() => setIsModalOpen(true)} size="lg">
          点击打开计费弹窗
        </Button>
      </div>

      {isModalOpen && (
        <PricingModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
