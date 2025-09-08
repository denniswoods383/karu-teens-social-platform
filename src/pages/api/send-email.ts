import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Karu Teens <noreply@karuteens.site>',
        to: [to],
        subject,
        html
      })
    });

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ error: 'Failed to send email' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Email service error' });
  }
}