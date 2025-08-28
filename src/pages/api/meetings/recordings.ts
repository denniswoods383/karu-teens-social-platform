import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { meeting_id, recording_url, duration } = req.body;
      
      const { data, error } = await supabase
        .from('meeting_recordings')
        .insert({
          meeting_id,
          recording_url,
          duration,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save recording' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}