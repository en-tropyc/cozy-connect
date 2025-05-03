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
  picture?: { // Make properties optional or use a simpler type for updates
    id?: string; // Make optional
    url: string; // Keep url required
    filename?: string; // Make optional
    type?: string; // Make optional
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

// Utility function to update a user profile
export async function updateUserProfile(recordId: string, dataToUpdate: Partial<Profile>) {
  if (!base) throw new Error('Airtable base not initialized');
  if (!recordId) throw new Error('Missing record ID for update');

  // Map Profile fields back to Airtable field names if necessary
  // Note: This example assumes direct mapping. Adjust if Airtable names differ significantly.
  // We need to be careful about the 'picture' field structure.
  const fieldsToUpdate: { [key: string]: any } = {};

  // Map standard fields (ensure keys exist in dataToUpdate before adding)
  if (dataToUpdate.hasOwnProperty('name')) fieldsToUpdate['Name 名子'] = dataToUpdate.name;
  if (dataToUpdate.hasOwnProperty('shortIntro')) fieldsToUpdate['Short intro 簡短介紹自己'] = dataToUpdate.shortIntro;
  if (dataToUpdate.hasOwnProperty('companyTitle')) fieldsToUpdate['Company/Title 公司職稱'] = dataToUpdate.companyTitle;
  if (dataToUpdate.hasOwnProperty('location')) fieldsToUpdate['🌏 Where are you from? 你從哪裡來？'] = dataToUpdate.location; // Map from form's 'fromLocation' via API payload
  if (dataToUpdate.hasOwnProperty('github')) fieldsToUpdate['GitHub'] = dataToUpdate.github; // Map from form's 'githubUrl' via API payload
  if (dataToUpdate.hasOwnProperty('instagram')) fieldsToUpdate['Instagram'] = dataToUpdate.instagram;
  if (dataToUpdate.hasOwnProperty('linkedinLink')) fieldsToUpdate['LinkedIn Link'] = dataToUpdate.linkedinLink;
  if (dataToUpdate.hasOwnProperty('categories')) fieldsToUpdate['Categories/Skills 分類'] = dataToUpdate.categories;
  if (dataToUpdate.hasOwnProperty('lookingFor')) fieldsToUpdate['I am looking for 我在尋找什麼？'] = dataToUpdate.lookingFor;
  if (dataToUpdate.hasOwnProperty('canOffer')) fieldsToUpdate['I can offer 我可以提供什麼？'] = dataToUpdate.canOffer;
  if (dataToUpdate.hasOwnProperty('openToWork')) fieldsToUpdate['I am open for work 我在找工作機會'] = dataToUpdate.openToWork;
  if (dataToUpdate.hasOwnProperty('other')) fieldsToUpdate['Other'] = dataToUpdate.other;

  // Handle picture update - expects specific Airtable format
  if (dataToUpdate.picture && Array.isArray(dataToUpdate.picture) && dataToUpdate.picture.length > 0) {
      // Assuming the API sends the correct format: [{ url: '...' }]
      // If filename is also needed: [{ url: '...', filename: '...' }]
      fieldsToUpdate['Picture 照片'] = dataToUpdate.picture;
  } else if (dataToUpdate.hasOwnProperty('picture') && dataToUpdate.picture === null) {
      // If the intention is to clear the picture
      fieldsToUpdate['Picture 照片'] = null; // Or potentially [] depending on Airtable field setup
  }
   // Note: We might not need email/cozyConnectGmail update if they are fixed identifiers

  console.log("Updating Airtable record:", recordId, "with fields:", fieldsToUpdate);

  // Perform the update
  const updatedRecords = await base(PROFILES_TABLE_ID).update([
    {
      id: recordId,
      fields: fieldsToUpdate,
    },
  ]);

  console.log("Airtable update response:", updatedRecords);
  return updatedRecords[0]; // Return the updated record
} 
