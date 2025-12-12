-- Test Donations SQL Script
-- This script creates test donations for 2 campaigns with different statuses
-- Campaign IDs:
-- Campaign 1: a7e25ad6-46a3-42a1-8d44-bb321ac43646
-- Campaign 2: dc690b6e-94ea-4616-b6f0-4986c15d5c64

-- Note: This script uses the first 5 users from your database as donors
-- If you want to use specific users, replace the subqueries with specific user UUIDs

-- For Campaign 1: Pending, Completed, and Failed donations
INSERT INTO donations (
  id,
  campaign_id,
  donor_id,
  amount,
  currency,
  payment_status,
  payment_method,
  payment_intent_id,
  message,
  is_anonymous,
  created_at,
  processed_at,
  retry_attempts,
  failure_reason,
  last_status_update,
  provider_status,
  provider_error
) VALUES
-- Campaign 1 - Pending donation
(
  gen_random_uuid(),
  'a7e25ad6-46a3-42a1-8d44-bb321ac43646', -- Campaign 1
  (SELECT id FROM users LIMIT 1 OFFSET 0), -- First user as donor
  50.00,
  'USD',
  'pending',
  'stripe',
  'pi_test_pending_' || substr(gen_random_uuid()::text, 1, 20),
  'Test pending donation message',
  false,
  NOW(),
  NULL,
  0,
  NULL,
  NOW(),
  'requires_payment_method',
  NULL
),
-- Campaign 1 - Completed donation
(
  gen_random_uuid(),
  'a7e25ad6-46a3-42a1-8d44-bb321ac43646', -- Campaign 1
  (SELECT id FROM users LIMIT 1 OFFSET 1), -- Second user as donor
  100.00,
  'USD',
  'completed',
  'stripe',
  'pi_test_completed_' || substr(gen_random_uuid()::text, 1, 20),
  'Test successful donation message',
  false,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days',
  0,
  NULL,
  NOW() - INTERVAL '2 days',
  'succeeded',
  NULL
),
-- Campaign 1 - Failed donation
(
  gen_random_uuid(),
  'a7e25ad6-46a3-42a1-8d44-bb321ac43646', -- Campaign 1
  (SELECT id FROM users LIMIT 1 OFFSET 2), -- Third user as donor
  25.00,
  'USD',
  'failed',
  'stripe',
  'pi_test_failed_' || substr(gen_random_uuid()::text, 1, 20),
  'Test failed donation message',
  false,
  NOW() - INTERVAL '1 day',
  NULL,
  2,
  'Card declined: insufficient funds',
  NOW() - INTERVAL '1 day',
  'payment_failed',
  'Your card was declined.'
),
-- Campaign 2 - Pending donation
(
  gen_random_uuid(),
  'dc690b6e-94ea-4616-b6f0-4986c15d5c64', -- Campaign 2
  (SELECT id FROM users LIMIT 1 OFFSET 3), -- Fourth user as donor
  75.00,
  'USD',
  'pending',
  'paystack',
  'paystack_test_pending_' || substr(gen_random_uuid()::text, 1, 20),
  'Test pending donation for campaign 2',
  false,
  NOW(),
  NULL,
  0,
  NULL,
  NOW(),
  'pending',
  NULL
),
-- Campaign 2 - Completed donation
(
  gen_random_uuid(),
  'dc690b6e-94ea-4616-b6f0-4986c15d5c64', -- Campaign 2
  (SELECT id FROM users LIMIT 1 OFFSET 4), -- Fifth user as donor
  150.00,
  'USD',
  'completed',
  'paystack',
  'paystack_test_completed_' || substr(gen_random_uuid()::text, 1, 20),
  'Test successful donation for campaign 2',
  false,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  0,
  NULL,
  NOW() - INTERVAL '3 days',
  'success',
  NULL
),
-- Campaign 2 - Failed donation
(
  gen_random_uuid(),
  'dc690b6e-94ea-4616-b6f0-4986c15d5c64', -- Campaign 2
  (SELECT id FROM users LIMIT 1 OFFSET 0), -- First user as donor
  30.00,
  'USD',
  'failed',
  'paystack',
  'paystack_test_failed_' || substr(gen_random_uuid()::text, 1, 20),
  'Test failed donation for campaign 2',
  false,
  NOW() - INTERVAL '5 hours',
  NULL,
  1,
  'Transaction timeout',
  NOW() - INTERVAL '5 hours',
  'failed',
  'The transaction timed out. Please try again.'
);

-- Verify the donations were created
SELECT 
  d.id,
  c.title as campaign_title,
  u.email as donor_email,
  d.amount,
  d.currency,
  d.payment_status,
  d.payment_method,
  d.created_at
FROM donations d
JOIN campaigns c ON d.campaign_id = c.id
JOIN users u ON d.donor_id = u.id
WHERE d.payment_intent_id LIKE '%test_%'
ORDER BY d.created_at DESC;

