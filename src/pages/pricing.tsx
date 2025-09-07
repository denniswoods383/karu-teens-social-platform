import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: "Free - Basic",
      price: "KSh 0",
      period: "/month",
      description: "Perfect for university students getting started",
      features: [
        "Access to public study groups (up to 5)",
        "Basic resource library (university materials)",
        "Community forums participation",
        "Assignment tracker (up to 10 active)",
        "Basic grade calculator",
        "Mobile app access (coming soon)",
        "100MB cloud storage",
        "Email support"
      ],
      notIncluded: [
        "Private study rooms",
        "Premium resources",
        "Mentorship matching",
        "Career development tools",
        "Priority support"
      ],
      buttonText: "Start Free",
      buttonStyle: "bg-gray-600 hover:bg-gray-700",
      popular: false
    },
    {
      name: "Student Pro",
      price: "KSh 40",
      period: "/month",
      weeklyPrice: "KSh 10/week",
      description: "Everything you need to excel in university",
      features: [
        "Everything in Free, plus:",
        "Unlimited study groups and private rooms",
        "Full resource library access (all university subjects and levels)",
        "Mentorship program (2 mentors/month)",
        "Career development suite",
        "CV builder and templates",
        "Internship board early access",
        "Advanced analytics and progress tracking",
        "5GB cloud storage",
        "Offline downloads (unlimited)",
        "Priority email and chat support",
        "Verified student badge",
        "No ads"
      ],
      buttonText: "Start 14-Day Free Trial",
      buttonStyle: "bg-blue-600 hover:bg-blue-700",
      popular: true
    },
    {
      name: "Premium Plus",
      price: "KSh 100",
      period: "/month",
      yearlyPrice: "KSh 1,200/year",
      description: "For serious university students and final year candidates",
      features: [
        "Everything in Student Pro, plus:",
        "1-on-1 tutoring sessions (4 hours/month)",
        "Exclusive masterclasses with top educators",
        "Personal academic advisor",
        "Premium mentorship (unlimited)",
        "Mock exam simulations with detailed feedback",
        "Personalized study plans",
        "Early access to new features",
        "20GB cloud storage",
        "API access for integrations",
        "Phone support",
        "Success guarantee or money back*"
      ],
      buttonText: "Start 14-Day Free Trial",
      buttonStyle: "bg-purple-600 hover:bg-purple-700",
      popular: false
    }
  ];

  const institutionalPlans = [
    {
      name: "School Basic",
      price: "KSh 3,500",
      period: "/month",
      users: "up to 100 students",
      features: [
        "All Premium features for students",
        "Teacher dashboard and controls",
        "School-branded space",
        "Analytics and reporting",
        "Bulk user management",
        "Training and onboarding"
      ]
    },
    {
      name: "School Premium",
      price: "KSh 5,999",
      period: "/month",
      users: "up to 500 students",
      features: [
        "Everything in School Basic",
        "Custom integrations",
        "Dedicated support manager",
        "Professional development for teachers",
        "Parent portal access",
        "Advanced security features"
      ]
    }
  ];

  const paymentMethods = [
    { name: "M-PESA", description: "Instant activation", available: true },
    { name: "Bank Transfer", description: "For institutional plans", available: false },
    { name: "Credit/Debit Cards", description: "Visa, Mastercard", available: false },
    { name: "PayPal", description: "For international payments", available: false }
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
              <Link href="/features" className="text-gray-600 hover:text-blue-600">Features</Link>
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
            💡 Choose Your Learning Journey
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-8"
          >
            Flexible pricing plans designed for every Kenyan university student's needs and budget
          </motion.p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white rounded-xl shadow-lg p-8 relative ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  {plan.weeklyPrice && (
                    <p className="text-sm text-gray-600">{plan.weeklyPrice} (Save 7%)</p>
                  )}
                  {plan.yearlyPrice && (
                    <p className="text-sm text-gray-600">or {plan.yearlyPrice}</p>
                  )}
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">✅ Included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.notIncluded && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">❌ Not Included:</h4>
                      <ul className="space-y-2">
                        {plan.notIncluded.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-500 mr-2 mt-1">✗</span>
                            <span className="text-gray-500 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${plan.buttonStyle}`}>
                  {plan.buttonText}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Plans */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Institutional Plans</h2>
            <p className="text-xl text-gray-600">Special pricing for universities and educational institutions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {institutionalPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">({plan.users})</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Contact Sales
                </button>
              </motion.div>
            ))}

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl shadow-lg p-8"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="mb-2">
                  <span className="text-2xl font-bold">Custom Pricing</span>
                </div>
                <p className="opacity-90">(500+ students)</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-300 mr-2 mt-1">✓</span>
                  <span>Fully customized solution</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-300 mr-2 mt-1">✓</span>
                  <span>On-premise deployment option</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-300 mr-2 mt-1">✓</span>
                  <span>SLA guarantees</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-300 mr-2 mt-1">✓</span>
                  <span>Custom features development</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-300 mr-2 mt-1">✓</span>
                  <span>Comprehensive training program</span>
                </li>
              </ul>

              <button className="w-full py-3 px-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Contact Sales
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Payment Methods & Policies */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Payment Methods */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment Methods</h3>
              <div className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                    <div>
                      <h4 className="font-semibold text-gray-900">{method.name}</h4>
                      <p className="text-gray-600 text-sm">{method.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      method.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {method.available ? 'Available' : 'Coming Soon'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Guarantee</h3>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">14-day money-back guarantee</h4>
                      <p className="text-gray-600 text-sm">Full refund, no questions asked</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">No questions asked cancellation</h4>
                      <p className="text-gray-600 text-sm">Cancel anytime through your account</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">University student verification required</h4>
                      <p className="text-gray-600 text-sm">Upload university student ID or admission letter for discounted rates</p>
                    </div>
                  </div>
                </div>
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