import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function PrivacyPage() {
  const router = useRouter();
  
  // Prevent any auth redirects for public pages
  useEffect(() => {
    // This is a public page, no auth required
  }, []);
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
            <Link href="/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign In</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6"><strong>Effective Date:</strong> January 1, 2024 | <strong>Version:</strong> 2.0</p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                KaruTeens Productions operates the KaruTeens platform (karuteens.site). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
              <p className="text-gray-700 mb-4">
                We are committed to protecting your privacy and ensuring the security of your personal information. As an education technology platform serving Kenyan students, we recognize the special responsibility we have in handling data, particularly for minors.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">Contact Information</h3>
                <p className="text-blue-800">Data Protection Officer: dpo@karuteens.site</p>
                <p className="text-blue-800">Office of the Data Protection Commissioner Registration: DPA/REG/2024/001234</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Information You Provide</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Account information (name, email, phone, school)</li>
                <li>Profile information and academic details</li>
                <li>Content you create (posts, messages, study materials)</li>
                <li>Payment information (M-PESA transactions)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Information Collected Automatically</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Device information and IP address</li>
                <li>Usage patterns and interaction metrics</li>
                <li>Location information (city/region from IP)</li>
                <li>Cookies and tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide and improve our educational services</li>
                <li>Facilitate study group collaboration and mentorship</li>
                <li>Send important service updates and notifications</li>
                <li>Personalize content and recommendations</li>
                <li>Ensure safety and security of the platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-red-800 font-semibold">We DO NOT sell your personal data to third parties.</p>
              </div>
              <p className="text-gray-700 mb-4">We may share information with:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Other users (public profile information in study groups)</li>
                <li>Service providers (hosting, payment processing, analytics)</li>
                <li>Educational institutions (with your consent)</li>
                <li>Parents/guardians (for users under 18)</li>
                <li>Legal authorities (when required by law)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>TLS 1.3 encryption for all data transmission</li>
                <li>AES-256 encryption for stored data</li>
                <li>Multi-factor authentication available</li>
                <li>24/7 security monitoring</li>
                <li>Regular security audits and penetration testing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">Under the Kenya Data Protection Act, you have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your data ("right to be forgotten")</li>
                <li>Object to processing</li>
                <li>Data portability</li>
                <li>Restrict processing</li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise these rights, email: <a href="mailto:privacy@karuteens.site" className="text-blue-600 hover:underline">privacy@karuteens.site</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <p className="text-yellow-800">
                  <strong>Minimum age:</strong> 13 years. Users 13-17 require parental consent.
                </p>
              </div>
              <p className="text-gray-700 mb-4">Enhanced protections for minors include:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Age-appropriate content filtering</li>
                <li>Enhanced moderation and safety measures</li>
                <li>Parental control options</li>
                <li>Limited data collection</li>
                <li>No targeted advertising</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 border-b text-left">Data Type</th>
                      <th className="px-4 py-2 border-b text-left">Active Account</th>
                      <th className="px-4 py-2 border-b text-left">After Deletion</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-b">Account Information</td>
                      <td className="px-4 py-2 border-b">Duration of account</td>
                      <td className="px-4 py-2 border-b">30 days (recovery period)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">Educational Content</td>
                      <td className="px-4 py-2 border-b">Duration of account</td>
                      <td className="px-4 py-2 border-b">Anonymized and retained</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">Payment Records</td>
                      <td className="px-4 py-2 border-b">7 years</td>
                      <td className="px-4 py-2 border-b">7 years (legal requirement)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Privacy Inquiries:</strong> privacy@karuteens.site</p>
                <p className="text-gray-700 mb-2"><strong>Data Protection Officer:</strong> dpo@karuteens.site</p>
                <p className="text-gray-700 mb-2"><strong>Rights Requests:</strong> rights@karuteens.site</p>
                <p className="text-gray-700">
                  <strong>Office of the Data Protection Commissioner:</strong><br/>
                  Website: www.odpc.go.ke | Email: info@odpc.go.ke | Phone: +254 20 2313199
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes via email and platform notifications 30 days in advance.
              </p>
              <p className="text-gray-700">
                <strong>Last Updated:</strong> January 1, 2024<br/>
                <strong>Next Review:</strong> July 1, 2024
              </p>
            </section>
          </div>
        </div>
      </div>

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