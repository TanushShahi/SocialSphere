import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  Check, 
  Copy, 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  ShieldCheck,
  Server
} from 'lucide-react';
import { supabaseService, SUPABASE_SQL_SCHEMA } from '../../api/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = supabaseService.getConfig();
      setUrl(cfg.url);
      setKey(cfg.key);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      supabaseService.saveConfig(url, key);
      const res = await supabaseService.testConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isConfigured = supabaseService.isConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-zinc-950/95 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.15)] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Supabase Cloud Database
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  PostgreSQL
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Authoritative cross-device sync & accounts</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="mt-5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isConfigured ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-cyan-400'}`} />
            <span className="text-xs font-medium text-zinc-300">
              {isConfigured ? 'Connected to Custom Supabase Project' : 'Using Multi-Device Cloud Sync'}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {isConfigured ? 'Realtime Active' : 'Zero-Config Mode'}
          </span>
        </div>

        {/* Credentials Form */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Supabase Project URL
            </label>
            <input 
              type="text" 
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Supabase Public Anon Key
            </label>
            <input 
              type="password" 
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
            />
          </div>

          {/* Test connection result banner */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              testResult.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {testResult.success ? (
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{testResult.message}</p>
                {testResult.count !== undefined && (
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Found {testResult.count} registered accounts in profiles table.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={handleSaveAndTest}
              disabled={testing || (!url.trim() && !key.trim())}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5" />
                  Save & Test Supabase
                </>
              )}
            </button>

            <button
              onClick={handleCopySchema}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-semibold text-xs transition-all flex items-center justify-center gap-2"
              title="Copy the SQL tables to paste in Supabase SQL editor"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy SQL Schema
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Help Guide */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-[11px] text-zinc-400">
          <p className="font-semibold text-zinc-300">How Supabase powers SocialSphere:</p>
          <ul className="list-disc pl-4 space-y-1 text-zinc-400">
            <li>
              <strong className="text-zinc-300">profiles:</strong> Stores usernames & accounts with instant case-insensitive search (<code className="text-emerald-400">ilike</code>).
            </li>
            <li>
              <strong className="text-zinc-300">follows:</strong> Real-time follow counts and follower listings across devices.
            </li>
            <li>
              <strong className="text-zinc-300">messages:</strong> Direct live chat powered by PostgreSQL Realtime subscriptions.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
