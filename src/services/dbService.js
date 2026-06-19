import { supabase } from '../config/supabaseClient';

export const dbService = {
  // --- AUTHENTICATION ---
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // --- DATABASE OPERATIONS ---
  async getMembers() {
    const { data, error } = await supabase.from('members').select('*').order('name');
    if (error) throw error;
    return data;
  },
  async addMember(member) {
    const { data, error } = await supabase.from('members').insert([member]).select();
    if (error) throw error;
    return data[0];
  },
  async getLevies() {
    const { data, error } = await supabase.from('levies').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data;
  },
  async addLevy(levy) {
    const { data, error } = await supabase.from('levies').insert([levy]).select();
    if (error) throw error;
    return data[0];
  },
  async getExpenses() {
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data;
  },
  async addExpense(expense) {
    const { data, error } = await supabase.from('expenses').insert([expense]).select();
    if (error) throw error;
    return data[0];
  },
  async getMeetings() {
    const { data, error } = await supabase.from('meetings').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data;
  },
  async addMeeting(meeting) {
    const { data, error } = await supabase.from('meetings').insert([meeting]).select();
    if (error) throw error;
    return data[0];
  }
};