import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FeaturesPage() {
  const coreFeatures = [
    {
      title: "Study Groups & Collaboration",
      icon: "👥",
      features: [
        "Virtual Study Rooms: Create or join study rooms for any subject with video, voice, and text chat capabilities. Share screens, whiteboards, and documents in real-time.",
        "Group Projects: Collaborate on assignments with built-in task management, file sharing, and deadline tracking.",
        "Peer Learning Networks: Connect with students from your university or across Kenya studying similar subjects.",
        "Study Buddy Matching: AI-powered matching based on subjects, study style, and availability."
      ]
    },
    {
      title: "Academic Resources",
      icon: "📚",
      features: [
        "University Resources: Notes, assignments, and resources shared by students from major Kenyan universities including University of Nairobi, Kenyatta University, JKUAT, and more.",
        "Digital Library: Access to e-books, research papers, and academic journals relevant to your course of study.",
        "Video Tutorials: Curated educational content from verified educators covering various university subjects and curriculums.",
        "Course Materials: Comprehensive study materials organized by university, faculty, and specific courses."
      ]
    },
    {
      title: "Mentorship Program",
      icon: "🎯",
      features: [
        "Professional Mentors (coming soon): Connect with industry professionals and alumni for career guidance and real-world insights.",
        "Peer Mentors: Senior students helping juniors navigate academic challenges and university life.",
        "Structured Programs (coming soon): 3-month mentorship cycles with defined goals and progress tracking.",
        "Virtual Office Hours (coming soon): Schedule one-on-one sessions with mentors for personalized guidance."
      ]
    },
    {
      title: "Career Development",
      icon: "💼",
      features: [
        "Internship Board: Exclusive internship opportunities from Kenyan companies specifically for university students.",
        "CV Builder: Professional templates optimized for the Kenyan job market with industry-specific formats.",
        "Skills Assessments: Evaluate your competencies and get personalized improvement plans based on your field of study.",
        "Career Path Explorer: Discover career options based on your interests, subjects, and market demand in Kenya.",
        "Interview Preparation: Mock interviews with AI feedback and tips from HR professionals."
      ]
    }
  ];

  const additionalFeatures = [
    {
      title: "Student Life Management",
      icon: "📅",
      description: "Assignment Tracker: Never miss a deadline with smart reminders and calendar integration. Grade Calculator (private and optional): Track your academic performance and calculate required grades. Timetable Manager: Organize classes, study sessions, and extracurricular activities. Expense Tracker (private and optional): Budget management tools for students. Mental Health Resources: Access to counseling services and wellness content."
    },
    {
      title: "Community Features",
      icon: "🏫",
      description: "Campus Forums: University-specific discussion boards for announcements and conversations. Event Calendar: Discover academic competitions, workshops, and campus events. Clubs & Societies: Virtual spaces for student organizations. Achievement Showcase (optional): Build your academic portfolio with certificates and accomplishments."
    },
    {
      title: "Mobile-First Design",
      icon: "📱",
      description: "Offline Mode: Download content for studying without internet. Data Saver (coming soon): Optimized for low bandwidth usage. SMS Integration (coming soon): Receive important updates via SMS. WhatsApp Bot (coming soon): Quick access to resources through WhatsApp. USSD Access (coming soon): Basic features accessible via USSD for feature phones."
    },
    {
      title: "Accessibility Features",
      icon: "♿",
      description: "Screen Reader Support (coming soon): Full compatibility with assistive technologies. Multiple Languages (coming soon): Interface available in English, Kiswahili, and local languages. Adjustable Text Size (coming soon): Customizable display for visual comfort. Keyboard Navigation: Complete functionality without mouse. Audio Descriptions (coming soon): Voice narration for visual content."
    }
  ];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Features - Empowering Kenyan University Students
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
          >
            Comprehensive platform designed specifically for university students in Kenya. Connect, collaborate, and excel in your higher education journey.
          </motion.p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">🎯 Core Learning Features</h2>
            <p className="text-xl text-gray-600">Comprehensive tools designed specifically for Kenyan university students</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-6">
                  <span className="text-4xl mr-4">{feature.icon}</span>
                  <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                <ul className="space-y-3">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Complete University Experience</h2>
            <p className="text-xl text-gray-600">Beyond academics - tools for your entire university journey in Kenya</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of Kenyan university students already using KaruTeens to excel in their studies and build successful careers.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Today
            </Link>
            <Link href="/pricing" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              View Pricing
            </Link>
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