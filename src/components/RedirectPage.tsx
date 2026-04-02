import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, updateDoc, increment } from '../firebase';
import { Loader2, AlertCircle, Home } from 'lucide-react';
import { Button } from './ui/Button';

export default function RedirectPage() {
  const { shortId } = useParams<{ shortId: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const performRedirect = async () => {
      if (!shortId) {
        setError('Invalid short link.');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'shortlinks', shortId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const originalUrl = data.originalUrl;

          // Increment clicks asynchronously
          updateDoc(docRef, {
            clicks: increment(1)
          }).catch(err => console.error('Error incrementing clicks:', err));

          // Redirect
          window.location.href = originalUrl;
        } else {
          setError('This short link does not exist or has been removed.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Redirection error:', err);
        setError('An error occurred while trying to redirect you.');
        setLoading(false);
      }
    };

    performRedirect();
  }, [shortId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-center max-w-md w-full">
          <Loader2 className="w-12 h-12 text-[#00a884] animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Redirecting...</h2>
          <p className="text-gray-500">Please wait while we take you to your destination.</p>
          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">LinkShare Shortener</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-4">Link Not Found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          {error || 'The link you are looking for could not be found.'}
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="w-full bg-[#00a884] text-white hover:bg-[#008f6f] py-4 font-bold rounded-2xl h-auto"
        >
          <Home className="w-5 h-5 mr-2" /> Back to Home
        </Button>
      </div>
    </div>
  );
}
