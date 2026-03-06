import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { RedditPost, RedditComment } from '../types/reddit';
import { redditFetch } from '../utils/api';

function timeAgo(utc: number): string {
  const seconds = Math.floor(Date.now() / 1000 - utc);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatScore(n: number): string {
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function getImageUrl(post: RedditPost): string | null {
  if (post.post_hint === 'image' && post.url_overridden_by_dest) return post.url_overridden_by_dest;
  if (post.preview?.images?.[0]?.source?.url) return post.preview.images[0].source.url;
  return null;
}

function Comment({ comment, depth = 0 }: { comment: RedditComment; depth?: number }) {
  const [collapsed, setCollapsed] = useState(false);
  if (!comment.author) return null;

  const replies = comment.replies?.data?.children
    ?.filter((c: any) => c.kind === 't1')
    ?.map((c: any) => c.data) || [];

  const borderColors = [
    'border-accent', 'border-blue-500', 'border-green-500',
    'border-purple-500', 'border-yellow-500', 'border-pink-500',
    'border-cyan-500', 'border-red-400',
  ];

  return (
    <div className={`${depth > 0 ? `ml-3 sm:ml-5 pl-3 sm:pl-4 border-l-2 ${borderColors[depth % borderColors.length]}/30` : ''}`}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-500 hover:text-white transition-colors">
            <svg className={`w-3 h-3 transition-transform ${collapsed ? '' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <span className={`text-xs font-bold ${comment.is_submitter ? 'text-accent' : 'text-blue-400'}`}>
            u/{comment.author}
          </span>
          {comment.is_submitter && (
            <span className="text-[10px] font-bold bg-accent/20 text-accent px-1.5 py-0.5 rounded">OP</span>
          )}
          {comment.stickied && (
            <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">📌 Pinned</span>
          )}
          <span className="text-xs text-gray-600">•</span>
          <span className="text-xs text-gray-500">{timeAgo(comment.created_utc)}</span>
          <span className="text-xs text-gray-600">•</span>
          <span className="text-xs text-gray-500 flex items-center gap-0.5">
            <svg className="w-3 h-3 text-upvote" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {formatScore(comment.score)}
          </span>
        </div>
        {!collapsed && (
          <>
            <div
              className="text-sm text-gray-300 leading-relaxed post-body"
              dangerouslySetInnerHTML={{ __html: comment.body_html || comment.body }}
            />
            {replies.length > 0 && (
              <div className="mt-1">
                {replies.map((reply: RedditComment) => (
                  <Comment key={reply.id} comment={reply} depth={depth + 1} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PostPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<RedditPost | null>(null);
  const [comments, setComments] = useState<RedditComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const permalink = '/' + (params['*'] || '');

  useEffect(() => {
    let cancelled = false;
    async function fetchPost() {
      setLoading(true);
      setError('');
      try {
        const data = await redditFetch(`${permalink}.json?raw_json=1&limit=100`);
        if (cancelled) return;
        if (data && Array.isArray(data) && data[0]?.data?.children?.[0]?.data) {
          setPost(data[0].data.children[0].data);
        }
        if (data && Array.isArray(data) && data[1]?.data?.children) {
          setComments(
            data[1].data.children
              .filter((c: any) => c.kind === 't1')
              .map((c: any) => c.data)
          );
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || 'Failed to load post');
          console.error(e);
        }
      }
      if (!cancelled) setLoading(false);
    }
    fetchPost();
    return () => { cancelled = true; };
  }, [permalink]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-8 w-full" />
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-64 w-full rounded-2xl" />
          <div className="space-y-3 mt-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-400 mb-2">{error || 'Post not found'}</h2>
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-dark-700 text-gray-300 rounded-xl hover:bg-dark-600 transition-colors">
            ← Go back
          </button>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(post);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Post */}
      <article className="bg-dark-800 rounded-2xl border border-dark-600/50 overflow-hidden animate-fade-in">
        {/* Post header */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => navigate(`/r/${post.subreddit}`)}
              className="text-sm font-bold text-accent hover:text-accent-hover transition-colors"
            >
              r/{post.subreddit}
            </button>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-gray-500">u/{post.author}</span>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-gray-500">{timeAgo(post.created_utc)}</span>
            {post.over_18 && (
              <span className="text-[10px] font-bold bg-nsfw/20 text-nsfw px-1.5 py-0.5 rounded">NSFW</span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-4">{post.title}</h1>

          {post.link_flair_text && (
            <span className="inline-block text-xs font-medium bg-dark-600 text-gray-300 px-2.5 py-1 rounded-lg mb-4">
              {post.link_flair_text}
            </span>
          )}
        </div>

        {/* Media */}
        {post.is_video && post.media?.reddit_video ? (
          <div className="bg-black flex justify-center">
            <video
              src={post.media.reddit_video.fallback_url}
              controls
              className="max-h-[70vh] w-auto"
            />
          </div>
        ) : imageUrl ? (
          <div className="bg-dark-900 flex justify-center">
            <img src={imageUrl} alt="" className="max-h-[70vh] w-auto object-contain" loading="lazy" />
          </div>
        ) : null}

        {/* Gallery */}
        {post.gallery_data && post.media_metadata && (
          <div className="flex overflow-x-auto gap-2 p-4 bg-dark-900">
            {post.gallery_data.items.map(item => {
              const meta = post.media_metadata?.[item.media_id];
              if (!meta) return null;
              return (
                <img
                  key={item.id}
                  src={meta.s.u}
                  alt=""
                  className="max-h-96 w-auto object-contain rounded-lg flex-shrink-0"
                  loading="lazy"
                />
              );
            })}
          </div>
        )}

        {/* Self text */}
        {post.selftext_html && (
          <div className="px-5 sm:px-6 pb-5">
            <div
              className="text-sm text-gray-300 leading-relaxed post-body prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.selftext_html }}
            />
          </div>
        )}

        {/* External URL */}
        {!post.is_self && post.url_overridden_by_dest && !imageUrl && (
          <div className="px-5 sm:px-6 pb-5">
            <a
              href={post.url_overridden_by_dest}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {post.domain} — Open link
            </a>
          </div>
        )}

        {/* Stats */}
        <div className="px-5 sm:px-6 py-4 border-t border-dark-600/50 flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <svg className="w-5 h-5 text-upvote" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-bold text-white">{formatScore(post.score)}</span>
            <span className="text-sm text-gray-500">points</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-bold text-white">{formatScore(post.num_comments)}</span>
            <span className="text-sm text-gray-500">comments</span>
          </div>
          <a
            href={`https://reddit.com${post.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors ml-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="text-sm">Open on Reddit</span>
          </a>
        </div>
      </article>

      {/* Comments */}
      <div className="mt-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comments ({comments.length})
        </h2>

        {comments.length === 0 ? (
          <div className="bg-dark-800 rounded-2xl border border-dark-600/50 p-8 text-center">
            <p className="text-gray-500">No comments yet</p>
          </div>
        ) : (
          <div className="bg-dark-800 rounded-2xl border border-dark-600/50 px-4 sm:px-6 divide-y divide-dark-600/30">
            {comments.map(comment => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
