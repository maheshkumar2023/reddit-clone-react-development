import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { RedditPost, SubredditInfo } from '../types/reddit';
import { useReddit } from '../context/RedditContext';
import PostCard from '../components/PostCard';
import { PostSkeletonList } from '../components/Skeleton';
import { redditFetch } from '../utils/api';

function formatNumber(n: number): string {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

export default function SubredditPage() {
  const { subreddit } = useParams<{ subreddit: string }>();
  const navigate = useNavigate();
  const { addSubreddit, selectedSubreddits } = useReddit();
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [info, setInfo] = useState<SubredditInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('hot');
  const [error, setError] = useState('');

  const isSelected = selectedSubreddits.includes(subreddit?.toLowerCase() || '');

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // Fetch posts and about in parallel
        const results = await Promise.allSettled([
          redditFetch(`/r/${subreddit}/${sort}.json?raw_json=1&limit=12&include_over_18=on`),
          redditFetch(`/r/${subreddit}/about.json?raw_json=1`),
        ]);

        if (cancelled) return;

        // Handle posts
        if (results[0].status === 'fulfilled' && results[0].value?.data?.children) {
          setPosts(results[0].value.data.children.map((c: any) => c.data));
        } else if (results[0].status === 'rejected') {
          throw results[0].reason;
        }

        // Handle about info
        if (results[1].status === 'fulfilled' && results[1].value?.data) {
          setInfo(results[1].value.data);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || 'Failed to load subreddit');
          console.error(e);
        }
      }
      if (!cancelled) setLoading(false);
    }
    if (subreddit) fetchData();
    return () => { cancelled = true; };
  }, [subreddit, sort]);

  const bannerImg = info?.banner_background_image?.split('?')[0];
  const iconImg = (info?.community_icon || info?.icon_img)?.split('?')[0];

  return (
    <div>
      {/* Banner */}
      <div className="relative h-32 sm:h-48 bg-gradient-to-r from-accent/30 to-purple-600/30 overflow-hidden">
        {bannerImg && (
          <img src={bannerImg} alt="" className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Sub header */}
        <div className="relative -mt-10 mb-6 flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-dark-700 border-4 border-dark-900 overflow-hidden flex items-center justify-center shrink-0 shadow-xl">
            {iconImg ? (
              <img src={iconImg} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-accent font-black text-2xl">r/</span>
            )}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white">r/{subreddit}</h1>
              {info?.over18 && (
                <span className="text-xs font-bold bg-nsfw/20 text-nsfw px-2 py-1 rounded-lg">NSFW</span>
              )}
            </div>
            {info && (
              <p className="text-sm text-gray-400 mt-1">
                {formatNumber(info.subscribers)} members
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={() => { if (subreddit) addSubreddit(subreddit); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-dark-600 text-gray-400 cursor-default'
                  : 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20'
              }`}
            >
              {isSelected ? '✓ Added' : '+ Add to Feed'}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-500/50 transition-all"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6 text-center">
            <p className="text-red-400 font-medium mb-2">Failed to load r/{subreddit}</p>
            <p className="text-gray-500 text-sm mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-hover transition-colors"
            >
              🔄 Try again
            </button>
          </div>
        )}

        {/* Description */}
        {info?.public_description && (
          <div className="bg-dark-800 rounded-2xl border border-dark-600/50 p-4 mb-6">
            <p className="text-sm text-gray-400 leading-relaxed">{info.public_description}</p>
          </div>
        )}

        {/* Sort */}
        <div className="flex items-center gap-2 mb-6">
          {['hot', 'new', 'top', 'rising'].map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                sort === s
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'bg-dark-800 text-gray-400 hover:text-white border border-dark-600/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <PostSkeletonList count={6} />
        ) : posts.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-500">No posts found in r/{subreddit}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
