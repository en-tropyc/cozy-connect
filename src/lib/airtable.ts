import Airtable from 'airtable';

// Check if we're on the server side
const isServer = typeof window === 'undefined';

// Initialize Airtable only on server side
let airtable: Airtable | null = null;
let base: Airtable.Base | null = null;

if (isServer) {
  if (!process.env.AIRTABLE_API_KEY) {
    throw new Error('AIRTABLE_API_KEY is required');
  }
  
  airtable = new Airtable({ 
    apiKey: process.env.AIRTABLE_API_KEY,
    endpointUrl: 'https://api.airtable.com',
  });

  if (!process.env.AIRTABLE_BASE_ID) {
    throw new Error('AIRTABLE_BASE_ID is required');
  }

  base = airtable.base(process.env.AIRTABLE_BASE_ID);
}

// Export the base instance
export { base };

export interface Profile {
  id: string;
  name: string;                 // Name 名子
  email?: string;              // Email 電子信箱
  instagram?: string;          // Instagram
  shortIntro: string;          // Short intro 簡短介紹自己
  linkedinLink?: string;       // LinkedIn Link
  companyTitle?: string;       // Company/Title 公司職稱
  picture?: {                  // Picture 照片
    id: string;
    url: string;
    filename: string;
    type: string;
  }[];
  categories?: string[];       // Categories/Skills 分類
  lookingFor?: string;        // I am looking for 我在尋找什麼？
  canOffer?: string;          // I can offer 我可以提供什麼？
  openToWork?: string;        // I am open for work 我在找工作機會
  other?: string;             // Other
  lastModified?: string;      // Last Modified
  location?: string;          // 🌏 Where are you from? 你從哪裡來？
}

export const getProfiles = async (): Promise<Profile[]> => {
  try {
    const response = await fetch('/api/profiles');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch profiles');
    }

    return data.profiles;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
}; 
