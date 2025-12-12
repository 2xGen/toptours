"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  Globe, 
  Calendar,
  RefreshCw,
  BarChart3,
  MapPin,
  BookOpen,
  Lock,
  LogOut,
  Gift
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [stats, setStats] = useState(null);
  const [pageViews, setPageViews] = useState([]);
  const [popularViatorDestinations, setPopularViatorDestinations] = useState([]);
  const [dateRange, setDateRange] = useState('30'); // days
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Check if already authenticated (from sessionStorage)
  useEffect(() => {
    const adminToken = sessionStorage.getItem('admin_token');
    if (adminToken) {
      setAuthenticated(true);
      setCheckingAuth(false);
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token in sessionStorage
        sessionStorage.setItem('admin_token', data.token);
        setAuthenticated(true);
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Invalid password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Failed to login. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // No need for Supabase auth token - we use simple password auth
      const [statsRes, viewsRes, popularRes] = await Promise.all([
        fetch('/api/admin/analytics/stats'),
        fetch(`/api/admin/analytics/page-views?days=${dateRange}`),
        fetch(`/api/admin/analytics/popular-viator-destinations?days=${dateRange}`)
      ]);

      const statsData = await statsRes.json();
      const viewsData = await viewsRes.json();
      const popularData = await popularRes.json();

      setStats(statsData);
      setPageViews(viewsData.pageViews || []);
      setPopularViatorDestinations(popularData.popularDestinations || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationNext />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="flex items-center justify-center min-h-[60vh]">
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Admin Login
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
                  {loginError && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      {loginError}
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loggingIn || !loginPassword}
                  >
                    {loggingIn ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
        <FooterNext />
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationNext />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading dashboard...</h1>
            </div>
          </div>
        </main>
        <FooterNext />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationNext />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Analytics and user statistics</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/partner-invites">
                <Button variant="outline" size="sm" className="bg-purple-50 hover:bg-purple-100 border-purple-300">
                  <Gift className="w-4 h-4 mr-2" />
                  Partner Invites
                </Button>
              </Link>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <Button onClick={fetchData} variant="outline" size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  sessionStorage.removeItem('admin_token');
                  setAuthenticated(false);
                  router.push('/');
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.usersLast30Days || 0} new in last 30 days
              </p>
            </CardContent>
          </Card>

          {/* Total Page Views */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPageViews?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.pageViewsLast30Days?.toLocaleString() || 0} in last 30 days
              </p>
            </CardContent>
          </Card>

          {/* Unique Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Sessions</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.uniqueSessions?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last {dateRange} days
              </p>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeUsers?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Logged in users (last 30 days)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Pages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Top Pages (Last {dateRange} days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pageViews.slice(0, 10).map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {page.page_path}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {page.page_type?.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {page.view_count?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500">views</p>
                    </div>
                  </div>
                ))}
                {pageViews.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Page Types Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Views by Page Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.pageTypes?.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {type.page_type?.replace(/_/g, ' ') || 'Other'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {type.view_count?.toLocaleString() || 0}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({type.percentage?.toFixed(1) || 0}%)
                      </span>
                    </div>
                  </div>
                ))}
                {(!stats?.pageTypes || stats.pageTypes.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                Top Destinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats?.topDestinations?.slice(0, 5).map((dest, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 capitalize">{dest.destination_id || 'N/A'}</span>
                    <span className="font-semibold text-gray-900">{dest.view_count?.toLocaleString() || 0}</span>
                  </div>
                ))}
                {(!stats?.topDestinations || stats.topDestinations.length === 0) && (
                  <p className="text-xs text-gray-500">No data</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                Daily Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.dailyAverage?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Page views per day (last {dateRange} days)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.usersLast30Days || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                New users in last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Popular Viator Destinations Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Popular Viator Destinations (Not in Featured 182)
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              These destinations are getting traffic but aren't in your featured list. Consider adding them!
            </p>
          </CardHeader>
          <CardContent>
            {popularViatorDestinations.length > 0 ? (
              <div className="space-y-3">
                {popularViatorDestinations.map((dest, index) => (
                  <div 
                    key={dest.destinationId} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {dest.destinationName}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            {dest.region && (
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                {dest.region}
                              </span>
                            )}
                            {dest.country && (
                              <span className="text-xs text-gray-600">
                                {dest.country}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {dest.pageCount} page{dest.pageCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {dest.viewCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">views</p>
                      <a
                        href={`/destinations/${dest.destinationId}/tours`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-700 mt-1 inline-block"
                      >
                        View page →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No popular Viator destinations found. These will appear as they get traffic.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
      <FooterNext />
    </div>
  );
}

