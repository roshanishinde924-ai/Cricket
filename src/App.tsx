/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  User, 
  Cpu, 
  History, 
  Play, 
  RotateCcw, 
  ChevronRight,
  Info,
  Zap,
  Shield,
  ArrowUpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateCommentary } from './services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ShotType = 'Defensive' | 'Aggressive' | 'Lofted';

interface BallRecord {
  over: number;
  ball: number;
  shot: ShotType;
  runs: number;
  isWicket: boolean;
  commentary: string;
}

export default function App() {
  // Game State
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);
  const [target, setTarget] = useState(45);
  const [maxOvers, setMaxOvers] = useState(5);
  const [history, setHistory] = useState<BallRecord[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommentary, setLastCommentary] = useState("Welcome to the match! 45 needed from 30 balls.");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const playBall = async (shot: ShotType) => {
    if (isGameOver || isProcessing) return;

    setIsProcessing(true);
    
    // Logic for outcome
    let outcomeRuns = 0;
    let isWicket = false;
    const rand = Math.random();

    if (shot === 'Defensive') {
      // High chance of 0 or 1, very low wicket chance
      if (rand < 0.6) outcomeRuns = 0;
      else if (rand < 0.95) outcomeRuns = 1;
      else isWicket = true;
    } else if (shot === 'Aggressive') {
      // Chance of 4 or 6, but higher wicket risk
      if (rand < 0.3) outcomeRuns = 0;
      else if (rand < 0.5) outcomeRuns = 1;
      else if (rand < 0.7) outcomeRuns = 4;
      else if (rand < 0.85) outcomeRuns = 6;
      else isWicket = true;
    } else if (shot === 'Lofted') {
      // High risk, high reward
      if (rand < 0.4) outcomeRuns = 0;
      else if (rand < 0.6) outcomeRuns = 4;
      else if (rand < 0.8) outcomeRuns = 6;
      else isWicket = true;
    }

    const currentOver = Math.floor(balls / 6);
    const currentBall = (balls % 6) + 1;
    const newRuns = runs + outcomeRuns;
    const newWickets = wickets + (isWicket ? 1 : 0);
    const newBalls = balls + 1;

    const scoreStr = `${newRuns}/${newWickets} (${Math.floor(newBalls / 6)}.${newBalls % 6})`;
    
    // Generate AI Commentary
    const outcomeText = isWicket ? "OUT!" : `${outcomeRuns} runs`;
    const commentary = await generateCommentary(shot, outcomeText, outcomeRuns, isWicket, scoreStr);

    const record: BallRecord = {
      over: currentOver,
      ball: currentBall,
      shot,
      runs: outcomeRuns,
      isWicket,
      commentary
    };

    setHistory(prev => [...prev, record]);
    setRuns(newRuns);
    setWickets(newWickets);
    setBalls(newBalls);
    setLastCommentary(commentary);

    // Check Win/Loss
    if (newRuns >= target) {
      setIsGameOver(true);
      setGameResult('won');
    } else if (newWickets >= 10 || newBalls >= maxOvers * 6) {
      setIsGameOver(true);
      setGameResult('lost');
    }

    setIsProcessing(false);
  };

  const resetGame = () => {
    setRuns(0);
    setWickets(0);
    setBalls(0);
    setHistory([]);
    setIsGameOver(false);
    setGameResult(null);
    setLastCommentary("New match started! 45 needed from 30 balls.");
  };

  const oversDisplay = `${Math.floor(balls / 6)}.${balls % 6}`;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Trophy className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Cricket Simulator Pro</h1>
              <p className="text-xs text-white/40 font-mono uppercase tracking-widest">v1.0.4 // AI-POWERED</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={resetGame}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
              title="Reset Match"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Scoreboard & Controls */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Scoreboard Card */}
          <section className="bg-[#141414] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={120} className="text-emerald-500" />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest mb-1 block">Current Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-bold tracking-tighter">{runs}</span>
                    <span className="text-4xl text-white/20 font-light">/</span>
                    <span className="text-4xl font-medium text-white/60">{wickets}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-white/40 uppercase tracking-widest mb-1 block">Overs</span>
                  <span className="text-4xl font-bold font-mono tracking-tight">{oversDisplay}</span>
                  <span className="text-white/20 ml-1">/ {maxOvers}.0</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Target</span>
                  <span className="text-2xl font-bold">{target}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Required</span>
                  <span className="text-2xl font-bold text-emerald-400">{Math.max(0, target - runs)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Controls */}
          <section className="space-y-4">
            <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest px-2">Select Your Shot</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ShotButton 
                label="Defensive" 
                icon={<Shield size={20} />}
                description="Safe, low risk of wicket"
                onClick={() => playBall('Defensive')}
                disabled={isGameOver || isProcessing}
                variant="safe"
              />
              <ShotButton 
                label="Aggressive" 
                icon={<Zap size={20} />}
                description="Balanced risk & reward"
                onClick={() => playBall('Aggressive')}
                disabled={isGameOver || isProcessing}
                variant="balanced"
              />
              <ShotButton 
                label="Lofted" 
                icon={<ArrowUpCircle size={20} />}
                description="High risk, maximum reward"
                onClick={() => playBall('Lofted')}
                disabled={isGameOver || isProcessing}
                variant="risky"
              />
            </div>
          </section>

          {/* Commentary Box */}
          <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-6 bg-[#0A0A0A] px-3 flex items-center gap-2">
              <Zap size={14} className="text-emerald-500" />
              <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Live Commentary</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p 
                key={lastCommentary}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-medium leading-relaxed text-emerald-50"
              >
                {isProcessing ? "The bowler is running in..." : lastCommentary}
              </motion.p>
            </AnimatePresence>
          </section>
        </div>

        {/* Right Column: History & Stats */}
        <div className="lg:col-span-5 flex flex-col h-[calc(100vh-12rem)]">
          <div className="bg-[#141414] border border-white/5 rounded-3xl flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-2">
                <History size={18} className="text-white/40" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Match Timeline</h2>
              </div>
              <span className="text-[10px] font-mono text-white/20">{history.length} Deliveries</span>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
            >
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4">
                  <Play size={48} strokeWidth={1} />
                  <p className="text-sm font-mono uppercase tracking-widest">Awaiting first ball</p>
                </div>
              ) : (
                history.map((ball, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-4 rounded-2xl border transition-all",
                      ball.isWicket ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/5"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono text-white/40">OVER {ball.over}.{ball.ball}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        ball.isWicket ? "bg-red-500 text-white" : "bg-white/10 text-white/60"
                      )}>
                        {ball.isWicket ? "Wicket" : `${ball.runs} Runs`}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 leading-snug italic">"{ball.commentary}"</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#141414] border border-white/10 rounded-[2.5rem] p-12 max-w-md w-full text-center shadow-2xl"
            >
              <div className={cn(
                "w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-8",
                gameResult === 'won' ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-red-500 shadow-lg shadow-red-500/20"
              )}>
                <Trophy className="text-black w-12 h-12" />
              </div>
              
              <h2 className="text-4xl font-bold tracking-tight mb-2">
                {gameResult === 'won' ? "Victory!" : "Match Over"}
              </h2>
              <p className="text-white/40 mb-8">
                {gameResult === 'won' 
                  ? `Incredible chase! You reached the target of ${target} with ${10 - wickets} wickets in hand.`
                  : `A tough loss. You finished at ${runs}/${wickets} in ${oversDisplay} overs.`}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 rounded-2xl p-4">
                  <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Total Runs</span>
                  <span className="text-2xl font-bold">{runs}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Wickets</span>
                  <span className="text-2xl font-bold">{wickets}</span>
                </div>
              </div>

              <button 
                onClick={resetGame}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-white/20 text-[10px] font-mono uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span>Engine: Gemini 3 Flash</span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <span>Mode: Interactive Simulator</span>
          </div>
          <p>© 2026 Cricket Simulator Pro // All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}

interface ShotButtonProps {
  label: string;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
  disabled: boolean;
  variant: 'safe' | 'balanced' | 'risky';
}

function ShotButton({ label, icon, description, onClick, disabled, variant }: ShotButtonProps) {
  const variants = {
    safe: "hover:border-blue-500/50 hover:bg-blue-500/5",
    balanced: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
    risky: "hover:border-orange-500/50 hover:bg-orange-500/5"
  };

  const iconColors = {
    safe: "text-blue-400",
    balanced: "text-emerald-400",
    risky: "text-orange-400"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex flex-col items-start p-5 rounded-2xl border border-white/5 bg-white/2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant]
      )}
    >
      <div className={cn("mb-3 p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors", iconColors[variant])}>
        {icon}
      </div>
      <span className="font-bold text-sm mb-1">{label}</span>
      <span className="text-[10px] text-white/40 leading-tight">{description}</span>
      <ChevronRight size={14} className="absolute top-5 right-5 text-white/10 group-hover:text-white/40 transition-colors" />
    </button>
  );
}
