import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  demat_code: string;
  experience_level: string;
  goals: string[];
  preferred_instruments: string[];
  risk_tolerance: string;
  age_range: string;
  occupation: string;
  city: string;
  referral_source: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // 2. Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setProfile(profileData);
        }

        // 3. Fetch first portfolio
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (portfolioError) {
          console.error('Error fetching portfolio:', portfolioError);
        } else {
          setPortfolio(portfolioData);
        }

      } catch (err) {
        console.error('Unexpected error in useProfile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { profile, portfolio, loading, setProfile };
};
