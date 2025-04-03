'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'

interface Player {
  id: number
  name: string
  // email?: string | null // Removed
}

export default function EditPlayer({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Player>>({})

  useEffect(() => {
    fetchPlayerData()
  }, [params.id])

  const fetchPlayerData = async () => {
    setLoading(true)
    setError(null)
    try {
      const playerId = Number(params.id)
      if (isNaN(playerId)) {
        throw new Error('Ongeldig speler ID.')
      }

      const { data, error: fetchError, status } = await supabase
        .from('players')
        .select('id, name') // Removed email from select
        .eq('id', playerId)
        .single()

      if (fetchError) {
        if (status === 406) { // Not found
          throw new Error('Speler niet gevonden.')
        } else {
          throw fetchError
        }
      }

      setFormData(data)
    } catch (error: any) {
      console.error('Fout bij ophalen spelergegevens:', error)
      setError(error.message || 'Kon de gegevens voor deze speler niet laden.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id || !formData.name?.trim()) {
        setError('Spelernaam is verplicht.');
        return;
    }
    
    setSubmitting(true)
    setError(null)

    try {
      const updatedPlayerData: { name: string } = { // No email in update
        name: formData.name.trim(),
        // email: formData.email?.trim() || null 
      };

      const { error: updateError } = await supabase
        .from('players')
        .update(updatedPlayerData)
        .eq('id', formData.id)

      if (updateError) throw updateError
      router.push('/admin/players') // Redirect on success
    } catch (error: any) {
      console.error('Fout bij bijwerken speler:', error)
       // Check for unique constraint violation
       if (error.message?.includes('duplicate key value violates unique constraint')) {
            setError('Deze spelernaam bestaat al.');
       } else {
            setError(error.message || 'Kon de speler niet bijwerken.');
       }
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
            <h1 className="text-2xl font-bold text-primary-600">Speler Bewerken</h1>
            <Link
              href="/admin/players"
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
                 <p className="text-secondary-600">Speler gegevens worden geladen...</p>
               </div>
             ) : error && !formData.id ? ( // Show fatal error if player couldn't be loaded
               <div className="bg-white rounded-xl shadow-soft p-8 text-center">
                  <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-red-700 mb-2">Fout opgetreden</h3>
                  <p className="text-red-600 mb-6">{error}</p>
                  <Link
                    href="/admin/players"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-sm"
                  >
                    Terug naar Overzicht
                  </Link>
               </div>
             ) : (
              <div className="bg-white rounded-xl shadow-soft">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                  <h2 className="text-xl font-semibold text-secondary-800 mb-4">Bewerk Speler Details</h2>
                  
                  {error && formData.id && ( // Show non-fatal errors (e.g., update error) within the form
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      <p><strong>Fout:</strong> {error}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
                      Naam <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Volledige naam van de speler"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-secondary-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-secondary-200 mt-8">
                    <button
                      type="button"
                      onClick={() => router.push('/admin/players')}
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