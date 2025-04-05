'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface ProfileFormData {
  name: string;
  shortIntro: string;
  picture: File | null;
  companyTitle?: string;
  fromLocation?: string;
  githubUrl?: string;
  instagram?: string;
  linkedinLink?: string;
  categories?: string[];
  lookingFor: string;
  canOffer: string;
  openToWork?: string;
  other?: string;
}

const CATEGORIES = [
  'Entrepreneur 創業家',
  'Engineer 工程師',
  'Content Creator 內容創作者',
  'Designer 設計師',
  'Product Management 產品管理',
  'Nomad 數位遊牧',
  'Web3/Crypto 區塊鏈',
  'Social Media 社群媒體',
  'Marketing 行銷',
  'Student 學生',
  'HR/Life Coach 職涯生涯教練',
  'Community Builder 社群經營者',
  'Wellness 健康',
  'AI 人工智慧',
];

export default function CreateProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    shortIntro: '',
    picture: null,
    companyTitle: '',
    fromLocation: '',
    githubUrl: '',
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

    // Validate required fields
    if (!formData.picture) {
      toast.error('Please upload a profile picture');
      return;
    }
    if (!formData.name) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.fromLocation) {
      toast.error('Please enter where you are from');
      return;
    }
    if (!formData.shortIntro) {
      toast.error('Please enter a short introduction');
      return;
    }
    if (!formData.categories || formData.categories.length === 0) {
      toast.error('Please select at least one category/skill');
      return;
    }
    if (!formData.lookingFor) {
      toast.error('Please enter what you are looking for');
      return;
    }
    if (!formData.canOffer) {
      toast.error('Please enter what you can offer');
      return;
    }

    setLoading(true);
    try {
      // First, upload the image to S3
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.picture);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const uploadResult = await uploadResponse.json();
      console.log('Upload response:', uploadResult);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      // Create profile data with the S3 image URL
      const profileData = {
        name: formData.name,
        shortIntro: formData.shortIntro,
        companyTitle: formData.companyTitle,
        fromLocation: formData.fromLocation,
        githubUrl: formData.githubUrl,
        instagram: formData.instagram,
        linkedinLink: formData.linkedinLink,
        categories: formData.categories,
        lookingFor: formData.lookingFor,
        canOffer: formData.canOffer,
        openToWork: formData.openToWork,
        other: formData.other,
        email: session.user.email,
        picture: [{
          url: uploadResult.url,
          filename: formData.picture.name
        }]
      };

      // Create the profile with the image URL
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create profile');
      }

      toast.success('Profile created successfully!');
      
      // Add a delay to ensure the profile is propagated
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if profile exists before redirecting
      console.log('Checking profile existence...');
      const checkResponse = await fetch('/api/profile/check');
      const checkResult = await checkResponse.json();
      console.log('Profile check response:', checkResult);
      
      if (!checkResult.success) {
        console.error('Profile check failed:', checkResult.error);
        throw new Error(`Profile creation succeeded but profile check failed: ${checkResult.error}. Please try refreshing the page.`);
      }
      
      // Redirect to matches page
      router.push('/matches');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error(error.message || 'Failed to create profile. Please try again.');
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
                <label htmlFor="picture" className="block text-sm font-medium text-gray-700">
                  Profile Picture <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="picture"
                  name="picture"
                  required
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    console.log('File selected:', file);
                    if (file) {
                      setFormData(prev => ({ ...prev, picture: file }));
                    }
                  }}
                  className="mt-1 block w-full text-sm text-gray-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="fromLocation" className="block text-sm font-medium text-gray-700">
                  Where are you from? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fromLocation"
                  name="fromLocation"
                  required
                  value={formData.fromLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="shortIntro" className="block text-sm font-medium text-gray-700">
                  Short Introduction <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="shortIntro"
                  name="shortIntro"
                  required
                  value={formData.shortIntro}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Categories/Skills <span className="text-red-500">*</span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map(category => (
                  <label
                    key={category}
                    className="flex items-center space-x-2 text-sm text-gray-900 hover:text-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.categories?.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="select-none">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Social Links</h2>
              
              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                />
              </div>

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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
              
              <div>
                <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700">
                  What are you looking for? <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="lookingFor"
                  name="lookingFor"
                  required
                  value={formData.lookingFor}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="canOffer" className="block text-sm font-medium text-gray-700">
                  What can you offer? <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="canOffer"
                  name="canOffer"
                  required
                  value={formData.canOffer}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Fields marked with <span className="text-red-500">*</span> are required
              </p>
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
