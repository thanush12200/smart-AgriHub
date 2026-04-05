import { useState } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  useDocTitle('Profile');
  const { user, updateUser } = useAuth();
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    region: user?.region || '',
    language: user?.language || 'en'
  });
  const [profileStatus, setProfileStatus] = useState({ loading: false, msg: '', type: '' });

  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdStatus, setPwdStatus] = useState({ loading: false, msg: '', type: '' });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileStatus({ loading: true, msg: '', type: '' });
    try {
      const { data } = await api.patch('/auth/profile', profileForm);
      updateUser(data.user);
      setProfileStatus({ loading: false, msg: 'Profile updated successfully', type: 'success' });
    } catch (err) {
      setProfileStatus({ loading: false, msg: err.response?.data?.message || 'Update failed', type: 'error' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdStatus({ loading: false, msg: 'New passwords do not match', type: 'error' });
      return;
    }
    setPwdStatus({ loading: true, msg: '', type: '' });
    try {
      await api.patch('/auth/password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      setPwdStatus({ loading: false, msg: 'Password changed successfully', type: 'success' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdStatus({ loading: false, msg: err.response?.data?.message || 'Password change failed', type: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-3xl text-slate-900">Your Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Left Column: Avatar & Basic Info */}
        <div className="card p-6 h-fit text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700">
            {user?.name?.[0]?.toUpperCase() || 'F'}
          </div>
          <h2 className="mt-4 font-display text-xl text-slate-900">{user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <div className="mt-4 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Role: <span className="ml-1 capitalize text-slate-900">{user?.role}</span>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="space-y-6">
          {/* Profile Form */}
          <div className="card p-6">
            <h3 className="section-title text-xl">Personal Information</h3>
            <form className="mt-4 space-y-4" onSubmit={handleProfileUpdate}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">Full Name</label>
                  <input className="input" value={profileForm.name} onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="field-label">Region</label>
                  <input className="input" value={profileForm.region} onChange={(e) => setProfileForm(p => ({ ...p, region: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="field-label">Language Preference</label>
                <select className="input" value={profileForm.language} onChange={(e) => setProfileForm(p => ({ ...p, language: e.target.value }))}>
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                </select>
              </div>
              {profileStatus.msg && (
                <p className={`text-sm ${profileStatus.type === 'error' ? 'text-red-600' : 'text-brand-600'}`}>
                  {profileStatus.msg}
                </p>
              )}
              <button className="btn-primary" type="submit" disabled={profileStatus.loading}>
                {profileStatus.loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Password Form */}
          <div className="card p-6">
            <h3 className="section-title text-xl">Change Password</h3>
            <form className="mt-4 space-y-4" onSubmit={handlePasswordChange}>
              <div>
                <label className="field-label">Current Password</label>
                <input className="input" type="password" value={pwdForm.currentPassword} onChange={(e) => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">New Password</label>
                  <input className="input" type="password" minLength={6} value={pwdForm.newPassword} onChange={(e) => setPwdForm(p => ({ ...p, newPassword: e.target.value }))} required />
                </div>
                <div>
                  <label className="field-label">Confirm New Password</label>
                  <input className="input" type="password" minLength={6} value={pwdForm.confirmPassword} onChange={(e) => setPwdForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
                </div>
              </div>
              {pwdStatus.msg && (
                <p className={`text-sm ${pwdStatus.type === 'error' ? 'text-red-600' : 'text-brand-600'}`}>
                  {pwdStatus.msg}
                </p>
              )}
              <button className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300" type="submit" disabled={pwdStatus.loading}>
                {pwdStatus.loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
