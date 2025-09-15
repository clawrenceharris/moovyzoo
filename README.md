# MoovyZoo 🎬

An AI-powered social streaming platform that transforms how movie and TV enthusiasts discover, discuss, and watch content together. MoovyZoo combines intelligent recommendations, community-driven discovery through "Habitats," and synchronized streaming experiences to create the ultimate entertainment platform.

## 🌟 Features

### 🤖 AI-Powered Recommendations & Chat
- **Intelligent Content Recommendations**: AI-driven movie and TV show suggestions based on your viewing history, taste profile, and social connections
- **AI Chat Assistant (Zoovie)**: Natural language conversations with an AI that understands your mood and preferences
- **Real-time Data Integration**: Powered by The Movie Database (TMDB) API with live data and web search capabilities
- **Explainable AI**: Clear explanations for why content is recommended to you

### 🏘️ Habitats - Community Discovery
- **Themed Communities**: Create or join spaces around genres, fandoms, directors, or specific shows/movies
- **Community Features**: 
  - Real-time discussions and chat
  - Community polls for deciding what to watch
  - Content discovery through community recommendations
  - Member management and moderation
- **Public & Private Habitats**: Choose your community's visibility and access level

### 👥 Social Features & Friends
- **Friend Discovery**: Find users with similar tastes using AI-powered compatibility matching
- **Social Profiles**: Detailed user profiles with watch history, favorite genres, and personal quotes
- **Friend Requests**: Send, accept, and manage friend connections
- **Taste Overlap Analysis**: See how your preferences align with friends and potential connections

### 🎪 Synchronized Stream Parties
- **Real-time Streaming**: Watch movies and TV shows together with friends in perfect sync
- **Host Controls**: Designated hosts can control playback for all participants
- **Live Chat**: Real-time messaging during streaming sessions
- **Participant Management**: Join/leave streams, participant lists, and host privileges
- **Multi-platform Support**: YouTube integration with plans for additional streaming services

### 📊 Profile & Watch History Management
- **Comprehensive Profiles**: Customize your profile with favorite genres, bio, avatar, and viewing preferences
- **Watch History Tracking**: Automatically track what you've watched, are currently watching, or dropped
- **Rating System**: Rate content and get better recommendations based on your ratings
- **Privacy Controls**: Control what information is public or private

### 🎯 Advanced Content Discovery
- **Intelligent Search**: Search across movies and TV shows with smart filtering
- **Genre-based Discovery**: Explore content by your favorite genres
- **Trending Content**: Stay updated with what's popular now
- **TMDB Integration**: Access to comprehensive movie and TV show data including cast, crew, and details

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** with App Router for modern React development
- **React 19** for the latest React features and performance
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS v4** for utility-first styling with custom design system
- **Radix UI** for accessible, unstyled component primitives
- **React Query (TanStack Query)** for server state management
- **React Hook Form** for form handling and validation

### Backend & Database
- **Supabase** for authentication, real-time database, and API
- **PostgreSQL** with Row-Level Security (RLS) for data security
- **Real-time subscriptions** for live updates across features
- **Optimized database schema** with proper indexing and constraints

### AI & APIs
- **OpenAI GPT-4o** for AI chat and recommendations
- **LangGraph** for advanced AI agent workflows
- **The Movie Database (TMDB) API** for comprehensive movie/TV data
- **Tavily API** for web search and content research

### Infrastructure
- **Vercel** for deployment and hosting
- **Server-Side Rendering (SSR)** for optimal performance and SEO
- **Progressive Web App (PWA)** capabilities
- **Responsive design** for desktop, tablet, and mobile

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm/yarn
- Supabase account and project
- OpenAI API key
- TMDB API key
- Tavily API key (optional, for web search features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd moovyzoo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   
   # TMDB Configuration
   TMDB_API_KEY=your_tmdb_api_key
   
   # Optional: Tavily for web search
   TAVILY_API_KEY=your_tavily_api_key
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   Run the database migrations in your Supabase SQL editor:
   ```sql
   -- Run these migration files in order:
   \i scripts/ai-recommendations-migration.sql
   \i scripts/ai-recommendations-rls-policies.sql
   \i scripts/stream-chat-migration.sql
   ```

5. **Start the development server**
```bash
npm run dev
# or
pnpm dev
# or
   yarn dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### Getting Started
1. **Create an Account**: Sign up with email or social authentication
2. **Complete Onboarding**: Set up your profile with favorite genres and preferences
3. **Explore Habitats**: Join communities around your interests
4. **Get Recommendations**: Let the AI suggest content based on your taste
5. **Connect with Friends**: Find and add users with similar preferences
6. **Start Streaming**: Create or join stream parties to watch together

### Key Features Usage

#### AI Chat
- Ask natural language questions about what to watch
- Get mood-based recommendations: "I want something funny but not too silly"
- Explore specific genres, actors, or directors
- Get detailed information about movies and TV shows

#### Habitats
- Browse public habitats or create your own
- Participate in community polls and discussions
- Discover content through community recommendations
- Invite friends to private habitats

#### Stream Parties
- Create a stream party from any movie or TV show
- Share the party link with friends
- Enjoy synchronized viewing with real-time chat
- Host controls for play/pause/seek across all participants

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Protected routes
│   │   ├── page.tsx            # Homepage with recommendations
│   │   ├── habitats/           # Habitat community pages
│   │   ├── streams/            # Stream party pages
│   │   └── profile/            # User profile pages
│   ├── api/                    # API routes
│   │   ├── chat/              # AI chat endpoints
│   │   ├── recommendations/    # AI recommendation endpoints
│   │   ├── friends/           # Friend management endpoints
│   │   ├── tmdb/             # TMDB API proxy endpoints
│   │   └── watch-history/     # Watch history tracking
│   ├── auth/                  # Authentication pages
│   └── globals.css           # Global styles
├── components/                # Reusable UI components
│   ├── ui/                   # Base UI components (Shadcn)
│   ├── cards/                # Domain-specific cards
│   ├── states/               # Loading, error, empty states
│   ├── media/                # Media search and display
│   └── layouts/              # Layout components
├── features/                 # Feature modules
│   ├── ai-chat/             # AI chat functionality
│   ├── ai-recommendations/   # Recommendation system
│   ├── auth/                # Authentication
│   ├── habitats/            # Community features
│   ├── profile/             # User profiles and friends
│   ├── streaming/           # Stream parties and video sync
│   └── onboarding/          # User onboarding flow
├── hooks/                   # Shared React hooks
├── lib/                     # Framework utilities
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
└── middleware.ts           # Authentication middleware
```

## 🧪 Testing

The project includes comprehensive testing with Vitest and Testing Library:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run Storybook tests
npm run test:storybook
```

### Test Coverage
- Unit tests for all business logic and utilities
- Integration tests for API routes and database operations
- Component tests for React components
- End-to-end tests for critical user flows

## 📚 Storybook

Explore and develop components in isolation:

```bash
# Start Storybook development server
npm run storybook

# Build Storybook for production
npm run build-storybook
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   - Import your repository to Vercel
   - Configure environment variables in Vercel dashboard

2. **Set Environment Variables**
   - Add all required environment variables from `.env.local`
   - Ensure production URLs are used for Supabase and external APIs

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Preview deployments available for pull requests

### Database Setup for Production
- Ensure your Supabase project is properly configured
- Run all migration scripts in the production environment
- Set up proper Row-Level Security policies
- Configure proper database indexing for performance


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **The Movie Database (TMDB)** for comprehensive movie and TV data
- **OpenAI** for powerful AI capabilities
- **Supabase** for robust backend infrastructure
- **Vercel** for excellent deployment platform
- **Next.js team** for the amazing React framework
- **Tailwind CSS** for the utility-first CSS framework
- **Kiro IDE** for its amazing features
- **Devpost** for organizing the Code with Kiro hackathon

---

**MoovyZoo** - Where AI meets community, and every recommendation is perfectly tailored to you. Transform your entertainment experience today! 🎬✨
