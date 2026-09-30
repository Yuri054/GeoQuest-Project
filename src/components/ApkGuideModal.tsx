import React, { useState } from 'react';
import { Smartphone, Copy, Check, Terminal, FileCode, Play, Sparkles, ExternalLink, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'capacitor' | 'bubblewrap' | 'webapk'>('capacitor');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { isInstallable, install } = usePWAInstall();

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const capacitorCommands = [
    {
      title: 'Step 1: Build the production web bundle',
      cmd: 'npm run build',
      desc: 'Compiles all React + Vite assets into the /dist directory.',
    },
    {
      title: 'Step 2: Add Android native project (first time only)',
      cmd: 'npx cap add android',
      desc: 'Creates the full Android Studio project scaffold inside /android.',
    },
    {
      title: 'Step 3: Sync web assets & configuration to Android',
      cmd: 'npx cap sync android',
      desc: 'Copies icons, splash screen, and web bundles to the native Android source.',
    },
    {
      title: 'Step 4: Compile the standalone debug APK via Gradle',
      cmd: 'cd android && ./gradlew assembleDebug',
      desc: 'Assembles your APK without opening Android Studio. Output file: android/app/build/outputs/apk/debug/app-debug.apk',
    },
    {
      title: 'Optional: Open directly in Android Studio',
      cmd: 'npx cap open android',
      desc: 'Launches Android Studio to test on connected Android phones or emulators with 1 click.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[88vh] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">APK Build &amp; Export Center</h3>
              <p className="text-[11px] text-slate-400 truncate">Compile &amp; deploy your Android APK</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-4 pt-2.5 border-b border-slate-800/80 flex items-center gap-2 text-[11px] shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`pb-2 px-2 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'capacitor'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Capacitor APK
          </button>

          <button
            onClick={() => setActiveTab('webapk')}
            className={`pb-2 px-2 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'webapk'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. 1-Tap WebAPK
          </button>

          <button
            onClick={() => setActiveTab('bubblewrap')}
            className={`pb-2 px-2 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'bubblewrap'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Bubblewrap CLI
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'capacitor' && (
            <>
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  The project has been fully configured with <strong>@capacitor/core</strong>, <strong>@capacitor/android</strong>, and <strong>capacitor.config.ts</strong>. You can compile a signed release or debug APK in seconds.
                </p>
              </div>

              <div className="space-y-3">
                {capacitorCommands.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{item.title}</span>
                      <button
                        onClick={() => copyToClipboard(item.cmd, idx)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition"
                        title="Copy command"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-emerald-400 text-xs">
                      <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="select-all">{item.cmd}</span>
                    </div>

                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Output Location Notice */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-slate-300">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-sky-400" />
                  <span>Generated APK Location:</span>
                </p>
                <code className="block p-2 rounded bg-slate-900 font-mono text-sky-300 text-[11px] select-all">
                  android/app/build/outputs/apk/debug/app-debug.apk
                </code>
                <p className="text-[11px] text-slate-400 mt-1">
                  You can transfer this <code className="text-slate-300 font-mono">app-debug.apk</code> to any Android smartphone via USB or Google Drive and tap to install directly!
                </p>
              </div>
            </>
          )}

          {activeTab === 'webapk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/40 text-sky-200">
                <h4 className="font-bold text-white text-sm mb-1">Instant Android WebAPK Installation</h4>
                <p className="text-xs leading-relaxed text-slate-300">
                  Android Chrome generates a real native APK directly through Google Play Services when you tap &quot;Install&quot; on a compliant PWA. It creates a dedicated launcher icon in your app drawer with standalone viewport, offline caching, and native notifications.
                </p>
              </div>

              {isInstallable ? (
                <button
                  onClick={install}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-950/50 transition active:scale-98"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Install WebAPK on Android Device Now</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                  <p>Open this application on your Android phone in Google Chrome to trigger the native 1-tap APK installation banner!</p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <h5 className="font-bold text-slate-200">Manual Chrome Android Steps:</h5>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
                  <li>Open this URL in Google Chrome on your Android smartphone.</li>
                  <li>Tap the three vertical dots (<strong>⋮</strong>) in the top-right menu.</li>
                  <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                  <li>Android automatically packages and compiles the WebAPK onto your device!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'bubblewrap' && (
            <div className="space-y-3">
              <p className="text-slate-300 leading-relaxed">
                Google&apos;s official <strong>Bubblewrap CLI</strong> lets you package any PWA into a signed Google Play Store APK/AAB from the command line without opening Android Studio.
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">1. Install Bubblewrap CLI</span>
                  <button
                    onClick={() => copyToClipboard('npm i -g @bubblewrap/cli', 101)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]"
                  >
                    {copiedIndex === 101 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 101 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 rounded bg-slate-900 font-mono text-emerald-400 text-xs">
                  npm i -g @bubblewrap/cli
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">2. Initialize APK from Manifest</span>
                  <button
                    onClick={() => copyToClipboard('bubblewrap init --manifest=https://your-domain.app/manifest.webmanifest', 102)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]"
                  >
                    {copiedIndex === 102 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 102 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 rounded bg-slate-900 font-mono text-emerald-400 text-xs select-all">
                  bubblewrap init --manifest=./dist/manifest.webmanifest
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">3. Build Signed APK</span>
                  <button
                    onClick={() => copyToClipboard('bubblewrap build', 103)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]"
                  >
                    {copiedIndex === 103 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 103 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 rounded bg-slate-900 font-mono text-emerald-400 text-xs">
                  bubblewrap build
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0 text-xs text-slate-400">
          <span>Capacitor Config: <code className="text-slate-200 font-mono">capacitor.config.ts</code></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
