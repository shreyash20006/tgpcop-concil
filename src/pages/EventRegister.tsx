import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { sendAdminNotification } from '../lib/brevo';
import {
  CalendarDays, Users, Loader2, CheckCircle2, AlertTriangle,
  ArrowLeft, UserPlus, Phone, Mail, GraduationCap
} from 'lucide-react';

export const EventRegister: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'duplicate' | 'full' | 'error'>('idle');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      if (!error && data) setEvent(data);
      setIsLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  const seatsLeft = event ? Math.max(0, (event.capacity || 100) - (event.registered_count || 0)) : 0;
  const capacityPercent = event ? Math.min(100, ((event.registered_count || 0) / (event.capacity || 100)) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !year || !eventId) return;
    setIsSubmitting(true);
    setStatus('idle');

    try {
      // Check capacity
      if (seatsLeft <= 0) { setStatus('full'); setIsSubmitting(false); return; }

      // Check duplicate
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('email', email)
        .maybeSingle();
      if (existing) { setStatus('duplicate'); setIsSubmitting(false); return; }

      // Insert registration
      const { error } = await supabase.from('event_registrations').insert({
        event_id: eventId, full_name: fullName, email, whatsapp, year,
      });
      if (error) throw error;

      // Increment count
      await supabase.from('events').update({
        registered_count: (event.registered_count || 0) + 1,
      }).eq('id', eventId);

      setStatus('success');
      setEvent({ ...event, registered_count: (event.registered_count || 0) + 1 });

      // Send Brevo confirmation email
      try {
        await sendAdminNotification({
          subject: `🎉 Registration Confirmed: ${event.name}`,
          title: 'Event Registration Successful',
          bodyHtml: `
            <p>Dear <b>${fullName}</b>,</p>
            <p>Your registration for the upcoming event <b>${event.name}</b> has been successfully recorded!</p>
            <hr style="border:0;border-top:1px solid rgba(255,255,255,0.1);margin:15px 0;" />
            <p><b>Registration Summary:</b></p>
            <ul>
              <li><b>Event:</b> ${event.name}</li>
              <li><b>Registrant:</b> ${fullName}</li>
              <li><b>Year:</b> ${year}</li>
              <li><b>WhatsApp:</b> ${whatsapp || '—'}</li>
            </ul>
            <p>We look forward to seeing you at the campus venue!</p>
          `,
        });
      } catch (emailErr) {
        console.warn('Failed to send registration confirmation email:', emailErr);
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-28 pb-24 min-h-screen bg-gray-light flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-burnt animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-28 pb-24 min-h-screen bg-gray-light flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle className="w-12 h-12 text-orange-burnt mb-4" />
        <h2 className="font-display font-extrabold text-2xl text-navy-dark mb-2">Event Not Found</h2>
        <p className="text-navy-dark/60 text-sm mb-6">This event doesn't exist or has been removed.</p>
        <Link to="/events" className="text-orange-burnt font-display font-bold text-sm hover:underline flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" /><span>Back to Events</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-screen bg-gray-light">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link to="/events" className="inline-flex items-center space-x-1.5 text-navy-dark/50 hover:text-orange-burnt font-display text-sm font-bold mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>Back to Events</span>
        </Link>

        {/* Event Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-navy-dark/10 p-6 sm:p-8 shadow-sm mb-6"
        >
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-navy-dark leading-tight mb-2">{event.name}</h1>
              <div className="flex items-center space-x-3 text-navy-dark/50 text-sm">
                <div className="flex items-center space-x-1"><CalendarDays className="w-4 h-4" /><span>{new Date(event.event_date || event.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${seatsLeft > 5 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : seatsLeft > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {seatsLeft > 0 ? `🟢 ${seatsLeft} seats left` : '🔴 Full'}
            </span>
          </div>
          <p className="text-navy-dark/70 text-sm leading-relaxed mb-5 font-sans">{event.description}</p>

          {/* Capacity Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-navy-dark/40">
              <span>Registrations</span>
              <span>{event.registered_count || 0} / {event.capacity || 100}</span>
            </div>
            <div className="w-full h-2.5 bg-navy-dark/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${capacityPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${capacityPercent >= 90 ? 'bg-red-500' : capacityPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              />
            </div>
          </div>
        </motion.div>

        {/* Registration Form or Success */}
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-emerald-200 p-8 text-center shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-display font-extrabold text-xl text-navy-dark mb-2">You're Registered! 🎉</h3>
            <p className="text-navy-dark/60 text-sm font-sans mb-1">Welcome to <strong>{event.name}</strong>.</p>
            <p className="text-navy-dark/40 text-xs font-sans">A confirmation has been sent to <strong>{email}</strong>.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-navy-dark/10 p-6 sm:p-8 shadow-sm"
          >
            <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-navy-dark/5">
              <UserPlus className="w-5 h-5 text-orange-burnt" />
              <h2 className="font-display font-extrabold text-lg text-navy-dark">Register for this Event</h2>
            </div>

            {/* Status Messages */}
            {status === 'duplicate' && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-medium flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /><span>You've already registered with this email!</span>
              </div>
            )}
            {status === 'full' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /><span>Sorry, this event is full!</span>
              </div>
            )}
            {status === 'error' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /><span>Something went wrong. Please try again.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Full Name *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-dark/30" />
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-dark/30" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-dark/30" />
                  <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Year *</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-dark/30" />
                  <select required value={year} onChange={e => setYear(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark bg-white transition-colors appearance-none">
                    <option value="">Select Year</option>
                    <option value="D.Pharm I">D.Pharm I Year</option>
                    <option value="D.Pharm II">D.Pharm II Year</option>
                    <option value="B.Pharm I">B.Pharm I Year</option>
                    <option value="B.Pharm II">B.Pharm II Year</option>
                    <option value="B.Pharm III">B.Pharm III Year</option>
                    <option value="B.Pharm IV">B.Pharm IV Year</option>
                    <option value="M.Pharm">M.Pharm</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting || seatsLeft <= 0}
                className="w-full py-3 rounded-lg bg-orange-burnt hover:bg-orange-burnt/90 text-white font-display text-sm font-bold shadow-md shadow-orange-burnt/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Registering...</span></> : <><UserPlus className="w-4 h-4" /><span>Register Now</span></>}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventRegister;
