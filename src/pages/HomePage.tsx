import { useEffect, useState } from 'react';
import { useReddit } from '../context/RedditContext';
import PostCard from '../components/PostCard';
import { PostSkeletonList } from '../components/Skeleton';
import { getActiveProxy } from '../utils/api';

const SORT_OPTIONS = [
  { value: 'hot', label: 'Hot', icon: '🔥' },
  { value: 'new', label: 'New', icon: '✨' },
  { value: 'top', label: 'Top', icon: '🏆' },
  { value: 'rising', label: 'Rising', icon: '📈' },
];

export default function HomePage() {
  const { posts, loading, selectedSubreddits, sortBy, setSortBy, fetchPosts, searchQuery, error } = useReddit();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [proxyName, setProxyName] = useState('');

  useEffect(() => {
    fetchPosts(selectedSubreddits, sortBy, searchQuery).then(() => {
      setProxyName(getActiveProxy());
    });
  }, [selectedSubreddits, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {searchQuery ? (
              <>Results for "<span className="text-accent">{searchQuery}</span>"</>
            ) : (
              <>
                <span className="text-accent">r/</span>
                {selectedSubreddits.join(' + ') || 'Select subreddits'}
              </>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            {loading ? 'Loading...' : `${posts.length} posts`}
            {proxyName && !loading && !error && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-500/70">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                via {proxyName}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="flex items-center bg-dark-800 rounded-xl border border-dark-600/50 p-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === opt.value
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'text-gray-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                <span>{opt.icon}</span>
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-dark-800 rounded-xl border border-dark-600/50 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-dark-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-dark-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 mb-6 text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-red-400 mb-2">Connection Error</h3>
          <p className="text-gray-400 text-sm mb-4 max-w-lg mx-auto leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => fetchPosts(selectedSubreddits, sortBy, searchQuery).then(() => setProxyName(getActiveProxy()))}
              className="px-6 py-2.5 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
            >
              🔄 Retry Connection
            </button>
            <a
              href="https://www.reddit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-dark-700 text-gray-300 text-sm font-medium rounded-xl hover:bg-dark-600 transition-colors border border-dark-500/50"
            >
              Open Reddit Directly ↗
            </a>
          </div>
          <p className="text-[11px] text-gray-600 mt-4">
            This app uses CORS proxies to access Reddit's API from the browser.
            If all proxies fail, try refreshing or check your network.
          </p>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <PostSkeletonList count={6} />
      ) : posts.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-400 mb-1">No posts found</h3>
          <p className="text-sm text-gray-600">Try selecting different subreddits or change your search</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'flex flex-col gap-3 max-w-3xl mx-auto'
        }>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
