import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Maximize2, Share2, Lock, Unlock, ArrowRight, Loader2 } from 'lucide-react';

export default function PhotoView() {
  const { id } = useParams();
  const [isProtected, setIsProtected] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const photoUrl = `/p/${id}`;

  useEffect(() => {
    const checkProtection = async () => {
      try {
        const response = await fetch(`/api/check-password/${id}`);
        const data = await response.json();
        setIsProtected(data.protected);
        if (!data.protected) {
          setIsUnlocked(true);
        }
      } catch (err) {
        console.error('Failed to check protection', err);
        setIsUnlocked(true); // Fallback
      }
    };
    checkProtection();
  }, [id]);

  const verifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });

      if (response.ok) {
        setIsUnlocked(true);
      } else {
        setError('गलत पासवर्ड। फिर से कोशिश करें।');
      }
    } catch (err) {
      setError('सर्वर एरर।');
    } finally {
      setIsVerifying(false);
    }
  };

  const sharePhoto = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Shared Photo via PhotoQR',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isProtected === null) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-[#00FF00]" /></div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black flex flex-col items-center justify-center p-6 pt-24"
    >
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div 
            key="lock-screen"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="max-w-md w-full bg-[#111111] border border-[#333333] p-12 text-center space-y-8"
          >
            <div className="w-16 h-16 bg-[#00FF00]/10 rounded-full flex items-center justify-center mx-auto">
              <Lock className="text-[#00FF00]" size={28} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold uppercase tracking-tight">पासवर्ड की आवश्यकता है</h2>
              <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Entering protected area</p>
            </div>

            <form onSubmit={verifyPassword} className="space-y-4">
              <input 
                type="password" 
                placeholder="Enter Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-black border border-[#333333] px-4 font-mono text-center focus:border-[#00FF00] outline-none transition-all"
                autoFocus
              />
              {error && <p className="text-red-500 text-[10px] uppercase font-mono">{error}</p>}
              <button 
                disabled={isVerifying}
                className="w-full h-14 bg-[#00FF00] text-black font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isVerifying ? <Loader2 className="animate-spin" size={18} /> : <>Unlock <ArrowRight size={18} /></>}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-2xl w-full space-y-8"
          >
            <div className="relative group">
              <motion.div
                className="border border-[#333333] shadow-2xl rounded-sm overflow-hidden"
              >
                <img 
                  src={photoUrl} 
                  alt="Shared from PhotoQR" 
                  className="w-full h-auto max-h-[70vh] object-contain bg-[#050505]"
                />
              </motion.div>
              
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[1px] bg-[#00FF00] opacity-30 shadow-[0_0_10px_#00FF00] pointer-events-none"
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-[#1a1a1a] pt-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00FF00] flex items-center justify-center rotate-45">
                  <Camera size={20} className="text-black -rotate-45" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#00FF00] uppercase tracking-tighter">Verified MetaData</div>
                  <div className="text-lg font-bold tracking-tight">SHARED PHOTO</div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => window.open(photoUrl, '_blank')}
                  className="p-4 border border-[#333333] hover:border-[#00FF00] transition-colors group"
                  title="Full size"
                >
                  <Maximize2 size={18} className="group-hover:text-[#00FF00]" />
                </button>
                <button 
                  onClick={sharePhoto}
                  className="px-6 py-4 bg-[#FFFFFF] text-black font-bold uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-[#00FF00] transition-colors"
                >
                  Share Link <Share2 size={14} />
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] font-mono opacity-20 uppercase tracking-[0.2em]">
                This photo was shared via PhotoQR. It is not permanently stored.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
