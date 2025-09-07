import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SecurityPage() {
  const securityFeatures = [
    {
      title: "Data Protection",
      icon: "🔒",
      features: [
        "TLS 1.3 encryption for all data transmission",
        "AES-256 encryption for stored data",
        "End-to-end encryption for private study groups",
        "Encrypted database with field-level encryption"
      ]
    },
    {
      title: "Infrastructure Security",
      icon: "🛡️",
      features: [
        "Cloudflare enterprise DDoS protection",
        "Web application firewall with real-time threat detection",
        "24/7 security monitoring and incident response",
        "Daily automated backups with 30-day retention"
      ]
    },
    {
      title: "Account Security",
      icon: "🔐",
      features: [
        "Two-Factor Authentication (SMS, TOTP, email)",
        "Biometric login (fingerprint and face recognition)",
        "Single Sign-On (SSO) integration with schools",
        "Automatic timeout and suspicious activity detection"
      ]
    },
    {
      title: "Minor Protection",
      icon: "👶",
      features: [
        "Age verification and parental consent",
        "Enhanced protections for users under 16",
        "Age-appropriate content filtering",
        "Parental controls and monitoring options"
      ]
    }
  ];

  const compliance = [
    { name: "Kenya Data Protection Act (2019)", status: "Full Compliance" },
    { name: "GDPR Ready", status: "For European Users" },
    { name: "COPPA Compliant", status: "Children's Privacy Protection" },
    { name: "FERPA Aligned", status: "Educational Records Privacy" },
    { name: "ISO 27001", status: "In Progress" },
    { name: "SOC 2 Type II", status: "Security Controls" }
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
            🔒 Your Safety is Our Priority
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl mb-8">
            Enterprise-grade security protecting Kenyan students' data and privacy
          </motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-xl shadow-lg p-8">
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

      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compliance & Certifications</h2>
            <p className="text-xl text-gray-600">Meeting international security and privacy standards</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {compliance.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-blue-600 font-semibold">{item.status}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Report Security Issues</h2>
          <p className="text-xl mb-8">Help us keep KaruTeens secure by reporting vulnerabilities</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Security Email</h3>
              <p className="mb-2">security@karuteens.site</p>
              <p className="text-sm opacity-75">Response within 24 hours</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Bug Bounty Program</h3>
              <p className="mb-2">Up to KSh 5,000 for critical vulnerabilities</p>
              <p className="text-sm opacity-75">Responsible disclosure rewarded</p>
            </div>
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