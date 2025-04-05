'use client';

interface MatchActionButtonsProps {
  matchId: string;
  onAction: (matchId: string, action: 'accepted' | 'rejected') => Promise<void>;
}

export default function MatchActionButtons({ matchId, onAction }: MatchActionButtonsProps) {
  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={() => onAction(matchId, 'accepted')}
        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
      >
        Accept
      </button>
      <button
        onClick={() => onAction(matchId, 'rejected')}
        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
      >
        Reject
      </button>
    </div>
  );
}
