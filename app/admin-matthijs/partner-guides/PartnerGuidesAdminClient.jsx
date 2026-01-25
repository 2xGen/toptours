"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NavigationNext from '@/components/NavigationNext';
import { 
  Plus, 
  Globe, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

export default function PartnerGuidesAdminClient() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [lookingUpDestination, setLookingUpDestination] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    destination_name: '',
    destination_id: '',
    country: '',
    region: '',
    guide_type: 'website', // Default to website
    is_approved: true,
    is_active: true
  });

  // Check authentication
  useEffect(() => {
    const adminToken = sessionStorage.getItem('admin_token');
    if (adminToken) {
      setAuthenticated(true);
      fetchGuides();
    }
    setCheckingAuth(false);
  }, []);

  // Auto-lookup destination when destination_name changes
  useEffect(() => {
    if (!formData.destination_name || formData.destination_name.length < 2) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLookingUpDestination(true);
      try {
        const response = await fetch(`/api/admin/lookup-destination?name=${encodeURIComponent(formData.destination_name)}`);
        const data = await response.json();
        
        if (data.destination_id) {
          setFormData(prev => ({
            ...prev,
            destination_id: data.destination_id,
            destination_name: data.destination_name,
            country: data.country || prev.country,
            region: data.region || prev.region,
          }));
        }
      } catch (error) {
        console.error('Error looking up destination:', error);
      } finally {
        setLookingUpDestination(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [formData.destination_name]);

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

      if (response.ok && data.success) {
        sessionStorage.setItem('admin_token', data.token);
        setAuthenticated(true);
        setLoginPassword('');
        fetchGuides();
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

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/partner-guides');
      const data = await response.json();
      setGuides(data.guides || []);
    } catch (error) {
      console.error('Error fetching guides:', error);
      toast({
        title: 'Error',
        description: 'Failed to load partner guides',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = editingGuide 
        ? { id: editingGuide.id, ...formData }
        : formData;

      const response = await fetch('/api/admin/partner-guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success!',
          description: editingGuide ? 'Guide updated' : 'Guide added',
        });
        resetForm();
        fetchGuides();
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving guide:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save guide',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this guide?')) return;

    try {
      const response = await fetch(`/api/admin/partner-guides?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Deleted',
          description: 'Guide removed successfully',
        });
        fetchGuides();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete guide',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (guide) => {
    setEditingGuide(guide);
    setFormData({
      name: guide.name || '',
      url: guide.url || '',
      description: guide.description || '',
      destination_name: guide.destination_name || '',
      destination_id: guide.destination_id || '',
      country: guide.country || '',
      region: guide.region || '',
      guide_type: guide.guide_type || 'website',
      is_approved: guide.is_approved ?? true,
      is_active: guide.is_active ?? true
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      description: '',
      destination_name: '',
      destination_id: '',
      country: '',
      region: '',
      guide_type: 'website',
      is_approved: true,
      is_active: true
    });
    setEditingGuide(null);
    setShowForm(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <>
        <NavigationNext />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full"
                />
                {loginError && (
                  <p className="text-sm text-red-600">{loginError}</p>
                )}
                <Button type="submit" className="w-full" disabled={loggingIn}>
                  {loggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <NavigationNext />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push('/admin-matthijs')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Partner Guides Admin</h1>
              <p className="text-gray-600 mt-2">Quick add/edit partner guides (Yellow Pages style)</p>
            </div>
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="sunset-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Guide
            </Button>
          </div>

          {/* Quick Add Form */}
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingGuide ? 'Edit Guide' : 'Add New Guide'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Aruba.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL *</label>
                    <Input
                      required
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Destination
                      {lookingUpDestination && (
                        <span className="ml-2 text-xs text-gray-500 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Looking up...
                        </span>
                      )}
                    </label>
                    <Input
                      value={formData.destination_name}
                      onChange={(e) => setFormData({ ...formData, destination_name: e.target.value })}
                      placeholder="e.g., Aruba (auto-fills country & region)"
                    />
                    {(formData.country || formData.region) && (
                      <div className="mt-2 flex gap-2 text-xs text-gray-600">
                        {formData.country && (
                          <span className="px-2 py-1 bg-blue-50 rounded">Country: {formData.country}</span>
                        )}
                        {formData.region && (
                          <span className="px-2 py-1 bg-green-50 rounded">Region: {formData.region}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description (optional)"
                      className="w-full px-3 py-2 border rounded-lg min-h-[80px]"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={submitting} className="sunset-gradient text-white">
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingGuide ? 'Update Guide' : 'Add Guide'
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Guides List */}
          <Card>
            <CardHeader>
              <CardTitle>All Guides ({guides.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                </div>
              ) : guides.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No guides yet. Add your first one!</p>
              ) : (
                <div className="space-y-3">
                  {guides.map((guide) => (
                    <div
                      key={guide.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{guide.name}</h3>
                          <Badge variant={guide.is_approved ? "default" : "secondary"}>
                            {guide.is_approved ? 'Approved' : 'Pending'}
                          </Badge>
                          <Badge variant={guide.is_active ? "default" : "outline"}>
                            {guide.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {guide.guide_type && (
                            <Badge variant="outline" className="text-xs">
                              {guide.guide_type}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                          <a
                            href={guide.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-blue-600"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {guide.url}
                          </a>
                          {guide.destination_name && (
                            <span>{guide.destination_name}</span>
                          )}
                          {guide.country && (
                            <span>{guide.country}</span>
                          )}
                        </div>
                        {guide.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                            {guide.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(guide)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(guide.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
