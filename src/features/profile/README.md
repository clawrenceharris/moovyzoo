# Profile Feature

A comprehensive user profile system for the Zoovie platform, featuring profile management, stats display, and social features.

## Features

### Profile Display
- **Profile Header**: Avatar, display name, username, bio, quote, and privacy status
- **Profile Stats**: Badges earned, binge races won, and habitats joined
- **Favorite Titles**: User's favorite movies and TV shows
- **Recent Activity**: Timeline of user actions and achievements
- **Quick Actions**: Fast access to platform features (for own profile)

### Profile Management
- **Edit Profile**: Comprehensive form for updating profile information
- **Privacy Controls**: Public/private profile visibility
- **Avatar Management**: URL-based avatar system
- **Genre Preferences**: Select favorite genres from predefined list
- **Title Management**: Add/remove favorite movies and TV shows

### Social Features
- **Public Profiles**: View other users' profiles (if public)
- **Privacy Respect**: Private profiles are protected
- **Activity Tracking**: Recent user activities and achievements

## Architecture

### Data Layer
- `profiles.repository.ts` - Database operations using Supabase client
- `profiles.server.ts` - Server-side operations using Supabase server client
- `profiles.types.ts` - TypeScript interfaces and types

### Domain Layer
- `profiles.service.ts` - Business logic and validation
- Validation rules for profile data
- Error handling and normalization

### Components
- `ProfilePage.tsx` - Main profile display component
- `ProfileHeader.tsx` - Profile header with avatar and basic info
- `ProfileStats.tsx` - Statistics display cards
- `FavoriteTitles.tsx` - Favorite movies/TV shows display
- `RecentActivity.tsx` - Activity timeline
- `QuickActions.tsx` - Quick action buttons
- `ProfileEditForm.tsx` - Profile editing form
- `ProfileSummary.tsx` - Compact profile display for lists
- `ProfileCard.tsx` - Card component for profile discovery

### Hooks
- `useProfile.ts` - Client-side profile operations

## Routes

- `/profile` - Current user's profile
- `/profile/edit` - Edit current user's profile
- `/profile/[userId]` - View specific user's profile
- `/profile/discover` - Discover other users' profiles

## Database Schema

The profile feature uses the `user_profiles` table with the following fields:

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- email: TEXT (required)
- display_name: TEXT (optional)
- username: TEXT (optional)
- avatar_url: TEXT (optional)
- bio: TEXT (optional, max 500 chars)
- quote: TEXT (optional, max 200 chars)
- favorite_genres: TEXT[] (array of genre names)
- favorite_titles: TEXT[] (array of movie/TV show titles)
- is_public: BOOLEAN (default true)
- onboarding_completed: BOOLEAN (default false)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP (auto-updated)
```

## Usage Examples

### Server-side Profile Loading
```tsx
import { profilesServerRepository } from "@/features/profile/data/profiles.server";

const profile = await profilesServerRepository.getCurrentUserProfile();
```

### Client-side Profile Operations
```tsx
import { useProfile } from "@/features/profile/hooks/useProfile";

const { profile, updateProfile, isLoading } = useProfile(userId);
```

### Profile Display
```tsx
import { ProfilePage } from "@/features/profile/components";

<ProfilePage 
  profile={profile} 
  isOwnProfile={true}
/>
```

## Design System Integration

The profile feature follows the Zoovie design system:

- **Colors**: Uses brand colors (primary red, accent blue) for highlights
- **Components**: Built with Shadcn UI components
- **Styling**: Follows component class patterns from globals.css
- **Responsive**: Mobile-first responsive design
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Future Enhancements

- **Badge System**: Integration with achievement badges
- **Social Connections**: Friend/follow system
- **Activity Feed**: Real-time activity updates
- **Profile Analytics**: View statistics and insights
- **Media Integration**: TMDB integration for favorite titles
- **Profile Themes**: Customizable profile themes
- **Export Profile**: Download profile data