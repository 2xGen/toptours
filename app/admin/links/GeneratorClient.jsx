"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Lock,
  Link as LinkIcon,
  Copy,
  LogOut,
  Sparkles,
  Baby,
  BookOpen,
  Car,
  Shield,
  Hotel,
  Umbrella,
} from 'lucide-react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';

import { getSiteOrigin } from '@/lib/siteUrl';
import { BABYQUIP_AFFILIATE_URL } from '@/lib/babyquipAffiliate';
import { DISCOVER_CARS_AFFILIATE_URL } from '@/lib/discoverCarsAffiliate';
import { DISCOVER_DC_GENERIC_SLUG, DISCOVER_DC_PRESETS } from '@/lib/discoverCarsDcOptions';
import { SAFETYWING_NOMAD_INSURANCE_URL, SAFETYWING_NOMAD_INSURANCE_COMPLETE_URL } from '@/lib/safetyWingAffiliate';
import { SW_NOMAD_INSURANCE_SLUG, SAFETY_WING_SW_PRESETS } from '@/lib/safetyWingSwOptions';
import { EX_DEFAULT_SLUG, EXPEDIA_EX_PRESETS } from '@/lib/expediaExOptions';
import { COCONUT_BG_SLUG, COCONUT_RENTALS_AFFILIATE_URL } from '@/lib/coconutRentalsAffiliate';

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

const PACKING_LIST_GUIDES = [
  { label: 'Aruba beach packing list', slug: 'aruba-packing-list' },
  { label: 'Curaçao beach packing list', slug: 'curacao-packing-list' },
  { label: 'Beach vacation packing list (general)', slug: 'beach-vacation-packing-list' },
];

const VIATOR_HISTORY_STORAGE_KEY = 'toptours_admin_viator_go_history_v1';
const VIATOR_HISTORY_MAX = 10;

function readViatorHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VIATOR_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((u) => typeof u === 'string' && u.trim().length > 0).slice(0, VIATOR_HISTORY_MAX);
  } catch {
    return [];
  }
}

function writeViatorHistory(urls) {
  try {
    localStorage.setItem(VIATOR_HISTORY_STORAGE_KEY, JSON.stringify(urls.slice(0, VIATOR_HISTORY_MAX)));
  } catch {
    // private mode / quota
  }
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
  const [viatorRecent, setViatorRecent] = useState([]);
  const [copiedViatorHistoryUrl, setCopiedViatorHistoryUrl] = useState(null);

  const [babyDestinations, setBabyDestinations] = useState([]);
  const [babyLoading, setBabyLoading] = useState(false);
  const [babyFetchError, setBabyFetchError] = useState('');
  const [babySearch, setBabySearch] = useState('');
  const [babySelectedId, setBabySelectedId] = useState('');
  const [copiedPackingSlug, setCopiedPackingSlug] = useState(null);

  const [dcPresetSlug, setDcPresetSlug] = useState(DISCOVER_DC_GENERIC_SLUG);
  const [copiedDcKey, setCopiedDcKey] = useState(null);

  const [swPresetSlug, setSwPresetSlug] = useState(SW_NOMAD_INSURANCE_SLUG);
  const [copiedSwKey, setCopiedSwKey] = useState(null);

  const [exPresetSlug, setExPresetSlug] = useState(EX_DEFAULT_SLUG);
  const [copiedExKey, setCopiedExKey] = useState(null);
  const [copiedBg, setCopiedBg] = useState(false);

  useEffect(() => {
    const adminToken = sessionStorage.getItem('admin_token');
    if (adminToken) {
      setAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    setViatorRecent(readViatorHistory());
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    (async () => {
      setBabyLoading(true);
      setBabyFetchError('');
      try {
        const res = await fetch('/api/admin/baby-equipment-destinations');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load destinations');
        if (!cancelled) setBabyDestinations(Array.isArray(data.destinations) ? data.destinations : []);
      } catch (e) {
        if (!cancelled) setBabyFetchError(e.message || 'Failed to load destinations');
      } finally {
        if (!cancelled) setBabyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authenticated]);

  const filteredBabyDestinations = useMemo(() => {
    const q = babySearch.trim().toLowerCase();
    const list = !q
      ? babyDestinations
      : babyDestinations.filter(
          (d) =>
            d.id.toLowerCase().includes(q) ||
            String(d.label || '')
              .toLowerCase()
              .includes(q)
        );
    return [...list].sort((a, b) =>
      String(a.label || '').localeCompare(String(b.label || ''), 'en', { sensitivity: 'base' })
    );
  }, [babyDestinations, babySearch]);

  const expediaPresetsAlphabetical = useMemo(
    () =>
      [...EXPEDIA_EX_PRESETS].sort((a, b) =>
        a.label.localeCompare(b.label, 'en', { sensitivity: 'base' })
      ),
    []
  );

  const babyGoUrl = babySelectedId ? `${origin}/fb/baby-equipment-rental-in-${babySelectedId}` : '';

  const dcUrl = `${origin}/dc/${dcPresetSlug}`;
  const swUrl = `${origin}/sw/${swPresetSlug}`;
  const exUrl = `${origin}/ex/${exPresetSlug}`;
  const bgUrl = `${origin}/bg/${COCONUT_BG_SLUG}`;

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

      const goUrl = `${origin}/go/${goPath}`;
      setGeneratedGoUrl(goUrl);
      setViatorRecent((prev) => {
        const next = [goUrl, ...prev.filter((u) => u !== goUrl)].slice(0, VIATOR_HISTORY_MAX);
        writeViatorHistory(next);
        return next;
      });
    } catch {
      setGeneratedError('Please paste a valid Viator URL.');
    }
  };

  const handleCopy = async () => {
    try {
      if (!generatedGoUrl) return;
      await navigator.clipboard.writeText(generatedGoUrl);
    } catch {
      // Clipboard can fail depending on browser permissions; ignore.
    }
  };

  const copyViatorHistoryUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedViatorHistoryUrl(url);
      window.setTimeout(() => setCopiedViatorHistoryUrl(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyBaby = async () => {
    try {
      if (!babyGoUrl) return;
      await navigator.clipboard.writeText(babyGoUrl);
    } catch {
      // ignore
    }
  };

  const copyPackingGuideUrl = async (slug) => {
    const url = `${origin}/travel-guides/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedPackingSlug(slug);
      window.setTimeout(() => setCopiedPackingSlug(null), 2000);
    } catch {
      // ignore
    }
  };

  const copyDcUrl = async () => {
    try {
      await navigator.clipboard.writeText(dcUrl);
      setCopiedDcKey(dcPresetSlug);
      window.setTimeout(() => setCopiedDcKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const copySwUrl = async () => {
    try {
      await navigator.clipboard.writeText(swUrl);
      setCopiedSwKey(swPresetSlug);
      window.setTimeout(() => setCopiedSwKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const copyExUrl = async () => {
    try {
      await navigator.clipboard.writeText(exUrl);
      setCopiedExKey(exPresetSlug);
      window.setTimeout(() => setCopiedExKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const copyBgUrl = async () => {
    try {
      await navigator.clipboard.writeText(bgUrl);
      setCopiedBg(true);
      window.setTimeout(() => setCopiedBg(false), 2000);
    } catch {
      // ignore
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

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationNext />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Link generator</h1>
            <p className="text-gray-600">
              Viator, Discover Cars, Expedia/Vrbo hotels, beach gear rentals in Aruba (Coconut Rentals), SafetyWing travel
              insurance, packing list guides, and BabyQuip—copy short links without leaving this page.
            </p>
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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Viator tours
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
                  Social previews use the tour title + the fixed TopTours image; visitors redirect after 1 second.
                </p>
              </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Recent Viator links</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Last {VIATOR_HISTORY_MAX} links you generated here—one-click copy when you need the same link again
                  (e.g. posting in multiple Facebook groups).
                </p>
              </div>
              {viatorRecent.length === 0 ? (
                <p className="text-sm text-gray-500">No history yet. Create a link above and it will show up here.</p>
              ) : (
                <ul className="space-y-2 list-none p-0 m-0">
                  {viatorRecent.map((url) => (
                    <li key={url}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <p
                          className="flex-1 min-w-0 font-mono text-xs sm:text-sm text-gray-800 truncate bg-white border border-gray-200 rounded-md px-3 py-2"
                          title={url}
                        >
                          {url}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyViatorHistoryUrl(url)}
                          className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          {copiedViatorHistoryUrl === url ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Car rentals (Discover Cars)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-gray-600">
              Only two URL shapes are valid:{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">/dc/best-car-rental-options</code> (one generic
              link) or <code className="text-xs bg-gray-100 px-1 rounded">/dc/car-rentals-in-{'{place}'}</code> (e.g.{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">car-rentals-in-miami</code>). Then redirect to{' '}
              <a
                href={DISCOVER_CARS_AFFILIATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline font-medium"
              >
                {DISCOVER_CARS_AFFILIATE_URL}
              </a>
              . Old short URLs like <code className="text-xs bg-gray-100 px-1 rounded">/dc/miami</code> 308 to the
              new path. Social previews use the car-rental OG image.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="dc-preset">
                Quick pick
              </label>
              <select
                id="dc-preset"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={dcPresetSlug}
                onChange={(e) => setDcPresetSlug(e.target.value)}
              >
                {DISCOVER_DC_PRESETS.map(({ label, slug }) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-gray-700">Your /dc/ link</label>
                <Button type="button" variant="outline" size="sm" onClick={copyDcUrl} className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  {copiedDcKey === dcPresetSlug ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <Input value={dcUrl} readOnly className="font-mono text-xs sm:text-sm" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Packing list travel guides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-gray-600">
              Public travel guide URLs on this site (Amazon disclosure pages). Uses your current origin (
              <code className="text-xs bg-gray-100 px-1 rounded">{origin}</code>
              ).
            </p>
            <ul className="space-y-4 list-none p-0 m-0">
              {PACKING_LIST_GUIDES.map(({ label, slug }) => {
                const fullUrl = `${origin}/travel-guides/${slug}`;
                return (
                  <li key={slug} className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <label className="text-sm font-medium text-gray-800">{label}</label>
                        <Input value={fullUrl} readOnly className="font-mono text-xs sm:text-sm" />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyPackingGuideUrl(slug)}
                        className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedPackingSlug === slug ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="w-5 h-5" />
              Baby gear (BabyQuip)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-gray-600">
              Redirects to{' '}
              <a
                href={BABYQUIP_AFFILIATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-700 underline font-medium"
              >
                {BABYQUIP_AFFILIATE_URL}
              </a>
              . Social previews use the baby equipment OG image and title like the destination pages.
            </p>

            {babyFetchError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{babyFetchError}</div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="baby-search">
                Search destination
              </label>
              <Input
                id="baby-search"
                value={babySearch}
                onChange={(e) => setBabySearch(e.target.value)}
                placeholder="Type e.g. aruba, punta, new york"
                disabled={babyLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="baby-select">
                Destination
              </label>
              <select
                id="baby-select"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={babySelectedId}
                onChange={(e) => setBabySelectedId(e.target.value)}
                disabled={babyLoading || babyDestinations.length === 0}
              >
                <option value="">{babyLoading ? 'Loading…' : 'Choose a destination…'}</option>
                {filteredBabyDestinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label} — {d.id}
                  </option>
                ))}
              </select>
              {!babyLoading && babyDestinations.length > 0 && (
                <p className="text-xs text-gray-500">
                  Showing {filteredBabyDestinations.length} of {babyDestinations.length} destinations with baby equipment
                  pages.
                </p>
              )}
            </div>

            {babyGoUrl && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-gray-700">Your /fb/ link</label>
                  <Button variant="outline" size="sm" onClick={handleCopyBaby} className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
                <Input value={babyGoUrl} readOnly />
                <p className="text-xs text-gray-500">
                  Path format: <code className="text-xs bg-gray-100 px-1 rounded">/fb/baby-equipment-rental-in-{'{slug}'}</code>{' '}
                  — BabyQuip redirect (Viator stays on <code className="text-xs bg-gray-100 px-1 rounded">/go/</code>).
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="w-5 h-5" />
              Hotels & rentals (Expedia / Vrbo)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-gray-600">
              Short links under <code className="text-xs bg-gray-100 px-1 rounded">/ex/{'{preset}'}</code> redirect to
              your Expedia affiliate URLs (or Vrbo for the home preset). Examples:{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">/ex/hotels-aruba</code>,{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">/ex/expedia-home</code>,{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">/ex/vrbo-home</code>. Visitors see a one-second
              interstitial; social previews use the dedicated hotels OG image.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="ex-preset">
                Destination / page
              </label>
              <select
                id="ex-preset"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={exPresetSlug}
                onChange={(e) => setExPresetSlug(e.target.value)}
              >
                {expediaPresetsAlphabetical.map(({ label, slug }) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-gray-700">Your /ex/ link</label>
                <Button type="button" variant="outline" size="sm" onClick={copyExUrl} className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  {copiedExKey === exPresetSlug ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <Input value={exUrl} readOnly className="font-mono text-xs sm:text-sm" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Umbrella className="w-5 h-5" />
              Beach gear rentals in Aruba (Coconut Rentals)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-gray-600">
              Canonical short link{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">{`/bg/${COCONUT_BG_SLUG}`}</code> (legacy{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">/bg</code> 308s here) redirects to Coconut Rentals
              with your ref. Lands on{' '}
              <a
                href={COCONUT_RENTALS_AFFILIATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-800 underline font-medium break-all"
              >
                {COCONUT_RENTALS_AFFILIATE_URL}
              </a>
              . Social previews use the beach-chair OG image.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-gray-700">Your beach gear link</label>
                <Button type="button" variant="outline" size="sm" onClick={copyBgUrl} className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  {copiedBg ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <Input value={bgUrl} readOnly className="font-mono text-xs sm:text-sm" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Travel insurance (SafetyWing)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-gray-600">
              Only two URL shapes are valid:{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">/sw/nomad-insurance</code> (Essential) and{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">/sw/nomad-insurance-complete</code>. Visitors see a
              short interstitial, then redirect to SafetyWing with your ambassador parameters. Essential lands on{' '}
              <a
                href={SAFETYWING_NOMAD_INSURANCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 underline font-medium break-all"
              >
                {SAFETYWING_NOMAD_INSURANCE_URL}
              </a>
              ; Complete on{' '}
              <a
                href={SAFETYWING_NOMAD_INSURANCE_COMPLETE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 underline font-medium break-all"
              >
                {SAFETYWING_NOMAD_INSURANCE_COMPLETE_URL}
              </a>
              . Social previews use the travel insurance OG image.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="sw-preset">
                Plan
              </label>
              <select
                id="sw-preset"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={swPresetSlug}
                onChange={(e) => setSwPresetSlug(e.target.value)}
              >
                {SAFETY_WING_SW_PRESETS.map(({ label, slug }) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-gray-700">Your /sw/ link</label>
                <Button type="button" variant="outline" size="sm" onClick={copySwUrl} className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  {copiedSwKey === swPresetSlug ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <Input value={swUrl} readOnly className="font-mono text-xs sm:text-sm" />
            </div>
          </CardContent>
        </Card>
      </main>
      <FooterNext />
    </div>
  );
}

