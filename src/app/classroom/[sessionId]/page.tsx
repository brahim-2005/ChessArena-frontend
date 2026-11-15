'use client';

import { useState } from 'react';
import Link from 'next/link';
import ChessBoard from '@/components/ChessBoard';
import { createGame, GameEngine } from '@/lib/chess/game';
import { Video, Mic, MicOff, Camera, CameraOff, Share2, MessageSquare, ArrowLeft, Users, Send } from 'lucide-react';

export default function VirtualClassroomPage() {
  const [engine] = useState<GameEngine>(() => createGame());
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'GM David Vance', text: 'Welcome to today\'s session! Let us look at the Caro-Kann Defense.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, { sender: 'You', text: chatInput }]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 flex flex-col">
      {/* Top Bar */}
      <header className="bg-background-secondary rounded-2xl p-4 border border-text-secondary/15 flex items-center justify-between mb-4 shadow-card">
        <div className="flex items-center space-x-3">
          <Link href="/sessions/history" className="p-2 bg-background-tertiary rounded-xl text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold">Virtual Chess Classroom — GM David Vance</h1>
            <p className="text-xs text-text-secondary">Shared Interactive Board · Secure WebRTC Session</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE SESSION
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left/Center: Shared Interactive Chessboard */}
        <div className="lg:col-span-2 bg-background-secondary rounded-2xl p-6 border border-text-secondary/15 flex flex-col items-center justify-center shadow-card">
          <div className="w-full max-w-lg">
            <ChessBoard
              engine={engine}
              onReset={() => engine.reset()}
              isWhitePlayer={true}
              isHotSeat={true}
            />
          </div>
        </div>

        {/* Right Sidebar: Video Streams & Chat */}
        <div className="space-y-4 flex flex-col">
          {/* Video Feeds */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background-secondary rounded-xl p-3 border border-text-secondary/15 aspect-video flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="flex justify-between items-center z-20">
                <span className="text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded">GM David Vance (Coach)</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center mx-auto my-auto z-20 text-lg">
                GM
              </div>
            </div>
            <div className="bg-background-secondary rounded-xl p-3 border border-text-secondary/15 aspect-video flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="flex justify-between items-center z-20">
                <span className="text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded">You (Student)</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center mx-auto my-auto z-20 text-lg">
                👤
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-background-secondary rounded-xl p-3 border border-text-secondary/15 flex items-center justify-center gap-3">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-xl transition-colors ${micOn ? 'bg-background-tertiary text-text-primary' : 'bg-red-500/20 text-red-400'}`}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setCamOn(!camOn)}
              className={`p-3 rounded-xl transition-colors ${camOn ? 'bg-background-tertiary text-text-primary' : 'bg-red-500/20 text-red-400'}`}
            >
              {camOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            </button>
            <Link
              href="/sessions/history"
              className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold rounded-xl text-sm transition-colors"
            >
              Leave Session
            </Link>
          </div>

          {/* Live Chat */}
          <div className="bg-background-secondary rounded-2xl p-4 border border-text-secondary/15 flex-1 flex flex-col min-h-[250px] shadow-card">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent" />
              Session Chat
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto mb-3 pr-1">
              {messages.map((msg, index) => (
                <div key={index} className="bg-background-tertiary rounded-xl p-3 text-sm">
                  <p className="font-bold text-xs text-accent mb-1">{msg.sender}</p>
                  <p className="text-text-primary">{msg.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 rounded-xl border border-text-secondary/20 bg-background-tertiary px-3 py-2 text-sm text-text-primary"
              />
              <button type="submit" className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
