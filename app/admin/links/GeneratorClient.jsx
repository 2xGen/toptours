"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Link as LinkIcon, Copy, LogOut, Sparkles } from 'lucide-react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';

import { getSiteOrigin } from '@/lib/siteUrl';

function normalizeViatorInput(input) {
  const trimmed = String(input || '').trim();
  if (!trimmed) return '';

  // Allow pasting either full URL or just a viator pathname.
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://www.viator.com/${trimmed.replace(/^\/+/, '')}`;
  }
  return trimmed;
}

function toGoPathFromViatorUrl(viatorUrl) {
  const url = new URL(viatorUrl);
  const hostname = url.hostname.toLowerCase();
  if (!hostname.includes('viator.com')) return null;

  // Remove query/hash; redirect page builds tracking query itself.
  const pathname = url.pathname.replace(/^\/+/, '');
  return pathname || null;
}

export default function GeneratorClient() {
  const origin = useMemo(() => getSiteOrigin(), []);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [viatorInput, setViatorInput] = useState('');
  const [generatedGoUrl, setGeneratedGoUrl] = useState('');
  const [generatedError, setGeneratedError] = useState('');

  useEffect(() => {
    const adminToken = sessionStorage.getItem('admin_token');
    if (adminToken) {
      setAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.token) {
        sessionStorage.setItem('admin_token', data.token);
        setAuthenticated(true);
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Invalid password');
      }
    } catch (err) {
      setLoginError('Failed to login. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleGenerate = () => {
    setGeneratedError('');
    setGeneratedGoUrl('');

    const normalized = normalizeViatorInput(viatorInput);
    if (!normalized) return;

    try {
      const goPath = toGoPathFromViatorUrl(normalized);
      if (!goPath) {
        setGeneratedError('That does not look like a Viator URL.');
        return;
      }

      setGeneratedGoUrl(`${origin}/go/${goPath}`);
    } catch {
      setGeneratedError('Please paste a valid Viator URL.');
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationNext />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Checking access...</h1>
            </div>
          </div>
        </main>
        <FooterNext />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationNext />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Admin Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full"
                    disabled={loggingIn}
                    autoFocus
                  />
                </div>
                {loginError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{loginError}</div>}
                <Button type="submit" className="w-full" disabled={loggingIn || !loginPassword}>
                  {loggingIn ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <FooterNext />
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      if (!generatedGoUrl) return;
      await navigator.clipboard.writeText(generatedGoUrl);
    } catch {
      // Clipboard can fail depending on browser permissions; ignore.
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationNext />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Viator Link Generator</h1>
            <p className="text-gray-600">Paste a Viator URL and get a toptours.ai tracking redirect link.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              sessionStorage.removeItem('admin_token');
              setAuthenticated(false);
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Viator link</label>
              <div className="flex gap-2">
                <Input
                  value={viatorInput}
                  onChange={(e) => setViatorInput(e.target.value)}
                  placeholder="https://www.viator.com/tours/Aruba/.../d28-119085P1"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button type="button" onClick={handleGenerate} className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Create toptours.ai/go/
                </Button>
              </div>
              {generatedError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{generatedError}</div>}
            </div>

            {generatedGoUrl && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-gray-700">Your redirect link</label>
                  <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
                <Input value={generatedGoUrl} readOnly />
                <p className="text-xs text-gray-500">
                  Facebook preview will use your link title + the fixed TopTours image, then redirects after 1 second.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <FooterNext />
    </div>
  );
}

