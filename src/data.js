// ── data.js — Supabase live data layer ───────────────────────────
import { useState, useEffect, useCallback } from 'react'
import {
  supabase,
  getAllProfiles, updateProfile,
  getTransactions, addTransaction, updateTransaction,
  deleteTransaction, approveTransaction,
  getNotifications, addNotification, markAllNotifsRead,
} from './supabase'

// ── Categories ────────────────────────────────────────────────────
export const CATEGORIES = [
  { id:'food',      label:'Food',      color:'#F59E0B' },
  { id:'grocery',   label:'Grocery',   color:'#10B981' },
  { id:'cleaning',  label:'Cleaning',  color:'#06B6D4' },
  { id:'electric',  label:'Electric',  color:'#F43F5E' },
  { id:'repair',    label:'Repair',    color:'#8B5CF6' },
  { id:'transport', label:'Transport', color:'#3B82F6' },
  { id:'medical',   label:'Medical',   color:'#EF4444' },
  { id:'other',     label:'Other',     color:'#64748B' },
]

// ── Permissions ───────────────────────────────────────────────────
export const PERMISSIONS = {
  give_advance:       ['superadmin', 'admin'],
  approve_expense:    ['superadmin', 'admin'],
  view_reports:       ['superadmin', 'admin'],
  edit_transaction:   ['superadmin', 'admin'],
  delete_transaction: ['superadmin', 'admin'],
  add_member:         ['superadmin', 'admin'],
  edit_member:        ['superadmin', 'admin'],
  delete_member:      ['superadmin'],
  assign_role:        ['superadmin'],
  view_all_members:   ['superadmin', 'admin'],
}

export function canDo(user, action) {
  if (!user) return false
  const allowed = PERMISSIONS[action]
  if (!allowed) return false
  return allowed.includes(user.role)
}

export const COLORS = ['#7C3AED','#06B6D4','#10B981','#F59E0B','#F43F5E','#3B82F6','#8B5CF6','#EF4444']
let _ci = 0
export function nextColor() { return COLORS[_ci++ % COLORS.length] }
export function makeInitials(name) {
  return (name||'').trim().split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || '?'
}

// ── Main data hook ────────────────────────────────────────────────
export function useHostelData(currentUser) {
  const [members,       setMembers]       = useState([])
  const [transactions,  setTransactions]  = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)

  // Initial load
  useEffect(() => {
    if (!currentUser) return
    setLoading(true)
    Promise.all([loadMembers(), loadTransactions(), loadNotifications()])
      .finally(() => setLoading(false))
  }, [currentUser?.id])

  // Real-time subscriptions — UI updates instantly across all devices
  useEffect(() => {
    if (!currentUser) return
    const txnSub = supabase.channel('rt-txn')
      .on('postgres_changes', { event:'*', schema:'public', table:'transactions' }, loadTransactions)
      .subscribe()
    const profSub = supabase.channel('rt-prof')
      .on('postgres_changes', { event:'*', schema:'public', table:'profiles' }, loadMembers)
      .subscribe()
    const notifSub = supabase.channel('rt-notif')
      .on('postgres_changes', { event:'*', schema:'public', table:'notifications' }, loadNotifications)
      .subscribe()
    return () => {
      supabase.removeChannel(txnSub)
      supabase.removeChannel(profSub)
      supabase.removeChannel(notifSub)
    }
  }, [currentUser?.id])

  async function loadMembers()       { try { setMembers(await getAllProfiles()) } catch(e){console.error(e)} }
  async function loadTransactions()  { try { setTransactions(await getTransactions()) } catch(e){console.error(e)} }
  async function loadNotifications() { try { setNotifications(await getNotifications()) } catch(e){console.error(e)} }

  const notify = useCallback(async (type, message, meta={}) => {
    try { await addNotification(type, message, meta) } catch(e){console.warn(e)}
  }, [])

  // ── Transactions ─────────────────────────────────────────────
  const handleAddTransaction = useCallback(async ({ type, memberId, amount, note, category }) => {
    const m    = members.find(x => x.id === memberId)
    const cat  = CATEGORIES.find(c => c.id === category)
    const isAdmin = canDo(currentUser, 'approve_expense')
    const status  = (type==='advance' || isAdmin) ? 'approved' : 'pending'
    const txn = await addTransaction({
      type, member_id:memberId, amount, status, category:category||null,
      note: note || (type==='advance' ? 'Cash advance' : 'Expense'),
      date: new Date().toISOString(), created_by: currentUser.id,
    })
    if (type==='advance')
      await notify('advance', `${currentUser.name} gave ₹${amount.toLocaleString('en-IN')} advance to ${m?.name}`)
    else if (status==='pending')
      await notify('expense', `${m?.name} submitted ₹${amount.toLocaleString('en-IN')}${cat?' for '+cat.label:''} — awaiting approval`)
    else
      await notify('expense', `${currentUser.name} logged ₹${amount.toLocaleString('en-IN')}${cat?' on '+cat.label:''}`)
    return txn
  }, [members, currentUser, notify])

  const handleUpdateTransaction = useCallback(async (id, updates) => {
    await updateTransaction(id, updates)
    await notify('edit', `${currentUser.name} edited a transaction`)
  }, [currentUser, notify])

  const handleDeleteTransaction = useCallback(async (id) => {
    const t = transactions.find(x => x.id===id)
    const m = members.find(x => x.id===t?.member_id)
    await deleteTransaction(id)
    await notify('delete', `${currentUser.name} deleted: ${t?.note} (₹${Number(t?.amount||0).toLocaleString('en-IN')}) for ${m?.name}`)
  }, [transactions, members, currentUser, notify])

  const handleApproveTransaction = useCallback(async (id) => {
    const t = transactions.find(x => x.id===id)
    const m = members.find(x => x.id===t?.member_id)
    await approveTransaction(id)
    await notify('approval', `${currentUser.name} approved ${m?.name}'s ₹${Number(t?.amount||0).toLocaleString('en-IN')} expense`)
  }, [transactions, members, currentUser, notify])

  // ── Members ───────────────────────────────────────────────────
  const handleUpdateMember = useCallback(async (id, updates) => {
    await updateProfile(id, updates)
    await notify('member', `${currentUser.name} updated ${updates.name||'a member'}'s profile`)
  }, [currentUser, notify])

  const handleAssignRole = useCallback(async (id, role) => {
    const m = members.find(x => x.id===id)
    await updateProfile(id, { role })
    await notify('role', `${currentUser.name} changed ${m?.name}'s role to ${role}`)
  }, [members, currentUser, notify])

  const handleDeleteMember = useCallback(async (id) => {
    const m = members.find(x => x.id===id)
    await updateProfile(id, { is_active:false })
    await notify('member', `${currentUser.name} removed ${m?.name} from the team`)
  }, [members, currentUser, notify])

  // ── Notifications ─────────────────────────────────────────────
  const handleMarkAllRead = useCallback(async () => {
    await markAllNotifsRead()
    try { setNotifications(await getNotifications()) } catch(e) { console.error(e) }
  }, [])

  return {
    members, transactions, notifications, loading,
    handleAddTransaction, handleUpdateTransaction,
    handleDeleteTransaction, handleApproveTransaction,
    handleUpdateMember, handleAssignRole, handleDeleteMember,
    handleMarkAllRead, notify,
  }
}

// ── Shared helpers ────────────────────────────────────────────────
export function formatCurrency(amount) {
  if (!amount) return '₹0'
  if (amount >= 100000) return '₹' + (amount/100000).toFixed(1) + 'L'
  if (amount >= 1000)   return '₹' + (amount/1000).toFixed(1).replace('.0','') + 'k'
  return '₹' + Number(amount).toLocaleString('en-IN')
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff/60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m/60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

// Keep these exports so old component code doesn't break
export const NOTIF_TYPES = { ADVANCE:'advance', EXPENSE:'expense', APPROVAL:'approval', EDIT:'edit', DELETE:'delete', MEMBER:'member', ROLE:'role' }
export function makeNotif(type, message, meta={}) {
  return { id: 't'+Date.now(), type, message, meta, is_read:false, created_at: new Date().toISOString() }
}

// ── Stats helpers (used by Dashboard, Reports components) ─────────

export function getTodayStats(transactions = []) {
  const todayStr = new Date().toDateString()
  const todayTxns = transactions.filter(t => new Date(t.date).toDateString() === todayStr)
  const totalAdvanced = todayTxns
    .filter(t => t.type === 'advance')
    .reduce((s, t) => s + Number(t.amount), 0)
  const totalSpent = todayTxns
    .filter(t => t.type === 'expense' && t.status === 'approved')
    .reduce((s, t) => s + Number(t.amount), 0)
  const remaining = totalAdvanced - totalSpent
  return { totalAdvanced, totalSpent, remaining }
}

export function getMemberBalance(memberId, transactions = []) {
  const txns = transactions.filter(t => t.memberId === memberId || t.member_id === memberId)
  const totalAdvanced = txns
    .filter(t => t.type === 'advance')
    .reduce((s, t) => s + Number(t.amount), 0)
  const totalSpent = txns
    .filter(t => t.type === 'expense' && t.status === 'approved')
    .reduce((s, t) => s + Number(t.amount), 0)
  return { totalAdvanced, totalSpent, remaining: totalAdvanced - totalSpent }
}

export function getWeeklyData(transactions = []) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const result = days.map(day => ({ day, expenses: 0, advances: 0 }))
  const now = new Date()
  transactions.forEach(t => {
    const d = new Date(t.date)
    const diffDays = Math.floor((now - d) / 86400000)
    if (diffDays > 6) return
    const idx = d.getDay()
    if (t.type === 'expense' && t.status === 'approved') result[idx].expenses += Number(t.amount)
    if (t.type === 'advance') result[idx].advances += Number(t.amount)
  })
  // Rotate so today is last
  const today = now.getDay()
  return [...result.slice(today + 1), ...result.slice(0, today + 1)]
}

export function getCategoryBreakdown(transactions = []) {
  const map = {}
  transactions
    .filter(t => t.type === 'expense' && t.status === 'approved')
    .forEach(t => {
      const cat = t.category || 'other'
      map[cat] = (map[cat] || 0) + Number(t.amount)
    })
  return Object.entries(map)
    .map(([id, amount]) => ({ id, amount }))
    .sort((a, b) => b.amount - a.amount)
}
