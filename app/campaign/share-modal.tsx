"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShortenLink } from "@/hooks/use-shorten-link";

interface Campaign {
  id: string;
  title: string;
  shortUrl?: string;
}

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onOpenChange, campaign }) => {
  const [copied, setCopied] = useState(false);
  const [campaignUrl, setCampaignUrl] = useState("");
  const { shortenLink, isLoading } = useShortenLink();

  useEffect(() => {
    if (campaign && open) {
      const longUrl = `${window.location.origin}/campaign/${campaign.id}`;
      
      // If campaign already has a short URL, use it
      if (campaign.shortUrl) {
        setCampaignUrl(campaign.shortUrl);
      } else {
        // Otherwise, try to shorten the URL
        shortenLink(longUrl).then((shortUrl) => {
          setCampaignUrl(shortUrl || longUrl);
        });
      }
    }
  }, [campaign, open, shortenLink]);

  const handleCopyLink = () => {
    if (campaignUrl) {
      navigator.clipboard.writeText(campaignUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: string) => {
    if (!campaignUrl || !campaign) return;

    const shareText = `Check out this campaign: ${campaign.title}`;
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(campaignUrl)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`;
        break;
      case "instagram":
        // Instagram doesn't support direct sharing via URL, copy to clipboard
        navigator.clipboard.writeText(`${shareText} ${campaignUrl}`);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#E7EDE6] border-2 border-dashed border-[#104901] rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#104901]">
          <div>
            <h2 className="text-2xl font-bold text-[#104901]">
              Campaigns do better when you share
            </h2>
            <p className="text-gray-700 mt-1">
              Share this campaign on your favourite socials networks.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#104901] text-white hover:bg-[#0a3a0a] p-0"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Campaign Link */}
          <div>
            <div className="flex items-center space-x-2">
              <Input
                value={isLoading ? "Generating link..." : campaignUrl}
                readOnly
                className="flex-1 border-[#104901] bg-white text-[#104901] font-medium"
              />
              <Button
                onClick={handleCopyLink}
                disabled={!campaignUrl || isLoading}
                className="bg-[#104901] text-white hover:bg-[#0a3a0a] border-[#104901]"
              >
                <Copy size={16} className="mr-1" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Share Campaign */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-[#104901]">
                Share campaign
              </h3>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleShare("facebook")}
                  disabled={!campaignUrl || isLoading}
                  className="text-[#104901] border-[#104901] hover:bg-[#104901] hover:text-white w-10 h-10 p-0"
                >
                  <Facebook size={20} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleShare("instagram")}
                  disabled={!campaignUrl || isLoading}
                  className="text-[#104901] border-[#104901] hover:bg-[#104901] hover:text-white w-10 h-10 p-0"
                >
                  <Instagram size={20} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleShare("twitter")}
                  disabled={!campaignUrl || isLoading}
                  className="text-[#104901] border-[#104901] hover:bg-[#104901] hover:text-white w-10 h-10 p-0"
                >
                  <Twitter size={20} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleShare("linkedin")}
                  disabled={!campaignUrl || isLoading}
                  className="text-[#104901] border-[#104901] hover:bg-[#104901] hover:text-white w-10 h-10 p-0"
                >
                  <Linkedin size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 