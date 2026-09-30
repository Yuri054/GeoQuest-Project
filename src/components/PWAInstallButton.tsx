import React, { useState } from 'react';
import { Download, CheckCircle, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
        <CheckCircle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installed App</span>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition active:scale-95"
        title="Install Android WebAPK or Desktop App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install APK</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left">
              <h3 className="text-base font-bold text-slate-100">Install RealmQuest on iOS</h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-300">
                1. Tap the <strong className="text-sky-400">Share</strong> button in your Safari navigation bar.<br />
                2. Scroll down and choose <strong className="text-sky-400">Add to Home Screen</strong>.<br />
                3. The app will open standalone in full screen with offline support!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
