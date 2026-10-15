import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SyncProvider, useSync } from './context/SyncContext';
import { Navigation, ActiveTab } from './components/Navigation';
import { MyLearningScreen } from './features/learning/MyLearningScreen';
import { DeckDetailView } from './features/learning/DeckDetailView';
import { StudySession } from './features/learning/StudySession';
import { ExploreScreen } from './features/explore/ExploreScreen';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { SharedDeckView } from './features/learning/SharedDeckView';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { Deck } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('my-learning');
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [studyDeck, setStudyDeck] = useState<Deck | null>(null);
  const [studyAllAhead, setStudyAllAhead] = useState(false);
  const [sharedDeckId, setSharedDeckId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Hash route listener for shared deck URLs like #shared/:deckId
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#shared/')) {
        const id = hash.replace('#shared/', '').trim();
        if (id) {
          setSharedDeckId(id);
        }
      } else {
        setSharedDeckId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setActiveDeck(null);
    setStudyDeck(null);
    if (sharedDeckId) {
      window.location.hash = '';
      setSharedDeckId(null);
    }
  };

  const handleOpenDeck = (deck: Deck) => {
    setActiveDeck(deck);
    setStudyDeck(null);
  };

  const handleStartStudy = (deck: Deck, studyAll: boolean = false) => {
    setStudyAllAhead(studyAll);
    setStudyDeck(deck);
  };

  const handleExitStudy = () => {
    setStudyDeck(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased transition-colors">
      {/* Sidebar Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Mobile Top Header with Official Logo & Install Button */}
      <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <img src="/icon.svg" alt="7ifd Logo" className="w-8 h-8 rounded-lg shadow-xs object-contain" />
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block leading-none">7ifd</span>
            <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Spaced Repetition</span>
          </div>
        </div>
        <PWAInstallButton variant="compact" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pb-20 md:pb-8 pt-2 px-2 sm:px-4 md:px-8">
        {sharedDeckId ? (
          <SharedDeckView
            deckId={sharedDeckId}
            onBack={() => {
              window.location.hash = '';
              setSharedDeckId(null);
              setActiveTab('my-learning');
            }}
            onAddedToMyLearning={() => {
              window.location.hash = '';
              setSharedDeckId(null);
              setActiveTab('my-learning');
            }}
          />
        ) : studyDeck ? (
          <StudySession
            deck={studyDeck}
            studyAll={studyAllAhead}
            onExit={handleExitStudy}
          />
        ) : activeDeck ? (
          <DeckDetailView
            deck={activeDeck}
            onBack={() => setActiveDeck(null)}
            onStartStudy={(d, studyAll) => handleStartStudy(d, studyAll)}
          />
        ) : activeTab === 'my-learning' ? (
          <MyLearningScreen
            onOpenDeck={handleOpenDeck}
            onStartStudy={(d) => handleStartStudy(d, false)}
            onNavigateExplore={() => setActiveTab('explore')}
          />
        ) : activeTab === 'explore' ? (
          <ExploreScreen onNavigateToMyLearning={() => setActiveTab('my-learning')} />
        ) : (
          <ProfileScreen onOpenAuth={() => setIsAuthModalOpen(true)} />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <OnboardingModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncProvider>
          <AppContent />
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
