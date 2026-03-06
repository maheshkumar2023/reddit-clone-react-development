/**
 * Reddit API fetch utility with multiple CORS proxy fallbacks.
 * Tries each proxy in order until one succeeds.
 */

const REDDIT_BASE = 'https://www.reddit.com';

interface ProxyStrategy {
  name: string;
  buildUrl: (redditUrl: string) => string;
  parseResponse: (res: Response) => Promise<any>;
  headers?: Record<string, string>;
}

const PROXY_STRATEGIES: ProxyStrategy[] = [
  // Strategy 1: allorigins /get — wraps response in JSON { contents: "..." }
  // Most reliable because it always returns 200 and wraps the content
  {
    name: 'AllOrigins',
    buildUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    parseResponse: async (res) => {
      const wrapper = await res.json();
      if (!wrapper.contents) {
        throw new Error('Empty contents from AllOrigins');
      }
      // contents is a string of the original response body
      return JSON.parse(wrapper.contents);
    },
  },

  // Strategy 2: corsproxy.io — correct format is /?url=<encoded>
  {
    name: 'CORSProxy.io',
    buildUrl: (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    parseResponse: async (res) => res.json(),
  },

  // Strategy 3: thingproxy — another reliable proxy
  {
    name: 'ThingProxy',
    buildUrl: (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
    parseResponse: async (res) => res.json(),
  },

  // Strategy 4: corsproxy.org 
  {
    name: 'CORSProxy.org',
    buildUrl: (url) => `https://corsproxy.org/?${encodeURIComponent(url)}`,
    parseResponse: async (res) => res.json(),
  },

  // Strategy 5: Direct fetch (works in some envs, or if CORS is relaxed)
  {
    name: 'Direct',
    buildUrl: (url) => url,
    parseResponse: async (res) => res.json(),
  },
];

// Remember which proxy worked last to try it first next time
let lastWorkingIndex = 0;

export async function redditFetch(path: string, signal?: AbortSignal): Promise<any> {
  const targetUrl = `${REDDIT_BASE}${path}`;

  // Build ordered list starting from last working proxy
  const ordered = [
    ...PROXY_STRATEGIES.slice(lastWorkingIndex),
    ...PROXY_STRATEGIES.slice(0, lastWorkingIndex),
  ];

  const errors: string[] = [];

  for (let i = 0; i < ordered.length; i++) {
    const proxy = ordered[i];

    // Skip if already aborted
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    try {
      // Create a timeout controller (12 seconds)
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), 12000);

      // If external signal aborts, also abort our controller
      const onExternalAbort = () => timeoutController.abort();
      signal?.addEventListener('abort', onExternalAbort);

      const fetchUrl = proxy.buildUrl(targetUrl);

      const res = await fetch(fetchUrl, {
        signal: timeoutController.signal,
        headers: {
          'Accept': 'application/json',
          ...(proxy.headers || {}),
        },
      });

      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', onExternalAbort);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await proxy.parseResponse(res);

      // Validate it looks like Reddit data
      if (!data || (typeof data !== 'object')) {
        throw new Error('Invalid response format');
      }

      // Success! Remember this proxy
      const actualIndex = PROXY_STRATEGIES.indexOf(proxy);
      lastWorkingIndex = actualIndex;
      console.log(`✅ [Reddixx] Loaded via ${proxy.name}`);
      return data;

    } catch (err: any) {
      // If the user/external signal aborted, throw immediately
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const msg = err.name === 'AbortError' ? 'Timeout (12s)' : err.message;
      errors.push(`${proxy.name}: ${msg}`);
      console.warn(`❌ [Reddixx] ${proxy.name} failed: ${msg}`);
      continue;
    }
  }

  // All proxies failed
  const errorDetail = errors.join(' | ');
  throw new Error(`Could not connect to Reddit. Tried ${ordered.length} methods. (${errorDetail})`);
}

/**
 * Get the currently active proxy name (for diagnostics)
 */
export function getActiveProxy(): string {
  return PROXY_STRATEGIES[lastWorkingIndex]?.name || 'Unknown';
}
