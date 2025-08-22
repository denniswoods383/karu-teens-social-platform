import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [faqItems, setFaqItems] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    loadFAQ();
  }, []);
  
  const loadFAQ = async () => {
    try {
      const { data } = await supabase
        .from('faq_items')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (data && data.length > 0) {
        setFaqItems(data);
      } else {
        // Fallback to hardcoded FAQ if table is empty
        setFaqItems(defaultFAQ);
      }
    } catch (error) {
      console.error('Failed to load FAQ:', error);
      setFaqItems(defaultFAQ);
    }
  };
  
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id,
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
          status: 'open'
        });
      
      if (!error) {
        alert('Message sent successfully! We\'ll get back to you soon.');
        setContactForm({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const defaultFAQ = [
    {
      question: "How do I create a post?",
      answer: "Click the 'What's on your mind?' box on your feed, type your message, and click 'Post'."
    },
    {
      question: "How do I follow comrades?",
      answer: "Go to the Comrades page and click 'nimekumark' next to users you want to follow."
    },
    {
      question: "How do I send messages?",
      answer: "Click on Messages in the navigation bar or click the message icon to start a conversation."
    },
    {
      question: "How do I edit my profile?",
      answer: "Click on your profile picture in the top right, then select 'Edit Profile'."
    },
    {
      question: "How do I report inappropriate content?",
      answer: "Click the three dots (⋯) on any post and select 'Report Post' to flag inappropriate content."
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <EnhancedNavbar />
        
        <div className="max-w-3xl mx-auto px-4 pt-20 pb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b">
              <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
              <p className="text-gray-600 mt-2">Find answers to common questions</p>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-4">
                  {faqItems.filter(item => 
                    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">📧 Email Support</h3>
                  <p className="text-blue-700 mb-3">Get help via email</p>
                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                    <textarea
                      placeholder="How can we help?"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                      required
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-2">💬 Quick Help</h3>
                  <p className="text-green-700 mb-3">Common solutions</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => alert('Try refreshing the page or clearing your browser cache.')}
                      className="block w-full text-left text-green-600 hover:underline text-sm"
                    >
                      • Page not loading?
                    </button>
                    <button 
                      onClick={() => alert('Check your internet connection and try again.')}
                      className="block w-full text-left text-green-600 hover:underline text-sm"
                    >
                      • Can't send messages?
                    </button>
                    <button 
                      onClick={() => alert('Go to Settings > Account to update your profile.')}
                      className="block w-full text-left text-green-600 hover:underline text-sm"
                    >
                      • Update profile info?
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🐛 Report a Bug</h3>
                <p className="text-gray-600 mb-4">Found an issue? Let us know!</p>
                <button 
                  onClick={() => window.open('/feedback', '_blank')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Report Bug
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}