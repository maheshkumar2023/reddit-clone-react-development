import { useNavigate } from 'react-router-dom';
import type { RedditPost } from '../types/reddit';

function timeAgo(utc: number): string {
  const seconds = Math.floor(Date.now() / 1000 - utc);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function formatScore(n: number): string {
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function getImageUrl(post: RedditPost): string | null {
  if (post.post_hint === 'image' && post.url_overridden_by_dest) {
    return post.url_overridden_by_dest;
  }
  if (post.preview?.images?.[0]?.source?.url) {
    return post.preview.images[0].source.url;
  }
  if (post.thumbnail && post.thumbnail !== 'self' && post.thumbnail !== 'default' && post.thumbnail !== 'nsfw' && post.thumbnail !== 'spoiler') {
    return post.thumbnail;
  }
  return null;
}

export default function PostCard({ post }: { post: RedditPost }) {
  const navigate = useNavigate();
  const imageUrl = getImageUrl(post);
  const isVideo = post.is_video && post.media?.reddit_video;

  const handleClick = () => {
    navigate(`/post${post.permalink}`);
  };

  const goToSubreddit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/r/${post.subreddit}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-dark-800 rounded-2xl border border-dark-600/50 hover:border-dark-500 transition-all duration-200 cursor-pointer group animate-fade-in overflow-hidden hover:shadow-lg hover:shadow-black/20"
    >
      {/* Media */}
      {(imageUrl || isVideo) && (
        <div className="relative w-full overflow-hidden bg-dark-900" style={{ maxHeight: '400px' }}>
          {isVideo && post.media?.reddit_video ? (
            <video
              src={post.media.reddit_video.fallback_url}
              controls
              muted
              className="w-full object-contain"
              style={{ maxHeight: '400px' }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="w-full object-contain"
              style={{ maxHeight: '400px' }}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : null}
          {post.over_18 && (
            <div className="absolute top-3 right-3 bg-nsfw/90 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm">
              NSFW
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={goToSubreddit}
            className="text-xs font-bold text-accent hover:text-accent-hover transition-colors"
          >
            r/{post.subreddit}
          </button>
          <span className="text-gray-600">•</span>
          <span className="text-xs text-gray-500">u/{post.author}</span>
          <span className="text-gray-600">•</span>
          <span className="text-xs text-gray-500">{timeAgo(post.created_utc)}</span>
          {post.over_18 && !imageUrl && (
            <span className="text-[10px] font-bold bg-nsfw/20 text-nsfw px-1.5 py-0.5 rounded">NSFW</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-white group-hover:text-accent-light transition-colors leading-snug mb-2">
          {post.title}
        </h3>

        {/* Flair */}
        {post.link_flair_text && (
          <span className="inline-block text-[11px] font-medium bg-dark-600 text-gray-300 px-2 py-0.5 rounded-md mb-2">
            {post.link_flair_text}
          </span>
        )}

        {/* Self text preview */}
        {post.is_self && post.selftext && !imageUrl && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {post.selftext.slice(0, 200)}
          </p>
        )}

        {/* External link */}
        {!post.is_self && post.domain && !post.domain.startsWith('i.') && !post.domain.startsWith('v.') && !post.domain.includes('reddit') && (
          <div className="flex items-center gap-1.5 mb-3">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="text-xs text-blue-400">{post.domain}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 bg-dark-700 rounded-lg px-2 py-1">
              <svg className="w-4 h-4 text-upvote" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-bold text-white">{formatScore(post.score)}</span>
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-medium">{formatScore(post.num_comments)}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard?.writeText(`https://reddit.com${post.permalink}`);
            }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors ml-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-xs font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
