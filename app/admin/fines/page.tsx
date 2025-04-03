'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Select from 'react-select'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import { formatCurrency, formatDate } from '@/lib/utils'

// Types from database (assuming generated or manually created)
interface Player {
  id: number
  name: string
}

interface Reason {
  id: number
  description: string
}

interface Fine {
  id: number
  player_id: number
  reason_id: number
  amount: number
  date: string
  admin_notes?: string | null
  player: {
    name: string
  }
  reason: {
    description: string
  }
}

// Options type for react-select
interface SelectOption {
    value: string;
    label: string;
}

interface FineFormData {
    player_ids: string[]
    reason_id: string
    amount: string
    admin_notes: string
}

export default function FinesManagement() {
  const [fines, setFines] = useState<Fine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for the inline form
  const [players, setPlayers] = useState<Player[]>([])
  const [reasons, setReasons] = useState<Reason[]>([])
  const [formLoading, setFormLoading] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<FineFormData>({
    player_ids: [],
    reason_id: '',
    amount: '',
    admin_notes: ''
  })

  // Options for react-select
  const [playerOptions, setPlayerOptions] = useState<SelectOption[]>([])

  useEffect(() => {
    fetchFines()
    fetchFormData()
  }, [])

  const fetchFines = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('fines')
        .select('*, player:players(name), reason:reasons(description), admin_notes')
        .order('date', { ascending: false })

      if (error) throw error
      setFines(data || [])
    } catch (error) {
      console.error('Fout bij ophalen boetes:', error)
      setError('Kon de boetes niet laden. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const fetchFormData = async () => {
    setFormLoading(true)
    setFormError(null)
    try {
      const [playersRes, reasonsRes] = await Promise.all([
        supabase.from('players').select('id, name').order('name'),
        supabase.from('reasons').select('id, description').order('description')
      ])

      if (playersRes.error) throw playersRes.error
      if (reasonsRes.error) throw reasonsRes.error

      const fetchedPlayers = playersRes.data || []
      setPlayers(fetchedPlayers)
      setReasons(reasonsRes.data || [])
      
      // Create options for react-select
      setPlayerOptions(fetchedPlayers.map(p => ({ value: String(p.id), label: p.name })))

    } catch (error) {
      console.error('Fout bij ophalen formuliergegevens:', error)
      setFormError('Kon spelers/redenen niet laden voor formulier.')
    } finally {
      setFormLoading(false)
    }
  }

  const handlePlayerSelectChange = (selectedOptions: readonly SelectOption[] | null) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prev => ({ ...prev, player_ids: selectedIds }));
  }

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    try {
        // Basic validation
        if (formData.player_ids.length === 0 || !formData.reason_id || !formData.amount) { 
            throw new Error('Speler(s), Reden en Bedrag zijn verplicht.');
        }
        
        const amountValue = parseFloat(formData.amount);
        if (isNaN(amountValue) || amountValue < 0) {
            throw new Error('Voer een geldig, niet-negatief bedrag in.');
        }
        
        const currentDate = new Date().toISOString();
        const notes = formData.admin_notes.trim() || null;

        // Create an array of fine objects to insert
        const finesToInsert = formData.player_ids.map(playerId => ({
          player_id: Number(playerId),
          reason_id: Number(formData.reason_id),
          amount: amountValue,
          date: currentDate,
          admin_notes: notes
        }));

        // Insert all fines at once
        const { error: insertError } = await supabase
          .from('fines')
          .insert(finesToInsert)

        if (insertError) throw insertError
        
        // Reset form
        setFormData({ player_ids: [], reason_id: '', amount: '', admin_notes: '' })
        
        fetchFines()

    } catch (error: any) {
      console.error('Fout bij toevoegen boete(s):', error)
      setFormError(error.message || 'Kon de boete(s) niet toevoegen. Controleer de gegevens.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteFine = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze boete wilt verwijderen?')) return

    try {
      const { error } = await supabase
        .from('fines')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchFines()
    } catch (error) {
      console.error('Fout bij verwijderen boete:', error)
      alert('Kon de boete niet verwijderen.')
    }
  }

  const deleteAllFines = async () => {
    if (!confirm('WEET JE ZEKER DAT JE ALLE BOETES WILT VERWIJDEREN? DIT KAN NIET ONGEDAAN GEMAAKT WORDEN!')) return

    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('fines')
        .delete()
        .neq('id', -1)

      if (error) throw error
      
      alert('Alle boetes zijn succesvol verwijderd.')
      fetchFines()

    } catch (error) {
      console.error('Fout bij verwijderen alle boetes:', error)
      setError('Kon niet alle boetes verwijderen.')
      alert('Fout: Kon niet alle boetes verwijderen.')
    } finally {
      setLoading(false)
    }
  }

  // --- STYLING for react-select (can be customized further) ---
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: '#CBD5E1',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#94A3B8'
      },
    }),
    option: (base: any, { isFocused, isSelected }: any) => ({
        ...base,
        backgroundColor: isSelected ? '#1E88E5' : isFocused ? '#E3F2FD' : 'white',
        color: isSelected ? 'white' : '#1E293B',
        '&:active': {
            backgroundColor: !isSelected ? '#BBDEFB' : undefined,
        },
    }),
    multiValue: (base: any) => ({
        ...base,
        backgroundColor: '#E3F2FD',
    }),
    multiValueLabel: (base: any) => ({
        ...base,
        color: '#1E88E5',
    }),
    multiValueRemove: (base: any) => ({
        ...base,
        color: '#1E88E5',
        ':hover': {
            backgroundColor: '#BBDEFB',
            color: '#1565C0',
        },
    }),
  };
  // --- END react-select STYLING ---

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
        <header className="bg-white shadow-soft">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">Boete Beheer</h1>
            <Link
                href="/admin/dashboard"
                className="text-sm font-medium text-secondary-600 hover:text-primary-600 inline-flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Terug naar Dashboard
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
             <div className="bg-white rounded-xl shadow-soft p-6 md:p-8 mb-8">
                <h2 className="text-xl font-semibold text-secondary-800 mb-6">Nieuwe Boete Toevoegen</h2>
                {formLoading ? (
                    <div className="text-center p-4 text-secondary-500">Formulier laden...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="player_ids" className="block text-sm font-medium text-secondary-700 mb-1">Speler(s) *</label>
                                <Select
                                  id="player_ids"
                                  instanceId="player_ids_select"
                                  isMulti
                                  name="player_ids"
                                  options={playerOptions}
                                  className="basic-multi-select text-sm"
                                  classNamePrefix="select"
                                  placeholder="Selecteer speler(s)..."
                                  onChange={handlePlayerSelectChange}
                                  value={playerOptions.filter(option => formData.player_ids.includes(option.value))}
                                  styles={selectStyles}
                                  required
                                />
                            </div>
                            <div>
                                <label htmlFor="reason_id" className="block text-sm font-medium text-secondary-700 mb-1">Reden *</label>
                                <select
                                  id="reason_id"
                                  name="reason_id"
                                  required
                                  value={formData.reason_id}
                                  onChange={handleFormInputChange}
                                  className="block w-full rounded-lg border-secondary-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                                >
                                  <option value="">Selecteer...</option>
                                  {reasons.map((reason) => (
                                    <option key={reason.id} value={reason.id}>
                                      {reason.description}
                                    </option>
                                  ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-secondary-700 mb-1">Bedrag (€) *</label>
                                <input
                                  id="amount"
                                  name="amount"
                                  type="number"
                                  required
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={formData.amount}
                                  onChange={handleFormInputChange}
                                  className="block w-full rounded-lg border-secondary-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="admin_notes" className="block text-sm font-medium text-secondary-700 mb-1">Admin Notities (Optioneel)</label>
                                <textarea
                                  id="admin_notes"
                                  name="admin_notes"
                                  rows={3}
                                  placeholder="Interne notities over deze boete(s)..."
                                  value={formData.admin_notes}
                                  onChange={handleFormInputChange}
                                  className="block w-full rounded-lg border-secondary-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col items-end">
                            <button
                              type="submit"
                              disabled={submitting || formLoading}
                              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                              {submitting ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                              {submitting ? 'Opslaan...' : 'Boete(s) Toevoegen'}
                            </button>
                            {formError && (
                                <div className="mt-3 text-red-600 text-sm text-right w-full">
                                  <p><strong>Fout:</strong> {formError}</p>
                                </div>
                            )}
                        </div>
                    </form>
                )}
            </div>

            <div className="flex justify-between items-center mb-4 mt-10">
                 <h2 className="text-xl font-semibold text-secondary-800">Boete Geschiedenis</h2>
                 <button
                    onClick={deleteAllFines}
                    disabled={loading || submitting || fines.length === 0}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Verwijder alle boetes permanent"
                >
                     <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Alles Verwijderen
                 </button>
            </div>
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                {loading ? (
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-secondary-600">Boetes worden geladen...</p>
                </div>
                ) : error ? (
                <div className="p-12 text-center text-red-600 bg-red-50">
                    <p>{error}</p>
                    <button 
                    onClick={fetchFines} 
                    className="mt-4 px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
                    >
                    Opnieuw proberen
                    </button>
                </div>
                ) : fines.length === 0 ? (
                <div className="p-12 text-center">
                    <svg className="w-16 h-16 text-secondary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v18h18" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12h14M7 6h14M7 18h14" />
                    </svg>
                    <p className="text-secondary-600">Geen boetes gevonden.</p>
                </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-secondary-600">
                    <thead className="text-xs text-secondary-700 uppercase bg-secondary-50">
                        <tr>
                        <th scope="col" className="px-6 py-3">Speler</th>
                        <th scope="col" className="px-6 py-3">Reden</th>
                        <th scope="col" className="px-6 py-3">Bedrag</th>
                        <th scope="col" className="px-6 py-3">Datum</th>
                        <th scope="col" className="px-6 py-3">Notities</th>
                        <th scope="col" className="px-6 py-3 text-right">Acties</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fines.map((fine) => (
                        <tr key={fine.id} className="bg-white border-b hover:bg-secondary-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-secondary-900">
                            {fine.player.name}
                            </td>
                            <td className="px-6 py-4">
                            {fine.reason.description}
                            </td>
                            <td className="px-6 py-4">
                            {formatCurrency(fine.amount)}
                            </td>
                            <td className="px-6 py-4">
                            {formatDate(fine.date)}
                            </td>
                            <td className="px-6 py-4 text-xs text-secondary-500 max-w-xs truncate" title={fine.admin_notes || ''}>
                                {fine.admin_notes || '-'} 
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                 <button
                                    onClick={() => deleteFine(fine.id)}
                                    className="font-medium text-red-600 hover:text-red-800 transition-colors"
                                >
                                    Verwijder
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 