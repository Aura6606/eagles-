import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db, doc, updateDoc } from '../lib/firebase';
import { User, Phone, ShieldCheck, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { profile, setProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate('/');
      toast.error('Please login to view profile');
    }
    if (profile) {
      setFormData({
        name: profile.name,
        phone: profile.phone
      });
    }
  }, [profile, authLoading, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        name: formData.name,
        phone: formData.phone
      });
      
      setProfile({
        ...profile,
        name: formData.name,
        phone: formData.phone
      });
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-zinc-900 rounded-[3rem] border border-white/5 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-green-500/20 via-green-500/10 to-transparent relative">
          <div className="absolute -bottom-16 left-12">
            <div className="w-32 h-32 rounded-3xl bg-zinc-800 border-4 border-black overflow-hidden shadow-2xl">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=22c55e&color=000&size=256`} 
                alt={profile.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="pt-20 pb-12 px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {profile.isAdmin && (
                  <span className="flex items-center space-x-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Admin</span>
                  </span>
                )}
              </div>
              <p className="text-zinc-500">Member since {profile.createdAt?.toDate ? format(profile.createdAt.toDate(), 'MMMM yyyy') : 'Recently'}</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-xl font-bold border-b border-white/5 pb-4">Personal Information</h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase flex items-center space-x-2">
                    <User className="w-3 h-3" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-green-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase flex items-center space-x-2">
                    <Phone className="w-3 h-3" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    placeholder="e.g., +254 714 593 466"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-green-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    required
                  />
                </div>

                {isEditing && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-all flex items-center justify-center space-x-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>Save Changes</span>
                  </motion.button>
                )}
              </form>
            </div>

            <div className="space-y-8">
              <h3 className="text-xl font-bold border-b border-white/5 pb-4">Account Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                  <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Account Status</p>
                  <p className="text-green-500 font-bold">Active</p>
                </div>
                <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                  <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Verification</p>
                  <p className="text-blue-500 font-bold">Verified</p>
                </div>
              </div>
              
              <div className="bg-green-500/5 p-6 rounded-2xl border border-green-500/10">
                <h4 className="font-bold mb-2 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Security Note</span>
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Your profile information is securely stored and only used for ride bookings and communication with your drivers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
