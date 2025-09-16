import { useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import { 
  getCampaignSectionCompletionStatus, 
  getCampaignCompletionCount, 
  isCampaignComplete,
  type CampaignData 
} from '@/lib/campaign-validation';

interface SectionCompletionStatus {
  'campaign-overview': boolean;
  'budget-timeline': boolean;
  'content-requirements': boolean;
  'audience-targeting': boolean;
  'agreements-compliance': boolean;
  'assets': boolean;
}

interface CampaignValidationResult {
  sectionStatus: SectionCompletionStatus;
  completionCount: { completed: number; total: number };
  isComplete: boolean;
  getSectionStyle: (sectionId: keyof SectionCompletionStatus, isActive: boolean) => string;
  getSectionIcon: (sectionId: keyof SectionCompletionStatus) => React.ReactElement | null;
}

export function useCampaignValidation(campaign: CampaignData | null): CampaignValidationResult {
  const validationResult = useMemo(() => {
    if (!campaign) {
      return {
        sectionStatus: {
          'campaign-overview': false,
          'budget-timeline': false,
          'content-requirements': false,
          'audience-targeting': false,
          'agreements-compliance': false,
          'assets': false,
        },
        completionCount: { completed: 0, total: 6 },
        isComplete: false,
      };
    }

    const sectionStatus = getCampaignSectionCompletionStatus(campaign);
    const completionCount = getCampaignCompletionCount(campaign);
    const isComplete = isCampaignComplete(campaign);

    return {
      sectionStatus,
      completionCount,
      isComplete,
    };
  }, [campaign]);

  const getSectionStyle = (sectionId: keyof SectionCompletionStatus, isActive: boolean): string => {
    const isCompleted = validationResult.sectionStatus[sectionId];
    
    // Active state takes priority - make it very prominent
    if (isActive) {
      if (isCompleted) {
        // Active + Completed: Normal primary background
        return 'bg-primary/20 dark:bg-primary/30 text-primary-foreground dark:text-primary-100 border-primary/40 dark:border-primary/500 shadow-md';
      } else {
        // Active + Not Completed: Strong blue/primary background
        return 'bg-primary/20 dark:bg-primary/30 text-primary-foreground dark:text-primary-100 border-primary/40 dark:border-primary/500 shadow-md';
      }
    }
    
    // Not active states
    if (isCompleted) {
      // Completed but not active: Normal background
      return 'bg-muted/50 dark:bg-muted/30 text-muted-foreground dark:text-muted-foreground border-transparent hover:bg-muted dark:hover:bg-muted/50 hover:border-border';
    }
    
    // Not completed and not active: Default with hover
    return 'bg-muted/50 dark:bg-muted/30 text-muted-foreground dark:text-muted-foreground border-transparent hover:bg-muted dark:hover:bg-muted/50 hover:border-border';
  };

  const getSectionIcon = (sectionId: keyof SectionCompletionStatus): React.ReactElement | null => {
    const isCompleted = validationResult.sectionStatus[sectionId];
    
    if (isCompleted) {
      return <CheckCircle className="h-4 w-4 ml-auto text-green-600 dark:text-green-400" />;
    }
    
    return null;
  };

  return {
    ...validationResult,
    getSectionStyle,
    getSectionIcon,
  };
}

// Helper hook for form validation states
export function useSectionFormValidation(
  campaign: CampaignData | null,
  sectionId: keyof SectionCompletionStatus
) {
  const { sectionStatus } = useCampaignValidation(campaign);
  
  return {
    isCompleted: sectionStatus[sectionId],
    getFieldStyle: (hasError: boolean = false): string => {
      if (hasError) {
        return 'border-red-300 focus:border-red-400 focus:ring-red-200 dark:border-red-600 dark:focus:border-red-500 dark:focus:ring-red-900/20';
      }
      
      if (sectionStatus[sectionId]) {
        return 'border-green-300 focus:border-green-400 focus:ring-green-200 dark:border-green-600 dark:focus:border-green-500 dark:focus:ring-green-900/20';
      }
      
      return 'border-input focus:border-ring focus:ring-ring/20';
    },
  };
}
