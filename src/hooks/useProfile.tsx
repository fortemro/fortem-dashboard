
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Profile = Tables<'profiluri_utilizatori'>;
type ProfileInsert = TablesInsert<'profiluri_utilizatori'>;
type ProfileUpdate = TablesUpdate<'profiluri_utilizatori'>;

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiluri_utilizatori')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Omit<ProfileInsert, 'user_id'>) => {
    if (!user) throw new Error('Nu ești autentificat');

    const { data, error } = await supabase
      .from('profiluri_utilizatori')
      .insert({
        ...profileData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user || !profile) throw new Error('Nu ești autentificat sau profilul nu există');

    const { data, error } = await supabase
      .from('profiluri_utilizatori')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    refreshProfile: fetchProfile
  };
}
