import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6"><strong>Effective Date:</strong> January 1, 2024 | <strong>Version:</strong> 2.0</p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <p className="text-yellow-800 font-semibold">
                PLEASE READ THESE TERMS CAREFULLY. BY USING KARUTEENS, YOU AGREE TO BE BOUND BY THESE TERMS.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using the KaruTeens platform, operated by KaruTeens Productions, you agree to be bound by these Terms of Service, our Privacy Policy, Community Guidelines, and all applicable laws.
              </p>
              <p className="text-gray-700 mb-4">You represent that:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You are at least 13 years of age</li>
                <li>If under 18, you have parental/guardian consent</li>
                <li>You have legal capacity to enter binding agreements</li>
                <li>You are not barred from using the Service under applicable law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">KaruTeens provides:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Educational resources and study materials</li>
                <li>Collaborative study groups</li>
                <li>Mentorship connections</li>
                <li>Academic tools and utilities</li>
                <li>Career development resources</li>
                <li>Community forums and discussions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
              <p className="text-gray-700 mb-4">To access certain features, you must:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide accurate, current information</li>
                <li>Verify email address or phone number</li>
                <li>Create a secure password</li>
                <li>Complete profile requirements</li>
                <li>Verify student status (for student accounts)</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Security</h3>
              <p className="text-gray-700 mb-4">You are responsible for:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Maintaining password confidentiality</li>
                <li>All activities under your account</li>
                <li>Notifying us of unauthorized use</li>
                <li>Using strong, unique passwords</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Acceptable Use</h3>
              <p className="text-gray-700 mb-4">You agree to use the Service only for:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Lawful educational purposes</li>
                <li>Legitimate academic collaboration</li>
                <li>Constructive community participation</li>
                <li>Personal skill development</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Prohibited Conduct</h3>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-red-800 font-semibold mb-2">You may NOT:</p>
                <ul className="list-disc pl-6 text-red-700">
                  <li>Post illegal, harmful, or offensive content</li>
                  <li>Harass, bully, or intimidate others</li>
                  <li>Engage in plagiarism or cheating</li>
                  <li>Share exam questions or answers</li>
                  <li>Attempt unauthorized access</li>
                  <li>Use for unauthorized commercial purposes</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">KaruTeens Property</h3>
              <p className="text-gray-700 mb-4">We own all rights to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>The KaruTeens platform and software</li>
                <li>Our trademarks, logos, and branding</li>
                <li>Original content we create</li>
                <li>Platform design and functionality</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">User Content</h3>
              <p className="text-gray-700 mb-4">
                You retain ownership of content you create but grant us a license to use, reproduce, modify, and distribute your content for service provision.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Subscription and Payments</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Terms</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Advance payment required for premium plans</li>
                <li>Automatic renewal unless cancelled</li>
                <li>Price changes with 30-day notice</li>
                <li>Currency in Kenya Shillings (KES)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Refund Policy</h3>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <ul className="list-disc pl-6 text-green-700">
                  <li>14-day money-back guarantee</li>
                  <li>Pro-rated refunds for annual plans</li>
                  <li>Processing time: 5-10 business days</li>
                  <li>M-PESA refunds: Instant processing</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimers</h2>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 font-semibold mb-2">
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, INCLUDING:
                </p>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>MERCHANTABILITY</li>
                  <li>FITNESS FOR PARTICULAR PURPOSE</li>
                  <li>ACCURACY OR COMPLETENESS</li>
                  <li>UNINTERRUPTED OPERATION</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, KARUTEENS SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
              </p>
              <p className="text-gray-700 mb-4">
                Our total liability shall not exceed the amount paid by you in the past 12 months, or KES 3,000, whichever is lower.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Dispute Resolution</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Informal Resolution</h3>
              <p className="text-gray-700 mb-4">Before formal proceedings:</p>
              <ol className="list-decimal pl-6 text-gray-700 mb-4">
                <li>Contact support@karuteens.site</li>
                <li>Describe issue and desired resolution</li>
                <li>Good faith negotiation for 30 days</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Arbitration</h3>
              <p className="text-gray-700 mb-4">
                If informal resolution fails, binding arbitration is required under the Kenya Arbitration Act at the Nairobi Centre for International Arbitration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms are governed by the laws of the Republic of Kenya. Kenyan courts have jurisdiction, subject to the arbitration agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Community Guidelines</h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="text-blue-900 font-semibold mb-2">All users must:</h3>
                <ul className="list-disc pl-6 text-blue-800">
                  <li>Treat others with respect</li>
                  <li>Celebrate diversity and avoid discrimination</li>
                  <li>Maintain academic integrity</li>
                  <li>Prioritize safety, especially child safety</li>
                  <li>Use appropriate language</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
              <p className="text-gray-700 mb-4">
                You may terminate your account anytime by deleting it in settings or emailing support. We may terminate accounts for Terms violations, illegal activity, or safety concerns.
              </p>
              <p className="text-gray-700 mb-4">
                Upon termination, access is immediately revoked, content may be deleted, and you have a 30-day export period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Legal Inquiries:</strong> legal@karuteens.site</p>
                <p className="text-gray-700 mb-2"><strong>General Support:</strong> support@karuteens.site</p>
                <p className="text-gray-700"><strong>Phone:</strong> +254 700 123 460</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Acknowledgment</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-800 font-semibold">
                  BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD THESE TERMS AND AGREE TO BE BOUND BY THEM.
                </p>
              </div>
              <p className="text-gray-700 mt-4">
                <strong>Last Review Date:</strong> January 1, 2024<br/>
                <strong>Next Review Date:</strong> July 1, 2024
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