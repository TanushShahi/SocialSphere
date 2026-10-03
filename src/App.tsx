import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/auth/AuthPage';
import { Sidebar } from './components/navigation/Sidebar';
import { MobileHeader } from './components/navigation/MobileHeader';
import { BottomNav } from './components/navigation/BottomNav';
import { FeedView } from './components/feed/FeedView';
import { ExploreView } from './components/explore/ExploreView';
import { ReelsView } from './components/reels/ReelsView';
import { MessagesView } from './components/messages/MessagesView';
import { ProfileView } from './components/profile/ProfileView';
import { SearchDrawer } from './components/drawers/SearchDrawer';
import { NotificationsDrawer } from './components/drawers/NotificationsDrawer';
import { CreatePostModal } from './components/create/CreatePostModal';
import { StoryViewerModal } from './components/feed/StoryViewerModal';
import { PostDetailModal } from './components/feed/PostDetailModal';
import { CallModal } from './components/calling/CallModal';
import { InstallAppModal } from './components/navigation/InstallAppModal';
import { ShareSheetModal } from './components/common/ShareSheetModal';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    isAuthenticated, 
    currentUser, 
    callSession, 
    endCall, 
    acceptIncomingCall,
    isInstallModalOpen,
    setIsInstallModalOpen
  } = useApp();

  // If user is not authenticated, display the full Instagram Auth experience
  if (!isAuthenticated || !currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-black dark:bg-black light:bg-[#FAFAFA] flex flex-col md:flex-row relative">
      {/* 1. Desktop & Tablet Sidebar */}
      <Sidebar />

      {/* 2. Mobile Sticky Header (<768px) */}
      <MobileHeader />

      {/* 3. Main Center Content Container */}
      <div className="flex-1 min-h-screen pb-16 md:pb-0 overflow-x-hidden">
        {activeTab === 'feed' && <FeedView />}
        {activeTab === 'explore' && <ExploreView />}
        {activeTab === 'reels' && <ReelsView />}
        {activeTab === 'messages' && <MessagesView />}
        {activeTab === 'profile' && <ProfileView />}
      </div>

      {/* 4. Mobile Bottom Navigation Bar (<768px) */}
      <BottomNav />

      {/* 5. Drawers & Modals */}
      <SearchDrawer />
      <NotificationsDrawer />
      <CreatePostModal />
      <StoryViewerModal />
      <PostDetailModal />
      <CallModal session={callSession} onEndCall={endCall} onAcceptCall={acceptIncomingCall} />
      <InstallAppModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />
      <ShareSheetModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
