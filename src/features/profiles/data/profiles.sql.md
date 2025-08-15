# Profiles Table Schema

## Table: user_profiles

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  favorite_genres TEXT[] DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{"profileVisibility": "public", "showFavoriteGenres": true, "allowDirectMessages": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id),
  CONSTRAINT user_profiles_display_name_length CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 50)
);
```

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Public profiles are readable by everyone
CREATE POLICY "Public profiles are readable" ON user_profiles
  FOR SELECT USING (
    privacy_settings->>'profileVisibility' = 'public'
  );
```

## Indexes

```sql
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_display_name ON user_profiles(display_name);
CREATE INDEX idx_user_profiles_last_active ON user_profiles(last_active_at DESC);
```
