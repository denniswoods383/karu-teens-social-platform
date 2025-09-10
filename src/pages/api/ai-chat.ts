import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, attachments } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'KaruTeens Study Assistant'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI study assistant for Kenyan university students. You specialize in:
- Academic subjects and coursework
- Study strategies and tips
- Assignment and homework help
- Exam preparation
- Career guidance
- Research assistance

Always provide accurate, helpful, and encouraging responses. When helping with assignments, guide students to understand concepts rather than just giving answers. Be culturally aware of the Kenyan education system.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.status(200).json({
        success: true,
        response: data.choices[0].message.content
      });
    } else {
      throw new Error('Invalid response from OpenRouter');
    }
  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get AI response. Please try again.'
    });
  }
}