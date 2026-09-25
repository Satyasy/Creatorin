/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActivePage, AuthState } from './types';
import { HomePage } from './components/HomePage';
import { LandingPage } from './components/LandingPage';
import { SignUpPage } from './components/SignUpPage';
import { SignInPage } from './components/SignInPage';
import { ExplorePage } from './components/ExplorePage';
import { ExploreProjectsPage } from './components/ExploreProjectsPage';
import { ExploreServicesPage } from './components/ExploreServicesPage';
import { CreatorProfilePage } from './components/CreatorProfilePage';
import { NotificationsPage } from './components/NotificationsPage';
import { ChatPage } from './components/ChatPage';
import { ProjectBriefsPage } from './components/ProjectBriefsPage';
import { UmkmProfilePage } from './components/UmkmProfilePage';
import { BriefDetailPage } from './components/BriefDetailPage';
import { InvoiceDetailPage } from './components/InvoiceDetailPage';
import { CollaborationRoomPage } from './components/CollaborationRoomPage';
import { MOCK_CREATORS } from './data/mockCreators';
import { MOCK_PROJECTS } from './data/mockProjects';
import { Creator, ProjectListing } from './types';

const AUTH_STORAGE_KEY = 'creatorin_session_user';

type AppProps = {
  initialPage?: ActivePage;
};

export default function App({ initialPage = 'home' }: AppProps) {
  const [currentPage, setCurrentPage] = useState<ActivePage>(initialPage);
  const [selectedCreator, setSelectedCreator] = useState<Creator>(MOCK_CREATORS[0]);
  const [selectedBrief, setSelectedBrief] = useState<ProjectListing>(MOCK_PROJECTS[0]);
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          isAuthenticated: true,
          user: parsed,
        };
      }
    } catch (e) {
      console.error('Failed to parse auth state from localStorage', e);
    }
    return {
      isAuthenticated: false,
      user: null,
    };
  });

  // Handle successful login or registration
  const handleLoginSuccess = (user: NonNullable<AuthState['user']>) => {
    setAuthState({
      isAuthenticated: true,
      user,
    });
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist auth state', e);
    }
  };

  // Handle logout
  const handleSignOut = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove auth state', e);
    }
    setCurrentPage('home');
  };

  const handleNavigate = (page: ActivePage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewCreator = (creator: Creator) => {
    setSelectedCreator(creator);
    setCurrentPage('creator-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewBrief = (brief: ProjectListing) => {
    setSelectedBrief(brief);
    setCurrentPage('brief-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render current view
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#0d0c22] font-sans selection:bg-[#0d0c22] selection:text-white">
      {currentPage === 'home' && (
        <HomePage 
          currentUser={authState.user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          onViewCreatorProfile={handleViewCreator}
        />
      )}

      {currentPage === 'landing' && (
        <LandingPage 
          currentUser={authState.user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          onViewCreatorProfile={handleViewCreator}
        />
      )}

      {currentPage === 'signup' && (
        <SignUpPage
          onNavigate={handleNavigate}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === 'signin' && (
        <SignInPage
          onNavigate={handleNavigate}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === 'explore' && (
        <ExplorePage
          currentUser={authState.user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          onViewCreatorProfile={handleViewCreator}
        />
      )}

      {currentPage === 'projects' && (
        <ExploreProjectsPage
          currentUser={authState.user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          onViewCreatorProfile={handleViewCreator}
        />
      )}

      {currentPage === 'services' && (
        <ExploreServicesPage
          currentUser={authState.user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          onViewCreatorProfile={handleViewCreator}
        />
      )}

      {currentPage === 'creator-profile' && (
        <CreatorProfilePage
          creator={selectedCreator}
          currentUser={authState.user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          onSelectCreator={handleViewCreator}
        />
      )}

      {currentPage === 'notifications' && (
        <NotificationsPage
          currentUser={authState.user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          onViewCreatorProfile={handleViewCreator}
        />
      )}

      {currentPage === 'chat' && (
        <ChatPage
          currentUser={authState.user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          onViewCreatorProfile={handleViewCreator}
        />
      )}

      {currentPage === 'briefs' && (
        <ProjectBriefsPage
          currentUser={authState.user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          onViewCreatorProfile={handleViewCreator}
          onViewBrief={handleViewBrief}
        />
      )}

      {currentPage === 'umkm-profile' && (
        <UmkmProfilePage
          currentUser={authState.user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          onViewCreatorProfile={handleViewCreator}
          onViewBrief={handleViewBrief}
        />
      )}

      {currentPage === 'brief-detail' && (
        <>
          <ProjectBriefsPage
            currentUser={authState.user}
            onSignOut={handleSignOut}
            onNavigate={handleNavigate}
            onViewCreatorProfile={handleViewCreator}
            onViewBrief={handleViewBrief}
          />
          <BriefDetailPage
            brief={selectedBrief}
            currentUser={authState.user}
            onSignOut={handleSignOut}
            onNavigate={handleNavigate}
            onClose={() => handleNavigate('briefs')}
            onViewCreatorProfile={handleViewCreator}
            onEditBrief={(updated) => setSelectedBrief(updated)}
          />
        </>
      )}

      {currentPage === 'invoice' && (
        <InvoiceDetailPage
          currentUser={authState.user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          onClose={() => handleNavigate('chat')}
        />
      )}

      {currentPage === 'collaboration-room' && (
        <CollaborationRoomPage
          currentUser={authState.user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
          onViewCreatorProfile={handleViewCreator}
        />
      )}
    </div>
  );
}
