'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPlayerFines, getPlayers } from '@/lib/database'
import type { Database } from '@/types/database.types'

type Player = Database['public']['Tables']['players']['Row']
type FineView = Database['public']['Views']['fines_view']['Row']

export default function PlayerHistory({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<Player | null>(null)
  const [fines, setFines] = useState<FineView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [playersList, playerFines] = await Promise.all([
          getPlayers(),
          getPlayerFines(Number(params.id))
        ])
        
        const currentPlayer = playersList.find(p => p.id === Number(params.id))
        if (!currentPlayer) {
          setError('Player not found')
          return
        }

        setPlayer(currentPlayer)
        setFines(playerFines)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load player data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-xl text-red-500 mb-4">{error || 'Player not found'}</div>
        <Link 
          href="/"
          className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    )
  }

  const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Player History</h1>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-soft hover:bg-gray-50 transition-colors text-primary-600"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Player Info */}
        <div className="bg-white rounded-xl shadow-soft p-8 mb-8 transform hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{player.name}</h2>
              <p className="text-gray-500">Total Fines</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary-600">€{totalFines.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Fine History */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Fine History
          </h2>
          <div className="space-y-4">
            {fines.length > 0 ? (
              fines.map((fine) => (
                <div 
                  key={fine.id} 
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{fine.reason_description}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(fine.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-primary-600 font-bold ml-4">€{fine.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">No fines recorded for this player</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 