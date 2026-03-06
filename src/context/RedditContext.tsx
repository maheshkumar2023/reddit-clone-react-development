import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { RedditPost, SubredditInfo } from '../types/reddit';
import { redditFetch } from '../utils/api';

interface RedditContextType {
  selectedSubreddits: string[];
  addSubreddit: (sub: string) => void;
  removeSubreddit: (sub: string) => void;
  toggleSubreddit: (sub: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  posts: RedditPost[];
  setPosts: (p: RedditPost[]) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  searchSubreddits: (query: string) => Promise<SubredditInfo[]>;
  fetchPosts: (subreddits: string[], sort: string, query: string) => Promise<void>;
  nsfwEnabled: boolean;
  setNsfwEnabled: (v: boolean) => void;
  error: string;
}

const RedditContext = createContext<RedditContextType | null>(null);

export function useReddit() {
  const ctx = useContext(RedditContext);
  if (!ctx) throw new Error('useReddit must be used within RedditProvider');
  return ctx;
}

const DEFAULT_SUBS = ['popular', 'all'];

export function RedditProvider({ children }: { children: React.ReactNode }) {
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>(DEFAULT_SUBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('hot');
  const [nsfwEnabled, setNsfwEnabled] = useState(true);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const addSubreddit = useCallback((sub: string) => {
    setSelectedSubreddits(prev => {
      if (prev.includes(sub.toLowerCase())) return prev;
      return [...prev, sub.toLowerCase()];
    });
  }, []);

  const removeSubreddit = useCallback((sub: string) => {
    setSelectedSubreddits(prev => prev.filter(s => s !== sub.toLowerCase()));
  }, []);

  const toggleSubreddit = useCallback((sub: string) => {
    setSelectedSubreddits(prev => {
      const lower = sub.toLowerCase();
      if (prev.includes(lower)) return prev.filter(s => s !== lower);
      return [...prev, lower];
    });
  }, []);

  const searchSubreddits = useCallback(async (query: string): Promise<SubredditInfo[]> => {
    if (!query.trim()) return [];
    try {
      const data = await redditFetch(
        `/subreddits/search.json?q=${encodeURIComponent(query)}&raw_json=1&limit=10&include_over_18=on`
      );
      return data.data.children.map((c: any) => c.data);
    } catch {
      return [];
    }
  }, []);

  const fetchPosts = useCallback(async (subreddits: string[], sort: string, query: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError('');
    try {
      let data: any;
      if (query.trim()) {
        // Search mode
        const subFilter = subreddits.length > 0 && !subreddits.includes('all') && !subreddits.includes('popular')
          ? `&restrict_sr=on&subreddit=${subreddits.join('+')}`
          : '';
        data = await redditFetch(
          `/search.json?q=${encodeURIComponent(query)}&raw_json=1&limit=12&sort=${sort}&include_over_18=on${subFilter}`,
          controller.signal
        );
      } else if (subreddits.length > 0) {
        // Browse mode
        const subStr = subreddits.join('+');
        data = await redditFetch(
          `/r/${subStr}/${sort}.json?raw_json=1&limit=12&include_over_18=on`,
          controller.signal
        );
      } else {
        setPosts([]);
        setLoading(false);
        return;
      }

      if (data?.data?.children) {
        setPosts(data.data.children.map((c: any) => c.data));
      } else {
        setPosts([]);
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Fetch error:', e);
        setError(e.message || 'Failed to load posts');
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <RedditContext.Provider value={{
      selectedSubreddits, addSubreddit, removeSubreddit, toggleSubreddit,
      searchQuery, setSearchQuery,
      posts, setPosts, loading, setLoading,
      sortBy, setSortBy,
      searchSubreddits, fetchPosts,
      nsfwEnabled, setNsfwEnabled,
      error,
    }}>
      {children}
    </RedditContext.Provider>
  );
}
