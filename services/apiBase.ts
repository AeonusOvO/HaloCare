const PRODUCTION_API_BASE = 'https://www.yunmai.life/api';

export const getApiBase = () => {
  const configured = (import.meta as any).env?.VITE_API_BASE;
  if (configured) return configured.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const capacitor = (window as any).Capacitor;
    const isNative = capacitor?.isNativePlatform?.() || ['capacitor:', 'ionic:'].includes(window.location.protocol);
    if (isNative) return PRODUCTION_API_BASE;
  }

  return '/api';
};
