import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { error } = await supabase
      .from('error_logs')
      .insert({
        message: req.body.message,
        stack: req.body.stack,
        url: req.body.url,
        user_id: req.body.userId,
        context: req.body.context,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error logging failed:', error);
    res.status(500).json({ error: 'Failed to log error' });
  }
}