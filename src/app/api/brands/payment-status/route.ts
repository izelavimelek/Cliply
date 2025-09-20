import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check when auth system is implemented
    // For now, skip auth to prevent import errors
    
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brand_id');
    
    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Implement actual payment method checking
    // This would check if the brand has:
    // 1. Valid payment method on file (credit card, bank account, etc.)
    // 2. Billing address
    // 3. Tax information if required
    // 4. Account in good standing
    
    // For now, return false to enforce payment setup flow
    const hasPaymentMethod = false;
    
    return NextResponse.json({ 
      hasPaymentMethod,
      brand_id: brandId,
      message: hasPaymentMethod ? 'Payment method configured' : 'Payment method required'
    });
    
  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
