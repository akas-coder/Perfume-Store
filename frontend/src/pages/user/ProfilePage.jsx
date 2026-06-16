import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiPlus, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addresses, setAddresses] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', phone: user.phone || '' });
    userAPI.getAddresses().then(r => setAddresses(r.data.data || []));
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await userAPI.updateProfile(profile);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await userAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.addAddress(newAddress);
      setAddresses(prev => [...prev, res.data.data]);
      setAddingAddress(false);
      setNewAddress({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
      toast.success('Address added!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await userAPI.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const AddressForm = ({ onSubmit, onCancel, addr, setAddr, title }) => (
    <form onSubmit={onSubmit} className="space-y-3 p-4 rounded-xl mt-3"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
      <h4 className="text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>{title}</h4>
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Full Name" value={addr.fullName} required
          onChange={e => setAddr(p => ({ ...p, fullName: e.target.value }))}
          className="px-3 py-2.5 rounded-lg text-sm input-dark" />
        <input placeholder="Phone" value={addr.phone} required
          onChange={e => setAddr(p => ({ ...p, phone: e.target.value }))}
          className="px-3 py-2.5 rounded-lg text-sm input-dark" />
      </div>
      <input placeholder="Address Line 1" value={addr.addressLine1} required
        onChange={e => setAddr(p => ({ ...p, addressLine1: e.target.value }))}
        className="w-full px-3 py-2.5 rounded-lg text-sm input-dark" />
      <input placeholder="Address Line 2 (optional)" value={addr.addressLine2}
        onChange={e => setAddr(p => ({ ...p, addressLine2: e.target.value }))}
        className="w-full px-3 py-2.5 rounded-lg text-sm input-dark" />
      <div className="grid grid-cols-3 gap-3">
        <input placeholder="City" value={addr.city} required
          onChange={e => setAddr(p => ({ ...p, city: e.target.value }))}
          className="px-3 py-2.5 rounded-lg text-sm input-dark" />
        <input placeholder="State" value={addr.state} required
          onChange={e => setAddr(p => ({ ...p, state: e.target.value }))}
          className="px-3 py-2.5 rounded-lg text-sm input-dark" />
        <input placeholder="Pincode" value={addr.pincode} required
          onChange={e => setAddr(p => ({ ...p, pincode: e.target.value }))}
          className="px-3 py-2.5 rounded-lg text-sm input-dark" />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-muted)' }}>
        <input type="checkbox" checked={addr.isDefault}
          onChange={e => setAddr(p => ({ ...p, isDefault: e.target.checked }))}
          style={{ accentColor: 'var(--color-gold)' }} />
        Set as default address
      </label>
      <div className="flex gap-3">
        <button type="submit" className="px-5 py-2 rounded-lg text-sm btn-gold">Save</button>
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg text-sm btn-outline-gold">Cancel</button>
      </div>
    </form>
  );

  const tabs = [
    { key: 'profile', label: 'Profile Info', icon: FiUser },
    { key: 'security', label: 'Security', icon: FiLock },
    { key: 'addresses', label: 'Addresses', icon: FiUser },
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
               style={{ background: 'linear-gradient(135deg, #E8C96A, #D4AF37)', color: '#0A0A0A' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--color-cream)' }}>{user?.name}</h1>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--color-surface)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === t.key ? 'btn-gold' : ''}`}
              style={activeTab !== t.key ? { color: 'var(--color-muted)' } : {}}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="p-6 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
              <h2 className="font-semibold text-lg mb-5" style={{ color: 'var(--color-cream)' }}>Personal Information</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Full Name</label>
                  <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm input-dark" id="profile-name" />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Email Address</label>
                  <input value={user?.email} disabled
                    className="w-full px-4 py-3 rounded-xl text-sm input-dark opacity-50 cursor-not-allowed" />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Phone Number</label>
                  <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm input-dark" id="profile-phone" />
                </div>
                <button type="submit" disabled={savingProfile}
                  className="px-8 py-3 rounded-xl text-sm btn-gold disabled:opacity-50 flex items-center gap-2">
                  <FiSave size={15} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="p-6 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
              <h2 className="font-semibold text-lg mb-5" style={{ color: 'var(--color-cream)' }}>Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                  { key: 'newPassword', label: 'New Password', placeholder: 'At least 6 characters' },
                  { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>{f.label}</label>
                    <input type="password" value={passwords[f.key]}
                      onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder} required className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
                  </div>
                ))}
                <button type="submit" disabled={savingPassword}
                  className="px-8 py-3 rounded-xl text-sm btn-gold disabled:opacity-50 flex items-center gap-2">
                  <FiLock size={15} /> {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {addresses.map(addr => (
              <div key={addr.id} className="p-5 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--color-cream)' }}>
                      {addr.fullName} · {addr.phone}
                      {addr.isDefault && <span className="ml-2 text-xs" style={{ color: 'var(--color-gold)' }}>★ Default</span>}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                      {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteAddress(addr.id)}
                    className="p-2 rounded-lg transition-colors hover:text-red-400"
                    style={{ color: 'var(--color-muted)' }}>
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {!addingAddress ? (
              <button onClick={() => setAddingAddress(true)}
                className="flex items-center gap-2 text-sm btn-outline-gold px-5 py-3 rounded-xl">
                <FiPlus size={16} /> Add New Address
              </button>
            ) : (
              <AddressForm onSubmit={handleAddAddress} onCancel={() => setAddingAddress(false)}
                addr={newAddress} setAddr={setNewAddress} title="New Address" />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
