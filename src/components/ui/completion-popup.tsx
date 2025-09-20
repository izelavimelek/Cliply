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
    description: 'Awesome! Your audience is defined. Now let\'s upload brand assets and resources for creators.',
    icon: <Users className="w-8 h-8 text-green-600" />,
    nextStep: 'Upload brand assets and resources',
    nextSection: 'assets'
  },
  'assets': {
    title: 'Assets Upload Complete!',
    description: 'Perfect! Assets are ready. Now you can review submissions or publish your campaign.',
    icon: <Upload className="w-8 h-8 text-green-600" />,
    nextStep: 'Review and publish your campaign',
    nextSection: 'publishing'
  },
  'publishing': {
    title: 'Campaign Published!',
    description: 'Congratulations! Your campaign is now live and ready for creator applications.',
    icon: <CheckCircle className="w-8 h-8 text-green-600" />,
    nextStep: 'Your campaign is live!',
    nextSection: undefined
  }
};

export function CompletionPopup({ isOpen, onClose, sectionName, nextSection, onNextSection, onMute }: CompletionPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay before showing to ensure smooth entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Start exit animation
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
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
    <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-500 ${
      isAnimating ? 'opacity-100' : 'opacity-0'
    }`}>
      <Card className={`w-full max-w-md mx-auto transition-all duration-500 transform ${
        isAnimating 
          ? 'animate-in slide-in-from-bottom-4 fade-in-0 scale-100 opacity-100' 
          : 'animate-out slide-out-to-bottom-4 fade-out-0 scale-95 opacity-0'
      }`}>
        <CardContent className="p-6">
          <div className={`flex items-start justify-between mb-4 transition-all duration-700 delay-100 ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`transition-all duration-700 delay-200 ${
                isAnimating ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
              }`}>
                {section.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className={`text-muted-foreground mb-6 leading-relaxed transition-all duration-700 delay-200 ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            {section.description}
          </p>

          <div className={`bg-muted/50 rounded-lg p-4 mb-6 transition-all duration-700 delay-300 ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Next: {section.nextStep}</span>
            </div>
          </div>

          <div className={`flex gap-3 transition-all duration-700 delay-400 ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 transition-all duration-200 hover:scale-105"
            >
              Continue Later
            </Button>
            {section.nextSection && onNextSection && (
              <Button
                onClick={handleNextSection}
                className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
              >
                Go to Next Section
              </Button>
            )}
          </div>
          
          {/* Mute Link */}
          {onMute && (
            <div className={`mt-4 pt-4 border-t border-border/50 text-center transition-all duration-700 delay-500 ${
              isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
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
