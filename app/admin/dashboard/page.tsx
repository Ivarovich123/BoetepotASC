'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminDashboard() {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
        {/* Header */}
        <header className="bg-white shadow-soft">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">BoetePot Admin</h1>
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="text-sm font-medium text-secondary-600 hover:text-primary-600 inline-flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Bekijk Website
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Uitloggen
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-secondary-800 mb-2">Admin Dashboard</h2>
            <p className="text-lg text-secondary-600">Beheer team boetes, spelers, en redenen</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Fine Management Card */}
            <DashboardCard
              href="/admin/fines"
              title="Boete Beheer"
              description="Voeg boetes toe, bewerk ze, of verwijder ze."
              icon={FineIcon}
            />

            {/* Player Management Card */}
            <DashboardCard
              href="/admin/players"
              title="Speler Beheer"
              description="Beheer spelersinformatie en gegevens."
              icon={PlayerIcon}
            />

            {/* Fine Reasons Card */}
            <DashboardCard
              href="/admin/reasons"
              title="Boete Redenen"
              description="Beheer de categorieën voor boetes."
              icon={ReasonIcon}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-6 border-t border-secondary-200">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-secondary-500">
              &copy; {new Date().getFullYear()} BoetePot Admin Paneel
            </p>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  )
}

// Card Component
interface DashboardCardProps {
  href: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const DashboardCard: React.FC<DashboardCardProps> = ({ href, title, description, icon: Icon }) => (
  <Link
    href={href}
    className="group bg-white rounded-xl shadow-soft p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
  >
    <div className="mb-4 inline-block p-4 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors">
      <Icon className="w-8 h-8 text-primary-600" />
    </div>
    <h3 className="text-xl font-semibold text-secondary-900 mb-2">{title}</h3>
    <p className="text-secondary-600 mb-4">{description}</p>
    <span className="inline-flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700 transition-colors">
      Beheren
      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </span>
  </Link>
)

// Icons (simple placeholders, replace with actual icons if available)
const FineIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const PlayerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)
const ReasonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
) 