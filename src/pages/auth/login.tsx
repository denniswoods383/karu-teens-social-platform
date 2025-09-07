import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleNavigation = (href: string) => {
    setIsNavigating(true);
    router.push(href);
  };

  const handleSocialLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'https://karuteens.site/feed'
        }
      });
      
      if (error) {
        alert(error.message);
      }
    } catch (error) {
      alert('Social login failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        alert(error.message);
      } else {
        router.push('/feed');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <span className="text-2xl font-bold text-white">
            Karu<span className="text-purple-400">Teens</span>
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="flex bg-white/10 rounded-lg p-1">
            <button 
              onClick={() => setLanguage('EN')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                language === 'EN' ? 'bg-white text-purple-900' : 'text-white hover:bg-white/20'
              }`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('SW')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                language === 'SW' ? 'bg-white text-purple-900' : 'text-white hover:bg-white/20'
              }`}
            >
              SW
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-100px)]">
        {/* Left Panel - Desktop Only */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-md text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Study smarter with university resources, mentors, and groups.
            </h2>
            <p className="text-purple-200 text-lg">
              Join thousands of Kenyan university students excelling in their studies.
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
              <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Log in</h1>
              
              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button 
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:scale-105 transform transition-all duration-200 active:scale-95"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <button 
                  onClick={() => handleSocialLogin('microsoft')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:scale-105 transform transition-all duration-200 active:scale-95"
                >
                  <svg className="w-5 h-5 mr-3" fill="#00BCF2" viewBox="0 0 24 24">
                    <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12s5.373 12 12 12 12-5.373 12-12z"/>
                    <path fill="white" d="M12.017 18.069h-2.146v-6.771H8.284V9.292h1.587V8.348c0-1.598.761-2.417 2.384-2.417.677 0 1.26.05 1.43.073v1.658l-.982.001c-.77 0-.919.366-.919.902v1.183h1.837l-.239 2.006h-1.598v6.771z"/>
                  </svg>
                  Continue with Microsoft
                </button>
                <button 
                  onClick={() => handleSocialLogin('apple')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:scale-105 transform transition-all duration-200 active:scale-95"
                >
                  <svg className="w-5 h-5 mr-3" fill="#000" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center mb-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Email or phone"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-gray-600">Remember this device (30 days)</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Logging in...
                    </div>
                  ) : (
                    'Log in'
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center mt-6">
                <span className="text-gray-600">New here? </span>
                <button 
                  onClick={() => handleNavigation('/auth/register')}
                  className="text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:scale-105 transform"
                  disabled={isNavigating}
                >
                  {isNavigating ? 'Loading...' : 'Create an account'}
                </button>
              </div>

              {/* Fine Print */}
              <p className="text-xs text-gray-500 text-center mt-6">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-purple-600 hover:underline">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-purple-600 hover:underline">Privacy</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-50 text-center py-4">
        <div className="flex justify-center space-x-4 text-sm text-purple-200">
          <Link href="/help" className="hover:text-white transition-colors">Help</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </footer>

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
    </div>
  );
}