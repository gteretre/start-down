"use client";
import React from "react";
import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url }) => {
  const handleShare = async () => {
    const shareData = {
      title,
      text,
      url
    };
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <Button
      // className="bg-primary text-white px-4 py-2 rounded"
      className="search-btn"
      onClick={handleShare}
    >
      <Share2 />
      Share
    </Button>
  );
};

export default ShareButton;
