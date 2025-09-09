"use client";

import { useState } from "react";
import { checkBrandProfileCompletion } from "@/lib/brand-validation";

export function useBrandProfileModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const handleNewCampaignClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const validation = await checkBrandProfileCompletion();
    
    if (!validation.isComplete) {
      setMissingFields(validation.missingFields);
      setIsModalOpen(true);
      return;
    }
    
    // If profile is complete, proceed to create campaign
    window.location.href = '/brand/campaigns/new';
  };

  const handleRedirect = () => {
    setIsModalOpen(false);
    window.location.href = '/brand/settings';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMissingFields([]);
  };

  return {
    isModalOpen,
    missingFields,
    handleNewCampaignClick,
    handleRedirect,
    closeModal
  };
}
