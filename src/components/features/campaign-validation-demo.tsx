import { useCampaignValidation } from '@/hooks/useCampaignValidation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, DollarSign, FileText, UserCheck, Shield } from 'lucide-react';

// Test component to demonstrate the validation system
export function CampaignValidationDemo() {
  // Example campaign data with varying completion levels
  const exampleCampaigns = [
    {
      id: '1',
      title: 'Summer Fashion Campaign',
      description: 'A comprehensive summer fashion campaign targeting young adults interested in sustainable fashion.',
      platforms: ['instagram', 'tiktok'],
      objective: 'awareness',
      category: 'Fashion',
      rate_type: 'per_thousand_views',
      rate_per_thousand: 15,
      total_budget: 5000,
      start_date: '2024-09-01',
      end_date: '2024-09-30',
      deliverable_quantity: {
        clips: 5,
        long_videos: 2,
        images: 10,
      },
      requirements: 'Must showcase sustainable fashion practices and highlight eco-friendly materials.',
      target_geography: ['United States', 'Canada'],
      target_age_range: { min: 18, max: 35 },
      usage_rights: 'Full rights for 6 months',
      exclusivity: { enabled: true },
      legal_confirmations: {
        platform_compliant: true,
        no_unlicensed_assets: true,
      }
    },
    {
      id: '2',
      title: 'Tech Product Launch',
      description: 'Launch campaign for new tech product',
      platforms: ['youtube'],
      objective: 'conversions',
      // Missing category, budget, dates, etc.
    },
    {
      id: '3',
      title: '', // Missing title
      description: '',
      platforms: [],
      // Almost nothing filled
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Campaign Validation System Demo</h1>
        <p className="text-muted-foreground">
          This demonstrates how our global validation system tracks completion of campaign sections
        </p>
      </div>

      {exampleCampaigns.map((campaign, index) => {
        const { sectionStatus, completionCount, isComplete, getSectionStyle, getSectionIcon } = useCampaignValidation(campaign);
        
        return (
          <Card key={campaign.id} className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Campaign {index + 1}: {campaign.title || 'Untitled Campaign'}
                    {isComplete && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted-foreground">
                      Progress: {completionCount.completed}/{completionCount.total} sections
                    </span>
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isComplete ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${(completionCount.completed / completionCount.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: 'campaign-overview', icon: Target, title: 'Campaign Overview' },
                  { id: 'budget-timeline', icon: DollarSign, title: 'Budget & Timeline' },
                  { id: 'content-requirements', icon: FileText, title: 'Content Requirements' },
                  { id: 'audience-targeting', icon: UserCheck, title: 'Audience Targeting' },
                  { id: 'agreements-compliance', icon: Shield, title: 'Agreements & Compliance' },
                ].map(section => {
                  const Icon = section.icon;
                  const isCompleted = sectionStatus[section.id as keyof typeof sectionStatus];
                  
                  return (
                    <div 
                      key={section.id}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        isCompleted 
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                          : 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{section.title}</span>
                        </div>
                        {isCompleted && <CheckCircle className="h-4 w-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
