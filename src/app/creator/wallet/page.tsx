"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Calendar,
  Clock,
  Plus,
  Wallet,
  Receipt,
  BarChart3
} from "lucide-react";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('transactions');
  
  // Empty state - no mock data
  const walletStats = {
    totalBalance: 0.00,
    pendingBalance: 0.00,
    totalEarned: 0.00,
    thisMonth: 0.00
  };

  const transactions: any[] = [];
  const payoutMethods: any[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wallet</h1>
        </div>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletStats.totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              No earnings yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletStats.pendingBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              No pending earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletStats.totalEarned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Start earning to see progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletStats.thisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              No earnings this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-1 border-b border-border">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'transactions'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'payouts'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Payout Methods
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Earnings Analytics
          </button>
        </div>

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No transactions yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your earnings and payouts will appear here once you start participating in campaigns.
                  </p>
                  <Button variant="outline">
                    Browse Campaigns
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'earning' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {transaction.type === 'earning' ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <CreditCard className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{transaction.date}</span>
                            <span>•</span>
                            <span className="capitalize">{transaction.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'earning' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {transaction.type === 'earning' ? '+' : ''}${transaction.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Payout Methods Tab */}
        {activeTab === 'payouts' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payout Methods</CardTitle>
                <Button variant="outline" size="sm" disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {payoutMethods.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No payout methods added</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a payout method to receive your earnings. This feature will be available soon.
                  </p>
                  <Button variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {payoutMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.account}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Earnings by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No earnings data yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Platform breakdown will appear here once you start earning.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No earnings data yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Monthly trends will appear here once you start earning.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
