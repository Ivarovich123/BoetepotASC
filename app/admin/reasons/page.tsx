'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import { formatDate } from '@/lib/utils'

interface Reason {
  id: number
  description: string
  created_at: string
}

interface ReasonFormData {
    description: string;
}

export default function ReasonsManagement() {
  const [reasons, setReasons] = useState<Reason[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ReasonFormData>({ description: '' })

  useEffect(() => {
    fetchReasons()
  }, [])

  const fetchReasons = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('reasons')
        .select('id, description, created_at')
        .order('description', { ascending: true })

      if (error) throw error
      setReasons(data || [])
    } catch (error) {
      console.error('Fout bij ophalen redenen:', error)
      setError('Kon de boeteredenen niet laden. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const descriptions = formData.description.split('\n')
        .map(desc => desc.trim())
        .filter(desc => desc.length > 0);

    if (descriptions.length === 0) {
        setFormError('Voer ten minste één geldige omschrijving in.');
        return;
    }
    
    setSubmitting(true);
    setFormError(null);

    try {
        const reasonsToInsert = descriptions.map(desc => ({ description: desc }));

      const { error: insertError } = await supabase
        .from('reasons')
        .insert(reasonsToInsert)
        .select();

      if (insertError) throw insertError;

      setFormData({ description: '' }); // Reset form
      fetchReasons(); // Refresh list

    } catch (error: any) {
      console.error('Fout bij toevoegen redenen:', error);
      if (error.message?.includes('duplicate key value violates unique constraint')) {
          setFormError('Eén of meer van deze omschrijvingen bestaan al.');
      } else {
          setFormError(error.message || 'Kon de redenen niet toevoegen.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReason = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze boetereden wilt verwijderen? \nLET OP: Dit kan mislukken als er nog boetes aan deze reden gekoppeld zijn.')) return

    try {
      const { error } = await supabase
        .from('reasons')
        .delete()
        .eq('id', id)

      if (error) {
        if (error.message.includes('violates foreign key constraint')) {
          alert('Kon reden niet verwijderen. Er zijn waarschijnlijk nog boetes aan deze reden gekoppeld.')
        } else {
          throw error
        }
      } else {
        fetchReasons() // Re-fetch after successful delete
      }
    } catch (error) {
      console.error('Fout bij verwijderen reden:', error)
      alert('Kon de reden niet verwijderen.')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
        {/* Header */}
        <header className="bg-white shadow-soft">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">Beheer Boete Redenen</h1>
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

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
            {/* Inline Bulk Form Section */}
             <div className="bg-white rounded-xl shadow-soft p-6 md:p-8 mb-8">
                 <h2 className="text-xl font-semibold text-secondary-800 mb-6">Nieuwe Reden(en) Toevoegen</h2>
                 <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">Omschrijving(en) * <span className="text-xs font-normal text-secondary-500">(één per lijn)</span></label>
                          <textarea
                            id="description"
                            name="description"
                            required
                            rows={4}
                            placeholder="Bijv.: Te laat op training\nMateriaal niet opgeruimd\nRode kaart"
                            value={formData.description}
                            onChange={handleFormInputChange}
                            className="block w-full rounded-lg border-secondary-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm py-2"
                          />
                      </div>
                       
                      <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={submitting}
                              className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                              {submitting ? (
                                <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                              )}
                              {submitting ? 'Opslaan...' : 'Reden(en) Toevoegen'}
                            </button>
                       </div>
                       {formError && (
                            <div className="mt-2 text-red-600 text-sm">
                              <p><strong>Fout:</strong> {formError}</p>
                            </div>
                        )}
                 </form>
            </div>

            {/* Reasons List Section */}
            <h2 className="text-xl font-semibold text-secondary-800 mb-4 mt-10">Bestaande Boete Redenen</h2>
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                {loading ? (
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-secondary-600">Redenen worden geladen...</p>
                </div>
                ) : error ? (
                <div className="p-12 text-center text-red-600 bg-red-50">
                    <p>{error}</p>
                    <button 
                    onClick={fetchReasons} 
                    className="mt-4 px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
                    >
                    Opnieuw proberen
                    </button>
                </div>
                ) : reasons.length === 0 ? (
                <div className="p-12 text-center">
                    <svg className="w-16 h-16 text-secondary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-secondary-600">Geen boeteredenen gevonden. Voeg hierboven de eerste toe.</p>
                </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-secondary-600">
                    <thead className="text-xs text-secondary-700 uppercase bg-secondary-50">
                        <tr>
                        <th scope="col" className="px-6 py-3">Omschrijving</th>
                        <th scope="col" className="px-6 py-3">Toegevoegd op</th>
                        <th scope="col" className="px-6 py-3 text-right">Acties</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reasons.map((reason) => (
                        <tr key={reason.id} className="bg-white border-b hover:bg-secondary-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-secondary-900">
                            {reason.description}
                            </td>
                            <td className="px-6 py-4">
                            {formatDate(reason.created_at)}
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-4">
                                <Link
                                href={`/admin/reasons/${reason.id}/edit`}
                                className="font-medium text-primary-600 hover:text-primary-700"
                                title="Bewerken"
                                >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                </Link>
                                <button
                                onClick={() => deleteReason(reason.id)}
                                className="font-medium text-red-600 hover:text-red-700"
                                title="Verwijderen"
                                >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                </button>
                            </div>
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