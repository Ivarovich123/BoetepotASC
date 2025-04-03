# Football Team Fines Tracker

A mobile-first web application for tracking fines in a football team. The system displays fine information transparently to all team members while providing an admin panel for authorized personnel to manage fines, players, and fine reasons.

## Features

- Public pages (no login required)
  - View total team fines
  - View recent fines
  - Search and view player fine history
- Admin panel (login required)
  - Fine management
  - Player management
  - Fine reasons management

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (Database)
- React Hook Form
- Zod (Validation)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following tables in Supabase:

- `players`: Stores player information
- `fines`: Records of fines issued to players
- `fine_reasons`: Categories of fine reasons
- `admin_users`: Admin authentication (optional, can be managed separately)

## Development

- The application is built with a mobile-first approach
- All components are responsive and optimized for mobile devices
- The admin panel is protected by authentication
- Data is fetched and updated in real-time using Supabase

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 