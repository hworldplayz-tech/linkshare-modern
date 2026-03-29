import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  LogIn, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  db, 
  collection, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  increment 
} from '../firebase';
import { SiteSettings } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import axios from 'axios';

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  settings: SiteSettings;
  onLogin: () => void;
  authLoading?: boolean;
  authError?: string;
}

export const AddGroupModal = ({ 
  isOpen, 
  onClose, 
  user, 
  settings, 
  onLogin,
  authLoading,
  authError
}: AddGroupModalProps) => {
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [metadata, setMetadata] = useState<{ title?: string; description?: string; image?: string } | null>(null);

  const categories = settings.categories || [];
  const countries = settings.countries || [];

  useEffect(() => {
    if (linkInput && linkInput.startsWith('http')) {
      const timer = setTimeout(() => {
        handleFetchMetadata(linkInput);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [linkInput]);

  const handleFetchMetadata = async (url: string) => {
    setFetchingMetadata(true);
    try {
      const response = await axios.post('/api/fetch-metadata', { url });
      setMetadata(response.data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return onLogin();

    const formData = new FormData(e.currentTarget);
    const data = {
      title: (formData.get('title') as string) || metadata?.title || '',
      link: formData.get('link') as string,
      category: formData.get('category') as string,
      country: formData.get('country') as string,
      description: (formData.get('description') as string) || metadata?.description || '',
      imageUrl: metadata?.image || '',
      type: formData.get('type') as 'group' | 'channel',
      authorUid: user.uid,
      authorEmail: user.email || '',
      authorName: (user.email === 'hworldplayz@gmail.com') ? 'Admin' : (user.displayName || 'Anonymous'),
      status: settings.autoApproveGroups ? 'approved' : 'pending',
      isFeatured: false,
      createdAt: serverTimestamp(),
    };

    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      await addDoc(collection(db, 'groups'), data);
      await updateDoc(doc(db, 'users', user.uid), {
        groupsCount: increment(1)
      });
      
      setFormSuccess(settings.autoApproveGroups ? 'Group published successfully!' : 'Group submitted successfully! It will be visible after approval.');
      setTimeout(() => {
        onClose();
        setFormSuccess('');
        setMetadata(null);
        setLinkInput('');
      }, 2000);
    } catch (error) {
      console.error('Error adding group:', error);
      setFormError('Failed to submit group. Please check your link and try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Promote Your Group"
    >
      {!user ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[#00a884]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-[#00a884]" />
          </div>
          <h4 className="text-xl font-bold mb-2">Sign In Required</h4>
          <p className="text-gray-500 mb-6">You need to be signed in to submit a group or channel link.</p>
          {authError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {authError}
            </div>
          )}
          <Button onClick={onLogin} className="w-full" disabled={authLoading}>
            {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In with Google'}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}
          {formSuccess && (
            <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> {formSuccess}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">WhatsApp Link</label>
            <div className="relative">
              <input 
                name="link"
                required
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 focus:border-[#00a884]"
              />
              {fetchingMetadata && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-[#00a884] animate-spin" />
                </div>
              )}
            </div>
          </div>

          {metadata && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
              {metadata.image && (
                <img src={metadata.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
              )}
              <div className="min-w-0">
                <h5 className="font-bold text-sm truncate">{metadata.title}</h5>
                <p className="text-xs text-gray-500 line-clamp-2">{metadata.description}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Group Title</label>
            <input 
              name="title"
              required
              defaultValue={metadata?.title || ''}
              placeholder="e.g. Tech Enthusiasts Global"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 focus:border-[#00a884]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
              <select 
                name="category"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Country</label>
              <select 
                name="country"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="group" defaultChecked className="text-[#00a884] focus:ring-[#00a884]" />
                <span className="text-sm font-medium">Group</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="channel" className="text-[#00a884] focus:ring-[#00a884]" />
                <span className="text-sm font-medium">Channel</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
            <textarea 
              name="description"
              rows={3}
              defaultValue={metadata?.description || ''}
              placeholder="Tell us what your group is about..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 focus:border-[#00a884] resize-none"
            />
          </div>
          <Button type="submit" className="w-full" disabled={formLoading}>
            {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Link'}
          </Button>
        </form>
      )}
    </Modal>
  );
};
