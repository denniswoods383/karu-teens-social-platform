import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('');
  const [message, setMessage] = useState('');

  const popularRequests = [
    { title: "Dark mode for late-night studying", votes: 2341 },
    { title: "Pomodoro timer integration", votes: 1876 },
    { title: "Offline video downloads", votes: 1654 },
    { title: "Voice notes in study groups", votes: 1432 },
    { title: "AI homework helper", votes: 1298 }
  ];

  const recentImprovements = [
    "Added offline mode (2,341 requests)",
    "Improved search functionality (1,876 requests)",
    "Enhanced mobile app speed (1,654 requests)",
    "Added Kiswahili language option (1,298 requests)",
    "Introduced group video calls (987 requests)"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link href="/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-6">
            💬 Your Voice Shapes KaruTeens
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl mb-8">
            Share your feedback, request features, and help us build the best platform for Kenyan students
          </motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Share Your Feedback</h2>
            
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-700 mb-4">How's your experience?</p>
              <div className="flex justify-center space-x-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className={`text-4xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-700 mb-4">What would you like to share?</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Bug Report', 'Feature Request', 'Compliment', 'Complaint', 'Suggestion', 'Other'].map((type) => (
                  <button key={type} onClick={() => setFeedbackType(type)} className={`p-3 rounded-lg border-2 transition-colors ${feedbackType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-2">Tell us more:</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} maxLength={1000} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Share your thoughts, suggestions, or report issues..."></textarea>
              <p className="text-sm text-gray-500 mt-1">{message.length}/1000 characters</p>
            </div>

            <div className="text-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">🚀 Popular Feature Requests</h2>
              <div className="space-y-4">
                {popularRequests.map((request, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                    <span className="text-gray-700">{request.title}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600 font-semibold">👍 {request.votes.toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Submit New Request
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">✅ Recent Improvements</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 mb-4">Based on your feedback, we've implemented:</p>
                <ul className="space-y-3">
                  {recentImprovements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✅</span>
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">What Users Are Saying</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">4.6/5</div>
                <div className="text-sm text-gray-600">Overall Satisfaction</div>
                <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">4.4/5</div>
                <div className="text-sm text-gray-600">App Performance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">4.7/5</div>
                <div className="text-sm text-gray-600">Content Quality</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">4.8/5</div>
                <div className="text-sm text-gray-600">Customer Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">4.5/5</div>
                <div className="text-sm text-gray-600">Value for Money</div>
              </div>
            </div>
            <p className="text-gray-600">Based on feedback from the last 30 days</p>
          </div>
        </div>
      </section>

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