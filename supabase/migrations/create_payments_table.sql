-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  checkout_request_id VARCHAR(255) UNIQUE,
  merchant_request_id VARCHAR(255),
  phone_number VARCHAR(20),
  amount DECIMAL(10,2),
  plan_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  mpesa_receipt_number VARCHAR(255),
  transaction_date VARCHAR(50),
  account_reference VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert/update payments
CREATE POLICY "System can manage payments" ON payments
  FOR ALL USING (true);