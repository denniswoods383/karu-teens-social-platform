import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedArticles, setExpandedArticles] = useState<{[key: number]: boolean}>({});
  
  const toggleArticle = (index: number) => {
    setExpandedArticles(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'account', name: 'Account Management', icon: '👤' },
    { id: 'billing', name: 'Billing & Payments', icon: '💳' },
    { id: 'safety', name: 'Safety & Privacy', icon: '🛡️' },
    { id: 'technical', name: 'Technical Support', icon: '🔧' }
  ];

  const helpArticles = [
    {
      category: 'getting-started',
      title: 'Creating Your Account',
      description: 'Step-by-step guide to sign up and verify your university student status',
      content: [
        'Visit karuteens.site or download our mobile app',
        'Click "Sign Up" and choose your account type (Student/Teacher/Parent)',
        'Enter your email or phone number',
        'Verify via SMS/email code',
        'Complete your profile with university information',
        'Upload university student ID for verification (optional for premium features)'
      ]
    },
    {
      category: 'getting-started',
      title: 'Navigation Guide',
      description: 'Learn how to navigate the KaruTeens platform',
      content: [
        'Dashboard: Your personalized home with activity feed and quick actions',
        'Study Groups: Find and create collaborative learning spaces',
        'Resources: Access university study materials and notes',
        'Mentorship: Connect with mentors and track progress',
        'Calendar: Manage your academic schedule',
        'Profile: Update settings and view achievements'
      ]
    },
    {
      category: 'account',
      title: 'Password & Login Issues',
      description: 'Troubleshoot login problems and reset your password',
      content: [
        'Forgot Password: Click "Forgot Password" on login page',
        'Enter registered email/phone and check for reset code',
        'Create new password (8+ characters, mixed case, numbers)',
        'Enable Two-Factor Authentication in Settings > Security',
        'Contact support if account is suspended'
      ]
    },
    {
      category: 'billing',
      title: 'Payment Methods',
      description: 'Available payment options and how to use them',
      content: [
        'M-PESA: Enter phone number > Receive prompt > Enter PIN',
        'Card payments: Coming soon with 3D Secure verification',
        'PayPal: Coming soon for international students',
        'Bank Transfer: Coming soon for institutional plans'
      ]
    },
    {
      category: 'safety',
      title: 'Reporting & Blocking',
      description: 'How to report inappropriate content and block users',
      content: [
        'Click three dots on content/profile',
        'Select "Report" and choose category',
        'Add description (optional) and submit',
        'Review within 24 hours',
        'Blocking removes all communication and hides content'
      ]
    },
    {
      category: 'technical',
      title: 'System Requirements',
      description: 'Minimum requirements for optimal performance',
      content: [
        'Mobile: Android 5.0+ or iOS 12.0+, 2GB RAM minimum',
        'Web: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+',
        'Internet: 3G or better for full features',
        'Storage: 100MB for Android, 150MB for iOS'
      ]
    }
  ];

  const contactOptions = [
    {
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      contact: 'support@karuteens.site',
      hours: 'Monday-Friday, 8 AM - 8 PM EAT',
      icon: '📧'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      contact: 'Available soon (check mhesh page)',
      hours: 'Monday-Friday, 9 AM - 6 PM EAT',
      icon: '📱'
    },
    {
      title: 'WhatsApp Support',
      description: 'Quick responses via WhatsApp Business',
      contact: 'Available soon (check mhesh page)',
      hours: 'Send screenshots for faster resolution',
      icon: '💬'
    },
    {
      title: 'Emergency Support',
      description: 'For urgent safety concerns',
      contact: 'safety@karuteens.site',
      hours: 'Monitored 24/7 - Response within 1 hour',
      icon: '🚨'
    }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">K</span>
              </div>
              <span className="text-xl font-bold text-gray-900">KaruTeens</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/features" className="text-gray-600 hover:text-blue-600">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-blue-600">Pricing</Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
              <Link href="/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            📚 How Can We Help You?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-8"
          >
            Find answers to common questions and get the support you need
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 text-gray-900 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="absolute right-2 top-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg text-center transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-semibold">{category.name}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Help Articles */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.description}</p>
                <div className="space-y-2">
                  {(expandedArticles[index] ? article.content : article.content.slice(0, 3)).map((step, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700 text-sm whitespace-pre-line">{step}</span>
                    </div>
                  ))}
                  {(article.fullContent || article.content.length > 3) && (
                    <button 
                      onClick={() => toggleArticle(index)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      {expandedArticles[index] ? 'Show less...' : 'Read more...'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-xl text-gray-600">Our support team is here to assist you</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{option.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{option.title}</h3>
                <p className="text-gray-600 mb-4">{option.description}</p>
                <div className="space-y-2">
                  <p className="font-semibold text-blue-600">{option.contact}</p>
                  <p className="text-sm text-gray-500">{option.hours}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">System Requirements</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Mobile App</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Android: Version 5.0 or higher</li>
                  <li>• iOS: Version 12.0 or higher</li>
                  <li>• RAM: Minimum 2GB recommended</li>
                  <li>• Storage: 100MB (Android), 150MB (iOS)</li>
                  <li>• Internet: 3G or better for full features</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💻 Web Browser</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Chrome 90+, Firefox 88+</li>
                  <li>• Safari 14+, Edge 90+</li>
                  <li>• JavaScript enabled</li>
                  <li>• Cookies enabled for login</li>
                  <li>• 1024x768 minimum resolution</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">K</span>
                </div>
                <span className="text-xl font-bold">KaruTeens</span>
              </div>
              <p className="text-gray-400">Empowering Kenyan students through technology.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/security">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/feedback">Feedback</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 KaruTeens Productions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}