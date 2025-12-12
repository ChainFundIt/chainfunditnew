"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

/**
 * Component that automatically favorites items after login
 * This handles the case where a user clicks favorite before logging in
 */
export function AutoFavoriteHandler() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Only run if user is authenticated and not loading
    if (loading || !user) return;

    // Check for pending favorite action
    const pendingFavoriteStr = localStorage.getItem("pending_favorite");
    if (!pendingFavoriteStr) return;

    const handleAutoFavorite = async () => {
      try {
        const pendingFavorite = JSON.parse(pendingFavoriteStr);
        
        // Check if already favorited
        const checkResponse = await fetch(
          `/api/favourites/check?itemType=${pendingFavorite.itemType}&itemId=${pendingFavorite.itemId}`
        );
        const checkData = await checkResponse.json();
        
        // Only favorite if not already favorited
        if (checkData.success && !checkData.data.isFavourited) {
          const favoriteResponse = await fetch('/api/favourites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              itemType: pendingFavorite.itemType,
              itemId: pendingFavorite.itemId,
            }),
          });

          if (favoriteResponse.ok) {
            const favoriteData = await favoriteResponse.json();
            if (favoriteData.success && favoriteData.data.isFavourited) {
              toast.success("Added to favorites!");
            }
          }
        } else if (checkData.success && checkData.data.isFavourited) {
          // Already favorited, just show a message
          toast.info("Already in your favorites!");
        }
        
        // Clear pending favorite regardless of success
        localStorage.removeItem("pending_favorite");
      } catch (error) {
        console.error('Error auto-favoriting:', error);
        // Clear pending favorite even on error
        localStorage.removeItem("pending_favorite");
      }
    };

    // Small delay to ensure auth is fully set up
    const timer = setTimeout(handleAutoFavorite, 500);
    return () => clearTimeout(timer);
  }, [user, loading]);

  return null;
}

