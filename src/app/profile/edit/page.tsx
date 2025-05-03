'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Profile } from '@/lib/airtable';
import imageCompression from 'browser-image-compression';

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

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [currentPictureUrl, setCurrentPictureUrl] = useState<string | null>(null);
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

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/profile/me');
          const data = await response.json();

          if (data.success && data.profile) {
            const profile: Profile = data.profile;
            setProfileId(profile.id);

            setFormData({
              name: profile.name ?? '',
              shortIntro: profile.shortIntro ?? '',
              picture: null,
              companyTitle: profile.companyTitle ?? '',
              fromLocation: profile.location ?? '',
              githubUrl: profile.github ?? '',
              instagram: profile.instagram ?? '',
              linkedinLink: profile.linkedinLink ?? '',
              categories: profile.categories ?? [],
              lookingFor: profile.lookingFor ?? '',
              canOffer: profile.canOffer ?? '',
              openToWork: profile.openToWork ?? '',
              other: profile.other ?? '',
            });

            setCurrentPictureUrl(profile.picture?.[0]?.url ?? null);

          } else {
            toast.error(data.error || 'Failed to load profile data.');
          }
        } catch (error) {
          toast.error('Failed to load your profile data.');
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) {
      toast.error('Please sign in to update your profile');
      return;
    }
    if (!profileId) {
       toast.error('Could not load profile ID. Cannot update.');
       return;
    }

    // Basic Frontend Validation (add more if needed)
     if (!formData.name || !formData.fromLocation || !formData.shortIntro ||
         !formData.categories || formData.categories.length === 0 ||
         !formData.lookingFor || !formData.canOffer) {
       toast.error('Please fill in all required fields (*)');
       return;
     }


    setIsSubmitting(true);
    try {
      let finalPictureData: Profile['picture'] | undefined = undefined;

      // Log 1: Check picture state before upload logic
      console.log('handleSubmit: formData.picture state:', formData.picture);

      // 1. Upload new picture if one was selected
      if (formData.picture instanceof Blob) {
         console.log("handleSubmit: Attempting to upload new picture (Blob detected)...");
         const uploadFormData = new FormData();
         // IMPORTANT: Append the Blob correctly, including filename
         uploadFormData.append('file', formData.picture, formData.picture.name);

         const uploadResponse = await fetch('/api/upload', { // Assuming /api/upload exists and works
           method: 'POST',
           body: uploadFormData
         });

         const uploadResult = await uploadResponse.json();
         // Log 2: Check upload result
         console.log('handleSubmit: Upload API result:', uploadResult);

         if (!uploadResult.success || !uploadResult.url) {
           throw new Error(uploadResult.error || 'Failed to upload new image');
         }
         // Prepare picture data including filename
         finalPictureData = [{
             url: uploadResult.url,
             filename: formData.picture.name // Get filename from the Blob object
         }];
         // Log 3: Check final picture data structure
         console.log('handleSubmit: finalPictureData prepared:', finalPictureData);
      } else {
         console.log('handleSubmit: No new picture Blob found in state.');
      }

      // 2. Prepare data for the update API
      const updatePayload: Partial<Profile> = { // Base payload without picture
        name: formData.name,
        shortIntro: formData.shortIntro,
        companyTitle: formData.companyTitle,
        location: formData.fromLocation,
        github: formData.githubUrl,
        instagram: formData.instagram,
        linkedinLink: formData.linkedinLink,
        categories: formData.categories,
        lookingFor: formData.lookingFor,
        canOffer: formData.canOffer,
        openToWork: formData.openToWork,
        other: formData.other,
      };

      // If a new picture was uploaded, add it to the payload
      if (finalPictureData) {
          // Assigning directly often bypasses stricter spread type checks
          (updatePayload as any).picture = finalPictureData;
      }


       // Remove undefined fields (important to do this AFTER adding picture)
       Object.keys(updatePayload).forEach(key => {
          if (updatePayload[key as keyof typeof updatePayload] === undefined || updatePayload[key as keyof typeof updatePayload] === '') {
             // Also delete empty strings to avoid overwriting with empty? Or handle differently?
             // For now, just handling undefined as before. Revisit if needed.
             if (updatePayload[key as keyof typeof updatePayload] === undefined) {
                delete updatePayload[key as keyof typeof updatePayload];
             }
         }
       });

      // Log 4: Check the final payload being sent
      console.log("handleSubmit: Sending PUT request to /api/profile/update with payload:", JSON.stringify(updatePayload, null, 2));

      // 3. Call the update API endpoint
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload) // Send the mapped data
      });

      const result = await response.json();
      // Log 5: Check the result from the update API
      console.log('handleSubmit: Update API result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      // Optional: redirect to home or profile view page
      router.push('/');

    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
          return;
      }

      console.log(`Original file size: ${file.size / 1024 / 1024} MB`);

      // Compression options (adjust as needed)
      const options = {
        maxSizeMB: 1,          // Max file size in MB
        maxWidthOrHeight: 1024, // Max width or height
        useWebWorker: true,    // Use multi-threading for faster compression
        // fileType: 'image/jpeg', // Force output type (optional)
      };

      try {
        setIsSubmitting(true); // Show loading indicator during compression
        toast('Compressing image...', { id: 'compressing-toast' });
        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed file size: ${compressedFile.size / 1024 / 1024} MB`);
        toast.dismiss('compressing-toast');

        // Store the compressed file Blob in state
        setFormData(prev => ({ ...prev, picture: compressedFile as File })); // Cast Blob back to File for type consistency

        // Update preview URL using the compressed file
        if (currentPictureUrl) {
            URL.revokeObjectURL(currentPictureUrl); // Clean up previous preview URL
        }
        setCurrentPictureUrl(URL.createObjectURL(compressedFile));

      } catch (error) {
        toast.dismiss('compressing-toast');
        console.error('Image compression error:', error);
        toast.error('Failed to compress image. Please try a different image.');
        // Optionally clear the file input/state if compression fails
        event.target.value = ''; // Clear the file input
        setFormData(prev => ({ ...prev, picture: null }));
        setCurrentPictureUrl(null); // Clear preview if needed
      } finally {
          setIsSubmitting(false); // Hide loading indicator
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
         <div>Loading profile...</div>
       </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
        <p className="text-gray-600">You need to be signed in to edit your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Your Profile</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label htmlFor="picture" className="block text-sm font-medium text-gray-700">
                  Profile Picture
                </label>
                {currentPictureUrl && (
                   <div className="mt-2 mb-2">
                     <img src={currentPictureUrl} alt="Current profile" className="h-20 w-20 rounded-full object-cover" />
                   </div>
                 )}
                <input
                  type="file"
                  id="picture"
                  name="picture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                 <p className="mt-1 text-xs text-gray-500">Upload a new picture to replace the current one.</p>
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
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
