import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    
    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = callbackMetadata.find((item: any) => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      // Update payment status
      const { data: payment } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_date: transactionDate,
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', checkoutRequestId)
        .select()
        .single();

      if (payment) {
        // Activate premium for user
        await supabase
          .from('user_profiles')
          .update({
            is_premium: true,
            premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          })
          .eq('user_id', payment.user_id);
      }
    } else {
      // Payment failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          error_message: stkCallback.ResultDesc,
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', checkoutRequestId);
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ error: error.message });
  }
}