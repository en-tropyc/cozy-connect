'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface ProfileFormData {
  name: string;
  shortIntro: string;
  companyTitle?: string;
  location?: string;
  instagram?: string;
  linkedinLink?: string;
  categories?: string[];
  lookingFor?: string;
  canOffer?: string;
  openToWork?: string;
  other?: string;
}

const CATEGORIES = [
  'Entrepreneur 創業家',
  'Content Creator 內容創作者',
  'Designer 設計師',
  'Marketing 行銷',
  'Social Media 社群媒體',
  'Community Builder 社群經營者',
  'Wellness 健康',
  'HR/Life Coach 職涯生涯教練',
  'Developer 開發者',
  'Product Manager 產品經理',
  'Investor 投資人',
  'Business Development 商務開發',
  'Sales 銷售',
  'Operations 營運',
];

export default function CreateProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    shortIntro: '',
    companyTitle: '',
    location: '',
    instagram: '',
    linkedinLink: '',
    categories: [],
    lookingFor: '',
    canOffer: '',
    openToWork: '',
    other: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) {
      toast.error('Please sign in to create a profile');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          email: session.user.email,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create profile');
      }

      toast.success('Profile created successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories?.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...(prev.categories || []), category],
    }));
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
        <p className="text-gray-600">You need to be signed in to create a profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Your Profile</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="shortIntro" className="block text-sm font-medium text-gray-700">
                  Short Introduction*
                </label>
                <textarea
                  id="shortIntro"
                  name="shortIntro"
                  required
                  value={formData.shortIntro}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="companyTitle" className="block text-sm font-medium text-gray-700">
                  Company/Title
                </label>
                <input
                  type="text"
                  id="companyTitle"
                  name="companyTitle"
                  value={formData.companyTitle}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map(category => (
                  <label
                    key={category}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={formData.categories?.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Social Links</h2>
              
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                  Instagram
                </label>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@username"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="linkedinLink" className="block text-sm font-medium text-gray-700">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  id="linkedinLink"
                  name="linkedinLink"
                  value={formData.linkedinLink}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
              
              <div>
                <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700">
                  What are you looking for?
                </label>
                <textarea
                  id="lookingFor"
                  name="lookingFor"
                  value={formData.lookingFor}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="canOffer" className="block text-sm font-medium text-gray-700">
                  What can you offer?
                </label>
                <textarea
                  id="canOffer"
                  name="canOffer"
                  value={formData.canOffer}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="openToWork" className="block text-sm font-medium text-gray-700">
                  Are you open for work opportunities?
                </label>
                <input
                  type="text"
                  id="openToWork"
                  name="openToWork"
                  value={formData.openToWork}
                  onChange={handleChange}
                  placeholder="E.g., Looking for freelance projects, Full-time positions, etc."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="other" className="block text-sm font-medium text-gray-700">
                  Anything else?
                </label>
                <textarea
                  id="other"
                  name="other"
                  value={formData.other}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating Profile...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
