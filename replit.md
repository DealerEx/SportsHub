# SportsHub - Kids Sports & Activities Finder

## Overview
SportsHub is a web application that helps parents find and compare local youth sports leagues, registration dates, and activities for their kids - all in one place. Think "Expedia for kids sports."

## Architecture
- **Frontend**: React + TypeScript with Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with session-based auth (passport-local)
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend API)
- **State**: TanStack React Query

## Data Model
- `users` - Parent accounts with auth credentials, email, zip code
- `children` - Kids linked to parents with birthdate, gender, sporting interests (age computed from birthdate)
- `sports` - Reference table of available sports/activities
- `leagues` - Organizations offering programs
- `programs` - Specific offerings with registration dates, age ranges, costs
- `notifications` - Alerts for parents about matching programs

## Key Features
- User registration/login with session auth
- Kid profile management (name, birthdate, gender, sport interests) - age auto-calculated from birthdate
- Browse & filter programs by sport, age, gender
- Program detail pages with league info and registration links
- Personalized dashboard with matching program recommendations
- Notification system for upcoming sign-ups

## File Structure
- `shared/schema.ts` - All Drizzle schemas and TypeScript types
- `server/auth.ts` - Passport auth setup with scrypt password hashing
- `server/db.ts` - Database connection pool
- `server/storage.ts` - Data access layer (IStorage interface)
- `server/seed.ts` - Seed data for sports, leagues, programs
- `server/routes.ts` - Express API endpoints
- `client/src/lib/auth.tsx` - Auth context provider
- `client/src/components/app-sidebar.tsx` - Navigation sidebar
- `client/src/pages/` - Dashboard, Browse, ProgramDetail, Kids, Notifications, Auth

## Running
- `npm run dev` starts both Express backend and Vite frontend on port 5000
- Database schema pushed via `npm run db:push`
