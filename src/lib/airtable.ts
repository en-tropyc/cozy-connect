import Airtable from 'airtable';

// Check if we're on the server side
const isServer = typeof window === 'undefined';

// Initialize Airtable only on server side
let airtable: Airtable | null = null;
let base: Airtable.Base | null = null;

if (isServer) {
  airtable = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  });
  base = airtable.base(process.env.AIRTABLE_BASE_ID!);
}

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
  'Instagram',
  'GitHub',
  'Categories/Skills 分類',
  'I am looking for 我在尋找什麼？',
  'I can offer 我可以提供什麼？'
];

// Utility function to get user profile by email
export async function getUserProfile(email: string) {
  if (!base) throw new Error('Airtable base not initialized');

  const profiles = await base(PROFILES_TABLE_ID)
    .select({
      filterByFormula: `{Cozy Connect Gmail} = '${email}'`,
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

  const matches = await base(MATCHES_TABLE_ID)
    .select({
      filterByFormula: `OR({Swiper} = '${userId}', {Swiped} = '${userId}')`,
      fields: ['Swiper', 'Swiped', 'Status']
    })
    .all();

  // Separate matches where user is the swiper vs. the swiped person
  const matchesWhereUserIsSwiper = matches.filter(match => match.fields.Swiper === userId);
  const matchesWhereUserIsSwiped = matches.filter(match => match.fields.Swiped === userId);

  return {
    matchesWhereUserIsSwiper,
    matchesWhereUserIsSwiped
  };
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
  cozyConnectGmail?: string;   // Cozy Connect Gmail
  instagram?: string;          // Instagram
  github?: string;             // GitHub
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
  active?: boolean;           // Whether the profile should be shown
  isMatch?: boolean;          // Whether this profile is a match
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
