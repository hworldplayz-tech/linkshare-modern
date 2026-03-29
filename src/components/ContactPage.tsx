import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SiteSettings } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';
import { User } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import { Button } from './ui/Button';

interface ContactPageProps {
  settings: SiteSettings;
}

export default function ContactPage({ settings }: ContactPageProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message
      };

      await emailjs.send(
        'service_g73xunh', 
        'template_tge0hum', 
        templateParams,
        'HqfPvAECrychv8JIh'
      );

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Email error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans selection:bg-[#00a884] selection:text-white">
      <Navbar 
        user={user}
        settings={settings}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#00a884]/10 to-transparent rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-8 leading-[0.9]">
              Get in <span className="text-[#00a884]">Touch</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-12">
              Have questions or need assistance? We're here to help you connect with the right communities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- Contact Content --- */}
      <section className="pb-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 mb-8">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#00a884]/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-[#00a884]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Email Us</p>
                      <p className="text-gray-900 font-medium">syedhamzaalinaqvi4@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#00a884]/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-[#00a884]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Response Time</p>
                      <p className="text-gray-900 font-medium">Within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#00a884]/10 rounded-2xl flex items-center justify-center shrink-0">
                      <MessageSquare className="w-6 h-6 text-[#00a884]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Social Support</p>
                      <p className="text-gray-900 font-medium">Available on WhatsApp</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#00a884] p-8 rounded-[32px] text-white">
                <h3 className="text-xl font-black mb-4">Need Quick Help?</h3>
                <p className="text-white/80 mb-6 text-sm leading-relaxed">
                  Check our About page for community guidelines and mission statement.
                </p>
                <Button 
                  variant="blank"
                  size="sm" 
                  onClick={() => navigate('/about')}
                  className="bg-white text-[#00a884] hover:bg-gray-100 border-none"
                >
                  Visit About Page
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100">
                <h2 className="text-3xl font-black text-gray-900 mb-8">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-bold text-gray-700 ml-1">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-bold text-gray-700 ml-1">Message</label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your inquiry..."
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isSubmitting}
                      className="w-full md:w-auto min-w-[200px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {submitStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700"
                      >
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">Message sent successfully! We'll get back to you soon.</p>
                      </motion.div>
                    )}
                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700"
                      >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">Failed to send message. Please try again later or email us directly.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <Footer settings={settings} />

      <AddGroupModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        user={user}
        settings={settings}
        onLogin={handleLogin}
      />
    </div>
  );
}
