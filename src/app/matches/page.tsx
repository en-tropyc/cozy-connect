import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserProfile, getUserMatches, getProfilesByIds } from '@/lib/airtable';
import type { Profile } from '@/lib/airtable';
import type { Record } from 'airtable';
import { redirect } from 'next/navigation';
import MatchesClient from './MatchesClient';

interface Match extends Profile {
  matchId: string;
}

interface MatchRecord extends Record<any> {
  fields: {
    Swiper: string;
    Swiped: string;
    Status: 'pending' | 'accepted' | 'rejected';
  };
}

export default async function MatchesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  try {
    const userProfile = await getUserProfile(session.user.email);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    const { matchesWhereUserIsSwiper, matchesWhereUserIsSwiped } = await getUserMatches(userProfile.id);
    console.log('Raw matches:', { matchesWhereUserIsSwiper, matchesWhereUserIsSwiped });

    // Get profiles for all matches
    const allMatchIds = [
      ...matchesWhereUserIsSwiper.map(m => (m as MatchRecord).fields.Swiped),
      ...matchesWhereUserIsSwiped.map(m => (m as MatchRecord).fields.Swiper)
    ];
    console.log('All match IDs:', allMatchIds);

    const profileRecords = await getProfilesByIds(allMatchIds);
    console.log('Raw profile records:', JSON.stringify(profileRecords, null, 2));

    // Convert Airtable records to Profile objects
    const profiles = profileRecords.map(record => {
      console.log('Processing record:', record.id, record.fields);
      return {
        id: record.id,
        name: record.fields['Name 名子'] as string,
        email: record.fields['Email 電子信箱'] as string,
        cozyConnectGmail: record.fields['Cozy Connect Gmail'] as string,
        instagram: record.fields['Instagram'] as string,
        shortIntro: record.fields['Short intro 簡短介紹自己'] as string,
        linkedinLink: record.fields['LinkedIn Link'] as string,
        categories: record.fields['Categories/Skills 分類'] as string[],
        lookingFor: record.fields['I am looking for 我在尋找什麼？'] as string,
        canOffer: record.fields['I can offer 我可以提供什麼？'] as string,
        companyTitle: record.fields['Company/Title 公司職稱'] as string,
        picture: record.fields['Picture 照片'] as any[],
        location: record.fields['🌏 Where are you from? 你從哪裡來？'] as string
      };
    });

    // Process matches where user is swiped (these are connection requests)
    const pendingConnectionRequests = matchesWhereUserIsSwiped
      .filter(match => (match as MatchRecord).fields.Status === 'pending')
      .map(match => {
        const profile = profiles.find(p => p.id === (match as MatchRecord).fields.Swiper);
        if (!profile || !profile.name || !profile.shortIntro) return null;
        return {
          ...profile,
          matchId: match.id
        } as Match;
      })
      .filter((match): match is Match => match !== null);

    // Process accepted matches (both where user is swiper or swiped)
    const accepted = [
      ...matchesWhereUserIsSwiper,
      ...matchesWhereUserIsSwiped
    ]
      .filter(match => (match as MatchRecord).fields.Status === 'accepted')
      .map(match => {
        const profileId = (match as MatchRecord).fields.Swiper === userProfile.id 
          ? (match as MatchRecord).fields.Swiped 
          : (match as MatchRecord).fields.Swiper;
        const profile = profiles.find(p => p.id === profileId);
        if (!profile || !profile.name || !profile.shortIntro) return null;
        return {
          ...profile,
          matchId: match.id
        } as Match;
      })
      .filter((match): match is Match => match !== null);

    return <MatchesClient 
      pendingMatches={pendingConnectionRequests}
      acceptedMatches={accepted}
    />;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Matches</h1>
        <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Failed to load matches'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
} 
