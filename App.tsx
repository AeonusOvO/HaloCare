import React, { useState } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import Learning from './components/Learning';
import Community from './components/Community';
import HealthProfile from './components/HealthProfile';
import SmartConsultation from './components/SmartConsultation';
import ARDiagnosis from './components/ARDiagnosis';
import AIButler from './components/AIButler';
import { AppView, UserProfile } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Home userProfile={userProfile} onChangeView={setCurrentView} />;
      case AppView.LEARNING:
        return <Learning />;
      case AppView.AI_DIAGNOSIS:
        return <ARDiagnosis />;
      case AppView.COMMUNITY:
        return <Community onChangeView={setCurrentView} />;
      case AppView.PROFILE:
        // Profile tab currently reuses AI Butler or Health Profile? 
        // Based on user request "我的" (Profile), usually contains settings/user info. 
        // For now, let's point to Health Profile or a placeholder User Center.
        // Let's reuse HealthProfile for "My Health" aspect as per previous design, 
        // or maybe AI Butler was there? No, Layout had "BUTLER".
        // Let's assume PROFILE tab shows the Health Profile for now.
        return <HealthProfile onProfileUpdate={setUserProfile} />;
        
      // Sub-views / Legacy Views
      case AppView.HEALTH_PROFILE:
        return <HealthProfile onProfileUpdate={setUserProfile} />;
      case AppView.CONSULTATION:
        return <SmartConsultation />;
      case AppView.BUTLER:
        return <AIButler />;
        
      default:
        return <Home userProfile={userProfile} onChangeView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;