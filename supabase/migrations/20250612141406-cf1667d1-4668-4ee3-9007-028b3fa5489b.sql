
-- Grant free premium access to louisegerrard@live.com
UPDATE public.subscribers 
SET 
  subscribed = true,
  subscription_tier = 'Premium',
  subscription_end = '2035-01-01 00:00:00+00'::timestamp with time zone,
  is_trial_active = false,
  legacy_pricing = true,
  price_amount = 1299,
  currency = 'gbp',
  updated_at = now()
WHERE email = 'louisegerrard@live.com';

-- Verify the update was successful
SELECT 
  email, 
  subscribed, 
  subscription_tier, 
  subscription_end, 
  is_trial_active, 
  legacy_pricing, 
  price_amount,
  currency
FROM public.subscribers 
WHERE email = 'louisegerrard@live.com';
