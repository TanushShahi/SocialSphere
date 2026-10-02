import React, { useEffect, useRef, useState } from 'react';
import { 
   Phone, 
   PhoneOff, 
   Video, 
   VideoOff, 
   Mic, 
   MicOff, 
   ShieldCheck,
   Sparkles
 } from 'lucide-react';
 import { CallSession } from '../../types';

interface CallModalProps {
  session: CallSession | null;
  onEndCall: () => void;
  onAcceptCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  session,
  onEndCall,
  onAcceptCall
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const ringtoneTimerRef = useRef<number | null>(null);

  // Call duration counter
  useEffect(() => {
    let interval: number;
    if (session?.status === 'connected') {
      interval = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [session?.status]);

  // Audio ringtone synthesizer for outgoing and incoming calls
  useEffect(() => {
    if (session?.status === 'incoming' || session?.status === 'outgoing') {
      const playBeep = () => {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(session.status === 'incoming' ? 520 : 440, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.6);
        } catch {}
      };

      playBeep();
      ringtoneTimerRef.current = window.setInterval(playBeep, 2500);
    } else {
      if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    }

    return () => {
      if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    };
  }, [session?.status]);

  // Handle local media setup when connected
  useEffect(() => {
    if (!session || session.status !== 'connected') return;

    let isCancelled = false;

    async function setupLocalMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: session?.callType === 'video',
          audio: true
        });
        if (isCancelled) return;
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.warn('Camera/mic unavailable, creating fallback synthetic stream:', e);
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#09090b';
          ctx.fillRect(0, 0, 640, 480);
          ctx.fillStyle = '#ec4899';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('Social Sphere Camera', 180, 240);
        }
        const fallbackStream = canvas.captureStream ? canvas.captureStream(15) : new MediaStream();
        localStreamRef.current = fallbackStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = fallbackStream;
        }
      }
    }

    setupLocalMedia();

    return () => {
      isCancelled = true;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [session?.status, session?.callType]);

  if (!session || session.status === 'idle') return null;

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoDisabled;
      });
    }
    setIsVideoDisabled(!isVideoDisabled);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isVideo = session.callType === 'video';

  return (
    <div className="fixed inset-0 z-50 bg-[#07070b]/95 backdrop-blur-2xl flex flex-col items-center justify-between p-6 select-none animate-fade-in text-white overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse delay-1000"></div>

      {/* 1. Top Header Encrypted Pill */}
      <div className="relative z-10 w-full max-w-xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-semibold text-zinc-300">
            Sphere End-to-End {isVideo ? 'Spatial Video' : 'Audio Stream'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        {session.status === 'connected' && (
          <span className="text-xs font-mono font-bold px-3.5 py-1.5 bg-white/[0.05] border border-white/10 rounded-full text-pink-400 backdrop-blur-md shadow-lg">
            {formatTimer(callDuration)}
          </span>
        )}
      </div>

      {/* 2. Middle Content Area */}
      <div className="relative z-10 flex-1 w-full max-w-xl flex flex-col items-center justify-center my-6">
        {session.status === 'incoming' && (
          /* Incoming Call Screen */
          <div className="flex flex-col items-center text-center space-y-6 animate-scale-in">
            <div className="relative">
              {/* Radiating soundwave rings */}
              <div className="absolute -inset-8 rounded-full border border-pink-500/30 animate-ping"></div>
              <div className="absolute -inset-4 bg-gradient-cosmic rounded-full blur-xl opacity-60 animate-pulse"></div>
              <div className="relative w-36 h-36 rounded-full p-[3px] bg-gradient-cosmic shadow-2xl">
                <img
                  src={session.partner.avatar}
                  alt={session.partner.name}
                  className="w-full h-full rounded-full object-cover border-4 border-black"
                />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">{session.partner.name}</h2>
              <p className="text-xs text-zinc-400 mt-1 font-mono">@{session.partner.username}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Incoming {isVideo ? 'Spatial Video Call...' : 'Audio Stream...'}
              </div>
            </div>
          </div>
        )}

        {session.status === 'outgoing' && (
          /* Outgoing Call Screen */
          <div className="flex flex-col items-center text-center space-y-6 animate-scale-in">
            <div className="relative">
              <div className="absolute -inset-6 rounded-full border border-purple-500/20 animate-pulse"></div>
              <div className="absolute -inset-4 bg-gradient-cosmic rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative w-36 h-36 rounded-full p-[3px] bg-white/20 shadow-2xl">
                <img
                  src={session.partner.avatar}
                  alt={session.partner.name}
                  className="w-full h-full rounded-full object-cover border-4 border-black"
                />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">{session.partner.name}</h2>
              <p className="text-xs text-zinc-400 mt-1 font-mono">@{session.partner.username}</p>
              <p className="text-xs text-pink-400 mt-3 font-semibold animate-pulse">
                Calling across the Sphere...
              </p>
            </div>
          </div>
        )}

        {session.status === 'connected' && (
          /* Connected Active Call Screen */
          <div className="w-full h-full max-h-[520px] flex flex-col items-center justify-center relative rounded-3xl overflow-hidden aerogel-card-glow border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.85)]">
            {isVideo ? (
              /* Video Stream Area */
              <div className="w-full h-full relative flex items-center justify-center bg-black/80">
                {/* Simulated / Remote Video View */}
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative mb-4">
                    <div className="absolute -inset-3 bg-gradient-cosmic rounded-full blur-md opacity-40"></div>
                    <img
                      src={session.partner.avatar}
                      alt={session.partner.name}
                      className="w-28 h-28 rounded-full object-cover border-2 border-white/20 shadow-2xl relative z-10"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-white">{session.partner.name}</h3>
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Connected
                  </p>
                </div>

                {/* Local Camera Picture-in-Picture */}
                <div className="absolute bottom-4 right-4 w-36 h-48 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/90 backdrop-blur-md">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isVideoDisabled ? 'hidden' : 'block'}`}
                  />
                  {isVideoDisabled && (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-950 text-[10px]">
                      <VideoOff className="w-6 h-6 mb-1 text-zinc-600" />
                      Camera off
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Audio Call Waveform Area */
              <div className="flex flex-col items-center text-center space-y-6 p-8">
                <div className="relative">
                  <div className="absolute -inset-6 bg-pink-500/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-32 h-32 rounded-full p-[2.5px] bg-gradient-cosmic shadow-2xl">
                    <img
                      src={session.partner.avatar}
                      alt={session.partner.name}
                      className="w-full h-full rounded-full object-cover border-4 border-black"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{session.partner.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-1">@{session.partner.username}</p>
                </div>

                {/* Animated Celestial Soundwave Equalizer */}
                <div className="flex items-center gap-1.5 h-12 pt-3">
                  {[35, 65, 95, 55, 80, 100, 75, 45, 90, 60, 40, 85, 30].map((height, i) => (
                    <span
                      key={i}
                      style={{ height: `${height}%`, animationDelay: `${i * 0.08}s` }}
                      className="w-1.5 bg-gradient-to-t from-pink-500 via-rose-400 to-amber-300 rounded-full animate-pulse shadow-sm shadow-pink-500/40"
                    ></span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Action Controls - Spatial Capsule Dock */}
      <div className="relative z-10 w-full max-w-md pb-4 flex items-center justify-center">
        <div className="spatial-dock px-6 py-3 flex items-center gap-6">
          {session.status === 'incoming' ? (
            /* Incoming Buttons: Decline / Accept */
            <>
              <button
                onClick={onEndCall}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-14 h-14 rounded-full bg-rose-600/90 hover:bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-600/50 transition-all group-hover:scale-110 active:scale-95 text-white">
                  <PhoneOff className="w-6 h-6" />
                </div>
                <span className="text-[11px] text-zinc-400 font-medium">Decline</span>
              </button>

              <button
                onClick={onAcceptCall}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-600/90 hover:bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-600/50 transition-all group-hover:scale-110 active:scale-95 text-white animate-bounce">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">Accept</span>
              </button>
            </>
          ) : (
            /* Active / Outgoing Buttons: Mute, Camera, End */
            <>
              <button
                onClick={toggleMute}
                className={`p-3.5 rounded-full transition-all active:scale-95 ${
                  isMuted
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/20'
                    : 'bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {isVideo && (
                <button
                  onClick={toggleVideo}
                  className={`p-3.5 rounded-full transition-all active:scale-95 ${
                    isVideoDisabled
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/20'
                      : 'bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10'
                  }`}
                  title={isVideoDisabled ? 'Turn camera on' : 'Turn camera off'}
                >
                  {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={onEndCall}
                className="w-13 h-13 p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-all hover:scale-105 active:scale-95"
                title="Hang up"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
