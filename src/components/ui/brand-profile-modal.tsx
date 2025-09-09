"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface BrandProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedirect: () => void;
  missingFields: string[];
}

export function BrandProfileModal({ isOpen, onClose, onRedirect, missingFields }: BrandProfileModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 mx-auto">
            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          
          <DialogTitle className="text-center text-xl font-semibold">
            Complete Your Brand Profile
          </DialogTitle>
          
          <DialogDescription className="text-center text-muted-foreground">
            Please complete your brand profile before creating campaigns. This helps creators understand your brand better.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Missing Required Fields:</h4>
            <ul className="space-y-1">
              {missingFields.map((field, index) => (
                <li key={index} className="flex items-center text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2"></div>
                  {field}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onRedirect}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Complete Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
