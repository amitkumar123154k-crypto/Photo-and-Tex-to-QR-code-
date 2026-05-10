/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import PhotoView from './components/PhotoView';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans selection:bg-[#00FF00] selection:text-black">
        {/* Simple Navigation / Logo */}
        <nav className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center mix-blend-difference">
          <div className="text-xl font-bold tracking-tighter uppercase italic">
            Photo<span className="text-[#00FF00]">QR</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-mono opacity-50">
            v1.0.0 / Beta
          </div>
        </nav>

        <main className="relative z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/view/:id" element={<PhotoView />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Decorative elements */}
        <div className="fixed bottom-6 left-6 pointer-events-none opacity-20">
          <div className="text-[8px] font-mono leading-none">
            01010101 01010101<br/>
            QR_GEN_SYS_ACTIVE<br/>
            LAT: 28.6139 N / LON: 77.2090 E
          </div>
        </div>
      </div>
    </Router>
  );
}

