'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getTotalFines, getRecentFines, getPlayers, getPlayerFines } from '@/lib/database'
import type { Database } from '@/types/database.types'

// Define types based on database schema (or use generated types)
type Player = Database['public']['Tables']['players']['Row']
// FineView might still have 'paid' from the DB view, but we won't use it
type FineView = Database['public']['Views']['fines_view']['Row']

export default function HomePage() {
  // State variables
  const [totalFines, setTotalFines] = useState<number>(0)
  const [recentFines, setRecentFines] = useState<FineView[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playerHistory, setPlayerHistory] = useState<FineView[] | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  // Fetch initial data effect
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [total, recent, playersList] = await Promise.all([
        getTotalFines(),
        getRecentFines(5),
        getPlayers()
      ])
      setTotalFines(total)
      setRecentFines(recent)
      setPlayers(playersList)
    } catch (error) {
      console.error('Fout bij ophalen gegevens:', error)
      setError('Kon de startpagina gegevens niet laden. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const fetchPlayerHistory = async (playerId: string) => {
    if (!playerId) {
      setPlayerHistory(null)
      return
    }
    setHistoryLoading(true)
    setHistoryError(null)
    setPlayerHistory(null)
    try {
      const historyData = await getPlayerFines(Number(playerId))
      setPlayerHistory(historyData)
    } catch (error) {
      console.error(`Fout bij ophalen geschiedenis voor speler ${playerId}:`, error)
      setHistoryError('Kon de geschiedenis van deze speler niet laden.')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handlePlayerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const playerId = e.target.value;
    setSelectedPlayer(playerId);
    fetchPlayerHistory(playerId);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 via-primary-50 to-secondary-50">
      {/* Header Section */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b border-secondary-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
           <Link href="/" className="flex items-center gap-3">
               <Image 
                   src="/logo.png"
                   alt="ASC Dalfsen Logo"
                   width={40} 
                   height={40} 
                   className="h-9 w-auto md:h-10"
               />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 text-transparent bg-clip-text hidden sm:inline">
               BoetePot
              </span>
           </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Admin Login
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-12 md:py-16">

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 mx-auto mb-6"></div>
            <p className="text-lg text-secondary-600">Gegevens worden geladen...</p>
          </div>
        ) : error ? (
            <div className="text-center py-16 bg-red-100 border border-red-300 rounded-xl shadow-md">
                <p className="text-red-700 font-semibold text-lg mb-4">{error}</p>
                <button 
                  onClick={fetchData} 
                  className="px-5 py-2 border border-red-500 text-sm font-medium rounded-full text-red-600 bg-white hover:bg-red-50 transition-colors"
                >
                  Opnieuw proberen
                </button>
            </div>
        ) : (
          <>
            {/* Total Fines Display - Enhanced Card */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg p-8 md:p-12 mb-12 text-center text-white transform transition-transform duration-300 hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-primary-100 mb-3 opacity-90">Totaal boetes</h3>
                <p className="text-5xl md:text-6xl font-bold tracking-tight">{formatCurrency(totalFines)}</p>
            </div>

            {/* Grid for Recent Fines & Player History */}
            <div className="grid md:grid-cols-2 gap-8 lg:gap-10 mb-12">
              
              {/* Recent Fines Card */}
              <div className="bg-white rounded-xl shadow-soft border border-secondary-100 p-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-5 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recente Boetes
                </h3>
                <div className="space-y-4">
                  {recentFines.length > 0 ? (
                    recentFines.map((fine) => (
                      <div key={`recent-${fine.id}`} className="bg-secondary-50 rounded-lg p-4 border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-secondary-800">{fine.player_name}</span>
                          <span className="font-bold text-primary-600">{formatCurrency(fine.amount)}</span>
                        </div>
                        <p className="text-secondary-700 text-sm mb-1">{fine.reason_description}</p>
                        <div className="flex justify-between items-center">
                            <p className="text-secondary-500 text-xs">
                              {formatDate(fine.date)}
                            </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-secondary-500 py-6">Geen recente boetes gevonden.</p>
                  )}
                </div>
              </div>

              {/* Player Selection Card */}
              <div className="bg-white rounded-xl shadow-soft border border-secondary-100 p-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-5 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Bekijk Speler Geschiedenis
                </h3>
                <div className="space-y-4">
                  <select 
                    className="block w-full rounded-lg border-secondary-300 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition duration-150 ease-in-out"
                    value={selectedPlayer}
                    onChange={handlePlayerSelectChange}
                  >
                    <option value="">Selecteer een speler...</option>
                    {players.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

             {/* Inline Player History Display Card */}
             {selectedPlayer && (
                <div className="bg-white rounded-xl shadow-soft border border-secondary-100 p-6 mt-0">
                  <h3 className="text-xl font-semibold text-secondary-900 mb-5">
                    Boetes voor {players.find(p => p.id === Number(selectedPlayer))?.name || 'Geselecteerde Speler'}
                  </h3>
                  {historyLoading ? (
                    <div className="text-center py-10">
                       <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
                       <p className="text-secondary-600">Geschiedenis wordt geladen...</p>
                    </div>
                  ) : historyError ? (
                    <div className="text-center py-8 text-red-600 bg-red-50 rounded-lg border border-red-200">
                      <p>{historyError}</p>
                    </div>
                  ) : playerHistory && playerHistory.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-secondary-100">
                      {playerHistory.map((fine) => (
                        <div key={`history-${fine.id}`} className="bg-secondary-50 rounded-lg p-3 border border-secondary-200">
                           <div className="flex justify-between items-start mb-1">
                             <span className="font-medium text-secondary-800">{fine.reason_description}</span>
                             <span className="font-semibold text-primary-600">{formatCurrency(fine.amount)}</span>
                           </div>
                           <div className="flex justify-between items-center">
                               <p className="text-secondary-500 text-xs">
                                 {formatDate(fine.date)}
                               </p>
                           </div>
                         </div>
                      ))}
                    </div>
                  ) : playerHistory && playerHistory.length === 0 ? (
                     <p className="text-center text-secondary-500 py-6">Geen boetes gevonden voor deze speler.</p>
                  ) : null}
                </div>
              )}
          </>
        )}
      </main>

      {/* Footer Section */}
      <footer className="py-6 border-t border-secondary-200 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-secondary-500">
            &copy; {new Date().getFullYear()} BoetePot | ASC Dalfsen
          </p>
        </div>
      </footer>
    </div>
  )
} 