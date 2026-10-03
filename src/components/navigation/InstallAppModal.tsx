import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, CheckCircle, Sparkles, Share, PlusSquare } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-fade-in text-white"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md aerogel-card-glow rounded-3xl p-6 sm:p-8 border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col items-center text-center space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Luminous Logo Badge */}
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-cosmic rounded-3xl blur-xl opacity-60 animate-pulse"></div>
          <div className="relative w-20 h-20 rounded-3xl p-[2px] bg-gradient-cosmic shadow-2xl overflow-hidden">
            <img src="./icon-192.png" alt="Social Sphere App Icon" className="w-full h-full object-cover rounded-3xl" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black tracking-tight text-gradient-cosmic flex items-center justify-center gap-1.5">
            Download Social Sphere
            <Sparkles className="w-4 h-4 text-pink-400" />
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed max-w-xs mx-auto">
            Install Social Sphere on your Phone, Tablet, or PC as a fast, standalone desktop & mobile application.
          </p>
        </div>

        {/* Device Badges */}
        <div className="grid grid-cols-2 gap-3 w-full text-xs">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-pink-400 flex-shrink-0" />
            <div className="text-left">
              <p className="font-bold text-white">Mobile & Tablet</p>
              <p className="text-[10px] text-zinc-400">Android & iOS</p>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
            <Monitor className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <div className="text-left">
              <p className="font-bold text-white">Desktop PC</p>
              <p className="text-[10px] text-zinc-400">Windows & Mac</p>
            </div>
          </div>
        </div>

        {isInstalled ? (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold py-2">
            <CheckCircle className="w-5 h-5" />
            <span>Social Sphere is already installed on your device!</span>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="w-full py-3 bg-gradient-cosmic hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/30 transition-all active:scale-95 text-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Install Standalone App Now</span>
          </button>
        ) : isIOS ? (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-zinc-300 space-y-2 text-left">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Share className="w-4 h-4 text-cyan-400" />
              How to install on iPhone / iPad:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400">
              <li>Tap the <strong className="text-white">Share</strong> button (box with upward arrow) in Safari.</li>
              <li>Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-pink-400" />.</li>
              <li>Launch directly from your home screen!</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3 w-full">
            <button
              onClick={() => {
                alert('To install on Desktop / Android:\n\n1. Look for the Install icon (⊞) in your browser address bar\n2. Or click the browser menu (⋮) -> \"Install Social Sphere\"');
              }}
              className="w-full py-3 bg-gradient-cosmic hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/30 transition-all active:scale-95 text-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Install to Desktop / Phone</span>
            </button>
            <p className="text-[10px] text-zinc-500">
              Works directly in Chrome, Edge, Brave, Samsung Internet & Safari.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
