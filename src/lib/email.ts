interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (data: EmailData) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};

export const emailTemplates = {
  newMessage: (senderName: string, message: string) => ({
    subject: `New message from ${senderName}`,
    html: `
      <h2>You have a new message!</h2>
      <p><strong>${senderName}</strong> sent you a message:</p>
      <blockquote style="background:#f5f5f5;padding:15px;border-left:4px solid #2563eb;">
        ${message}
      </blockquote>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" style="background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">View Message</a>
    `
  }),
  
  newFollower: (followerName: string) => ({
    subject: `${followerName} started following you`,
    html: `
      <h2>New Follower!</h2>
      <p><strong>${followerName}</strong> is now following you on Karu Teens.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" style="background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">View Profile</a>
    `
  }),
  
  marketplaceInquiry: (buyerName: string, itemTitle: string) => ({
    subject: `Someone is interested in your ${itemTitle}`,
    html: `
      <h2>Marketplace Inquiry</h2>
      <p><strong>${buyerName}</strong> is interested in your item: <strong>${itemTitle}</strong></p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" style="background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reply Now</a>
    `
  })
};