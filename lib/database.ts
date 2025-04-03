import { supabase } from './supabase'

export async function getTotalFines() {
  const { data, error } = await supabase
    .from('fines')
    .select('amount')
  
  if (error) throw error
  
  return data.reduce((sum, fine) => sum + fine.amount, 0)
}

export async function getRecentFines(limit = 5) {
  const { data, error } = await supabase
    .from('fines_view')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

export async function getPlayerFines(playerId: number) {
  const { data, error } = await supabase
    .from('fines_view')
    .select('*')
    .eq('player_id', playerId)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getFineReasons() {
  const { data, error } = await supabase
    .from('reasons')
    .select('*')
    .order('description')
  
  if (error) throw error
  return data
}

export async function addFine(fine: {
  player_id: number
  reason_id: number
  amount: number
  date?: string
}) {
  const { data, error } = await supabase
    .from('fines')
    .insert([fine])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function addPlayer(name: string) {
  const { data, error } = await supabase
    .from('players')
    .insert([{ name }])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function addReason(description: string) {
  const { data, error } = await supabase
    .from('reasons')
    .insert([{ description }])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function deleteFine(id: number) {
  const { error } = await supabase
    .from('fines')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function deletePlayer(id: number) {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteReason(id: number) {
  const { error } = await supabase
    .from('reasons')
    .delete()
    .eq('id', id)
  
  if (error) throw error
} 