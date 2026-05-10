import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, Download, Camera, Check, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [mode, setMode] = useState<'photo' | 'text'>('photo');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError('Photo is too big (max 5MB)');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setQrUrl(null);
      setError(null);
    }
  };

  const generateTextQR = () => {
    if (!textInput.trim()) {
      setError('Please enter some text or URL / कृपया टेक्स्ट लिखें');
      return;
    }
    setQrUrl(textInput);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00FF00', '#FFFFFF']
    });
  };

  const uploadPhoto = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('photo', file);
    if (password) {
      formData.append('password', password);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setQrUrl(data.url);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00FF00', '#FFFFFF', '#333333']
      });
    } catch (err) {
      setError('Could not upload photo. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `photo-qr-${Date.now()}.png`;
        link.href = url;
        link.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-12 overflow-hidden"
    >
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Branding & Info */}
        <div className="space-y-8">
          <motion.div
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            className="space-y-4"
          >
            <h1 className="text-7xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              {mode === 'photo' ? (
                <>अपनी फोटो का <br/><span className="text-[#00FF00]">QR कोड</span></>
              ) : (
                <>टेक्स्ट को <br/><span className="text-[#00FF00]">QR कोड</span></>
              )}
              <br/>बनाएं
            </h1>
            <p className="text-sm font-mono opacity-60 max-w-sm leading-relaxed">
              {mode === 'photo' 
                ? 'Upload any photo and instantly generate a unique QR code. Anyone who scans it will see your photo. सिर्फ फोटो अपलोड करें और स्कैन करने के लिए तैयार हो जाएं।'
                : 'Convert any text or web link into a QR code instantly. किसी भी टेक्स्ट या लिंक को तुरंत QR कोड में बदलें।'
              }
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Mode Switcher */}
            <div className="flex border-b border-[#333333] mb-8">
              <button 
                onClick={() => { setMode('photo'); setQrUrl(null); setError(null); }}
                className={`pb-4 px-6 text-[10px] uppercase tracking-widest font-bold transition-all ${mode === 'photo' ? 'text-[#00FF00] border-b-2 border-[#00FF00]' : 'opacity-40 hover:opacity-100'}`}
              >
                Photo Mode
              </button>
              <button 
                onClick={() => { setMode('text'); setQrUrl(null); setError(null); }}
                className={`pb-4 px-6 text-[10px] uppercase tracking-widest font-bold transition-all ${mode === 'text' ? 'text-[#00FF00] border-b-2 border-[#00FF00]' : 'opacity-40 hover:opacity-100'}`}
              >
                Text Mode
              </button>
            </div>

            {mode === 'photo' ? (
              <div className="space-y-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="hidden" 
                  ref={fileInputRef}
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative w-full h-16 bg-[#F5F5F5] text-black font-bold uppercase tracking-widest overflow-hidden transition-all hover:pr-12"
                >
                  <div className="absolute inset-0 bg-[#00FF00] translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {file ? 'Change Photo' : 'Select Photo'} 
                    <Upload size={18} />
                  </span>
                  <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                </button>

                {file && !qrUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <input 
                        type="password" 
                        placeholder="Set Password (Optional / वैकल्पिक)" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 bg-black border border-[#333333] px-4 font-mono text-xs focus:border-[#00FF00] outline-none transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity">
                        <Check size={14} />
                      </div>
                    </div>

                    <motion.button
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={uploadPhoto}
                      disabled={isUploading}
                      className="w-full h-16 border-2 border-[#00FF00] text-[#00FF00] font-bold uppercase tracking-widest hover:bg-[#00FF00] hover:text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>उम्मीद रखें... <Loader2 className="animate-spin" size={18} /></>
                      ) : (
                        <>Generate QR <Check size={18} /></>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea 
                  placeholder="Enter text or paste URL here... (उदा. https://google.com)"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full h-32 bg-black border border-[#333333] p-4 font-mono text-sm focus:border-[#00FF00] outline-none transition-colors resize-none"
                />
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateTextQR}
                  className="w-full h-16 bg-[#00FF00] text-black font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                >
                  Create Text QR <Check size={18} />
                </motion.button>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-500 font-mono text-xs uppercase animate-pulse">{error}</p>
          )}
        </div>

        {/* Right Side: Preview & QR */}
        <div className="relative aspect-square bg-[#111111] border border-[#333333] flex items-center justify-center group overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#F5F5F5 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <AnimatePresence mode="wait">
            {!preview && !qrUrl && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 text-[#333333]"
              >
                <Camera size={64} strokeWidth={1} />
                <div className="text-[10px] font-mono uppercase tracking-[0.3em]">No Image Selected</div>
              </motion.div>
            )}

            {preview && !qrUrl && (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full h-full p-8"
              >
                <div className="w-full h-full relative">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover grayscale brightness-75 contrast-125" />
                  <div className="absolute inset-0 border-4 border-[#00FF00] opacity-50 mix-blend-overlay"></div>
                </div>
              </motion.div>
            )}

            {qrUrl && (
              <motion.div 
                key="qr"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                className="flex flex-col items-center gap-8"
              >
                <div className="p-4 bg-white rounded-sm shadow-[0_0_50px_rgba(0,255,0,0.2)]">
                  <QRCodeSVG 
                    id="qr-code-svg"
                    value={qrUrl} 
                    size={220} 
                    level="H"
                    includeMargin={false}
                    fgColor="#000000"
                  />
                </div>
                <button 
                  onClick={downloadQR}
                  className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest hover:text-[#00FF00] transition-colors"
                >
                  Download PNG <Download size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner accents */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#333333]"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#333333]"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#333333]"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#333333]"></div>
        </div>
      </div>
      
      {/* Footer Text */}
      <div className="mt-12 text-[10px] font-mono opacity-20 uppercase tracking-[0.5em] text-center max-w-xl">
        Designed for utility / Optimized for clarity / Non-persistent storage active
      </div>
    </motion.div>
  );
}
