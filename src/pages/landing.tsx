import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Lazy load non-critical components
const LazyFeatureGrid = dynamic(() => import('../components/landing/FeatureGrid'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />
});

export default function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "AI-Powered Study Assistant",
      description: "Get personalized help with homework, exam prep, and study planning",
      icon: "🤖",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      title: "Real-Time Study Groups",
      description: "Join virtual study sessions with classmates across Kenya",
      icon: "👥",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      title: "University Resources",
      description: "Access notes, assignments, and materials from major Kenyan universities",
      icon: "📚",
      gradient: "from-green-600 to-teal-600"
    },
    {
      title: "Secure Social Learning",
      description: "Connect safely with verified students and share knowledge",
      icon: "🔒",
      gradient: "from-orange-600 to-red-600"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Students", icon: "👨‍🎓" },
    { number: "1M+", label: "Study Sessions", icon: "📖" },
    { number: "95%", label: "Improved Grades", icon: "📈" },
    { number: "24/7", label: "AI Support", icon: "🤖" }
  ];

  return (
    <>
      <Head>
        <title>KaruTeens - Kenya's #1 University Student Platform | Study Smarter Together</title>
        <meta name="description" content="Join 50,000+ Kenyan university students excelling through AI-powered learning, study groups, and academic resources. Free to start, built for success." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="Kenya university students, study platform, AI tutoring, study groups, academic resources, KCSE, CBC, university prep" />
        
        {/* Open Graph */}
        <meta property="og:title" content="KaruTeens - Kenya's #1 University Student Platform" />
        <meta property="og:description" content="Join 50,000+ Kenyan university students excelling through AI-powered learning and collaboration." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://karuteens.site" />
        <meta property="og:image" content="https://karuteens.site/og-image.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="KaruTeens - Kenya's #1 University Student Platform" />
        <meta name="twitter:description" content="AI-powered learning platform for Kenyan university students" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "KaruTeens",
            "description": "Kenya's leading university student platform",
            "url": "https://karuteens.site",
            "logo": "https://karuteens.site/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+254-700-123-460",
              "contactType": "customer service",
              "email": "support@karuteens.site"
            },
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "KE"
            }
          })}
        </script>
        
        <link rel="canonical" href="https://karuteens.site" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://mmeqccelfchvnbvhqmws.supabase.co" />
        
        {/* Critical CSS for above-the-fold content */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .hero-gradient { background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%); }
            .btn-primary { background: linear-gradient(135deg, #9333ea, #ec4899); min-height: 48px; }
            .animate-blob { animation: blob 7s infinite; }
            @keyframes blob {
              0%, 100% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(30px, -50px) scale(1.1); }
              66% { transform: translate(-20px, 20px) scale(0.9); }
            }
          `
        }} />
      </Head>
      
      <div className="min-h-screen hero-gradient text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between p-6 bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <span className="text-2xl font-bold">
            Karu<span className="text-purple-400">Teens</span>
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-6"
        >
          <Link href="/features" className="text-purple-300 hover:text-white transition-colors text-sm">
            Features
          </Link>
          <Link href="/pricing" className="text-purple-300 hover:text-white transition-colors text-sm">
            Pricing
          </Link>
          <Link href="/help" className="text-purple-300 hover:text-white transition-colors text-sm">
            Help
          </Link>
          <Link href="/contact" className="text-purple-300 hover:text-white transition-colors text-sm">
            Contact
          </Link>
          <Link href="/auth/login" className="px-4 py-2 text-purple-300 hover:text-white transition-colors text-sm">
            Login
          </Link>
          <Link href="/auth/register" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 text-sm">
            Get Started Free
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Kenya's #1
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Student Platform
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of Kenyan university students excelling in their studies through AI-powered learning, 
              collaborative study groups, and comprehensive academic resources.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/auth/register')}
                className="btn-primary px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 focus:ring-4 focus:ring-purple-300 focus:outline-none transition-all duration-300 shadow-lg touch-manipulation"
                aria-label="Start learning for free - Sign up now"
              >
                Start Learning Free 🚀
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="min-h-[48px] px-8 py-4 border-2 border-purple-400 rounded-full text-lg font-semibold hover:bg-purple-400 hover:text-purple-900 focus:ring-4 focus:ring-purple-300 focus:outline-none transition-all duration-300 touch-manipulation"
                aria-label="Watch platform demo video"
              >
                Watch Demo 📹
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>100% Free to Start</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>University Focused</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Safe & Secure</span>
              </div>
            </div>
          </motion.div>

          {/* Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/30">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className={`text-6xl mb-4 bg-gradient-to-r ${features[currentFeature].gradient} bg-clip-text text-transparent`}>
                    {features[currentFeature].icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{features[currentFeature].title}</h3>
                  <p className="text-gray-300">{features[currentFeature].description}</p>
                </motion.div>
              </AnimatePresence>
              
              {/* Feature Dots */}
              <div className="flex justify-center space-x-2 mt-6">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentFeature ? 'bg-purple-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center bg-gradient-to-br from-purple-800/30 to-pink-800/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-purple-300 mb-1">{stat.number}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Excel in Your Studies
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From AI-powered tutoring to collaborative study groups, we've built the ultimate platform for Kenyan university students.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: "🎯",
              title: "Personalized Learning",
              description: "AI adapts to your learning style and pace for maximum efficiency",
              color: "from-blue-600 to-cyan-600"
            },
            {
              icon: "📱",
              title: "Mobile-First Design",
              description: "Study anywhere with our optimized mobile experience",
              color: "from-green-600 to-teal-600"
            },
            {
              icon: "🏆",
              title: "Gamified Progress",
              description: "Earn points, badges, and compete with friends while learning",
              color: "from-purple-600 to-pink-600"
            },
            {
              icon: "💬",
              title: "Real-Time Chat",
              description: "Get instant help from peers and mentors 24/7",
              color: "from-orange-600 to-red-600"
            },
            {
              icon: "📊",
              title: "Progress Analytics",
              description: "Track your improvement with detailed performance insights",
              color: "from-indigo-600 to-purple-600"
            },
            {
              icon: "🔐",
              title: "Safe Environment",
              description: "Verified students only, with robust privacy protection",
              color: "from-pink-600 to-rose-600"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-purple-800/30 to-pink-800/30 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
            >
              <div className={`text-4xl mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of Kenyan university students who are already achieving better grades with KaruTeens.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/register')}
              className="px-8 py-4 bg-white text-purple-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Get Started Free Today 🎉
            </motion.button>
            <div className="text-sm opacity-75">
              No credit card required • 100% Free to start
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/20 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">K</span>
                </div>
                <span className="text-xl font-bold">KaruTeens</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering Kenyan university students through technology and community.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/feedback" className="hover:text-white transition-colors">Feedback</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-purple-500/20 mt-12 pt-8">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h5 className="font-semibold mb-3 text-white">Contact Information</h5>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>📧 support@karuteens.site</p>
                  <p>🚨 safety@karuteens.site</p>
                  <p>📱 Response within 24 hours</p>
                </div>
              </div>
              <div>
                <h5 className="font-semibold mb-3 text-white">Trust & Security</h5>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>🔒 SSL Secured</p>
                  <p>🛡️ Kenya Data Protection Act Compliant</p>
                  <p>✅ Safe for Students Certified</p>
                </div>
              </div>
              <div>
                <h5 className="font-semibold mb-3 text-white">Pricing Transparency</h5>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>💰 Free to start, always</p>
                  <p>📊 Pro: KSh 40/month</p>
                  <p>🔄 Cancel anytime</p>
                </div>
              </div>
            </div>
            <div className="text-center text-gray-400 text-sm">
              <p>&copy; 2024 KaruTeens Productions. Built with ❤️ for Kenyan university students.</p>
            </div>
          </div>
        </div>
      </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}