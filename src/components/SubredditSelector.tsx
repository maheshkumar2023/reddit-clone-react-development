import { useState, useRef, useEffect, useCallback } from 'react';
import { useReddit } from '../context/RedditContext';
import type { SubredditInfo } from '../types/reddit';
import { redditFetch } from '../utils/api';

const POPULAR_SUBS = [
  'popular', 'all', 'askreddit', 'funny', 'gaming', 'worldnews',
  'todayilearned', 'science', 'movies', 'music', 'technology',
  'memes', 'pics', 'videos', 'news', 'showerthoughts',
  'space', 'diy', 'jokes', 'food', 'art', 'books',
  'sports', 'programming', 'dataisbeautiful', 'philosophy',
];

export default function SubredditSelector() {
  const { selectedSubreddits, addSubreddit, removeSubreddit } = useReddit();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SubredditInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchSubs = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const data = await redditFetch(
        `/subreddits/search.json?q=${encodeURIComponent(q)}&raw_json=1&limit=12&include_over_18=on`
      );
      if (data?.data?.children) {
        setResults(data.data.children.map((c: any) => c.data));
      }
    } catch (err) {
      console.warn('Subreddit search failed:', err);
      setResults([]);
    }
    setSearching(false);
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => searchSubs(val), 400);
  };

  const handleSelect = (sub: string) => {
    const name = sub.toLowerCase().replace('r/', '');
    if (!selectedSubreddits.includes(name)) {
      addSubreddit(name);
    }
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const filteredPopular = POPULAR_SUBS.filter(s =>
    !selectedSubreddits.includes(s) &&
    (!query || s.includes(query.toLowerCase()))
  );

  const formatNumber = (n: number) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex flex-wrap items-center gap-1.5 bg-dark-800 border border-dark-500/50 rounded-xl px-3 py-2 min-h-[42px] cursor-text transition-all focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20"
        onClick={() => { inputRef.current?.focus(); setIsOpen(true); }}
      >
        <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
        {selectedSubreddits.map(sub => (
          <span
            key={sub}
            className="inline-flex items-center gap-1 bg-accent/15 text-accent text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-accent/25 transition-colors"
          >
            r/{sub}
            <button
              onClick={(e) => { e.stopPropagation(); removeSubreddit(sub); }}
              className="hover:text-white transition-colors ml-0.5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedSubreddits.length === 0 ? "Search subreddits..." : "Add more..."}
          className="flex-1 min-w-[100px] bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-500/50 rounded-xl shadow-2xl shadow-black/50 z-50 max-h-[360px] overflow-y-auto">
          {searching && (
            <div className="flex items-center gap-2 px-4 py-3 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              Searching...
            </div>
          )}

          {query && results.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Search Results</div>
              {results.map(sub => (
                <button
                  key={sub.display_name}
                  onClick={() => handleSelect(sub.display_name)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-600 transition-colors text-left ${
                    selectedSubreddits.includes(sub.display_name.toLowerCase()) ? 'bg-accent/10' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center overflow-hidden shrink-0">
                    {(sub.icon_img || sub.community_icon) ? (
                      <img src={(sub.community_icon || sub.icon_img).split('?')[0]} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-accent font-bold text-xs">r/</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      r/{sub.display_name}
                      {sub.over18 && <span className="text-[10px] font-bold bg-nsfw/20 text-nsfw px-1.5 py-0.5 rounded">NSFW</span>}
                    </div>
                    <div className="text-xs text-gray-500">{formatNumber(sub.subscribers)} members</div>
                  </div>
                  {selectedSubreddits.includes(sub.display_name.toLowerCase()) && (
                    <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {(!query || results.length === 0) && !searching && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Popular Subreddits</div>
              {filteredPopular.slice(0, 12).map(sub => (
                <button
                  key={sub}
                  onClick={() => handleSelect(sub)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-600 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-accent font-bold text-xs">r/</span>
                  </div>
                  <span className="text-sm font-medium text-white">r/{sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
