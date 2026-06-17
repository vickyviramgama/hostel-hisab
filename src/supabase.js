import { createClient } from '@supabase/supabase-js'

// ── Replace these with your Supabase project values ──────────────
// Supabase dashboard → Settings → API
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || 'YOUR_SUPABASE_ANON_KEY'
// ─────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Auth helpers ─────────────────────────────────────────────────

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUp(email, password, name, role = 'staff') {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, role } }
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/?reset=true'
  })
  if (error) throw error
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

// ── Profile helpers ──────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles').select('*').eq('is_active', true).order('created_at')
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles').update(updates).eq('id', userId)
  if (error) throw error
}

export async function createMember(email, password, name, role, phone, color) {
  // Admin creates a new staff member account
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
  const { data, error } = await supabase.auth.admin.createUser({
    email, password,
    email_confirm: true,
    user_metadata: { name, role }
  })
  if (error) {
    // Fallback: use signUp (requires email confirmation)
    const res = await signUp(email, password, name, role)
    if (res.user) {
      await supabase.from('profiles').update({ phone, color, initials, role }).eq('id', res.user.id)
    }
    return res
  }
  if (data.user) {
    await supabase.from('profiles').update({ phone, color, initials, role }).eq('id', data.user.id)
  }
  return data
}

// ── Transaction helpers ──────────────────────────────────────────

export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions').select('*').order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function addTransaction(txn) {
  const { data, error } = await supabase
    .from('transactions').insert([txn]).select().single()
  if (error) throw error
  return data
}

export async function updateTransaction(id, updates) {
  const { error } = await supabase
    .from('transactions').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions').delete().eq('id', id)
  if (error) throw error
}

export async function approveTransaction(id) {
  const { error } = await supabase
    .from('transactions').update({ status: 'approved' }).eq('id', id)
  if (error) throw error
}

// ── Notification helpers ─────────────────────────────────────────

export async function getNotifications() {
  const { data, error } = await supabase
    .from('notifications').select('*').order('created_at', { ascending: false }).limit(50)
  if (error) throw error
  return data
}

export async function addNotification(type, message, meta = {}) {
  const { error } = await supabase
    .from('notifications').insert([{ type, message, meta }])
  if (error) console.warn('Notif insert failed:', error.message)
}

export async function markAllNotifsRead() {
  const { error } = await supabase
    .from('notifications').update({ is_read: true }).eq('is_read', false)
  if (error) throw error
}
