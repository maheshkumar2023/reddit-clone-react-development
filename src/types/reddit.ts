export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  url: string;
  thumbnail: string;
  selftext: string;
  selftext_html: string | null;
  is_video: boolean;
  is_self: boolean;
  post_hint?: string;
  preview?: {
    images: Array<{
      source: { url: string; width: number; height: number };
      resolutions: Array<{ url: string; width: number; height: number }>;
    }>;
  };
  media?: {
    reddit_video?: {
      fallback_url: string;
      height: number;
      width: number;
    };
  };
  over_18: boolean;
  stickied: boolean;
  link_flair_text?: string;
  ups: number;
  downs: number;
  domain: string;
  url_overridden_by_dest?: string;
  gallery_data?: {
    items: Array<{ media_id: string; id: number }>;
  };
  media_metadata?: Record<string, {
    s: { u: string; x: number; y: number };
    p: Array<{ u: string; x: number; y: number }>;
  }>;
}

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  body_html: string;
  score: number;
  created_utc: number;
  replies?: {
    data?: {
      children: Array<{ kind: string; data: RedditComment }>;
    };
  };
  depth: number;
  is_submitter: boolean;
  stickied: boolean;
}

export interface SubredditInfo {
  display_name: string;
  display_name_prefixed: string;
  title: string;
  public_description: string;
  subscribers: number;
  icon_img: string;
  community_icon: string;
  banner_background_image: string;
  primary_color: string;
  over18: boolean;
}
