import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    category: '',
    message: '',
    urgency: 'medium'
  });

  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Response time: Within 24 hours',
      contact: 'support@karuteens.site',
      hours: 'Monday-Friday, 8 AM - 8 PM EAT',
      icon: '📧',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our team',
      contact: 'Available soon (check mhesh page)',
      hours: 'Monday-Friday, 9 AM - 6 PM EAT',
      icon: '📱',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'WhatsApp Support',
      description: 'Quick responses via WhatsApp',
      contact: 'Available soon (check mhesh page)',
      hours: 'Send screenshots for faster resolution',
      icon: '💬',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Emergency Support',
      description: 'For urgent safety concerns',
      contact: 'safety@karuteens.site',
      hours: 'Monitored 24/7 - Response within 1 hour',
      icon: '🚨',
      color: 'from-red-500 to-red-600'
    }
  ];

  const specializedSupport = [
    { title: 'Technical Issues', email: 'tech@karuteens.site' },
    { title: 'Billing Questions', email: 'billing@karuteens.site' },
    { title: 'Security Concerns', email: 'security@karuteens.site' },
    { title: 'Partnerships', email: 'partners@karuteens.site' },
    { title: 'Media Inquiries', email: 'press@karuteens.site' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
              <Link href="/help" className="text-gray-600 hover:text-blue-600">Help</Link>
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
            📬 We're Here to Help
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-8"
          >
            Get in touch with our support team for any questions or assistance you need
          </motion.p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600">Choose the best way to reach us</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className={`bg-gradient-to-r ${method.color} p-6 text-white text-center`}>
                  <div className="text-4xl mb-2">{method.icon}</div>
                  <h3 className="text-xl font-bold">{method.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <div className="space-y-2">
                    <p className="font-semibold text-blue-600">{method.contact}</p>
                    <p className="text-sm text-gray-500">{method.hours}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
              <p className="text-gray-600">Fill out the form below and we'll get back to you as soon as possible</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+254 700 123 456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    School/Institution
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your school name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="account">Account Issues</option>
                    <option value="safety">Safety & Privacy</option>
                    <option value="feature">Feature Request</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message * (500 characters minimum)
                </label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your issue or question in detail..."
                ></textarea>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.message.length}/500 characters minimum
                </p>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Specialized Support */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Specialized Support</h2>
            <p className="text-xl text-gray-600">Direct contact for specific issues</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializedSupport.map((support, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{support.title}</h3>
                <a 
                  href={`mailto:${support.email}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {support.email}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Response Time Commitment */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Our Response Time Commitment</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">1 Hour</div>
              <div className="text-sm">Critical Issues</div>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">4 Hours</div>
              <div className="text-sm">High Priority</div>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">24 Hours</div>
              <div className="text-sm">Medium Priority</div>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">48 Hours</div>
              <div className="text-sm">Low Priority</div>
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