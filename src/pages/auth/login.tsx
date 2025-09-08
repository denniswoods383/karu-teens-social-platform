import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [isNavigating, setIsNavigating] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [showMagicLinkSent, setShowMagicLinkSent] = useState(false);
  const router = useRouter();

  const handleNavigation = (href: string) => {
    setIsNavigating(true);
    router.push(href);
  };

  const handleMagicLink = async () => {
    if (!email) {
      alert('Please enter your email first');
      return;
    }
    
    setIsMagicLinkLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'https://karuteens.site/feed'
        }
      });
      
      if (error) {
        alert('Unable to send magic link. Please check your email address and try again.');
      } else {
        setShowMagicLinkSent(true);
      }
    } catch (error) {
      alert('Something went wrong. Please check your connection and try again.');
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setCapsLockOn(e.getModifierState('CapsLock'));
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSocialLogin = async (provider: 'google' | 'azure') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'https://karuteens.site/feed'
        }
      });
      
      if (error) {
        alert('Social login failed. Please try again or use email instead.');
      }
    } catch (error) {
      alert('Connection issue. Please check your internet and try again.');
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
        if (error.message.includes('Invalid login credentials')) {
          alert('Email or password is incorrect (try resetting your password).');
        } else if (error.message.includes('Email not confirmed')) {
          alert('Please check your email and click the confirmation link first.');
        } else {
          alert('Login failed. Please check your details and try again.');
        }
      } else {
        router.push('/feed');
      }
    } catch (error) {
      alert('Something went wrong. Please check your connection and try again.');
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
              
              {/* Magic Link - Primary Option */}
              <div className="space-y-3 mb-6">
                {showMagicLinkSent ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-green-600 font-medium mb-1">📧 Check your email!</div>
                    <p className="text-sm text-green-700">We sent a magic link to {email}</p>
                    <button 
                      onClick={() => setShowMagicLinkSent(false)}
                      className="text-xs text-green-600 hover:underline mt-2"
                    >
                      Try a different email
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleMagicLink}
                    disabled={isMagicLinkLoading || !email}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transform transition-all duration-200 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isMagicLinkLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <span className="mr-2">🔗</span>
                    )}
                    <span className="font-semibold">
                      {isMagicLinkLoading ? 'Sending...' : 'Send Magic Link (No Password)'}
                    </span>
                  </button>
                )}
                
                <button 
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center px-4 py-3 bg-white border-2 border-blue-500 rounded-lg hover:bg-blue-50 hover:scale-105 transform transition-all duration-200 active:scale-95 shadow-sm"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-semibold text-gray-700">Continue with Google</span>
                </button>
                
                <button 
                  onClick={() => handleSocialLogin('azure')}
                  className="w-full flex items-center justify-center px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:scale-105 transform transition-all duration-200 active:scale-95 shadow-sm"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#00BCF2" d="M0 0h11.377v11.372H0z"/>
                    <path fill="#0078D4" d="M12.623 0H24v11.372H12.623z"/>
                    <path fill="#00BCF2" d="M0 12.628h11.377V24H0z"/>
                    <path fill="#40E0D0" d="M12.623 12.628H24V24H12.623z"/>
                  </svg>
                  <span className="font-semibold text-gray-700">Continue with Microsoft</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center mb-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">or use password</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your university email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  {capsLockOn && (
                    <div className="absolute -bottom-6 left-0 text-xs text-amber-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      Caps Lock is on
                    </div>
                  )}
                </div>

                {/* Forgot Password - Prominent */}
                <div className="text-center mb-4">
                  <Link 
                    href="/auth/forgot-password" 
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm hover:underline"
                  >
                    <span className="mr-1">🔑</span>
                    Forgot your password?
                  </Link>
                </div>
                
                {/* Remember Device */}
                <div className="flex items-center justify-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600">Remember this device (30 days)</span>
                  </label>
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
                      Signing you in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center mt-6">
                <span className="text-gray-600">New to KaruTeens? </span>
                <button 
                  onClick={() => handleNavigation('/auth/register')}
                  className="text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:scale-105 transform"
                  disabled={isNavigating}
                >
                  {isNavigating ? 'Loading...' : 'Join thousands of students'}
                </button>
              </div>

              {/* Fine Print - Small but Present */}
              <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-purple-500 hover:text-purple-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-purple-500 hover:text-purple-600 hover:underline">Privacy Policy</Link>.
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