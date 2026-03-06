import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReddit } from '../context/RedditContext';
import SubredditSelector from './SubredditSelector';

export default function Header() {
  const { searchQuery, setSearchQuery, fetchPosts, selectedSubreddits, sortBy } = useReddit();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const navigate = useNavigate();
  const location = useLocation();
  const [showSubSelector, setShowSubSelector] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    if (location.pathname !== '/') navigate('/');
    fetchPosts(selectedSubreddits, sortBy, localQuery);
  };

  const handleInputChange = (val: string) => {
    setLocalQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSearchQuery(val);
      if (location.pathname !== '/') navigate('/');
      fetchPosts(selectedSubreddits, sortBy, val);
    }, 600);
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-dark-600/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => { setSearchQuery(''); setLocalQuery(''); navigate('/'); }}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.8 7.2c.2.3.2.7.2 1 0 3.4-4 6.2-8.8 6.2S.4 13.6.4 10.2c0-.3 0-.7.2-1-.4-.4-.6-1-.6-1.6 0-1.2 1-2.2 2.2-2.2.6 0 1.2.2 1.6.6 1.4-1 3.2-1.6 5.2-1.6l1-4.6c0-.2.2-.2.4-.2l3.2.8c.2-.6.8-1 1.4-1 .8 0 1.6.8 1.6 1.6s-.8 1.6-1.6 1.6c-.8 0-1.4-.6-1.6-1.4l-2.8-.6-.8 4c2 0 3.8.6 5.2 1.6.4-.4 1-.6 1.6-.6 1.2 0 2.2 1 2.2 2.2 0 .6-.2 1.2-.6 1.6zM8.4 10c-.8 0-1.6.8-1.6 1.6s.8 1.6 1.6 1.6 1.6-.8 1.6-1.6S9.2 10 8.4 10zm7.2 0c-.8 0-1.6.8-1.6 1.6s.8 1.6 1.6 1.6 1.6-.8 1.6-1.6S16.4 10 15.6 10zm-7.2 5.6c-.2 0-.4.2-.2.4 1 1.2 2.4 1.8 3.8 1.8s2.8-.6 3.8-1.8c.2-.2 0-.4-.2-.4-.2 0-.2 0-.4.2-.8 1-2 1.4-3.2 1.4s-2.4-.4-3.2-1.4c-.1-.2-.2-.2-.4-.2z"/>
              </svg>
            </div>
            <span className="text-xl font-black text-white tracking-tight hidden sm:block">
              Reddit
              {/* <span className="text-accent">xx</span> */}
            </span>
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={localQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search anything..."
                className="w-full bg-dark-700 text-white text-sm placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 border border-dark-500/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-all"
              />
              {localQuery && (
                <button
                  type="button"
                  onClick={() => { setLocalQuery(''); setSearchQuery(''); fetchPosts(selectedSubreddits, sortBy, ''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Subreddit Selector Toggle */}
          <button
            onClick={() => setShowSubSelector(!showSubSelector)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
              showSubSelector
                ? 'bg-accent text-white'
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-500/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span className="hidden sm:inline">Subreddits</span>
            {selectedSubreddits.length > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                showSubSelector ? 'bg-white/20' : 'bg-accent/20 text-accent'
              }`}>
                {selectedSubreddits.length}
              </span>
            )}
          </button>
        </div>

        {/* Subreddit Selector Panel */}
        {showSubSelector && (
          <div className="mt-3 animate-fade-in">
            <SubredditSelector />
          </div>
        )}
      </div>
    </header>
  );
}
