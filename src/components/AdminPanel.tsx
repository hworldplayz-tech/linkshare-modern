import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Users, 
  LayoutGrid, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Plus, 
  Save, 
  LogOut, 
  Eye, 
  EyeOff, 
  Code,
  Check,
  BookOpen,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Upload,
  LogIn,
  ShieldCheck,
  Globe,
  List as ListIcon,
  Search,
  Calendar,
  User as UserIcon,
  Tag,
  ArrowRight,
  MessageCircle,
  Clock,
  Image as ImageIcon,
  Menu,
  Vote,
  Info,
  AlertCircle,
  Trophy,
  Tv
} from 'lucide-react';
import { 
  db, 
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  getDoc,
  addDoc,
  Timestamp,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { Group, SiteSettings, MenuItem, DEFAULT_SETTINGS, Category, Country, Tip, Blog } from '../types';
import { TIPS } from '../data/tips';
import { DEFAULT_GROUPS } from '../data/groups';
import { motion, AnimatePresence } from 'motion/react';

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}) => {
  const variants = {
    primary: 'bg-[#00a884] text-white hover:bg-[#008f70]',
    secondary: 'bg-[#128c7e] text-white hover:bg-[#075e54]',
    outline: 'border-2 border-[#00a884] text-[#00a884] hover:bg-[#00a884] hover:text-white',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg font-semibold',
  };
  return (
    <button 
      className={`rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'groups' | 'users' | 'categories' | 'countries' | 'tips' | 'blogs' | 'ads' | 'menus' | 'polls'>('settings');
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState<any>(null);
  const [pollCountries, setPollCountries] = useState<any[]>([]);
  const [fakeVotesIran, setFakeVotesIran] = useState(0);
  const [fakeVotesIsrael, setFakeVotesIsrael] = useState(0);
  const [iranFlagUrl, setIranFlagUrl] = useState('');
  const [israelFlagUrl, setIsraelFlagUrl] = useState('');
  const [useFakeVotes, setUseFakeVotes] = useState(false);
  const [showCountries, setShowCountries] = useState(true);
  const [editingPollCountry, setEditingPollCountry] = useState<any>(null);

  const [newCategory, setNewCategory] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);
  const [editingCountry, setEditingCountry] = useState<{ id: string, name: string } | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
  const [deletingTipId, setDeletingTipId] = useState<string | null>(null);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deletingCountryId, setDeletingCountryId] = useState<string | null>(null);

  useEffect(() => {
    const savedLogin = localStorage.getItem('adminLoggedIn');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && u.email === 'hworldplayz@gmail.com') {
        setIsLoggedIn(true);
        localStorage.setItem('adminLoggedIn', 'true');
      }
    });

    setLoading(false);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubSettings = onSnapshot(doc(db, 'settings', 'main'), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as SiteSettings;
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/main');
    });

    const unsubGroups = onSnapshot(collection(db, 'groups'), (snapshot) => {
      setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group)));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'groups');
    });

    let unsubUsers = () => {};
    if (user && user.email === 'hworldplayz@gmail.com') {
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'users');
      });
    } else {
      setUsers([]);
    }

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Category)));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'categories');
    });

    const unsubCountries = onSnapshot(collection(db, 'countries'), (snapshot) => {
      setCountries(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Country)));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'countries');
    });

    const unsubTips = onSnapshot(collection(db, 'tips'), (snapshot) => {
      setTips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tip)));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'tips');
    });

    const unsubBlogs = onSnapshot(collection(db, 'blogs'), (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog)));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'blogs');
    });

    const unsubPoll = onSnapshot(doc(db, 'polls', 'iran-vs-israel'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPoll(data);
        setFakeVotesIran(data.fakeVotesIran || 0);
        setFakeVotesIsrael(data.fakeVotesIsrael || 0);
        setIranFlagUrl(data.iranFlagUrl || '');
        setIsraelFlagUrl(data.israelFlagUrl || '');
        setUseFakeVotes(data.useFakeVotes || false);
        setShowCountries(data.showCountries !== false);
      }
    }, (error) => {
      console.warn("Poll subscription admin info snapshot watcher:", error.message);
    });

    const unsubPollCountries = onSnapshot(collection(db, 'countryVotes'), (snapshot) => {
      setPollCountries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'countryVotes');
    });

    return () => {
      unsubSettings();
      unsubGroups();
      unsubUsers();
      unsubCategories();
      unsubCountries();
      unsubTips();
      unsubBlogs();
      unsubPoll();
      unsubPollCountries();
    };
  }, [isLoggedIn, user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'hworldplayz' && password === 'hworldplayz@512') {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
  };

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'main'), settings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      handleFirestoreError(err, OperationType.WRITE, 'settings/main');
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), { name: newCategory.trim() });
      setNewCategory('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'categories');
    }
  };

  const updateCategory = async () => {
    if (!editingCategory) return;
    try {
      await updateDoc(doc(db, 'categories', editingCategory.id), { name: editingCategory.name });
      setEditingCategory(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${editingCategory.id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      setDeletingCategoryId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  const addCountry = async () => {
    if (!newCountry.trim()) return;
    try {
      await addDoc(collection(db, 'countries'), { name: newCountry.trim() });
      setNewCountry('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'countries');
    }
  };

  const updateCountry = async () => {
    if (!editingCountry) return;
    try {
      await updateDoc(doc(db, 'countries', editingCountry.id), { name: editingCountry.name });
      setEditingCountry(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `countries/${editingCountry.id}`);
    }
  };

  const deleteCountry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'countries', id));
      setDeletingCountryId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `countries/${id}`);
    }
  };

  const addHeaderMenu = () => {
    const newItem = { id: Date.now().toString(), label: 'New Menu', href: '#' };
    setSettings({ ...settings, headerMenus: [...settings.headerMenus, newItem] });
  };

  const updateHeaderMenu = (index: number, updatedItem: any) => {
    const newMenus = [...settings.headerMenus];
    newMenus[index] = updatedItem;
    setSettings({ ...settings, headerMenus: newMenus });
  };

  const deleteHeaderMenu = (index: number) => {
    const newMenus = settings.headerMenus.filter((_, i) => i !== index);
    setSettings({ ...settings, headerMenus: newMenus });
  };

  const addDropdownItem = (menuIndex: number) => {
    const newMenus = [...settings.headerMenus];
    const menu = { ...newMenus[menuIndex] };
    const newDropdown = [...(menu.dropdown || []), { id: Date.now().toString(), label: 'Sub Menu', href: '#' }];
    menu.dropdown = newDropdown;
    newMenus[menuIndex] = menu;
    setSettings({ ...settings, headerMenus: newMenus });
  };

  const updateDropdownItem = (menuIndex: number, dropIndex: number, updatedDrop: any) => {
    const newMenus = [...settings.headerMenus];
    const menu = { ...newMenus[menuIndex] };
    const newDropdown = [...(menu.dropdown || [])];
    newDropdown[dropIndex] = updatedDrop;
    menu.dropdown = newDropdown;
    newMenus[menuIndex] = menu;
    setSettings({ ...settings, headerMenus: newMenus });
  };

  const deleteDropdownItem = (menuIndex: number, dropIndex: number) => {
    const newMenus = [...settings.headerMenus];
    const menu = { ...newMenus[menuIndex] };
    const newDropdown = menu.dropdown?.filter((_, i) => i !== dropIndex);
    menu.dropdown = newDropdown;
    newMenus[menuIndex] = menu;
    setSettings({ ...settings, headerMenus: newMenus });
  };

  const addFooterQuickLink = () => {
    const newItem = { id: Date.now().toString(), label: 'New Link', href: '#' };
    setSettings({ ...settings, footerQuickLinks: [...settings.footerQuickLinks, newItem] });
  };

  const updateFooterQuickLink = (index: number, updatedItem: any) => {
    const newLinks = [...settings.footerQuickLinks];
    newLinks[index] = updatedItem;
    setSettings({ ...settings, footerQuickLinks: newLinks });
  };

  const deleteFooterQuickLink = (index: number) => {
    const newLinks = settings.footerQuickLinks.filter((_, i) => i !== index);
    setSettings({ ...settings, footerQuickLinks: newLinks });
  };

  const addFooterLegalLink = () => {
    const newItem = { id: Date.now().toString(), label: 'New Link', href: '#' };
    setSettings({ ...settings, footerLegalLinks: [...settings.footerLegalLinks, newItem] });
  };

  const updateFooterLegalLink = (index: number, updatedItem: any) => {
    const newLinks = [...settings.footerLegalLinks];
    newLinks[index] = updatedItem;
    setSettings({ ...settings, footerLegalLinks: newLinks });
  };

  const deleteFooterLegalLink = (index: number) => {
    const newLinks = settings.footerLegalLinks.filter((_, i) => i !== index);
    setSettings({ ...settings, footerLegalLinks: newLinks });
  };

  const saveTip = async () => {
    if (!editingTip) return;
    try {
      if (editingTip.id) {
        const { id, ...data } = editingTip;
        await updateDoc(doc(db, 'tips', id), data);
      } else {
        await addDoc(collection(db, 'tips'), editingTip);
      }
      setEditingTip(null);
      alert('Tip saved successfully!');
    } catch (err) {
      console.error('Error saving tip:', err);
      handleFirestoreError(err, OperationType.WRITE, 'tips');
    }
  };

  const saveGroup = async () => {
    if (!editingGroup) return;
    try {
      if (editingGroup.id) {
        const { id, ...data } = editingGroup;
        await updateDoc(doc(db, 'groups', id), data);
      } else {
        await addDoc(collection(db, 'groups'), editingGroup);
      }
      setEditingGroup(null);
      alert('Group saved successfully!');
    } catch (err) {
      console.error('Error saving group:', err);
      handleFirestoreError(err, OperationType.WRITE, 'groups');
    }
  };

  const deleteTip = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tips', id));
      setDeletingTipId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tips/${id}`);
    }
  };

  const saveBlog = async () => {
    if (!editingBlog) return;
    try {
      if (editingBlog.id) {
        const { id, ...data } = editingBlog;
        await updateDoc(doc(db, 'blogs', id), data);
      } else {
        await addDoc(collection(db, 'blogs'), editingBlog);
      }
      setEditingBlog(null);
      alert('Blog saved successfully!');
    } catch (err) {
      console.error('Error saving blog:', err);
      handleFirestoreError(err, OperationType.WRITE, 'blogs');
    }
  };

  const deleteBlog = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blogs', id));
      setDeletingBlogId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `blogs/${id}`);
    }
  };

  const seedTips = async () => {
    if (tips.length > 0) {
      if (!confirm("This will add default tips. Some might be duplicates. Continue?")) return;
    }
    
    try {
      setLoading(true);
      for (const tip of TIPS) {
        const { id, ...tipData } = tip;
        await addDoc(collection(db, 'tips'), {
          ...tipData,
          createdAt: Timestamp.fromDate(new Date(tipData.createdAt))
        });
      }
      alert("Default tips added successfully!");
    } catch (error) {
      console.error("Error seeding tips:", error);
      alert("Failed to seed tips.");
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultCountries = async () => {
    const defaults = ['Global', 'USA', 'Pakistan', 'India', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Other'];
    for (const name of defaults) {
      if (!countries.find(c => c.name === name)) {
        await addDoc(collection(db, 'countries'), { name });
      }
    }
  };

  const seedDefaultGroups = async () => {
    if (groups.length > 0) {
      if (!confirm('Groups already exist. Do you want to add default groups anyway?')) return;
    }
    
    setLoading(true);
    try {
      for (const group of DEFAULT_GROUPS) {
        await addDoc(collection(db, 'groups'), {
          ...group,
          createdAt: Timestamp.fromDate(new Date(group.createdAt as string))
        });
      }
      alert('Default groups added successfully!');
    } catch (err) {
      console.error('Error seeding groups:', err);
      handleFirestoreError(err, OperationType.WRITE, 'groups');
    } finally {
      setLoading(false);
    }
  };
  const seedDefaultCategories = async () => {
    const defaults = ['WhatsApp', 'Telegram', 'Signal', 'Discord', 'Facebook', 'Instagram', 'Other'];
    for (const name of defaults) {
      if (!categories.find(c => c.name === name)) {
        await addDoc(collection(db, 'categories'), { name });
      }
    }
  };

  const savePollSettings = async () => {
    try {
      await updateDoc(doc(db, 'polls', 'iran-vs-israel'), {
        fakeVotesIran: Number(fakeVotesIran),
        fakeVotesIsrael: Number(fakeVotesIsrael),
        iranFlagUrl: iranFlagUrl,
        israelFlagUrl: israelFlagUrl,
        useFakeVotes: useFakeVotes,
        showCountries: showCountries,
        lastUpdated: Timestamp.now()
      });
      // Also save site settings for the banner
      await setDoc(doc(db, 'settings', 'main'), settings);
      alert('Poll settings saved successfully!');
    } catch (err) {
      console.error('Error saving poll settings:', err);
      handleFirestoreError(err, OperationType.WRITE, 'polls/iran-vs-israel');
    }
  };

  const savePollCountry = async () => {
    if (!editingPollCountry) return;
    try {
      const { id, ...data } = editingPollCountry;
      await updateDoc(doc(db, 'countryVotes', id), data);
      setEditingPollCountry(null);
      alert('Country updated successfully!');
    } catch (err) {
      console.error('Error saving poll country:', err);
      handleFirestoreError(err, OperationType.UPDATE, `countryVotes/${editingPollCountry.id}`);
    }
  };

  if (loading) return null;

  const handleGoogleLogin = async () => {
    try {
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user && result.user.email === 'hworldplayz@gmail.com') {
        setIsLoggedIn(true);
        localStorage.setItem('adminLoggedIn', 'true');
      } else {
        await signOut(auth);
        setError('Access denied: Your Google account is not registered as an administrator.');
      }
    } catch (err: any) {
      console.error('Error signing in with Google:', err);
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#00a884] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00a884]/20">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Admin Login</h1>
            <p className="text-gray-500 mt-2">Enter credentials or use Google auth</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 focus:border-[#00a884]"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 focus:border-[#00a884]"
                placeholder="Enter password"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
            <Button type="submit" className="w-full py-4 text-lg">
              <LogIn className="w-5 h-5" /> Login to Dashboard
            </Button>
          </form>

          <div className="text-center my-6 flex items-center justify-center gap-2">
            <span className="h-[1px] bg-gray-200 flex-1"></span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">OR</span>
            <span className="h-[1px] bg-gray-200 flex-1"></span>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin} 
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold py-3 px-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer text-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.5 0 2.85.52 3.9 1.5l2.9-2.9C17 1.84 14.63 1 12 1 7.37 1 3.4 3.65 1.5 7.5l3.4 2.6c.86-2.58 3.28-4.46 7.1-4.46z"/>
              <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.6-.2-2.35H12v4.45h6.45c-.28 1.47-1.11 2.72-2.39 3.56l3.64 2.83c2.13-1.97 3.8-5.04 3.8-8.49z"/>
              <path fill="#FBBC05" d="M4.9 14.9c-.24-.72-.38-1.49-.38-2.3c0-.81.14-1.58.38-2.3L1.5 7.7a10.96 10.96 0 000 8.6l3.4-2.6z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.64-2.83c-1.12.75-2.55 1.25-4.32 1.25-3.82 0-6.24-1.88-7.1-4.46l-3.4 2.6C3.4 20.35 7.37 23 12 23z"/>
            </svg>
            Sign in with Google Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-8">
            {settings.headerLogoUrl ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                <img src={settings.headerLogoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-[#00a884] rounded-xl flex items-center justify-center shadow-lg shadow-[#00a884]/20">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
            )}
            <span className="text-2xl font-black tracking-tighter text-[#00a884]">{settings.headerLogoText || 'Admin'}</span>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'settings', label: 'Site Settings', icon: SettingsIcon },
              { id: 'menus', label: 'Menus', icon: Menu },
              { id: 'groups', label: 'Groups', icon: LayoutGrid },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'categories', label: 'Categories', icon: ListIcon },
              { id: 'countries', label: 'Countries', icon: Globe },
              { id: 'tips', label: 'Tips & Tricks', icon: BookOpen },
              { id: 'blogs', label: 'Blogs', icon: BookOpen },
              { id: 'polls', label: 'Poll Management', icon: Vote },
              { id: 'ads', label: 'Ad Management', icon: Code },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  activeTab === tab.id 
                    ? 'bg-[#00a884] text-white shadow-lg shadow-[#00a884]/20' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-50 space-y-4">
          {!user && (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 font-bold flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" /> Action Required
                </p>
                <p className="text-[10px] text-amber-600 mt-1">
                  You must connect your Google Admin account to perform database actions (delete, update).
                </p>
              </div>
              <button 
                onClick={handleGoogleLogin}
                className="flex items-center gap-3 text-[#00a884] font-bold hover:bg-[#00a884]/5 w-full px-4 py-3 rounded-xl transition-all border border-[#00a884]/20"
              >
                <LogIn className="w-5 h-5" /> Connect Google
              </button>
            </div>
          )}
          {user && (
            <div className="px-4 py-2 bg-gray-50 rounded-xl mb-2">
              <p className="text-xs text-gray-500 font-medium">Logged in as:</p>
              <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-500 font-bold hover:bg-red-50 w-full px-4 py-3 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'polls' ? (
            <motion.div 
              key="polls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900">Poll Management</h2>
                <Button onClick={savePollSettings}><Save className="w-5 h-5" /> Save Poll Settings</Button>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${settings.showPollBanner ? 'bg-[#00a884] shadow-[#00a884]/20' : 'bg-gray-300 shadow-gray-200'}`}>
                      <Vote className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">Show Poll Banner on Home</h3>
                      <p className="text-sm text-gray-500">Display a voting banner below the hero section.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, showPollBanner: !settings.showPollBanner})}
                    className={`w-16 h-8 rounded-full transition-all relative ${settings.showPollBanner ? 'bg-[#00a884]' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.showPollBanner ? 'left-9' : 'left-1'}`} />
                  </button>
                </div>

                {settings.showPollBanner && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Poll Banner Text</label>
                    <input 
                      type="text" 
                      value={settings.pollBannerText}
                      onChange={(e) => setSettings({...settings, pollBannerText: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="Iran vs Israel Live Voting: Where do you stand?"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${useFakeVotes ? 'bg-[#00a884] shadow-[#00a884]/20' : 'bg-gray-300 shadow-gray-200'}`}>
                      <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">Use Fake Voting System</h3>
                      <p className="text-sm text-gray-500">When enabled, public votes will show real + fake counts.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUseFakeVotes(!useFakeVotes)}
                    className={`w-16 h-8 rounded-full transition-all relative ${useFakeVotes ? 'bg-[#00a884]' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${useFakeVotes ? 'left-9' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${showCountries ? 'bg-[#00a884] shadow-[#00a884]/20' : 'bg-gray-300 shadow-gray-200'}`}>
                      <Globe className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">Show Top Voting Countries</h3>
                      <p className="text-sm text-gray-500">Display the list of countries with their vote distribution.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowCountries(!showCountries)}
                    className={`w-16 h-8 rounded-full transition-all relative ${showCountries ? 'bg-[#00a884]' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${showCountries ? 'left-9' : 'left-1'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <img src="https://flagcdn.com/w40/ir.png" alt="Iran" className="w-6 h-4 object-cover rounded-sm" />
                      <label className="text-sm font-bold text-gray-700">Iran Fake Votes</label>
                    </div>
                    <input 
                      type="number" 
                      value={fakeVotesIran}
                      onChange={(e) => setFakeVotesIran(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    />
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest flex justify-between">
                      <span>Real Votes:</span>
                      <span className="text-gray-900">{poll?.realVotesIran || 0}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <img src="https://flagcdn.com/w40/il.png" alt="Israel" className="w-6 h-4 object-cover rounded-sm" />
                      <label className="text-sm font-bold text-gray-700">Israel Fake Votes</label>
                    </div>
                    <input 
                      type="number" 
                      value={fakeVotesIsrael}
                      onChange={(e) => setFakeVotesIsrael(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    />
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest flex justify-between">
                      <span>Real Votes:</span>
                      <span className="text-gray-900">{poll?.realVotesIsrael || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">Iran Main Flag (Image/GIF)</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                        <img src={iranFlagUrl || "https://flagcdn.com/w160/ir.png"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <input 
                        type="text" 
                        value={iranFlagUrl}
                        onChange={(e) => setIranFlagUrl(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                        placeholder="Flag URL or GIF..."
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">Israel Main Flag (Image/GIF)</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                        <img src={israelFlagUrl || "https://flagcdn.com/w160/il.png"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <input 
                        type="text" 
                        value={israelFlagUrl}
                        onChange={(e) => setIsraelFlagUrl(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                        placeholder="Flag URL or GIF..."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-blue-900 mb-1">How it works</h4>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        The "Fake Votes" you set here are added to the "Real Votes" when the system is ON. 
                        User votes always increment the "Real Votes" counter.
                        If you turn it OFF, only the actual user votes will be displayed publicly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#00a884]" /> Manage Poll Countries
                  </h3>
                  <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Country</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Votes (IR / IL)</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pollCountries.map(country => (
                          <tr key={country.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                                  {country.flagUrl ? (
                                    <img src={country.flagUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <img src={`https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">{country.countryName}</div>
                                  <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">{country.countryCode}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="text-xs font-bold text-green-600">{country.votesIran?.toLocaleString() || 0}</div>
                                <div className="text-xs font-bold text-blue-600">{country.votesIsrael?.toLocaleString() || 0}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => setEditingPollCountry(country)}
                                className="p-2 text-[#00a884] hover:bg-[#00a884]/5 rounded-xl transition-colors"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* FIFA World Cup 2026 Live Config Area */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <h2 className="text-3xl font-black text-gray-900 text-orange-600 flex items-center gap-2">
                  <Trophy className="w-8 h-8 text-orange-500" />
                  FIFA World Cup 2026 Live Stream Settings
                </h2>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-orange-100 shadow-sm space-y-8">
                {/* 1. FIFA Home Banner Toggle */}
                <div className="flex items-center justify-between p-6 bg-orange-50/20 rounded-3xl border border-orange-100/40">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${settings.fifaBannerEnabled ? 'bg-orange-500 shadow-orange-500/20' : 'bg-gray-300 shadow-gray-200'}`}>
                      <Trophy className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">Show FIFA Home Banner</h3>
                      <p className="text-sm text-gray-500">Enable or disable the FIFA World Cup 2026 Live guide banner on the homepage.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, fifaBannerEnabled: !settings.fifaBannerEnabled})}
                    className={`w-16 h-8 rounded-full transition-all relative ${settings.fifaBannerEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.fifaBannerEnabled ? 'left-9' : 'left-1'}`} />
                  </button>
                </div>

                {settings.fifaBannerEnabled && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">FIFA Home Banner Text</label>
                    <input 
                      type="text" 
                      value={settings.fifaBannerText || ''}
                      onChange={(e) => setSettings({...settings, fifaBannerText: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-medium"
                      placeholder="🔥 FIFA World Cup 2026 Live: How & Where to Watch Matches Stream Live around the globe!"
                    />
                  </div>
                )}

                {/* 2. FIFA Watch Now Button / Embed Player system Toggle */}
                <div className="flex items-center justify-between p-6 bg-orange-50/20 rounded-3xl border border-orange-100/40">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${settings.fifaWatchEnabled ? 'bg-orange-500 shadow-orange-500/20' : 'bg-gray-300 shadow-gray-200'}`}>
                      <Tv className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">Enable Watch Live Interactive Video Feed</h3>
                      <p className="text-sm text-gray-500">When disabled, hides the stream button or renders an offline notification on the blog.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, fifaWatchEnabled: !settings.fifaWatchEnabled})}
                    className={`w-16 h-8 rounded-full transition-all relative ${settings.fifaWatchEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.fifaWatchEnabled ? 'left-9' : 'left-1'}`} />
                  </button>
                </div>

                {settings.fifaWatchEnabled && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Live Frame Embed Url (Stream Player Source Link)</label>
                    <input 
                      type="text" 
                      value={settings.fifaEmbedUrl || ''}
                      onChange={(e) => setSettings({...settings, fifaEmbedUrl: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-mono"
                      placeholder="e.g. https://www.youtube.com/embed/2M_HLa71PIU"
                    />
                    <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
                      Ensure this is a dedicated embed link (e.g., has `/embed/` in YouTube paths) so browsers do not reject frame access.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'settings' ? (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900">Site Settings</h2>
                <Button onClick={saveSettings}><Save className="w-5 h-5" /> Save Changes</Button>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Site Title</label>
                    <input 
                      type="text" 
                      value={settings.siteTitle}
                      onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Logo Text</label>
                    <input 
                      type="text" 
                      value={settings.headerLogoText}
                      onChange={(e) => setSettings({...settings, headerLogoText: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Header Logo Image (Upload or URL)</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        {settings.headerLogoUrl && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                            <img src={settings.headerLogoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                          </div>
                        )}
                        <div className="flex-1 relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 1024 * 1024) {
                                  alert('Logo image must be less than 1MB');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setSettings({...settings, headerLogoUrl: reader.result as string});
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id="logo-image-upload"
                          />
                          <label 
                            htmlFor="logo-image-upload"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
                          >
                            <Upload className="w-4 h-4" /> {settings.headerLogoUrl ? 'Change Logo' : 'Upload Logo'}
                          </label>
                        </div>
                        {settings.headerLogoUrl && (
                          <button 
                            onClick={() => setSettings({...settings, headerLogoUrl: ''})}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Remove Logo"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase">URL</div>
                        <input 
                          type="text" 
                          value={settings.headerLogoUrl || ''}
                          onChange={(e) => setSettings({...settings, headerLogoUrl: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                          placeholder="Or paste logo URL here..."
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Favicon Image (Upload or URL)</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        {settings.faviconUrl && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                            <img src={settings.faviconUrl} alt="Favicon Preview" className="w-full h-full object-contain p-2" />
                          </div>
                        )}
                        <div className="flex-1 relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 512 * 1024) {
                                  alert('Favicon must be less than 512KB');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setSettings({...settings, faviconUrl: reader.result as string});
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id="favicon-upload"
                          />
                          <label 
                            htmlFor="favicon-upload"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
                          >
                            <Upload className="w-4 h-4" /> {settings.faviconUrl ? 'Change Favicon' : 'Upload Favicon'}
                          </label>
                        </div>
                        {settings.faviconUrl && (
                          <button 
                            onClick={() => setSettings({...settings, faviconUrl: ''})}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Remove Favicon"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase">URL</div>
                        <input 
                          type="text" 
                          value={settings.faviconUrl || ''}
                          onChange={(e) => setSettings({...settings, faviconUrl: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                          placeholder="Or paste favicon URL here..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${settings.heroShow ? 'bg-[#00a884] shadow-[#00a884]/20' : 'bg-gray-300 shadow-gray-200'}`}>
                        <LayoutGrid className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900">Hero Section Settings</h3>
                        <p className="text-xs text-gray-500">Manage the main heading and subtitle on the homepage.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, heroShow: !settings.heroShow})}
                      className={`w-14 h-7 rounded-full transition-all relative ${settings.heroShow ? 'bg-[#00a884]' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${settings.heroShow ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  {settings.heroShow && (
                    <div className="space-y-6 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Hero Title</label>
                          <input 
                            type="text" 
                            value={settings.heroTitle}
                            onChange={(e) => setSettings({...settings, heroTitle: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                            placeholder="Main Heading..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Title Size</label>
                          <select 
                            value={settings.heroTitleSize}
                            onChange={(e) => setSettings({...settings, heroTitleSize: e.target.value as any})}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 font-bold"
                          >
                            <option value="h1">Extra Large (H1)</option>
                            <option value="h2">Large (H2)</option>
                            <option value="h3">Medium (H3)</option>
                            <option value="h4">Small (H4)</option>
                            <option value="h5">Extra Small (H5)</option>
                            <option value="h6">Tiny (H6)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Hero Subtitle / Description</label>
                        <textarea 
                          value={settings.heroSubtitle}
                          onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                          placeholder="Short description below heading..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tips & Tricks Section Image (Upload or URL)</label>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      {settings.tipsSectionImageUrl && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                          <img src={settings.tipsSectionImageUrl} alt="Tips Section Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert('Section image must be less than 2MB');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSettings({...settings, tipsSectionImageUrl: reader.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="tips-image-upload"
                        />
                        <label 
                          htmlFor="tips-image-upload"
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl cursor-pointer hover:bg-100 transition-colors text-sm font-medium text-gray-600"
                        >
                          <Upload className="w-4 h-4" /> {settings.tipsSectionImageUrl ? 'Change Image' : 'Upload Image'}
                        </label>
                      </div>
                      {settings.tipsSectionImageUrl && (
                        <button 
                          onClick={() => setSettings({...settings, tipsSectionImageUrl: ''})}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="Remove Image"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase">URL</div>
                      <input 
                        type="text" 
                        value={settings.tipsSectionImageUrl || ''}
                        onChange={(e) => setSettings({...settings, tipsSectionImageUrl: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                        placeholder="Or paste image URL here..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Footer About Text</label>
                  <textarea 
                    value={settings.footerAbout}
                    onChange={(e) => setSettings({...settings, footerAbout: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                  />
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'menus' ? (
            <motion.div 
              key="menus"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900">Menu Management</h2>
                <Button onClick={saveSettings}><Save className="w-5 h-5" /> Save Changes</Button>
              </div>

              <div className="space-y-8">
                {/* Header Menus */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900">Header Navigation</h3>
                    <Button variant="outline" size="sm" onClick={addHeaderMenu}>
                      <Plus className="w-4 h-4" /> Add Menu Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {settings.headerMenus.map((menu, mIndex) => (
                      <div key={menu.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Label</label>
                            <input 
                              type="text" 
                              value={menu.label}
                              onChange={(e) => updateHeaderMenu(mIndex, { ...menu, label: e.target.value })}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Link (URL or Path)</label>
                            <input 
                              type="text" 
                              value={menu.href}
                              onChange={(e) => updateHeaderMenu(mIndex, { ...menu, href: e.target.value })}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <button 
                              onClick={() => addDropdownItem(mIndex)}
                              className="p-2 text-[#00a884] hover:bg-[#00a884]/5 rounded-xl transition-colors"
                              title="Add Dropdown"
                            >
                              <ChevronDown className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deleteHeaderMenu(mIndex)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Dropdown Items */}
                        {menu.dropdown && menu.dropdown.length > 0 && (
                          <div className="pl-8 space-y-3 border-l-2 border-gray-200 ml-4">
                            {menu.dropdown.map((drop, dIndex) => (
                              <div key={drop.id} className="flex flex-col sm:flex-row gap-3 items-center">
                                <div className="flex-1">
                                  <input 
                                    type="text" 
                                    value={drop.label}
                                    onChange={(e) => updateDropdownItem(mIndex, dIndex, { ...drop, label: e.target.value })}
                                    placeholder="Submenu Label"
                                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                                  />
                                </div>
                                <div className="flex-1">
                                  <input 
                                    type="text" 
                                    value={drop.href}
                                    onChange={(e) => updateDropdownItem(mIndex, dIndex, { ...drop, href: e.target.value })}
                                    placeholder="Submenu Link"
                                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                                  />
                                </div>
                                <button 
                                  onClick={() => deleteDropdownItem(mIndex, dIndex)}
                                  className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Quick Links */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900">Footer Quick Links</h3>
                    <Button variant="outline" size="sm" onClick={addFooterQuickLink}>
                      <Plus className="w-4 h-4" /> Add Link
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.footerQuickLinks.map((link, index) => (
                      <div key={link.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex-1 space-y-2">
                          <input 
                            type="text" 
                            value={link.label}
                            onChange={(e) => updateFooterQuickLink(index, { ...link, label: e.target.value })}
                            placeholder="Label"
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                          />
                          <input 
                            type="text" 
                            value={link.href}
                            onChange={(e) => updateFooterQuickLink(index, { ...link, href: e.target.value })}
                            placeholder="Link"
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                          />
                        </div>
                        <button 
                          onClick={() => deleteFooterQuickLink(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Legal Links */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900">Footer Legal Links</h3>
                    <Button variant="outline" size="sm" onClick={addFooterLegalLink}>
                      <Plus className="w-4 h-4" /> Add Link
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.footerLegalLinks.map((link, index) => (
                      <div key={link.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex-1 space-y-2">
                          <input 
                            type="text" 
                            value={link.label}
                            onChange={(e) => updateFooterLegalLink(index, { ...link, label: e.target.value })}
                            placeholder="Label"
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                          />
                          <input 
                            type="text" 
                            value={link.href}
                            onChange={(e) => updateFooterLegalLink(index, { ...link, href: e.target.value })}
                            placeholder="Link"
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                          />
                        </div>
                        <button 
                          onClick={() => deleteFooterLegalLink(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'tips' ? (
            <motion.div 
              key="tips"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">Manage Tips & Tricks</h2>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={seedTips} className="flex-1 sm:flex-none">
                    <Sparkles className="w-4 h-4" /> Add Default Tips
                  </Button>
                  <Button onClick={() => setEditingTip({ title: '', slug: '', excerpt: '', content: '', category: 'WhatsApp', author: 'Admin', imageUrl: '', createdAt: new Date().toISOString() } as any)} className="flex-1 sm:flex-none">
                    <Plus className="w-5 h-5" /> Add New Tip
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tips.map((tip) => (
                  <div key={tip.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {tip.imageUrl ? (
                        <img src={tip.imageUrl} alt={tip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <BookOpen className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#00a884] text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                          {tip.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-black text-gray-900 mb-2 line-clamp-2">{tip.title}</h3>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-2">{tip.excerpt}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(tip.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingTip(tip)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setDeletingTipId(tip.id!)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : activeTab === 'blogs' ? (
            <motion.div 
              key="blogs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">Manage Blogs</h2>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Button onClick={() => setEditingBlog({ title: '', slug: '', excerpt: '', content: '', category: 'General', author: 'Admin', imageUrl: '', createdAt: new Date().toISOString() } as any)} className="flex-1 sm:flex-none">
                    <Plus className="w-5 h-5" /> Add New Blog Post
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <div key={blog.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {blog.imageUrl ? (
                        <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <BookOpen className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#00a884] text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-black text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-2">{blog.excerpt}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingBlog(blog)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setDeletingBlogId(blog.id!)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : activeTab === 'categories' ? (
            <motion.div 
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">Manage Categories</h2>
                <Button variant="outline" onClick={seedDefaultCategories} className="w-full sm:w-auto">
                  <Sparkles className="w-4 h-4" /> Add Default Categories
                </Button>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <input 
                    type="text" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                  />
                  <Button onClick={addCategory} className="w-full sm:w-auto"><Plus className="w-5 h-5" /> Add</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      {editingCategory?.id === cat.id ? (
                        <div className="flex gap-2 w-full">
                          <input 
                            type="text" 
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                            autoFocus
                          />
                          <button onClick={updateCategory} className="text-green-500 hover:bg-green-50 p-1 rounded-lg">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-gray-700">{cat.name}</span>
                          <div className="flex gap-1">
                            <button onClick={() => setEditingCategory({ id: cat.id, name: cat.name })} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeletingCategoryId(cat.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'countries' ? (
            <motion.div 
              key="countries"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">Manage Countries</h2>
                <Button variant="outline" onClick={seedDefaultCountries} className="w-full sm:w-auto">
                  <Sparkles className="w-4 h-4" /> Add Default Countries
                </Button>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <input 
                    type="text" 
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    placeholder="New country name..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                  />
                  <Button onClick={addCountry} className="w-full sm:w-auto"><Plus className="w-5 h-5" /> Add</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {countries.map(count => (
                    <div key={count.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      {editingCountry?.id === count.id ? (
                        <div className="flex gap-2 w-full">
                          <input 
                            type="text" 
                            value={editingCountry.name}
                            onChange={(e) => setEditingCountry({ ...editingCountry, name: e.target.value })}
                            className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                            autoFocus
                          />
                          <button onClick={updateCountry} className="text-green-500 hover:bg-green-50 p-1 rounded-lg">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingCountry(null)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-gray-700">{count.name}</span>
                          <div className="flex gap-1">
                            <button onClick={() => setEditingCountry({ id: count.id, name: count.name })} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeletingCountryId(count.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'ads' ? (
            <motion.div 
              key="ads"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Ad Management</h2>
                  <p className="text-gray-500 mt-1">Configure your ad scripts and placements</p>
                </div>
                <Button onClick={saveSettings}><Save className="w-5 h-5" /> Save Ads Configuration</Button>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${settings.globalAdsEnabled ? 'bg-[#00a884] shadow-[#00a884]/20' : 'bg-gray-300 shadow-gray-200'}`}>
                      <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">Master Ad Toggle</h3>
                      <p className="text-sm text-gray-500">Enable or disable all ads across the entire site</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, globalAdsEnabled: !settings.globalAdsEnabled})}
                    className={`w-16 h-8 rounded-full transition-all relative ${settings.globalAdsEnabled ? 'bg-[#00a884]' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.globalAdsEnabled ? 'left-9' : 'left-1'}`} />
                  </button>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-[#00a884]" /> Ad Placements
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {settings.adPlacements?.map((placement, index) => (
                      <div key={placement.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${placement.enabled ? 'bg-[#00a884]/10 text-[#00a884]' : 'bg-gray-200 text-gray-400'}`}>
                              <Code className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{placement.label}</h4>
                              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{placement.type}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const newPlacements = [...settings.adPlacements];
                              newPlacements[index] = { ...placement, enabled: !placement.enabled };
                              setSettings({ ...settings, adPlacements: newPlacements });
                            }}
                            className={`w-12 h-6 rounded-full transition-all relative ${placement.enabled ? 'bg-[#00a884]' : 'bg-gray-300'}`}
                          >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${placement.enabled ? 'left-6.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Ad Script (HTML/JS)</label>
                          <textarea 
                            value={placement.script}
                            onChange={(e) => {
                              const newPlacements = [...settings.adPlacements];
                              newPlacements[index] = { ...placement, script: e.target.value };
                              setSettings({ ...settings, adPlacements: newPlacements });
                            }}
                            rows={4}
                            placeholder="Paste your ad network script here..."
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'groups' ? (
            <motion.div 
              key="groups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900">Manage Groups</h2>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={seedDefaultGroups} disabled={loading}>
                    <Plus className="w-5 h-5" /> Seed Default Groups
                  </Button>
                  <Button onClick={() => setEditingGroup({ title: '', link: '', category: '', country: '', description: '', status: 'approved', createdAt: new Date().toISOString(), type: 'group', authorUid: 'hworldplayz' } as any)}>
                    <Plus className="w-5 h-5" /> Add Group
                  </Button>
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Group Name</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Category</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {groups.map(group => (
                      <tr key={group.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{group.title}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">{group.link}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider rounded-full">
                            {group.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                            group.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {group.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => setEditingGroup(group)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button onClick={() => setDeletingGroupId(group.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-black text-gray-900">Registered Users</h2>
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">User</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Email</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-black">
                              {user.displayName?.[0] || 'U'}
                            </div>
                            <div className="font-bold text-gray-900">{user.displayName || 'Anonymous'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Edit Group Modal */}
      <AnimatePresence>
        {editingPollCountry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPollCountry(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-2xl font-black text-gray-900">Edit Poll Country</h3>
                <button onClick={() => setEditingPollCountry(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Country Name</label>
                  <input 
                    type="text" 
                    value={editingPollCountry.countryName}
                    onChange={(e) => setEditingPollCountry({ ...editingPollCountry, countryName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Flag URL (Image or GIF)</label>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                        {editingPollCountry.flagUrl ? (
                          <img src={editingPollCountry.flagUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <img src={`https://flagcdn.com/w80/${editingPollCountry.countryCode.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditingPollCountry({...editingPollCountry, flagUrl: reader.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="poll-country-flag-upload"
                        />
                        <label 
                          htmlFor="poll-country-flag-upload"
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
                        >
                          <Upload className="w-5 h-5" /> {editingPollCountry.flagUrl ? 'Change Flag' : 'Upload Flag'}
                        </label>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={editingPollCountry.flagUrl || ''}
                      onChange={(e) => setEditingPollCountry({ ...editingPollCountry, flagUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="Or paste URL here..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setEditingPollCountry(null)}>Cancel</Button>
                <Button onClick={savePollCountry}><Save className="w-5 h-5" /> Save Changes</Button>
              </div>
            </motion.div>
          </div>
        )}

        {editingGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingGroup(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-2xl font-black text-gray-900">
                  {editingGroup.id ? 'Edit Group' : 'Add New Group'}
                </h3>
                <button onClick={() => setEditingGroup(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Group Name</label>
                    <input 
                      type="text" 
                      value={editingGroup.title}
                      onChange={(e) => setEditingGroup({ ...editingGroup, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="WhatsApp Group Name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Invite Link</label>
                    <input 
                      type="text" 
                      value={editingGroup.link}
                      onChange={(e) => setEditingGroup({ ...editingGroup, link: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="https://chat.whatsapp.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select 
                      value={editingGroup.category}
                      onChange={(e) => setEditingGroup({ ...editingGroup, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Country</label>
                    <select 
                      value={editingGroup.country}
                      onChange={(e) => setEditingGroup({ ...editingGroup, country: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    >
                      <option value="">Select Country</option>
                      {countries.map(count => (
                        <option key={count.id} value={count.name}>{count.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea 
                      value={editingGroup.description}
                      onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="What is this group about?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select 
                      value={editingGroup.status}
                      onChange={(e) => setEditingGroup({ ...editingGroup, status: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setEditingGroup(null)}>Cancel</Button>
                <Button onClick={saveGroup}><Save className="w-5 h-5" /> Save Group</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Tip Modal */}
      <AnimatePresence>
        {editingTip && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTip(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-2xl font-black text-gray-900">
                  {editingTip.id ? 'Edit Tutorial' : 'Add New Tutorial'}
                </h3>
                <button onClick={() => setEditingTip(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                    <input 
                      type="text" 
                      value={editingTip.title}
                      onChange={(e) => setEditingTip({ ...editingTip, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="How to..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Slug</label>
                    <input 
                      type="text" 
                      value={editingTip.slug}
                      onChange={(e) => setEditingTip({ ...editingTip, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="how-to-..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select 
                      value={editingTip.category}
                      onChange={(e) => setEditingTip({ ...editingTip, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    >
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))
                      ) : (
                        ['WhatsApp', 'Privacy', 'Tutorial', 'Tips', 'Secrets', 'Tricks', 'Creative'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Excerpt (Short Description)</label>
                    <textarea 
                      value={editingTip.excerpt}
                      onChange={(e) => setEditingTip({ ...editingTip, excerpt: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="A brief summary of the tutorial..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tip Image (Upload or URL)</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        {editingTip.imageUrl && (
                          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                            <img src={editingTip.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setEditingTip({...editingTip, imageUrl: reader.result as string});
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id="tip-modal-image-upload"
                          />
                          <label 
                            htmlFor="tip-modal-image-upload"
                            className="flex items-center justify-center gap-2 px-4 py-4 bg-gray-50 border border-gray-200 border-dashed rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
                          >
                            <Upload className="w-5 h-5" /> {editingTip.imageUrl ? 'Change Image' : 'Upload Image'}
                          </label>
                        </div>
                        {editingTip.imageUrl && (
                          <button 
                            onClick={() => setEditingTip({...editingTip, imageUrl: ''})}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Remove Image"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase">URL</div>
                        <input 
                          type="text" 
                          value={editingTip.imageUrl}
                          onChange={(e) => setEditingTip({ ...editingTip, imageUrl: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                          placeholder="Or paste image URL here..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Content (HTML Supported)</label>
                    <textarea 
                      value={editingTip.content}
                      onChange={(e) => setEditingTip({ ...editingTip, content: e.target.value })}
                      rows={10}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="<p>Write your tutorial content here...</p>"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setEditingTip(null)}>Cancel</Button>
                <Button onClick={saveTip}><Save className="w-5 h-5" /> Save Tutorial</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Blog Modal */}
      <AnimatePresence>
        {editingBlog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingBlog(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-2xl font-black text-gray-900">
                  {editingBlog.id ? 'Edit Blog Post' : 'Add New Blog Post'}
                </h3>
                <button onClick={() => setEditingBlog(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                    <input 
                      type="text" 
                      value={editingBlog.title}
                      onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="Blog title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Slug</label>
                    <input 
                      type="text" 
                      value={editingBlog.slug}
                      onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="blog-slug-..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select 
                      value={editingBlog.category}
                      onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                    >
                      {['General', 'Tech Tools', 'Stylish Text', 'Status Saver', 'Guides'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Excerpt (Short Description)</label>
                    <textarea 
                      value={editingBlog.excerpt}
                      onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="A brief summary of the blog post..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Blog Image (Upload or URL)</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        {editingBlog.imageUrl && (
                          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                            <img src={editingBlog.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setEditingBlog({...editingBlog, imageUrl: reader.result as string});
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id="blog-modal-image-upload"
                          />
                          <label 
                            htmlFor="blog-modal-image-upload"
                            className="flex items-center justify-center gap-2 px-4 py-4 bg-gray-50 border border-gray-200 border-dashed rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
                          >
                            <Upload className="w-5 h-5" /> {editingBlog.imageUrl ? 'Change Image' : 'Upload Image'}
                          </label>
                        </div>
                        {editingBlog.imageUrl && (
                          <button 
                            onClick={() => setEditingBlog({...editingBlog, imageUrl: ''})}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Remove Image"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase">URL</div>
                        <input 
                          type="text" 
                          value={editingBlog.imageUrl}
                          onChange={(e) => setEditingBlog({ ...editingBlog, imageUrl: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                          placeholder="Or paste image URL here..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Content (HTML Supported)</label>
                    <textarea 
                      value={editingBlog.content}
                      onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                      rows={10}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                      placeholder="<p>Write your blog content here...</p>"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setEditingBlog(null)}>Cancel</Button>
                <Button onClick={saveBlog}><Save className="w-5 h-5" /> Save Blog Post</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {(deletingGroupId || deletingTipId || deletingBlogId || deletingCategoryId || deletingCountryId) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDeletingGroupId(null);
                setDeletingTipId(null);
                setDeletingBlogId(null);
                setDeletingCategoryId(null);
                setDeletingCountryId(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-gray-500 mb-8">This action cannot be undone. This item will be permanently deleted.</p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setDeletingGroupId(null);
                    setDeletingTipId(null);
                    setDeletingBlogId(null);
                    setDeletingCategoryId(null);
                    setDeletingCountryId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1"
                  onClick={() => {
                    if (deletingGroupId) {
                      deleteDoc(doc(db, 'groups', deletingGroupId))
                        .then(() => {
                          setDeletingGroupId(null);
                          alert('Group deleted successfully!');
                        })
                        .catch((err) => {
                          console.error('Error deleting group:', err);
                          alert('Failed to delete group. You might not have sufficient permissions. Please ensure you are logged in with your Google Admin account.');
                        });
                    }
                    if (deletingTipId) {
                      deleteTip(deletingTipId)
                        .then(() => {
                          setDeletingTipId(null);
                          alert('Tip deleted successfully!');
                        })
                        .catch((err) => {
                          console.error('Error deleting tip:', err);
                          alert('Failed to delete tip.');
                        });
                    }
                    if (deletingBlogId) {
                      deleteBlog(deletingBlogId)
                        .then(() => {
                          setDeletingBlogId(null);
                          alert('Blog deleted successfully!');
                        })
                        .catch((err) => {
                          console.error('Error deleting blog:', err);
                          alert('Failed to delete blog.');
                        });
                    }
                    if (deletingCategoryId) {
                      deleteCategory(deletingCategoryId)
                        .then(() => {
                          setDeletingCategoryId(null);
                          alert('Category deleted successfully!');
                        })
                        .catch((err) => {
                          console.error('Error deleting category:', err);
                          alert('Failed to delete category.');
                        });
                    }
                    if (deletingCountryId) {
                      deleteCountry(deletingCountryId)
                        .then(() => {
                          setDeletingCountryId(null);
                          alert('Country deleted successfully!');
                        })
                        .catch((err) => {
                          console.error('Error deleting country:', err);
                          alert('Failed to delete country.');
                        });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
