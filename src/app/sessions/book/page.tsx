'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Video, CheckCircle2, Calendar, Clock, User, Shield } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export default function BookSessionPage() {
  const { tr, language } = useI18n();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('2026-11-15');
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [sessionType, setSessionType] = useState('one_on_one');
  const [booked, setBooked] = useState(false);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBooked(true);
  };

  if (booked) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-text-primary">
        <div className="bg-background-secondary rounded-2xl p-8 border border-text-secondary/15 shadow-card">
          <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl font-bold mb-2">{tr('Coaching Session Booked!')}</h1>
          <p className="text-text-secondary text-sm mb-6">
            {tr('Your lesson with GM David Vance has been successfully scheduled for')} {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(language)} {tr('at')} {selectedTime} UTC.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/sessions/history"
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors"
            >
              {tr('View My Sessions')}
            </Link>
            <Link
              href="/classroom/demo-session"
              className="px-6 py-3 bg-background-tertiary hover:bg-background text-text-primary font-semibold rounded-xl border border-text-secondary/20 transition-colors"
            >
              {tr('Enter Virtual Classroom')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-text-primary">
      <Link href="/sessions" className="text-sm text-text-secondary hover:text-accent flex items-center gap-2 mb-6">
        <ArrowLeft className="w-4 h-4" />
        {tr('Back to Coaches')}
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold">{tr('Book Coaching Session')}</h1>
        <p className="mt-1 text-text-secondary">{tr('Schedule a private 1-on-1 session with GM David Vance ($75/hr).')}</p>
      </header>

      <form onSubmit={handleBooking} className="bg-background-secondary rounded-2xl p-6 md:p-8 border border-text-secondary/15 space-y-6 shadow-card">
        <div>
          <label className="block text-sm font-medium mb-2">{tr('Session Type')}</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSessionType('one_on_one')}
              className={`p-4 rounded-xl border text-start transition-all ${
                sessionType === 'one_on_one'
                  ? 'border-accent bg-accent/10 text-text-primary'
                  : 'border-text-secondary/15 bg-background-tertiary text-text-secondary'
              }`}
            >
              <p className="font-bold text-text-primary">{tr('1-on-1 Private Lesson')}</p>
              <p className="text-xs text-text-secondary mt-1">{tr('Personalized game analysis & training')} ($75)</p>
            </button>
            <button
              type="button"
              onClick={() => setSessionType('group')}
              className={`p-4 rounded-xl border text-start transition-all ${
                sessionType === 'group'
                  ? 'border-accent bg-accent/10 text-text-primary'
                  : 'border-text-secondary/15 bg-background-tertiary text-text-secondary'
              }`}
            >
              <p className="font-bold text-text-primary">{tr('Group Masterclass')}</p>
              <p className="text-xs text-text-secondary mt-1">{tr('Interactive opening & tactical seminar')} ($35)</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">{tr('Select Date')}</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-text-secondary/20 bg-background-tertiary px-4 py-3 text-text-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{tr('Select Time (UTC)')}</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full rounded-xl border border-text-secondary/20 bg-background-tertiary px-4 py-3 text-text-primary"
            >
              <option value="10:00">10:00 {tr('AM')} UTC</option>
              <option value="14:00">02:00 {tr('PM')} UTC</option>
              <option value="17:00">05:00 {tr('PM')} UTC</option>
              <option value="20:00">08:00 {tr('PM')} UTC</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-text-secondary/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">{tr('Total Price')}</p>
            <p className="text-2xl font-bold font-mono text-accent">{sessionType === 'one_on_one' ? '$75.00' : '$35.00'}</p>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors shadow-lg shadow-accent/30"
          >
            {tr('Confirm & Book Session')}
          </button>
        </div>
      </form>
    </div>
  );
}
