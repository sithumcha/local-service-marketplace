import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle from '../components/ThemeToggle';

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuthStore();
  const navigate = useNavigate();

  // Personal details state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Active tab state
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'security'

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Profile image size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      await updateProfile({ name, email, phone, profileImage });
      setProfileSuccess('Your profile details have been saved successfully.');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile details.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      setIsUpdatingPassword(false);
      return;
    }

    try {
      await updatePassword({ currentPassword, newPassword });
      setPasswordSuccess('Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/dashboard/admin';
    if (user?.role === 'provider') return '/dashboard/provider';
    return '/dashboard/customer';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between animate-fade-in">
      
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              QuickServe.lk
            </Link>
            <Link
              to={getDashboardLink()}
              className="text-xs font-bold text-slate-400 hover:text-white transition hidden sm:inline-block"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBell />
            <Link
              to={getDashboardLink()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Settings Panel */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-xl space-y-6 self-start">
            
            {/* Avatar upload wrapper */}
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-amber-500 bg-slate-950 flex items-center justify-center shadow-lg relative">
                {profileImage ? (
                  <img src={profileImage} alt="User avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl text-slate-700 font-bold uppercase">
                    {user?.name?.slice(0, 2) || 'QS'}
                  </span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-[10px] font-bold text-white">
                <span>Change Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile info */}
            <div>
              <h2 className="text-lg font-black text-white">{user?.name}</h2>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mt-1.5 inline-block">
                {user?.role} Account
              </span>
            </div>

            {/* General Meta details */}
            <div className="w-full border-t border-slate-850 pt-6 text-left space-y-3 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Email</span>
                <span className="font-semibold text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone</span>
                <span className="font-semibold text-white">{user?.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span>Member Since</span>
                <span className="font-semibold text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString([], { dateStyle: 'medium' }) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Dashboard Link for mobile */}
            <Link
              to={getDashboardLink()}
              className="w-full py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition sm:hidden"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Right Column: Settings Tabs */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-850 pb-1 gap-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-sm font-black transition relative cursor-pointer ${
                  activeTab === 'details' ? 'text-amber-500' : 'text-slate-400 hover:text-white'
                }`}
              >
                Personal Details
                {activeTab === 'details' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`pb-3 text-sm font-black transition relative cursor-pointer ${
                  activeTab === 'security' ? 'text-amber-500' : 'text-slate-400 hover:text-white'
                }`}
              >
                Security Settings
                {activeTab === 'security' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>
            </div>

            {/* TAB 1: DETAILS */}
            {activeTab === 'details' && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                
                {profileSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                    {profileError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl hover:scale-[1.01] hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            )}

            {/* TAB 2: SECURITY */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                
                {passwordSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
                    {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl hover:scale-[1.01] hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingPassword ? 'Updating Password...' : 'Change Password'}
                </button>
              </form>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-8">
        <p>© 2026 QuickServe.lk. All profile data is secured & encrypted.</p>
      </footer>
    </div>
  );
};

export default Profile;
