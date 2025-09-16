"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, X, Target, DollarSign, FileText, Users, Shield, Upload } from "lucide-react";

interface CompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  nextSection?: string;
  onNextSection?: () => void;
  onMute?: () => void;
}

const sectionInfo = {
  'campaign-overview': {
    title: 'Campaign Overview Complete!',
    description: 'Great! You\'ve set up your campaign basics. Now let\'s define your budget and timeline.',
    icon: <Target className="w-8 h-8 text-green-600" />,
    nextStep: 'Set your budget and payment structure',
    nextSection: 'budget-timeline'
  },
  'budget-timeline': {
    title: 'Budget & Timeline Complete!',
    description: 'Perfect! Your budget is set. Now let\'s define what content creators need to deliver.',
    icon: <DollarSign className="w-8 h-8 text-green-600" />,
    nextStep: 'Define content requirements and guidelines',
    nextSection: 'content-requirements'
  },
  'content-requirements': {
    title: 'Content Requirements Complete!',
    description: 'Excellent! Creators now know what to create. Let\'s define your target audience.',
    icon: <FileText className="w-8 h-8 text-green-600" />,
    nextStep: 'Set your target audience and demographics',
    nextSection: 'audience-targeting'
  },
  'audience-targeting': {
    title: 'Audience Targeting Complete!',
    description: 'Awesome! Your audience is defined. Now let\'s set up legal agreements and compliance.',
    icon: <Users className="w-8 h-8 text-green-600" />,
    nextStep: 'Review agreements and compliance requirements',
    nextSection: 'agreements-compliance'
  },
  'agreements-compliance': {
    title: 'Agreements & Compliance Complete!',
    description: 'Fantastic! Legal requirements are set. Finally, let\'s upload any assets creators might need.',
    icon: <Shield className="w-8 h-8 text-green-600" />,
    nextStep: 'Upload brand assets and resources',
    nextSection: 'assets'
  },
  'assets': {
    title: 'Assets Upload Complete!',
    description: 'Congratulations! Your campaign is fully set up and ready to go live.',
    icon: <Upload className="w-8 h-8 text-green-600" />,
    nextStep: 'Your campaign is ready to launch!',
    nextSection: undefined
  }
};

export function CompletionPopup({ isOpen, onClose, sectionName, nextSection, onNextSection, onMute }: CompletionPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen || !isVisible) return null;

  const section = sectionInfo[sectionName as keyof typeof sectionInfo];
  if (!section) return null;

  const handleNextSection = () => {
    if (onNextSection) {
      onNextSection();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {section.icon}
              <div>
                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            {section.description}
          </p>

          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Next: {section.nextStep}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Continue Later
            </Button>
            {section.nextSection && onNextSection && (
              <Button
                onClick={handleNextSection}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Go to Next Section
              </Button>
            )}
          </div>
          
          {/* Mute Link */}
          {onMute && (
            <div className="mt-4 pt-4 border-t border-border/50 text-center">
              <button
                onClick={onMute}
                className="text-sm text-muted-foreground hover:text-blue-600 hover:underline transition-all duration-200"
              >
                Don't show this again for this campaign
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
