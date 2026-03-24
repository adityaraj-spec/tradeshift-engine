import React, { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import type { Profile } from '../hooks/useProfile';
import { updateProfile } from '../lib/updateProfile';
import { toast } from 'sonner';

const GOALS_OPTIONS = ['Wealth Creation', 'Passive Income', 'Retirement', 'Education', 'Home Purchase', 'Tax Saving'];
const INSTRUMENTS_OPTIONS = ['Equities', 'Options', 'Futures', 'Commodities', 'Forex', 'Mutual Funds', 'Bonds'];
const RISK_LEVELS = ['Conservative', 'Moderate', 'Aggressive', 'Very Aggressive'];
const AGE_RANGES = ['18-25', '26-35', '36-45', '46-60', '60+'];
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

export const ProfilePage: React.FC = () => {
  const { profile, portfolio, loading, setProfile } = useProfile();
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dematOptions, setDematOptions] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      
      // Generate options if no demat_code exists
      if (!profile.demat_code) {
        const generateOptions = () => {
          const catchyWords = ['BULL', 'BEAR', 'GOLD', 'ACE', 'PRO', 'GAIN', 'TRADE', 'BOSS', 'WIN', 'MAX', 'RISK'];
          const options: string[] = [];
          
          while (options.length < 3) {
            const word = catchyWords[Math.floor(Math.random() * catchyWords.length)];
            const randomNum = Math.floor(100 + Math.random() * 899);
            const candidate = `TS-${word}-${randomNum}`;
            if (!options.includes(candidate)) {
              options.push(candidate);
            }
          }
          return options;
        };
        setDematOptions(generateOptions());
      }
    }
  }, [profile]);

  const handleSelectDemat = async (code: string) => {
    setIsSubmitting(true);
    try {
      const updated = await updateProfile({ demat_code: code });
      setProfile(updated);
      toast.success(`Demat Code ${code} assigned successfully!`);
    } catch (err) {
      toast.error('Failed to assign Demat code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMulti = (field: 'goals' | 'preferred_instruments', value: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create a clean updates object by picking only editable fields
      const { 
        experience_level, 
        goals, 
        preferred_instruments, 
        risk_tolerance, 
        age_range, 
        occupation, 
        city, 
        referral_source 
      } = formData;
      
      const updates = {
        experience_level: experience_level?.toLowerCase(),
        goals: goals?.map(g => g.toLowerCase()),
        preferred_instruments: preferred_instruments?.map(i => i.toLowerCase()),
        risk_tolerance: risk_tolerance?.toLowerCase(),
        age_range,
        occupation,
        city,
        referral_source
      };

      const updated = await updateProfile(updates);
      setProfile(updated);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col justify-center transition-all hover:border-gray-700">
            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Demat Client Code</span>
            {profile?.demat_code ? (
              <h2 className="text-4xl font-black text-blue-500 mt-2 font-mono tracking-tighter">
                {profile.demat_code}
              </h2>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-yellow-500/80 mb-4 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20 inline-block">
                  Select your unique terminal ID to begin
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {dematOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => handleSelectDemat(option)}
                      className="group flex items-center justify-between bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 px-4 py-3 rounded-xl transition-all active:scale-95"
                    >
                      <span className="font-mono font-bold group-hover:text-white">{option}</span>
                      <span className="text-[10px] uppercase font-black text-blue-400 group-hover:text-blue-100">Select</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-xl shadow-blue-900/20">
            <span className="text-blue-100/70 text-sm font-bold uppercase tracking-widest">Available Margin</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black">₹</span>
              <h2 className="text-5xl font-black tabular-nums tracking-tighter">
                {portfolio?.balance.toLocaleString('en-IN') || '0.00'}
              </h2>
            </div>
            <p className="mt-4 text-blue-100/60 text-xs italic">Portfolio updated in real-time</p>
          </div>
        </div>

        {/* PROFILE FORM */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-8 border-b border-gray-800 pb-4">Investing Profile</h3>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Selects & Text */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Trading Experience</label>
                  <select 
                    value={formData.experience_level || ''}
                    onChange={(e) => setFormData({...formData, experience_level: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">Select Experience</option>
                    {EXPERIENCE_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Risk Tolerance</label>
                  <div className="flex flex-wrap gap-2">
                    {RISK_LEVELS.map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData({...formData, risk_tolerance: lvl})}
                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                          formData.risk_tolerance === lvl 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40' 
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Age Range</label>
                    <select 
                      value={formData.age_range || ''}
                      onChange={(e) => setFormData({...formData, age_range: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Select Age</option>
                      {AGE_RANGES.map(age => <option key={age} value={age}>{age}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                    <input 
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Multi-selects */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Investment Goals</label>
                  <div className="flex flex-wrap gap-2">
                    {GOALS_OPTIONS.map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleToggleMulti('goals', goal)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                          formData.goals?.includes(goal)
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-400'
                            : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Preferred Instruments</label>
                  <div className="flex flex-wrap gap-2">
                    {INSTRUMENTS_OPTIONS.map(inst => (
                      <button
                        key={inst}
                        type="button"
                        onClick={() => handleToggleMulti('preferred_instruments', inst)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                          formData.preferred_instruments?.includes(inst)
                            ? 'bg-green-600/30 border-green-500 text-green-400'
                            : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
                        }`}
                      >
                        {inst}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-12 rounded-xl shadow-lg shadow-blue-900/30 transform transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Changes...' : 'Update Explorer Profile'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
