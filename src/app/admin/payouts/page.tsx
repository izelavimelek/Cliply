"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Calendar
} from "lucide-react";

interface Payout {
  id: string;
  creator_name: string;
  creator_email: string;
  amount: number;
  campaign_title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at?: string;
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      // TODO: Implement real API endpoint for payout management
      // const response = await fetch('/api/admin/payouts');
      // const data = await response.json();
      
      // Mock data for now
      const mockPayouts: Payout[] = [
        {
          id: "1",
          creator_name: "John Creator",
          creator_email: "john@example.com",
          amount: 250.00,
          campaign_title: "Gaming Headset Review",
          status: "pending",
          created_at: "2024-01-20T10:00:00Z"
        },
        {
          id: "2",
          creator_name: "Sarah Influencer",
          creator_email: "sarah@example.com",
          amount: 180.00,
          campaign_title: "Fashion Summer Collection",
          status: "processing",
          created_at: "2024-01-19T14:30:00Z"
        },
        {
          id: "3",
          creator_name: "Mike Reviewer",
          creator_email: "mike@example.com",
          amount: 320.00,
          campaign_title: "Fitness App Promotion",
          status: "completed",
          created_at: "2024-01-18T09:15:00Z",
          processed_at: "2024-01-19T11:45:00Z"
        }
      ];
      
      setPayouts(mockPayouts);
      setLoading(false);
    } catch (error) {
      console.error("Error loading payouts:", error);
      setLoading(false);
    }
  };

  const handlePayoutAction = async (payoutId: string, action: string) => {
    // TODO: Implement payout management actions
    console.log(`Action ${action} for payout ${payoutId}`);
    
    switch (action) {
      case 'approve':
        // TODO: API call to approve payout
        break;
      case 'reject':
        // TODO: API call to reject payout
        break;
      case 'retry':
        // TODO: API call to retry failed payout
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'processing':
        return <Badge variant="default" className="gap-1 bg-blue-600">Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="w-3 h-3" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPending = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalProcessing = payouts.filter(p => p.status === 'processing').reduce((sum, p) => sum + p.amount, 0);
  const totalCompleted = payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payouts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="w-8 h-8" />
          Payout Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Process and manage creator payouts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${totalPending.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {payouts.filter(p => p.status === 'pending').length} requests
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalProcessing.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {payouts.filter(p => p.status === 'processing').length} in progress
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalCompleted.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {payouts.filter(p => p.status === 'completed').length} paid out
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {payouts.filter(p => p.status === 'failed').length}
            </div>
            <div className="text-sm text-muted-foreground">
              Need attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Queue</CardTitle>
          <CardDescription>
            Review and process creator payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {payout.creator_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payout.creator_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{payout.campaign_title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-lg font-semibold text-green-600">
                        ${payout.amount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payout.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(payout.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {payout.processed_at ? (
                        <div className="text-sm text-muted-foreground">
                          {new Date(payout.processed_at).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {payout.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handlePayoutAction(payout.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePayoutAction(payout.id, 'reject')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {payout.status === 'failed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePayoutAction(payout.id, 'retry')}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* TODO: Add batch processing functionality */}
      {/* TODO: Add payout history and filtering */}
      {/* TODO: Add integration with payment processors (Stripe, PayPal) */}
      {/* TODO: Add payout scheduling and automation */}
    </div>
  );
}
