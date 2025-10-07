import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Save, Trash2, Edit, Eye, Upload, Download,
  MapPin, Image, Activity, HelpCircle, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const AdminData = () => {
  const [destinations, setDestinations] = useState([]);
  const [currentDestination, setCurrentDestination] = useState({
    id: '',
    name: '',
    imageUrl: '',
    activities: ['', '', '', '', ''],
    faqs: [
      { question: '', answer: '' },
      { question: '', answer: '' },
      { question: '', answer: '' }
    ]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Load existing data on component mount
  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = () => {
    try {
      const saved = localStorage.getItem('adminDestinations');
      if (saved) {
        setDestinations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading destinations:', error);
    }
  };

  const saveDestinations = (data) => {
    try {
      localStorage.setItem('adminDestinations', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving destinations:', error);
      return false;
    }
  };

  const resetForm = () => {
    setCurrentDestination({
      id: '',
      name: '',
      imageUrl: '',
      activities: ['', '', '', '', ''],
      faqs: [
        { question: '', answer: '' },
        { question: '', answer: '' },
        { question: '', answer: '' }
      ]
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleActivityChange = (index, value) => {
    const newActivities = [...currentDestination.activities];
    newActivities[index] = value;
    setCurrentDestination(prev => ({
      ...prev,
      activities: newActivities
    }));
  };

  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...currentDestination.faqs];
    newFaqs[index] = {
      ...newFaqs[index],
      [field]: value
    };
    setCurrentDestination(prev => ({
      ...prev,
      faqs: newFaqs
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!currentDestination.name.trim()) {
      toast({
        title: "Error",
        description: "Destination name is required",
        variant: "destructive"
      });
      return;
    }

    if (!currentDestination.imageUrl.trim()) {
      toast({
        title: "Error",
        description: "Image URL is required",
        variant: "destructive"
      });
      return;
    }

    const newDestination = {
      ...currentDestination,
      id: isEditing ? editingId : Date.now().toString(),
      name: currentDestination.name.trim(),
      imageUrl: currentDestination.imageUrl.trim(),
      activities: currentDestination.activities.filter(activity => activity.trim() !== ''),
      faqs: currentDestination.faqs.filter(faq => faq.question.trim() !== '' && faq.answer.trim() !== '')
    };

    let updatedDestinations;
    if (isEditing) {
      updatedDestinations = destinations.map(dest => 
        dest.id === editingId ? newDestination : dest
      );
    } else {
      updatedDestinations = [...destinations, newDestination];
    }

    if (saveDestinations(updatedDestinations)) {
      setDestinations(updatedDestinations);
      resetForm();
      toast({
        title: "Success",
        description: isEditing ? "Destination updated successfully!" : "Destination added successfully!"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save destination",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (destination) => {
    setCurrentDestination({
      id: destination.id,
      name: destination.name,
      imageUrl: destination.imageUrl,
      activities: [...destination.activities, '', '', '', '', ''].slice(0, 5),
      faqs: [...destination.faqs, { question: '', answer: '' }, { question: '', answer: '' }, { question: '', answer: '' }].slice(0, 3)
    });
    setIsEditing(true);
    setEditingId(destination.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      const updatedDestinations = destinations.filter(dest => dest.id !== id);
      if (saveDestinations(updatedDestinations)) {
        setDestinations(updatedDestinations);
        toast({
          title: "Success",
          description: "Destination deleted successfully!"
        });
      }
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(destinations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'destinations-data.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Data exported successfully!"
    });
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data)) {
            setDestinations(data);
            saveDestinations(data);
            toast({
              title: "Success",
              description: "Data imported successfully!"
            });
          } else {
            throw new Error('Invalid data format');
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Invalid JSON file",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Destination Admin</h1>
          <p className="text-gray-600">Manage destinations, activities, and FAQs</p>
        </div>

        {/* Export/Import Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <Button onClick={exportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {isEditing ? 'Edit Destination' : 'Add New Destination'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Destination Name
                    </label>
                    <Input
                      value={currentDestination.name}
                      onChange={(e) => setCurrentDestination(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Paris, France"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Image className="h-4 w-4 inline mr-1" />
                      Image URL
                    </label>
                    <Input
                      value={currentDestination.imageUrl}
                      onChange={(e) => setCurrentDestination(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>
                </div>

                {/* Popular Activities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Activity className="h-4 w-4 inline mr-1" />
                    Popular Activities (Search Terms for Viator API)
                  </label>
                  <div className="space-y-3">
                    {currentDestination.activities.map((activity, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={activity}
                          onChange={(e) => handleActivityChange(index, e.target.value)}
                          placeholder={`Activity ${index + 1} (e.g., "aruba snorkeling tours")`}
                        />
                        {activity && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivityChange(index, '')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <HelpCircle className="h-4 w-4 inline mr-1" />
                    Frequently Asked Questions
                  </label>
                  <div className="space-y-4">
                    {currentDestination.faqs.map((faq, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Question {index + 1}
                          </label>
                          <Textarea
                            value={faq.question}
                            onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                            placeholder="Enter question..."
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Answer {index + 1}
                          </label>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                            placeholder="Enter answer..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isEditing ? 'Update Destination' : 'Add Destination'}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Destinations List */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Destinations ({destinations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {destinations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No destinations added yet</p>
                ) : (
                  destinations.map((destination) => (
                    <motion.div
                      key={destination.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{destination.name}</h3>
                          <p className="text-sm text-gray-500">
                            {destination.activities.length} activities • {destination.faqs.length} FAQs
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(destination)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(destination.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Preview Activities */}
                      {destination.activities.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-600 mb-1">Activities:</p>
                          <div className="flex flex-wrap gap-1">
                            {destination.activities.map((activity, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preview Image */}
                      {destination.imageUrl && (
                        <div className="w-full h-32 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={destination.imageUrl}
                            alt={destination.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminData; 