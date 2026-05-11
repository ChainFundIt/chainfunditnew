import { useState } from 'react';
import { PaymentProvider } from '@/lib/payments/config';

export interface DonationData {
  campaignId: string;
  amount: number;
  currency: string;
  paymentProvider: PaymentProvider;
  message?: string;
  isAnonymous?: boolean;
  email?: string;
  donorName?: string;
  donorPhone?: string;
  chainerId?: string | null;
}

export interface DonationResult {
  success: boolean;
  provider?: PaymentProvider;
  donationId?: string;
  // Stripe specific
  clientSecret?: string;
  paymentIntentId?: string;
  // Paystack specific
  authorization_url?: string;
  reference?: string;
  // PayPal specific
  approvalUrl?: string;
  orderId?: string;
  // Error
  error?: string;
  /** Extra context from API (e.g. Postgres / PayPal message) */
  details?: string;
}

export function useDonations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeDonation = async (
    donationData: DonationData,
    simulate: boolean = false
  ): Promise<DonationResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...donationData,
          simulate,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        const combined = [result.error, result.details].filter(Boolean).join(" — ");
        setError(combined || result.error);
        return {
          success: false,
          error: combined || result.error,
          details: result.details,
        };
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize donation';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = async (
    donationId: string,
    success: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donationId,
          success,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to simulate payment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentStatus = async (
    donationId: string,
    status: 'completed' | 'failed' | 'pending'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donationId,
          status,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to simulate payment status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const processDonation = async (donationData: DonationData): Promise<DonationResult> => {
    const result = await initializeDonation(donationData);
    
    if (!result.success) {
      return result;
    }

    // For Stripe, you would typically handle the client-side payment confirmation here
    // For redirect-based providers, send the donor to the approval page
    if (result.provider === 'paystack' && result.authorization_url) {
      window.location.href = result.authorization_url;
    } else if (result.provider === 'paypal' && result.approvalUrl) {
      window.location.href = result.approvalUrl;
    }

    return result;
  };

  const processTestDonation = async (donationData: DonationData): Promise<DonationResult> => {
    // First initialize the donation in simulation mode
    const initResult = await initializeDonation(donationData, true);
    
    if (!initResult.success || !initResult.donationId) {
      return initResult;
    }

    // Then simulate successful payment
    const simulateResult = await simulatePayment(initResult.donationId, true);
    
    if (!simulateResult.success) {
      return { success: false, error: simulateResult.error };
    }

    return {
      ...initResult,
      success: true,
    };
  };

  return {
    loading,
    error,
    initializeDonation,
    simulatePayment,
    simulatePaymentStatus,
    processDonation,
    processTestDonation,
  };
}
