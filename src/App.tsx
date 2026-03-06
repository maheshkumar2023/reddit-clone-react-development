import { HashRouter, Routes, Route } from 'react-router-dom';
import { RedditProvider } from './context/RedditContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import SubredditPage from './pages/SubredditPage';

export default function App() {
  return (
    <HashRouter>
      <RedditProvider>
        <div className="min-h-screen bg-dark-900 text-gray-200">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/r/:subreddit" element={<SubredditPage />} />
              <Route path="/post/*" element={<PostPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-dark-600/30 mt-12">
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-accent to-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.8 7.2c.2.3.2.7.2 1 0 3.4-4 6.2-8.8 6.2S.4 13.6.4 10.2c0-.3 0-.7.2-1-.4-.4-.6-1-.6-1.6 0-1.2 1-2.2 2.2-2.2.6 0 1.2.2 1.6.6 1.4-1 3.2-1.6 5.2-1.6l1-4.6c0-.2.2-.2.4-.2l3.2.8c.2-.6.8-1 1.4-1 .8 0 1.6.8 1.6 1.6s-.8 1.6-1.6 1.6c-.8 0-1.4-.6-1.6-1.4l-2.8-.6-.8 4c2 0 3.8.6 5.2 1.6.4-.4 1-.6 1.6-.6 1.2 0 2.2 1 2.2 2.2 0 .6-.2 1.2-.6 1.6zM8.4 10c-.8 0-1.6.8-1.6 1.6s.8 1.6 1.6 1.6 1.6-.8 1.6-1.6S9.2 10 8.4 10zm7.2 0c-.8 0-1.6.8-1.6 1.6s.8 1.6 1.6 1.6 1.6-.8 1.6-1.6S16.4 10 15.6 10zm-7.2 5.6c-.2 0-.4.2-.2.4 1 1.2 2.4 1.8 3.8 1.8s2.8-.6 3.8-1.8c.2-.2 0-.4-.2-.4-.2 0-.2 0-.4.2-.8 1-2 1.4-3.2 1.4s-2.4-.4-3.2-1.4c-.1-.2-.2-.2-.4-.2z"/>
                  </svg>
                </div>
                <span className="text-lg font-black text-white tracking-tight">
                  Reddit
                  {/* <span className="text-accent">xx</span> */}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                A Reddit explorer built with React • Data from Reddit's public API
              </p>
            </div>
          </footer>
        </div>
      </RedditProvider>
    </HashRouter>
  );
}
