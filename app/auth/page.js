"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Info, Check, Sparkles, Users, Trophy, Coins, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedExplainer from '@/components/auth/AnimatedExplainer';

function AuthPageContent() {
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot' | 'reset' | 'setNickname'
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [checkingName, setCheckingName] = useState(false);
  const [nameAvailable, setNameAvailable] = useState(null); // null = not checked, true = available, false = taken
  const [needsNickname, setNeedsNickname] = useState(false);

  // Check URL params for reset mode and handle Supabase recovery token
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'reset') {
      setMode('reset');
    }
    
    // Check for Supabase recovery token in URL hash
    // Supabase sends tokens in hash fragment like: #access_token=...&type=recovery
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('type=recovery') || hash.includes('access_token')) {
        setMode('reset');
        // Supabase will automatically handle the token exchange via detectSessionInUrl
        // Clear the hash after processing to clean up the URL
        setTimeout(() => {
          window.history.replaceState(null, '', window.location.pathname + '?mode=reset');
        }, 100);
      }
    }
  }, [searchParams]);

  // Check if user needs to set nickname after sign-in
  useEffect(() => {
    const checkNickname = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .single();
        
        if (!profile?.display_name) {
          setNeedsNickname(true);
          setMode('setNickname');
        }
      }
    };
    checkNickname();
  }, [supabase]);

  // Check if display name is available using API endpoint (bypasses RLS)
  const checkDisplayNameAvailability = async (name) => {
    if (!name.trim()) {
      setNameAvailable(null);
      setCheckingName(false);
      return;
    }

    setCheckingName(true);
    try {
      // Add timeout to prevent hanging (5 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const apiPromise = fetch('/api/internal/check-display-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: name.trim() }),
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });

      const result = await Promise.race([apiPromise, timeoutPromise]);

      if (result.available === true) {
        setNameAvailable(true);
      } else if (result.available === false) {
        setNameAvailable(false);
      } else {
        setNameAvailable(null);
      }
    } catch (err) {
      console.error('Error checking name availability:', err);
      // On timeout or other error, reset to allow user to try again
      setNameAvailable(null);
    } finally {
      setCheckingName(false);
    }
  };

  // Debounce name checking with useEffect
  const debounceTimerRef = useRef(null);
  const isCheckingRef = useRef(false);
  
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Reset availability when display name changes
    setNameAvailable(null);
    
    // Set new timer to check availability after user stops typing (500ms delay)
    if (displayName.trim() && !isCheckingRef.current) {
      debounceTimerRef.current = setTimeout(async () => {
        if (!isCheckingRef.current) {
          isCheckingRef.current = true;
          await checkDisplayNameAvailability(displayName);
          isCheckingRef.current = false;
        }
      }, 500);
    }
    
    // Cleanup on unmount or when displayName changes
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [displayName]);
  
  const handleDisplayNameChange = (value) => {
    setDisplayName(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate terms acceptance for signup
    if (mode === 'signup' && !acceptedTerms) {
      setMessage('Please accept the terms and conditions to continue.');
      return;
    }

    // Validate display name for setNickname mode
    if (mode === 'setNickname') {
      if (!displayName.trim()) {
        setMessage('Please enter a nickname.');
        return;
      }
      if (nameAvailable === false) {
        setMessage('This nickname is already taken. Please choose another one.');
        return;
      }
      // If name hasn't been checked yet, check it now
      if (nameAvailable === null) {
        await checkDisplayNameAvailability(displayName);
        if (nameAvailable === false) {
          setMessage('This nickname is already taken. Please choose another one.');
          return;
        }
      }
    }
    
    setMessage('');
    setLoading(true);
    try {
      if (mode === 'reset') {
        if (!newPassword || !confirmPassword) {
          setMessage('Please enter and confirm your new password.');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setMessage('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (newPassword.length < 6) {
          setMessage('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setMessage('Password updated successfully! Redirecting to sign in...');
        setTimeout(() => {
          setMode('signin');
          setNewPassword('');
          setConfirmPassword('');
          setMessage('');
        }, 2000);
        return;
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        setMessage('Password reset email sent! Check your inbox for instructions.');
        return;
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Handle specific error cases
          if (error.message?.includes('Invalid login credentials') || error.message?.includes('Email not confirmed')) {
            setMessage('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message?.includes('Email not confirmed')) {
            setMessage('Please check your email to confirm your account before signing in.');
          } else {
            throw error;
          }
          setLoading(false);
          return;
        }
        
        // Check if user has display name
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single();
          
          if (!profile?.display_name) {
            setNeedsNickname(true);
            setMode('setNickname');
            setMessage('');
            setLoading(false);
            return;
          }
        }
        
        setMessage('Signed in! Redirecting...');
        // Get redirect URL from query params, default to home
        const redirectUrl = searchParams.get('redirect') || '/';
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
      } else if (mode === 'setNickname') {
        // Validate display name
        if (!displayName.trim()) {
          setMessage('Please enter a nickname.');
          setLoading(false);
          return;
        }
        if (nameAvailable === false) {
          setMessage('This nickname is already taken. Please choose another one.');
          setLoading(false);
          return;
        }
        // If name hasn't been checked yet, check it now
        if (nameAvailable === null) {
          await checkDisplayNameAvailability(displayName);
          if (nameAvailable === false) {
            setMessage('This nickname is already taken. Please choose another one.');
            setLoading(false);
            return;
          }
        }

        // Save display name
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setMessage('Please sign in first.');
          setLoading(false);
          return;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ id: user.id, display_name: displayName.trim() });

        if (profileError) {
          if (profileError.code === '23505' || profileError.message?.includes('unique')) {
            setMessage('This nickname is already taken. Please choose another one.');
            setNameAvailable(false);
            setLoading(false);
            return;
          }
          throw profileError;
        }

        // Send welcome email (don't block on failure)
        try {
          fetch('/api/internal/send-welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          }).catch(err => console.error('Failed to send welcome email:', err));
        } catch (e) {
          console.error('Error triggering welcome email:', e);
        }

        setMessage('Nickname saved! Redirecting...');
        // Get redirect URL from query params, default to home
        const redirectUrl = searchParams.get('redirect') || '/';
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
        return;
      } else {
        // Sign up - just email and password, no nickname needed yet
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          // Handle specific error cases
          if (error.message?.includes('User already registered') || error.message?.includes('already registered') || error.message?.includes('already exists')) {
            setMessage('Email is already in use. If this is yours, please sign in.');
            setMode('signin');
          } else {
            throw error;
          }
          setLoading(false);
          return;
        }
        
        // If email confirmation is disabled, a session is returned and user is signed in
        if (data?.session?.user) {
          // User is signed in, check if they need a nickname
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', data.session.user.id)
            .single();
          
          if (!profile?.display_name) {
            // No nickname, show nickname screen
            setMode('setNickname');
            setMessage('');
            setLoading(false);
            return;
          }
          
          setMessage('Account created! Redirecting...');
          // Get redirect URL from query params, default to home
          const redirectUrl = searchParams.get('redirect') || '/';
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 500);
        } else {
          // If confirmation is enabled, no session is returned
          setMessage('Account created. Please check your email to confirm your account, then sign in.');
          setMode('signin');
        }
      }
    } catch (err) {
      setMessage(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
      // The redirect will happen automatically
    } catch (err) {
      setMessage(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };


  // Determine if we should show the split layout (only for signin/signup, not for forgot/reset/setNickname)
  const showSplitLayout = mode === 'signin' || mode === 'signup';

  return (
    <div className="min-h-screen bg-white">
      {showSplitLayout ? (
        // Split Layout for Sign In/Sign Up
        <div className="min-h-screen flex flex-col lg:flex-row">
          {/* Left Side - Benefits & Explainer (Desktop only, shows on left) */}
          <div className="hidden lg:flex lg:w-1/2 ocean-gradient p-12 flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 max-w-lg mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-semibold text-white">Revolutionary Tour Discovery</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Discover Amazing Tours & Restaurants
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  The first AI-powered platform that helps you discover tours and restaurants that actually match your travel style with personalized recommendations.
                </p>
              </motion.div>

              {/* Animated Explainer */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border-2 border-white/30 shadow-lg">
                <AnimatedExplainer autoPlay={true} />
              </div>

              {/* Quick Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border-2 border-orange-200 shadow-lg">
                  <Coins className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="text-gray-900 text-sm font-semibold">50 Points/Day</p>
                  <p className="text-gray-700 text-xs">Free daily points</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 shadow-lg">
                  <Trophy className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-gray-900 text-sm font-semibold">Leaderboard</p>
                  <p className="text-gray-700 text-xs">Compete globally</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-lg">
                  <Sparkles className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-gray-900 text-sm font-semibold">AI Matching</p>
                  <p className="text-gray-700 text-xs">1 match per day</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-lg">
                  <Bookmark className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-gray-900 text-sm font-semibold">Save Unlimited</p>
                  <p className="text-gray-700 text-xs">Tours & restaurants</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full lg:w-1/2 lg:fixed lg:right-0 lg:top-0 lg:h-screen flex items-center justify-center p-4 lg:p-12 bg-gray-50 lg:overflow-y-auto">
            <div className="w-full max-w-md my-auto">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {mode === 'signin' ? 'Sign in to continue your journey' : 'Join thousands of travelers discovering amazing places'}
                    </p>
                  </div>
                  <Link href="/" className="text-sm text-purple-600 hover:underline whitespace-nowrap ml-4">← Home</Link>
                </div>

                {/* Progress Indicator for Sign Up */}
                {mode === 'signup' && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Step 1 of 2</span>
                      <span className="text-xs text-gray-600">50%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="sunset-gradient h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '50%' }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Create your account → Choose nickname</p>
                  </div>
                )}

                {mode === 'setNickname' && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Step 2 of 2</span>
                      <span className="text-xs text-gray-600">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="sunset-gradient h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Almost there! Choose your nickname</p>
                  </div>
                )}

                {/* Mode Toggle */}
                {mode !== 'forgot' && mode !== 'reset' && mode !== 'setNickname' && (
                  <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <Button 
                      variant={mode === 'signin' ? 'default' : 'ghost'} 
                      onClick={() => { setMode('signin'); setMessage(''); }}
                      className={`flex-1 ${mode === 'signin' ? 'sunset-gradient text-white shadow-md' : ''}`}
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant={mode === 'signup' ? 'default' : 'ghost'} 
                      onClick={() => { setMode('signup'); setMessage(''); }}
                      className={`flex-1 ${mode === 'signup' ? 'sunset-gradient text-white shadow-md' : ''}`}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}

                {(mode === 'forgot' || mode === 'reset') && (
                  <div className="mb-4">
                    <Button variant="outline" onClick={() => { setMode('signin'); setMessage(''); setNewPassword(''); setConfirmPassword(''); }} className="mb-2">
                      ← Back to Sign In
                    </Button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'setNickname' && (
            <div>
              <label className="block text-sm text-gray-700 mb-1 flex items-center gap-2">
                Nickname
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                      This name will be used as your public name
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  placeholder="How should we call you?"
                  className={nameAvailable === false ? 'border-red-500 focus-visible:ring-red-500' : nameAvailable === true ? 'border-green-500 focus-visible:ring-green-500' : ''}
                />
                {checkingName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                  </div>
                )}
                {!checkingName && nameAvailable === true && displayName.trim() && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                    ✓
                  </div>
                )}
                {!checkingName && nameAvailable === false && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                    ✗
                  </div>
                )}
              </div>
              {nameAvailable === false && (
                <p className="text-xs text-red-600 mt-1">This nickname is already taken. Please choose another one.</p>
              )}
              {nameAvailable === true && displayName.trim() && (
                <p className="text-xs text-green-600 mt-1">Great! This nickname is available.</p>
              )}
            </div>
          )}
          {mode !== 'reset' && mode !== 'setNickname' && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          )}
          {mode === 'reset' && (
            <>
              <div>
                <label className="block text-sm text-gray-700 mb-1">New Password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Confirm New Password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
            </>
          )}
          {mode !== 'forgot' && mode !== 'reset' && mode !== 'setNickname' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm text-gray-700">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setMessage(''); }}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}
          {mode === 'signup' && (
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                I accept the{' '}
                <Link href="/terms" target="_blank" className="text-purple-600 hover:underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" target="_blank" className="text-purple-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
          )}
          <Button type="submit" className="w-full sunset-gradient text-white" disabled={loading || (mode === 'signup' && !acceptedTerms)}>
            {loading ? 'Please wait…' : mode === 'setNickname' ? 'Continue' : mode === 'reset' ? 'Update Password' : mode === 'forgot' ? 'Send Reset Link' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        
        {mode !== 'forgot' && mode !== 'reset' && mode !== 'setNickname' && (
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full mt-4 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>
        )}
        {message && (
          <div className={`mt-4 text-sm ${message.includes('sent') || message.includes('Signed in') || message.includes('created') || message.includes('updated successfully') || message.includes('saved!') ? 'text-green-600' : message.includes('already in use') ? 'text-orange-600' : 'text-red-600'}`}>
            <p>{message}</p>
            {message.includes('already in use') && (
              <button
                onClick={() => {
                  setMode('signin');
                  setMessage('');
                }}
                className="mt-2 text-sm font-semibold underline hover:no-underline"
              >
                Go to Sign In →
              </button>
            )}
          </div>
        )}
        {mode === 'forgot' && (
          <p className="mt-4 text-xs text-gray-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        )}
        {mode === 'reset' && (
          <p className="mt-4 text-xs text-gray-500">
            Enter your new password. Make sure it's at least 6 characters long.
          </p>
        )}
              </div>
            </div>
          </div>

          {/* Benefits Section - Mobile Only (below form) */}
          <div className="lg:hidden ocean-gradient p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 max-w-lg mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 mb-4">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <span className="text-xs font-semibold text-white">Revolutionary Tour Discovery</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Discover Amazing Tours & Restaurants
                </h2>
                <p className="text-base text-white/90 mb-6">
                  The first AI-powered platform that helps you discover tours and restaurants that actually match your travel style with personalized recommendations.
                </p>
              </motion.div>

              {/* Animated Explainer */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border-2 border-white/30 shadow-lg">
                <AnimatedExplainer autoPlay={true} />
              </div>

              {/* Quick Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-3 border-2 border-orange-200 shadow-lg">
                  <Coins className="w-5 h-5 text-orange-600 mb-1.5" />
                  <p className="text-gray-900 text-xs font-semibold">50 Points/Day</p>
                  <p className="text-gray-700 text-[10px]">Free daily points</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border-2 border-purple-200 shadow-lg">
                  <Trophy className="w-5 h-5 text-purple-600 mb-1.5" />
                  <p className="text-gray-900 text-xs font-semibold">Leaderboard</p>
                  <p className="text-gray-700 text-[10px]">Compete globally</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border-2 border-blue-200 shadow-lg">
                  <Sparkles className="w-5 h-5 text-blue-600 mb-1.5" />
                  <p className="text-gray-900 text-xs font-semibold">AI Matching</p>
                  <p className="text-gray-700 text-[10px]">1 match per day</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-200 shadow-lg">
                  <Bookmark className="w-5 h-5 text-green-600 mb-1.5" />
                  <p className="text-gray-900 text-xs font-semibold">Save Unlimited</p>
                  <p className="text-gray-700 text-[10px]">Tours & restaurants</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        // Single Column Layout for Forgot/Reset/SetNickname
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold">
                {mode === 'setNickname' ? 'Choose Your Nickname' : mode === 'reset' ? 'Set New Password' : mode === 'forgot' ? 'Reset Password' : 'Sign in to TopTours'}
              </h1>
              <Link href="/" className="text-sm text-purple-600 hover:underline">Back to home</Link>
            </div>
            {mode === 'setNickname' && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-600">Step 2 of 2</span>
                  <span className="text-xs text-gray-600">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="sunset-gradient h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Almost there! Choose your nickname</p>
              </div>
            )}
            {(mode === 'forgot' || mode === 'reset') && (
              <div className="mb-4">
                <Button variant="outline" onClick={() => { setMode('signin'); setMessage(''); setNewPassword(''); setConfirmPassword(''); }} className="mb-2">
                  ← Back to Sign In
                </Button>
              </div>
            )}
            {mode === 'setNickname' && (
              <p className="mb-4 text-sm text-gray-600">
                Choose a nickname that will be displayed publicly on the leaderboard and in your profile.
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'setNickname' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1 flex items-center gap-2">
                    Nickname
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                          This name will be used as your public name
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={displayName}
                      onChange={(e) => handleDisplayNameChange(e.target.value)}
                      placeholder="How should we call you?"
                      className={nameAvailable === false ? 'border-red-500 focus-visible:ring-red-500' : nameAvailable === true ? 'border-green-500 focus-visible:ring-green-500' : ''}
                    />
                    {checkingName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                      </div>
                    )}
                    {!checkingName && nameAvailable === true && displayName.trim() && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        ✓
                      </div>
                    )}
                    {!checkingName && nameAvailable === false && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                        ✗
                      </div>
                    )}
                  </div>
                  {nameAvailable === false && (
                    <p className="text-xs text-red-600 mt-1">This nickname is already taken. Please choose another one.</p>
                  )}
                  {nameAvailable === true && displayName.trim() && (
                    <p className="text-xs text-green-600 mt-1">Great! This nickname is available.</p>
                  )}
                </div>
              )}
              {mode !== 'reset' && mode !== 'setNickname' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              )}
              {mode === 'reset' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">New Password</label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Confirm New Password</label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
                  </div>
                </>
              )}
              {mode !== 'forgot' && mode !== 'reset' && mode !== 'setNickname' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm text-gray-700">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setMessage(''); }}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              )}
              <Button type="submit" className="w-full sunset-gradient text-white" disabled={loading || (mode === 'signup' && !acceptedTerms)}>
                {loading ? 'Please wait…' : mode === 'setNickname' ? 'Continue' : mode === 'reset' ? 'Update Password' : mode === 'forgot' ? 'Send Reset Link' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
            {message && (
              <div className={`mt-4 text-sm ${message.includes('sent') || message.includes('Signed in') || message.includes('created') || message.includes('updated successfully') || message.includes('saved!') ? 'text-green-600' : message.includes('already in use') ? 'text-orange-600' : 'text-red-600'}`}>
                <p>{message}</p>
                {message.includes('already in use') && (
                  <button
                    onClick={() => {
                      setMode('signin');
                      setMessage('');
                    }}
                    className="mt-2 text-sm font-semibold underline hover:no-underline"
                  >
                    Go to Sign In →
                  </button>
                )}
              </div>
            )}
            {mode === 'forgot' && (
              <p className="mt-4 text-xs text-gray-500">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            )}
            {mode === 'reset' && (
              <p className="mt-4 text-xs text-gray-500">
                Enter your new password. Make sure it's at least 6 characters long.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
