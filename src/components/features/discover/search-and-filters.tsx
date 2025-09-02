"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CampaignType, campaignTypeLabels } from "@/types/campaign";

interface SearchAndFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (types: CampaignType[]) => void;
}

export function SearchAndFilters({ onSearch, onFilterChange }: SearchAndFiltersProps) {
  const [selectedTypes, setSelectedTypes] = useState<CampaignType[]>([]);

  const handleTypeClick = (type: CampaignType) => {
    setSelectedTypes((prev) => {
      const newTypes = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];
      onFilterChange(newTypes);
      return newTypes;
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search campaigns..."
          className="pl-9"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-2 gap-2 pb-4 md:grid-cols-3 lg:grid-cols-4">
          {Object.values(CampaignType).map((type) => (
            <Badge
              key={type}
              variant={selectedTypes.includes(type) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTypeClick(type)}
            >
              {campaignTypeLabels[type]}
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
