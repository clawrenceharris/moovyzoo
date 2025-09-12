import type {
  Friend,
  FriendRequest,
  FriendStatus,
  UserProfile,
} from "../domain/profiles.types";
import { supabase } from "@/utils/supabase/client";
import { AppErrorCode } from "@/utils/error-codes";

/**
 * Database document interface for friends table
 */
interface FriendDocument {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

/**
 * Repository for friend relationship data operations using Supabase
 * Contains only database access logic, no business rules
 */
export class FriendsRepository {
  /**
   * Send a friend request
   */
  async sendFriendRequest(requesterId: string, receiverId: string): Promise<Friend> {
    try {
      // Check if users are trying to friend themselves
      if (requesterId === receiverId) {
        throw new Error(AppErrorCode.CANNOT_FRIEND_SELF);
      }

      // Check if a relationship already exists
      const existingRelationship = await this.getFriendStatus(requesterId, receiverId);
      if (existingRelationship.status !== 'none') {
        throw new Error(AppErrorCode.FRIEND_REQUEST_ALREADY_EXISTS);
      }

      const { data: friendship, error } = await supabase
        .from("friends")
        .insert({
          requester_id: requesterId,
          receiver_id: receiverId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToFriend(friendship);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get friend status between two users
   */
  async getFriendStatus(userId1: string, userId2: string): Promise<FriendStatus> {
    try {
      const { data: friendship, error } = await supabase
        .from("friends")
        .select("*")
        .or(`and(requester_id.eq.${userId1},receiver_id.eq.${userId2}),and(requester_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (!friendship) {
        return { status: 'none' };
      }

      const mappedFriendship = this.mapDatabaseToFriend(friendship);

      // Determine status from current user's perspective
      if (mappedFriendship.status === 'accepted') {
        return {
          status: 'friends',
          friendshipId: mappedFriendship.id,
        };
      }

      if (mappedFriendship.status === 'blocked') {
        return {
          status: 'blocked',
          friendshipId: mappedFriendship.id,
        };
      }

      // For pending requests, determine if sent or received
      if (mappedFriendship.requesterId === userId1) {
        return {
          status: 'pending_sent',
          friendshipId: mappedFriendship.id,
        };
      } else {
        return {
          status: 'pending_received',
          friendshipId: mappedFriendship.id,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pending friend requests for a user
   */
  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data: requests, error } = await supabase
        .from("friends")
        .select(`
          id,
          created_at,
          requester:user_profiles!friends_requester_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return requests.map((request: any) => ({
        id: request.id,
        requester: {
          id: request.requester.id,
          displayName: request.requester.display_name,
          avatarUrl: request.requester.avatar_url,
        },
        createdAt: new Date(request.created_at),
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string): Promise<Friend> {
    try {
      const { data: friendship, error } = await supabase
        .from("friends")
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!friendship) {
        throw new Error(AppErrorCode.FRIEND_REQUEST_NOT_FOUND);
      }

      return this.mapDatabaseToFriend(friendship);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Decline a friend request
   */
  async declineFriendRequest(requestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("friends")
        .delete()
        .eq('id', requestId)
        .eq('status', 'pending');

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get friends list for a user
   */
  async getFriends(userId: string): Promise<UserProfile[]> {
    try {
      const { data: friendships, error } = await supabase
        .from("friends")
        .select(`
          requester_id,
          receiver_id,
          requester:user_profiles!friends_requester_id_fkey (*),
          receiver:user_profiles!friends_receiver_id_fkey (*)
        `)
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) {
        throw error;
      }

      return friendships.map((friendship: any) => {
        // Return the profile that is NOT the current user
        const friendProfile = friendship.requester_id === userId 
          ? friendship.receiver 
          : friendship.requester;

        return {
          id: friendProfile.id,
          userId: friendProfile.user_id,
          email: friendProfile.email,
          displayName: friendProfile.display_name,
          username: friendProfile.username,
          avatarUrl: friendProfile.avatar_url,
          bio: friendProfile.bio,
          quote: friendProfile.quote,
          favoriteGenres: friendProfile.favorite_genres || [],
          favoriteTitles: friendProfile.favorite_titles || [],
          isPublic: friendProfile.is_public,
          onboardingCompleted: friendProfile.onboarding_completed,
          createdAt: new Date(friendProfile.created_at),
          updatedAt: new Date(friendProfile.updated_at),
        };
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove a friend (unfriend)
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("friends")
        .delete()
        .or(`and(requester_id.eq.${userId},receiver_id.eq.${friendId}),and(requester_id.eq.${friendId},receiver_id.eq.${userId})`)
        .eq('status', 'accepted');

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Map database row to Friend type
   */
  private mapDatabaseToFriend(dbFriend: FriendDocument): Friend {
    return {
      id: dbFriend.id,
      requesterId: dbFriend.requester_id,
      receiverId: dbFriend.receiver_id,
      status: dbFriend.status,
      createdAt: new Date(dbFriend.created_at),
      updatedAt: new Date(dbFriend.updated_at),
    };
  }
}

// Export singleton instance
export const friendsRepository = new FriendsRepository();