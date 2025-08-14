-- Seed data for MoovyZoo profiles table
-- This file contains sample data for testing the profiles functionality

-- Note: In a real application, profiles are created through the signup process
-- This seed data is for development and testing purposes only

-- Sample genres that users can select from
-- These would typically be stored in a separate genres table, but for MVP we'll use arrays

-- The profiles table will be populated through the application signup flow
-- No seed data needed for profiles as they are user-generated

-- You can add test data here if needed for development:
-- INSERT INTO public.profiles (id, email, display_name, favorite_genres, favorite_titles, is_public, onboarding_completed)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', 
--    ARRAY['sci-fi', 'action'], ARRAY['Blade Runner', 'The Matrix'], true, true);

-- Note: The above is commented out because real user IDs come from auth.users
-- and should not be manually inserted in production