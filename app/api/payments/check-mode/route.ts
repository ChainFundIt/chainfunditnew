import { NextRequest, NextResponse } from 'next/server';
import { getPaymentModeStatus } from '@/lib/payments/config';

/**
 * GET /api/payments/check-mode
 * Diagnostic endpoint to check if payment keys are in test or production mode
 */
export async function GET(request: NextRequest) {
  try {
    const status = getPaymentModeStatus();
    
    // Determine overall mode
    const isAnyTestMode = status.stripe.isTestMode || status.paystack.isTestMode;
    
    return NextResponse.json({
      success: true,
      overallMode: isAnyTestMode ? 'test' : 'live',
      isTestMode: isAnyTestMode,
      stripe: {
        secretKey: {
          mode: status.stripe.secretKeyMode,
          isSet: status.stripe.secretKeyMode !== 'missing',
          prefix: status.stripe.secretKeyMode === 'test' ? 'sk_test_' : 
                  status.stripe.secretKeyMode === 'live' ? 'sk_live_' : 'unknown',
        },
        publishableKey: {
          mode: status.stripe.publishableKeyMode,
          isSet: status.stripe.publishableKeyMode !== 'missing',
          prefix: status.stripe.publishableKeyMode === 'test' ? 'pk_test_' : 
                  status.stripe.publishableKeyMode === 'live' ? 'pk_live_' : 'unknown',
        },
        isTestMode: status.stripe.isTestMode,
      },
      paystack: {
        secretKey: {
          mode: status.paystack.secretKeyMode,
          isSet: status.paystack.secretKeyMode !== 'missing',
          prefix: status.paystack.secretKeyMode === 'test' ? 'sk_test_' : 
                  status.paystack.secretKeyMode === 'live' ? 'sk_live_' : 'unknown',
        },
        publicKey: {
          mode: status.paystack.publicKeyMode,
          isSet: status.paystack.publicKeyMode !== 'missing',
          prefix: status.paystack.publicKeyMode === 'test' ? 'pk_test_' : 
                  status.paystack.publicKeyMode === 'live' ? 'pk_live_' : 'unknown',
        },
        isTestMode: status.paystack.isTestMode,
      },
      recommendations: generateRecommendations(status),
    });
  } catch (error: any) {
    console.error('Error checking payment mode:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to check payment mode' 
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(status: ReturnType<typeof getPaymentModeStatus>): string[] {
  const recommendations: string[] = [];
  
  // Stripe recommendations
  if (status.stripe.secretKeyMode === 'test' || status.stripe.publishableKeyMode === 'test') {
    recommendations.push('Stripe is in TEST mode. To switch to production:');
    recommendations.push('  - Replace STRIPE_SECRET_KEY with a key starting with "sk_live_"');
    recommendations.push('  - Replace NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY with a key starting with "pk_live_"');
  }
  
  if (status.stripe.secretKeyMode === 'missing') {
    recommendations.push('STRIPE_SECRET_KEY is missing');
  }
  
  if (status.stripe.publishableKeyMode === 'missing') {
    recommendations.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing');
  }
  
  if (status.stripe.secretKeyMode === 'live' && status.stripe.publishableKeyMode === 'test') {
    recommendations.push('⚠️ Stripe secret key is LIVE but publishable key is TEST - they must match!');
  }
  
  if (status.stripe.secretKeyMode === 'test' && status.stripe.publishableKeyMode === 'live') {
    recommendations.push('⚠️ Stripe secret key is TEST but publishable key is LIVE - they must match!');
  }
  
  // Paystack recommendations
  if (status.paystack.secretKeyMode === 'test' || status.paystack.publicKeyMode === 'test') {
    recommendations.push('Paystack is in TEST mode. To switch to production:');
    recommendations.push('  - Replace PAYSTACK_SECRET_KEY with a key starting with "sk_live_"');
    recommendations.push('  - Replace NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY with a key starting with "pk_live_"');
  }
  
  if (status.paystack.secretKeyMode === 'missing') {
    recommendations.push('PAYSTACK_SECRET_KEY is missing');
  }
  
  if (status.paystack.publicKeyMode === 'missing') {
    recommendations.push('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is missing');
  }
  
  if (status.paystack.secretKeyMode === 'live' && status.paystack.publicKeyMode === 'test') {
    recommendations.push('⚠️ Paystack secret key is LIVE but public key is TEST - they must match!');
  }
  
  if (status.paystack.secretKeyMode === 'test' && status.paystack.publicKeyMode === 'live') {
    recommendations.push('⚠️ Paystack secret key is TEST but public key is LIVE - they must match!');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ All payment keys are configured for production mode');
  }
  
  return recommendations;
}



