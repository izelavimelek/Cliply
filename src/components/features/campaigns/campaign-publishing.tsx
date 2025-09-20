"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  CreditCard, 
  Send, 
  Clock,
  DollarSign,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Campaign } from "./types";
import { 
  performPublishingCheck, 
  publishCampaign, 
  PublishingCheck,
  ValidationError 
} from "@/lib/campaign-publishing";

interface CampaignPublishingProps {
  campaign: Campaign;
  onStatusChange?: (newStatus: string) => void;
}

export function CampaignPublishing({ campaign, onStatusChange }: CampaignPublishingProps) {
  const router = useRouter();
  const [publishingCheck, setPublishingCheck] = useState<PublishingCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    checkPublishingStatus();
  }, [campaign]);

  const checkPublishingStatus = async () => {
    setIsLoading(true);
    try {
      const check = await performPublishingCheck(campaign);
      setPublishingCheck(check);
    } catch (error) {
      console.error('Error checking publishing status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishClick = async () => {
    if (!publishingCheck) return;

    // If missing payment, redirect to payment setup
    if (publishingCheck.missingPaymentSetup) {
      router.push('/brand/settings?tab=payment');
      return;
    }

    // If validation errors exist, don't allow publishing
    if (publishingCheck.validationErrors.length > 0) {
      return;
    }

    setIsPublishing(true);
    try {
      const result = await publishCampaign(campaign.id);
      if (result.success) {
        onStatusChange?.('pending_approval');
        alert('Campaign successfully submitted for approval!');
      } else {
        alert(result.error || 'Failed to publish campaign');
      }
    } catch (error) {
      alert('An error occurred while publishing the campaign');
    } finally {
      setIsPublishing(false);
    }
  };

  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'pending_approval':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
      case 'paused':
        return <Badge variant="outline">Paused</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="secondary">{campaign.status}</Badge>;
    }
  };

  const getStatusMessage = () => {
    switch (campaign.status) {
      case 'draft':
        return "Complete all required sections and add a payment method to publish this campaign.";
      case 'pending_approval':
        return "Your campaign is under review by our team. You'll be notified once it's approved.";
      case 'approved':
        return "Your campaign has been approved and is now visible to creators.";
      case 'rejected':
        return "Your campaign was rejected. Please review the feedback and make necessary changes.";
      case 'active':
        return "Your campaign is live and accepting submissions from creators.";
      case 'paused':
        return "Your campaign is paused. It's not visible to creators until reactivated.";
      case 'completed':
        return "Your campaign has been completed.";
      default:
        return "";
    }
  };

  const renderValidationErrors = (errors: ValidationError[]) => {
    const errorsBySection = errors.reduce((acc, error) => {
      if (!acc[error.section]) acc[error.section] = [];
      acc[error.section].push(error);
      return acc;
    }, {} as Record<string, ValidationError[]>);

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-destructive">Required Fields Missing:</h4>
        {Object.entries(errorsBySection).map(([section, sectionErrors]) => (
          <div key={section} className="space-y-2">
            <h5 className="font-medium text-sm">{section}</h5>
            <ul className="space-y-1 ml-4">
              {sectionErrors.map((error, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking campaign status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pt-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Send className="h-8 w-8 text-primary" />
          </div>
          {getStatusBadge()}
        </div>
        <h1 className="text-2xl font-bold mb-2">Campaign Publishing</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {getStatusMessage()}
        </p>
      </div>

      {/* Draft Status - Publishing Checklist */}
      {campaign.status === 'draft' && publishingCheck && (
        <div className="space-y-6">
          {/* Progress Overview */}
          <Card className="border-2 border-dashed">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Publishing Readiness</h3>
                <div className="text-sm text-muted-foreground">
                  {publishingCheck.validationErrors.length === 0 && publishingCheck.hasPaymentMethod ? '2/2' : 
                   publishingCheck.validationErrors.length === 0 || publishingCheck.hasPaymentMethod ? '1/2' : '0/2'} Complete
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Requirements Check */}
                <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                  publishingCheck.validationErrors.length === 0 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {publishingCheck.validationErrors.length === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">
                      Campaign Requirements
                    </div>
                    <div className="text-sm opacity-75">
                      {publishingCheck.validationErrors.length === 0 
                        ? 'All required fields completed' 
                        : `${publishingCheck.validationErrors.length} fields need attention`}
                    </div>
                  </div>
                </div>

                {/* Payment Check */}
                <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                  publishingCheck.hasPaymentMethod 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {publishingCheck.hasPaymentMethod ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">
                      Payment Method
                    </div>
                    <div className="text-sm opacity-75">
                      {publishingCheck.hasPaymentMethod 
                        ? 'Payment method configured' 
                        : 'Payment setup required'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Validation Errors */}
          {publishingCheck.validationErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Required Fields Missing
                </CardTitle>
                <CardDescription>
                  Complete these fields to publish your campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(
                    publishingCheck.validationErrors.reduce((acc, error) => {
                      if (!acc[error.section]) acc[error.section] = [];
                      acc[error.section].push(error);
                      return acc;
                    }, {} as Record<string, typeof publishingCheck.validationErrors>)
                  ).map(([section, sectionErrors]) => (
                    <div key={section} className="space-y-3">
                      <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">
                        {section}
                      </h4>
                      <div className="space-y-2">
                        {sectionErrors.map((error, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{error.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Section */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {publishingCheck.missingPaymentSetup ? (
                  <>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <CreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-orange-800">
                        Set up your payment method to publish campaigns and pay creators
                      </p>
                    </div>
                    <Button 
                      onClick={handlePublishClick}
                      disabled={isPublishing}
                      size="lg"
                      className="w-full max-w-xs"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Set Up Payment Method
                    </Button>
                  </>
                ) : publishingCheck.canPublish ? (
                  <>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-800">
                        Your campaign is ready to publish! It will be reviewed by our team before going live.
                      </p>
                    </div>
                    <Button 
                      onClick={handlePublishClick}
                      disabled={isPublishing}
                      size="lg"
                      className="w-full max-w-xs bg-green-600 hover:bg-green-700"
                    >
                      {isPublishing ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></div>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Publish Campaign
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <AlertCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-700">
                        Complete the required fields above to publish your campaign
                      </p>
                    </div>
                    <Button disabled size="lg" className="w-full max-w-xs" variant="outline">
                      <XCircle className="h-4 w-4 mr-2" />
                      Complete Required Fields
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Approval Status */}
      {campaign.status === 'pending_approval' && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="text-center p-8">
            <div className="p-4 rounded-full bg-orange-100 w-fit mx-auto mb-4">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-orange-900">Under Review</h3>
            <p className="text-orange-700 mb-4 max-w-md mx-auto">
              Your campaign has been submitted and is being reviewed by our team. 
              You'll receive an email notification once it's approved.
            </p>
            <div className="text-sm text-orange-600">
              ⏱️ Review typically takes 24-48 hours
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Campaign Stats */}
      {(campaign.status === 'active' || campaign.status === 'approved') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="text-center p-6">
              <div className="p-3 rounded-full bg-blue-100 w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {campaign.submissions_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center p-6">
              <div className="p-3 rounded-full bg-green-100 w-fit mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                ${campaign.budget_spent || 0}
              </div>
              <div className="text-sm text-muted-foreground">Budget Spent</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
