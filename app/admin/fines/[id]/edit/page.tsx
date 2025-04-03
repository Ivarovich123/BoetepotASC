'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import { formatCurrency } from '@/lib/utils'

interface Player {
  id: number
  name: string
}

interface Reason {
  id: number
  description: string
  amount: number
}

interface Fine {
  id: number
  player_id: number
  reason_id: number
  amount: number
  date: string
}

export default function EditFine({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [reasons, setReasons] = useState<Reason[]>([])
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Fine>>({})

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const fineId = Number(params.id)
      if (isNaN(fineId)) {
        throw new Error('Ongeldig boete ID.')
      }

      const [fineRes, playersRes, reasonsRes] = await Promise.all([
        supabase
          .from('fines')
          .select('id, player_id, reason_id, amount, date')
          .eq('id', fineId)
          .single(),
        supabase.from('players').select('id, name').order('name'),
        supabase.from('reasons').select('id, description, amount').order('description')
      ])

      if (fineRes.error) {
        if (fineRes.status === 406) { // PostgREST standard for no rows found
          throw new Error('Boete niet gevonden.')
        } else {
          throw fineRes.error
        }
      }
      if (playersRes.error) throw playersRes.error
      if (reasonsRes.error) throw reasonsRes.error

      // Ensure date is in yyyy-mm-dd format for input type="date"
      const fineData = fineRes.data
      if (fineData.date) {
          fineData.date = new Date(fineData.date).toISOString().split('T')[0]
      }

      setFormData(fineData)
      setPlayers(playersRes.data || [])
      setReasons(reasonsRes.data || [])
    } catch (error: any) {
      console.error('Fout bij ophalen gegevens:', error)
      setError(error.message || 'Kon de gegevens voor deze boete niet laden.')
      // Don't redirect immediately, show error instead
    } finally {
      setLoading(false)
    }
  }

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const reasonId = Number(e.target.value)
    const reason = reasons.find(r => r.id === reasonId)
    setFormData(prev => ({
      ...prev,
      reason_id: reasonId,
      amount: reason ? reason.amount : (prev?.amount ?? 0) // Keep existing amount if reason not found or amount is null
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id) return // Should not happen if loaded correctly
    
    setSubmitting(true)
    setError(null)

    try {
      // Validation
       if (!formData.player_id || !formData.reason_id || formData.amount === undefined || formData.amount === null || !formData.date) {
            throw new Error('Alle velden (behalve Betaald) zijn verplicht.');
        }
       const amountValue = parseFloat(String(formData.amount));
       if (isNaN(amountValue) || amountValue < 0) {
            throw new Error('Voer een geldig, niet-negatief bedrag in.');
        }

      const { error } = await supabase
        .from('fines')
        .update({
          player_id: Number(formData.player_id),
          reason_id: Number(formData.reason_id),
          amount: amountValue,
          date: formData.date,
        })
        .eq('id', formData.id)

      if (error) throw error
      router.push('/admin/fines') // Redirect on success
    } catch (error: any) {
      console.error('Fout bij bijwerken boete:', error)
      setError(error.message || 'Kon de boete niet bijwerken. Controleer de gegevens en probeer het opnieuw.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
        {/* Header */}
        <header className="bg-white shadow-soft">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">Boete Bewerken</h1>
            <Link
              href="/admin/fines"
              className="text-sm font-medium text-secondary-600 hover:text-primary-600 inline-flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Terug naar Overzicht
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
             {loading ? (
              <div className="bg-white rounded-xl shadow-soft p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-secondary-600">Boete details worden geladen...</p>
              </div>
            ) : error && !formData.id ? (
              <div className="bg-white rounded-xl shadow-soft p-8 text-center">
                 <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 <h3 className="text-xl font-semibold text-red-700 mb-2">Fout opgetreden</h3>
                 <p className="text-red-600 mb-6">{error}</p>
                 <Link
                   href="/admin/fines"
                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-sm"
                 >
                   Terug naar Overzicht
                 </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-soft">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                  <h2 className="text-xl font-semibold text-secondary-800 mb-4">Bewerk Boete Details</h2>

                  {error && formData.id && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      <p><strong>Fout:</strong> {error}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="player" className="block text-sm font-medium text-secondary-700 mb-1">
                      Speler
                    </label>
                    <select
                      id="player"
                      name="player_id" // Name attribute is important for handleInputChange
                      required
                      value={formData.player_id || ''}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-secondary-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Selecteer een speler</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-secondary-700 mb-1">
                      Reden
                    </label>
                    <select
                      id="reason"
                      name="reason_id" // Name attribute is important
                      required
                      value={formData.reason_id || ''}
                      onChange={handleReasonChange} // Use specific handler for amount update
                      className="block w-full rounded-lg border-secondary-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Selecteer een reden</option>
                      {reasons.map((reason) => (
                        <option key={reason.id} value={reason.id}>
                          {reason.description} ({formatCurrency(reason.amount)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-secondary-700 mb-1">
                      Bedrag (€)
                    </label>
                    <input
                      id="amount"
                      name="amount" // Name attribute is important
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount === undefined || formData.amount === null ? '' : formData.amount}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-secondary-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-secondary-700 mb-1">
                      Datum
                    </label>
                    <input
                      id="date"
                      name="date" // Name attribute is important
                      type="date"
                      required
                      value={formData.date || ''}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-secondary-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-secondary-200 mt-8">
                    <button
                      type="button"
                      onClick={() => router.push('/admin/fines')}
                      className="px-4 py-2 border border-secondary-300 text-sm font-medium rounded-lg text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                      disabled={submitting}
                    >
                      Annuleren
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || loading}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {submitting ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {submitting ? 'Opslaan...' : 'Wijzigingen Opslaan'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 