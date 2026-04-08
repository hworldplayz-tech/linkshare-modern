import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Vote, 
  Globe, 
  TrendingUp, 
  Users, 
  AlertCircle,
  CheckCircle2,
  Trophy,
  Flag,
  Info
} from 'lucide-react';
import { 
  db, 
  doc, 
  onSnapshot, 
  updateDoc, 
  increment, 
  serverTimestamp,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  setDoc,
  getDoc
} from '../firebase';
import { Button } from './ui/Button';

interface PollData {
  realVotesIran: number;
  realVotesIsrael: number;
  fakeVotesIran: number;
  fakeVotesIsrael: number;
  iranFlagUrl?: string;
  israelFlagUrl?: string;
  useFakeVotes: boolean;
  showCountries?: boolean;
  lastUpdated: any;
}

interface CountryVote {
  countryCode: string;
  countryName: string;
  flagUrl?: string;
  votesIran: number;
  votesIsrael: number;
}

export const IranVsIsraelPage = () => {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [countryVotes, setCountryVotes] = useState<CountryVote[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [userCountry, setUserCountry] = useState<{ code: string; name: string }>({ code: 'US', name: 'United States' });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Fetch user country with multiple fallbacks
    const fetchCountry = async () => {
      // List of IP geolocation APIs to try
      const apis = [
        { url: 'https://ipapi.co/json/', map: (d: any) => ({ code: d.country_code, name: d.country_name }) },
        { url: 'https://ipwho.is/', map: (d: any) => d.success ? ({ code: d.country_code, name: d.country }) : null },
        { url: 'https://api.db-ip.com/v2/free/self', map: (d: any) => ({ code: d.countryCode, name: d.countryName }) }
      ];

      for (const api of apis) {
        try {
          const res = await fetch(api.url);
          if (!res.ok) continue;
          const data = await res.json();
          const result = api.map(data);
          if (result && result.code && result.name) {
            setUserCountry(result);
            return;
          }
        } catch (err) {
          console.warn(`API ${api.url} failed:`, err);
        }
      }
    };

    fetchCountry();

    // Real-time poll data
    const pollRef = doc(db, 'polls', 'iran-vs-israel');
    const unsubscribePoll = onSnapshot(pollRef, (snapshot) => {
      if (snapshot.exists()) {
        setPoll(snapshot.data() as PollData);
      } else {
        // Initialize poll if it doesn't exist
        setDoc(pollRef, {
          realVotesIran: 0,
          realVotesIsrael: 0,
          fakeVotesIran: 0,
          fakeVotesIsrael: 0,
          useFakeVotes: false,
          lastUpdated: serverTimestamp()
        });
      }
    });

    // Real-time country votes
    const countryVotesRef = collection(db, 'countryVotes');
    const q = query(countryVotesRef, orderBy('votesIran', 'desc'), limit(10));
    const unsubscribeCountries = onSnapshot(q, (snapshot) => {
      const votes = snapshot.docs.map(doc => doc.data() as CountryVote);
      setCountryVotes(votes);
    });

    // Check local storage for lifetime vote
    const storedVote = localStorage.getItem('has_voted_iran_vs_israel');
    if (storedVote === 'true') {
      setHasVoted(true);
    }

    return () => {
      unsubscribePoll();
      unsubscribeCountries();
    };
  }, []);

  const handleVote = async (side: 'iran' | 'israel') => {
    if (hasVoted) {
      alert('You have already submitted your vote. Only one vote is allowed per person.');
      return;
    }

    setIsVoting(true);
    try {
      const pollRef = doc(db, 'polls', 'iran-vs-israel');
      const countryRef = doc(db, 'countryVotes', userCountry.code);

      // Update poll
      await updateDoc(pollRef, {
        [side === 'iran' ? 'realVotesIran' : 'realVotesIsrael']: increment(1),
        lastUpdated: serverTimestamp()
      });

      // Update country votes
      const countrySnap = await getDoc(countryRef);
      if (!countrySnap.exists()) {
        await setDoc(countryRef, {
          countryCode: userCountry.code,
          countryName: userCountry.name,
          votesIran: side === 'iran' ? 1 : 0,
          votesIsrael: side === 'israel' ? 1 : 0
        });
      } else {
        await updateDoc(countryRef, {
          [side === 'iran' ? 'votesIran' : 'votesIsrael']: increment(1)
        });
      }

      // Update local storage for lifetime vote
      setHasVoted(true);
      localStorage.setItem('has_voted_iran_vs_israel', 'true');

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const iranVotes = poll.realVotesIran + (poll.useFakeVotes ? poll.fakeVotesIran : 0);
  const israelVotes = poll.realVotesIsrael + (poll.useFakeVotes ? poll.fakeVotesIsrael : 0);
  const totalVotes = iranVotes + israelVotes;
  const iranPercent = totalVotes > 0 ? Math.round((iranVotes / totalVotes) * 100) : 50;
  const israelPercent = 100 - iranPercent;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-600 text-xs font-black uppercase tracking-widest mb-4"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Live Global Poll
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight"
          >
            Where Do You Stand?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto"
          >
            The world is watching. Make your voice heard in this global support poll.
          </motion.p>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 right-8 z-50 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold">Vote submitted successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voting Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Israel Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100 flex flex-col items-center text-center group"
          >
            <div className="w-48 h-32 mb-8 rounded-2xl overflow-hidden border-4 border-gray-50 shadow-inner flex items-center justify-center bg-gray-50">
              <img 
                src={poll.israelFlagUrl || "https://flagcdn.com/w320/il.png"} 
                alt="Israel Flag" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-8">Israel</h2>
            <Button 
              onClick={() => handleVote('israel')}
              disabled={isVoting || hasVoted}
              className="w-full max-w-[200px] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {hasVoted ? 'VOTED' : 'VOTE'}
            </Button>
            <div className="mt-12">
              <div className="text-5xl font-black text-blue-600 mb-1">{israelVotes.toLocaleString()}</div>
              <div className="text-sm font-black text-gray-400 uppercase tracking-widest">Votes</div>
            </div>
          </motion.div>

          {/* Iran Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100 flex flex-col items-center text-center group"
          >
            <div className="w-48 h-32 mb-8 rounded-2xl overflow-hidden border-4 border-gray-50 shadow-inner flex items-center justify-center bg-gray-50">
              <img 
                src={poll.iranFlagUrl || "https://flagcdn.com/w320/ir.png"} 
                alt="Iran Flag" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-8">Iran</h2>
            <Button 
              onClick={() => handleVote('iran')}
              disabled={isVoting || hasVoted}
              className="w-full max-w-[200px] bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {hasVoted ? 'VOTED' : 'VOTE'}
            </Button>
            <div className="mt-12">
              <div className="text-5xl font-black text-green-600 mb-1">{iranVotes.toLocaleString()}</div>
              <div className="text-sm font-black text-gray-400 uppercase tracking-widest">Votes</div>
            </div>
          </motion.div>
        </div>

        {/* Status Info */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500 font-bold">
            <Info className="w-5 h-5 text-blue-500" />
            {hasVoted ? 'Thank you for your vote!' : 'Only one vote allowed per person.'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 mb-12">
          <div className="flex justify-between items-end mb-4">
            <div className="text-left">
              <div className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">Israel</div>
              <div className="text-4xl font-black text-gray-900">{israelPercent}%</div>
            </div>
            <div className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest pb-1">
              of total votes
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-green-600 uppercase tracking-widest mb-1">Iran</div>
              <div className="text-4xl font-black text-gray-900">{iranPercent}%</div>
            </div>
          </div>
          <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden flex">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${israelPercent}%` }}
              className="h-full bg-blue-600"
            />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${iranPercent}%` }}
              className="h-full bg-green-600"
            />
          </div>
        </div>

        {/* Top Countries Section */}
        {poll.showCountries !== false && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 h-full">
                <div className="flex items-center gap-3 mb-8">
                  <Globe className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-black text-gray-900">Top Voting Countries</h3>
                </div>
                <div className="space-y-6">
                  {countryVotes.length > 0 ? (
                    countryVotes.map((country, idx) => {
                      const total = country.votesIran + country.votesIsrael;
                      const iranP = total > 0 ? Math.round((country.votesIran / total) * 100) : 50;
                      const israelP = 100 - iranP;
                      return (
                        <div key={country.countryCode} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-gray-400 w-6">#{idx + 1}</span>
                              <img 
                                src={country.flagUrl || (country.countryCode ? `https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png` : "https://flagcdn.com/w40/un.png")} 
                                alt={country.countryName}
                                className="w-6 h-4 object-cover rounded-sm bg-gray-100"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://flagcdn.com/w40/un.png";
                                }}
                              />
                              <span className="font-bold text-gray-900">{country.countryName}</span>
                            </div>
                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest">
                              {total.toLocaleString()} Total
                            </div>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-blue-600" style={{ width: `${israelP}%` }} />
                            <div className="h-full bg-green-600" style={{ width: `${iranP}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-400 font-bold">
                      Waiting for more global data...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-xl">
                <TrendingUp className="w-10 h-10 mb-6 opacity-50" />
                <h3 className="text-2xl font-black mb-4">Trending Now</h3>
                <p className="text-blue-100 font-medium mb-6">
                  Global participation has increased by 12% in the last 24 hours.
                </p>
                <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                  <Users className="w-5 h-5" />
                  {totalVotes.toLocaleString()} Total Voters
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Leading Support
                </h4>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <img 
                      src={iranVotes > israelVotes ? "https://flagcdn.com/w40/ir.png" : "https://flagcdn.com/w40/il.png"} 
                      alt="Leader"
                      className="w-8 h-6 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="font-black text-gray-900">{iranVotes > israelVotes ? 'Iran' : 'Israel'}</div>
                    <div className="text-xs font-bold text-gray-500">Currently in the lead</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
