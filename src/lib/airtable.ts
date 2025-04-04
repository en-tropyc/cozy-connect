import Airtable from 'airtable';

// Check if we're on the server side
const isServer = typeof window === 'undefined';

// Initialize Airtable only on server side
let airtable: Airtable | null = null;
let base: Airtable.Base | null = null;

// Table IDs
export const MATCHES_TABLE_ID = 'tblfmOco0ONZsxF1b';
export const PROFILES_TABLE_ID = 'tbl9Jj8pIUABtsXRo';

// Common profile fields to fetch
const PROFILE_FIELDS = [
  'Name 名子',
  'Email 電子信箱',
  'Picture 照片',
  'Company/Title 公司職稱',
  '🌏 Where are you from? 你從哪裡來？',
  'Short intro 簡短介紹自己',
  'LinkedIn Link',
  'Instagram'
];

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

// Utility function to get user profile by email
export async function getUserProfile(email: string) {
  if (!base) throw new Error('Airtable base not initialized');

  const profiles = await base(PROFILES_TABLE_ID)
    .select({
      filterByFormula: `{Email 電子信箱} = '${email}'`,
      maxRecords: 1,
      fields: PROFILE_FIELDS
    })
    .firstPage();
    
  return profiles[0];
}

// Utility function to get profile by ID
export async function getProfileById(id: string) {
  if (!base) throw new Error('Airtable base not initialized');

  const profiles = await base(PROFILES_TABLE_ID)
    .select({
      filterByFormula: `RECORD_ID() = '${id}'`,
      maxRecords: 1,
      fields: PROFILE_FIELDS
    })
    .firstPage();
    
  return profiles[0];
}

// Utility function to create a match
export async function createMatch(swiperId: string, swipedId: string) {
  if (!base) throw new Error('Airtable base not initialized');
  
  const records = await base(MATCHES_TABLE_ID).create([
    {
      fields: {
        Swiper: swiperId,
        Swiped: swipedId,
        Status: 'pending'
      }
    }
  ]);
  
  return records[0];
}

// Utility function to get all matches for a user
export async function getUserMatches(userId: string) {
  if (!base) throw new Error('Airtable base not initialized');

  return base(MATCHES_TABLE_ID)
    .select({
      filterByFormula: `OR({Swiper} = '${userId}', {Swiped} = '${userId}')`,
      fields: ['Swiper', 'Swiped', 'Status']
    })
    .all();
}

// Utility function to get multiple profiles by IDs efficiently
export async function getProfilesByIds(ids: string[]) {
  if (!base) throw new Error('Airtable base not initialized');
  if (ids.length === 0) return [];

  return base(PROFILES_TABLE_ID)
    .select({
      filterByFormula: `OR(${ids.map(id => `RECORD_ID() = '${id}'`).join(',')})`,
      fields: PROFILE_FIELDS
    })
    .all();
}

// Export the base instance and Profile interface
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

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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

    // Shuffle all profiles
    return shuffleArray(data.profiles);

  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
}; 
