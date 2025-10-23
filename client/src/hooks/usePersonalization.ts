import { useState, useEffect, useCallback } from 'react';

interface UserPreferences {
  expandedView: boolean;
  sidebarOpen: boolean;
  showDailyBriefing: boolean;
  favoriteActions: string[];
  recentSearches: string[];
  dismissedHints: string[];
  preferredMarkets: string[];
  portfolioSortBy: 'value' | 'performance' | 'alphabetical';
  chatHistory: any[];
  lastVisit: string;
  viewCounts: Record<string, number>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  expandedView: false,
  sidebarOpen: false,
  showDailyBriefing: true,
  favoriteActions: ['buy', 'sell', 'analyze'],
  recentSearches: [],
  dismissedHints: [],
  preferredMarkets: ['S&P 500', 'NASDAQ'],
  portfolioSortBy: 'value',
  chatHistory: [],
  lastVisit: new Date().toISOString(),
  viewCounts: {},
};

export function usePersonalization(userId?: string) {
  const storageKey = `athena_preferences_${userId || 'default'}`;
  
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
  });

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [preferences, storageKey]);

  // Track page views
  const trackPageView = useCallback((page: string) => {
    setPreferencesState(prev => ({
      ...prev,
      viewCounts: {
        ...prev.viewCounts,
        [page]: (prev.viewCounts[page] || 0) + 1,
      },
      lastVisit: new Date().toISOString(),
    }));
  }, []);

  // Update individual preferences
  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferencesState(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Add to recent searches
  const addRecentSearch = useCallback((search: string) => {
    setPreferencesState(prev => ({
      ...prev,
      recentSearches: [
        search,
        ...prev.recentSearches.filter(s => s !== search)
      ].slice(0, 10), // Keep only last 10 searches
    }));
  }, []);

  // Toggle favorite action
  const toggleFavoriteAction = useCallback((action: string) => {
    setPreferencesState(prev => ({
      ...prev,
      favoriteActions: prev.favoriteActions.includes(action)
        ? prev.favoriteActions.filter(a => a !== action)
        : [...prev.favoriteActions, action],
    }));
  }, []);

  // Dismiss hint
  const dismissHint = useCallback((hintId: string) => {
    setPreferencesState(prev => ({
      ...prev,
      dismissedHints: [...prev.dismissedHints, hintId],
    }));
  }, []);

  // Get personalized recommendations based on user behavior
  const getPersonalizedRecommendations = useCallback(() => {
    const { viewCounts, favoriteActions, preferredMarkets } = preferences;
    
    // Sort pages by view count to determine user interests
    const topPages = Object.entries(viewCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([page]) => page);
    
    // Generate recommendations based on behavior
    const recommendations = [];
    
    if (topPages.includes('/portfolio')) {
      recommendations.push({
        type: 'feature',
        message: 'You frequently check your portfolio. Try our new portfolio analytics.',
      });
    }
    
    if (favoriteActions.includes('buy')) {
      recommendations.push({
        type: 'action',
        message: 'Based on your activity, here are today\'s top buy opportunities.',
      });
    }
    
    if (preferredMarkets.includes('NASDAQ')) {
      recommendations.push({
        type: 'market',
        message: 'NASDAQ stocks you follow are showing strong momentum today.',
      });
    }
    
    return recommendations;
  }, [preferences]);

  // Reset preferences
  const resetPreferences = useCallback(() => {
    setPreferencesState(DEFAULT_PREFERENCES);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Check if should show daily briefing
  const shouldShowDailyBriefing = useCallback(() => {
    const lastDismissed = localStorage.getItem('athena_briefing_dismissed');
    const today = new Date().toDateString();
    
    return preferences.showDailyBriefing && lastDismissed !== today;
  }, [preferences.showDailyBriefing]);

  return {
    preferences,
    updatePreference,
    addRecentSearch,
    toggleFavoriteAction,
    dismissHint,
    getPersonalizedRecommendations,
    resetPreferences,
    shouldShowDailyBriefing,
    trackPageView,
  };
}