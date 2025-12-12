"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import { RefreshCw, Search, Edit, Save, X, Mail, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTourUrl } from '@/utils/tourHelpers';
import Link from 'next/link';

const STATUS_COLORS = {
  not_contacted: 'bg-gray-100 text-gray-800',
  no_answer: 'bg-yellow-100 text-yellow-800',
  declined: 'bg-red-100 text-red-800',
  claimed_promo: 'bg-blue-100 text-blue-800',
  paid_subscribed: 'bg-green-100 text-green-800',
};

export default function TourOperatorsCRMPage() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [destinationNames, setDestinationNames] = useState({}); // { "123": "Dubai, UAE" }
  const [sortBy, setSortBy] = useState('newest'); // Default: newest first
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/internal/tour-operators-crm');
      const result = await res.json();
      if (result.success) {
        const ops = result.data || [];
        setOperators(ops);
        
        // Collect all unique destination IDs
        const allDestinationIds = new Set();
        ops.forEach(op => {
          const destIds = op.destination_ids || [];
          if (Array.isArray(destIds)) {
            destIds.forEach(id => allDestinationIds.add(id));
          }
        });
        
        // Fetch destination names in one API call
        if (allDestinationIds.size > 0) {
          try {
            const destRes = await fetch('/api/internal/destinations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ destinationIds: Array.from(allDestinationIds) })
            });
            const destResult = await destRes.json();
            if (destResult.success) {
              setDestinationNames(destResult.data || {});
            }
          } catch (error) {
            console.error('Error fetching destination names:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (op) => {
    setSelectedOperator(op);
    setEditData({
      email: op.email || '',
      date_sent_email: op.date_sent_email ? op.date_sent_email.split('T')[0] : '',
      reminder_date: op.reminder_date ? op.reminder_date.split('T')[0] : '',
      status: op.status || 'not_contacted',
      notes: op.notes || '',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOperator(null);
    setEditData({});
  };

  const handleSave = async () => {
    if (!selectedOperator) return;
    
    setSaving(true);
    try {
      // Convert empty strings to null for date fields
      const updates = { ...editData };
      if (updates.date_sent_email === '') {
        updates.date_sent_email = null;
      }
      if (updates.reminder_date === '') {
        updates.reminder_date = null;
      }
      if (updates.notes === '') {
        updates.notes = null;
      }
      if (updates.email === '') {
        updates.email = null;
      }
      
      const res = await fetch(`/api/internal/tour-operators-crm/${selectedOperator.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const result = await res.json();
      if (result.success) {
        await fetchOperators();
        handleCloseModal();
      } else {
        alert('Error: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = operators.filter(op =>
    op.operator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get first destination name for an operator (for sorting)
  const getFirstDestinationName = (op) => {
    const destIds = Array.isArray(op.destination_ids) ? op.destination_ids : [];
    const destNames = destIds.map(id => destinationNames[id]).filter(Boolean);
    return destNames.length > 0 ? destNames[0].toLowerCase() : 'zzz'; // 'zzz' sorts last
  };

  // Sort operators
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'date_sent_newest':
        const dateA = a.date_sent_email ? new Date(a.date_sent_email).getTime() : 0;
        const dateB = b.date_sent_email ? new Date(b.date_sent_email).getTime() : 0;
        return dateB - dateA; // Newest first
      
      case 'date_sent_oldest':
        const dateA2 = a.date_sent_email ? new Date(a.date_sent_email).getTime() : 0;
        const dateB2 = b.date_sent_email ? new Date(b.date_sent_email).getTime() : 0;
        return dateA2 - dateB2; // Oldest first
      
      case 'destination_az':
        const destA = getFirstDestinationName(a);
        const destB = getFirstDestinationName(b);
        return destA.localeCompare(destB);
      
      case 'destination_za':
        const destA2 = getFirstDestinationName(a);
        const destB2 = getFirstDestinationName(b);
        return destB2.localeCompare(destA2);
      
      case 'status':
        const statusA = a.status || 'not_contacted';
        const statusB = b.status || 'not_contacted';
        return statusA.localeCompare(statusB);
      
      case 'newest':
      default:
        const createdA = new Date(a.created_at).getTime();
        const createdB = new Date(b.created_at).getTime();
        return createdB - createdA; // Newest first
    }
  });

  const stats = {
    total: operators.length,
    not_contacted: operators.filter(op => op.status === 'not_contacted').length,
    emailsSent: operators.filter(op => op.date_sent_email).length,
    newThisWeek: operators.filter(op => {
      const created = new Date(op.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    }).length,
  };

  return (
    <>
      <NavigationNext />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white text-sm mb-1">Hi, Matthijs</p>
              <h1 className="text-3xl font-bold text-white mb-2">Tour Operators CRM</h1>
              <p className="text-white">Manage operator outreach</p>
            </div>
            <Button onClick={fetchOperators} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search operators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-gray-600 mt-1">Total Operators</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-600">{stats.not_contacted}</div>
                <p className="text-xs text-gray-600 mt-1">Not Contacted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{stats.emailsSent}</div>
                <p className="text-xs text-gray-600 mt-1">Emails Sent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{stats.newThisWeek}</div>
                <p className="text-xs text-gray-600 mt-1">New This Week</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinations</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Sent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <div className="flex items-center gap-2">
                          <span>Actions</span>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="ml-2 px-2 py-1 border border-gray-300 rounded text-xs bg-white text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 min-w-[160px]"
                          >
                            <option value="newest">Newest First</option>
                            <option value="date_sent_newest">Date Sent (Newest)</option>
                            <option value="date_sent_oldest">Date Sent (Oldest)</option>
                            <option value="destination_az">Destination (A-Z)</option>
                            <option value="destination_za">Destination (Z-A)</option>
                            <option value="status">Status</option>
                          </select>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sorted.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          {searchTerm ? 'No operators found' : 'No operators yet'}
                        </td>
                      </tr>
                    ) : (
                      sorted.map((op) => {
                        const productIds = Array.isArray(op.tour_product_ids) ? op.tour_product_ids : [];
                        const destIds = Array.isArray(op.destination_ids) ? op.destination_ids : [];
                        const destNames = destIds.map(id => destinationNames[id]).filter(Boolean);
                        return (
                          <tr key={op.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{op.operator_name}</div>
                              <div className="text-xs text-gray-500">{new Date(op.created_at).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              {destNames.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {destNames.map((name, idx) => (
                                    <div key={idx} className="text-xs text-gray-700">{name}</div>
                                  ))}
                                  {destIds.length > destNames.length && (
                                    <div className="text-xs text-gray-400">
                                      {destIds.length - destNames.length} unknown
                                    </div>
                                  )}
                                </div>
                              ) : destIds.length > 0 ? (
                                <div className="text-xs text-gray-400 italic">Loading...</div>
                              ) : (
                                <div className="text-xs text-gray-400 italic">Not set</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                {productIds.slice(0, 3).map((pid, idx) => (
                                  <Link key={idx} href={getTourUrl(pid)} target="_blank" className="text-blue-600 hover:underline text-xs">
                                    {pid}
                                  </Link>
                                ))}
                                {productIds.length > 3 && <span className="text-xs text-gray-500">+{productIds.length - 3} more</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">{op.email || <span className="text-gray-400 italic">Not set</span>}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                {op.date_sent_email ? new Date(op.date_sent_email).toLocaleDateString() : <span className="text-gray-400 italic">Not set</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={STATUS_COLORS[op.status] || STATUS_COLORS.not_contacted}>
                                {op.status || 'not_contacted'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(op)}>
                                <Edit className="w-4 h-4 mr-1" /> Edit
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <FooterNext />

      {/* Edit Modal */}
      <AnimatePresence>
        {modalOpen && selectedOperator && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed */}
              <div className="flex-shrink-0 p-6 sm:p-8 pb-4 border-b border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 pr-8">Edit Operator</h2>
                <p className="text-gray-600">
                  {selectedOperator.operator_name}
                  {(() => {
                    const destIds = Array.isArray(selectedOperator.destination_ids) ? selectedOperator.destination_ids : [];
                    const destNames = destIds.map(id => destinationNames[id]).filter(Boolean);
                    if (destNames.length > 0) {
                      return ` - ${destNames.join(', ')}`;
                    }
                    return '';
                  })()}
                </p>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-4">
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      placeholder="operator@example.com"
                      className="w-full"
                    />
                  </div>

                  {/* Date Sent Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Sent Email</label>
                    <Input
                      type="date"
                      value={editData.date_sent_email}
                      onChange={(e) => setEditData({ ...editData, date_sent_email: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  {/* Reminder Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Date</label>
                    <Input
                      type="date"
                      value={editData.reminder_date}
                      onChange={(e) => setEditData({ ...editData, reminder_date: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="not_contacted">Not Contacted</option>
                      <option value="no_answer">No Answer</option>
                      <option value="declined">Declined</option>
                      <option value="claimed_promo">Claimed Promo</option>
                      <option value="paid_subscribed">Paid Subscribed</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={editData.notes || ''}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      placeholder="Add notes..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer - Fixed */}
              <div className="flex-shrink-0 p-6 sm:p-8 pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button
                    onClick={handleCloseModal}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 hover:border-gray-400 font-semibold"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1 font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

