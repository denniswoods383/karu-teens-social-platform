import { NextApiRequest, NextApiResponse } from 'next';
import { initiateSTKPush } from '../../../lib/mpesa';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, amount, userId, planType } = req.body;

  if (!phoneNumber || !amount || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const accountReference = `KARU_${userId}_${Date.now()}`;
    
    // Initiate STK Push
    const mpesaResponse = await initiateSTKPush(phoneNumber, amount, accountReference);
    
    if (mpesaResponse.ResponseCode === '0') {
      // Store payment request in database
      await supabase.from('payments').insert({
        user_id: userId,
        checkout_request_id: mpesaResponse.CheckoutRequestID,
        merchant_request_id: mpesaResponse.MerchantRequestID,
        phone_number: phoneNumber,
        amount: amount,
        plan_type: planType,
        status: 'pending',
        account_reference: accountReference
      });

      res.status(200).json({
        success: true,
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        message: 'Payment request sent to your phone'
      });
    } else {
      res.status(400).json({
        success: false,
        error: mpesaResponse.errorMessage || 'Payment initiation failed'
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}