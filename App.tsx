import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import Learning from './components/Learning';
import Community from './components/Community';
import HealthProfile from './components/HealthProfile';
import SmartConsultation from './components/SmartConsultation';
import ARDiagnosis from './components/ARDiagnosis';
import AIButler from './components/AIButler';
import Auth from './components/Auth';
import { api } from './services/api';
import { AppView, UserProfile } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await api.getMe(token);
          setUser(userData);
        } catch (e) {
          console.error("Auth failed", e);
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const handleLogin = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    if (user && user.id) {
        localStorage.removeItem(`ar_intro_animated_${user.id}`);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) return <div>Loading...</div>;

  if (!token || !user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Home userProfile={userProfile} onChangeView={setCurrentView} />;
      case AppView.LEARNING:
        return <Learning />;
      case AppView.AI_DIAGNOSIS:
        return <ARDiagnosis userId={user?.id} />;
      case AppView.COMMUNITY:
        return <Community onChangeView={setCurrentView} />;
      case AppView.PROFILE:
      case AppView.HEALTH_PROFILE:
        return (
          <HealthProfile 
            onProfileUpdate={setUserProfile} 
            token={token}
            user={user}
            onLogout={handleLogout}
          />
        );
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
