import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { sendAdminNotification } from '../lib/brevo';
import { ShieldAlert, Loader2, CheckCircle2, Calendar, MapPin } from 'lucide-react';

const INCIDENT_TYPES = ['Ragging', 'Harassment', 'Bullying', 'Discrimination', 'Other'];

export const Complaint: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentType || !description) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('complaints').insert({
        incident_type: incidentType,
        description,
        incident_date: incidentDate || null,
        location: location || null,
      });
      if (error) throw error;

      // Notify anti-ragging committee
      await sendAdminNotification({
        subject: '⚠️ New Anonymous Complaint Received',
        title: 'Anonymous Complaint Alert',
        bodyHtml: `
          <p><b>Incident Type:</b> ${incidentType}</p>
          <p><b>Date:</b> ${incidentDate || 'Not specified'}</p>
          <p><b>Location:</b> ${location || 'Not specified'}</p>
          <hr style="border:0;border-top:1px solid rgba(255,255,255,0.1);margin:15px 0;" />
          <p><b>Description:</b></p>
          <p style="background:rgba(255,255,255,0.1);padding:12px;border-radius:8px;">${description}</p>
          <p style="margin-top:20px;color:rgba(255,255,255,0.5);font-size:12px;">This complaint was submitted anonymously. No personal data was collected.</p>
        `,
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-gray-light">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-navy-dark mb-3">Anonymous Complaint</h1>
          <p className="text-navy-dark/60 text-sm sm:text-base font-sans max-w-md mx-auto">Report any incident safely and anonymously. Your identity is never recorded.</p>
        </motion.div>

        {/* Anonymity Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-navy-dark text-white p-4 rounded-xl mb-6 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-orange-burnt shrink-0 mt-0.5" />
          <div>
            <p className="font-display font-bold text-sm mb-0.5">🔒 100% Anonymous</p>
            <p className="text-white/60 text-xs font-sans">This form does not collect your name, email, or any personal information. Your identity is fully protected.</p>
          </div>
        </motion.div>

        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-emerald-200 p-8 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-display font-extrabold text-xl text-navy-dark mb-2">Complaint Submitted</h3>
            <p className="text-navy-dark/60 text-sm font-sans max-w-sm mx-auto">The concerned authorities have been notified and will take appropriate action. Your identity remains anonymous.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-navy-dark/10 p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Incident Type *</label>
                <select required value={incidentType} onChange={e => setIncidentType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-red-400 outline-none text-sm font-sans text-navy-dark bg-white transition-colors">
                  <option value="">Select type of incident</option>
                  {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Describe the Incident *</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={5}
                  placeholder="Please describe what happened in detail..."
                  className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-red-400 outline-none text-sm font-sans text-navy-dark transition-colors resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Date of Incident</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-dark/30" />
                    <input type="date" value={incidentDate} onChange={e => setIncidentDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-red-400 outline-none text-sm font-sans text-navy-dark bg-white transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-dark/30" />
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Campus Lab 2"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-red-400 outline-none text-sm font-sans text-navy-dark transition-colors" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-display text-sm font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Submitting...</span></> : <><ShieldAlert className="w-4 h-4" /><span>Submit Complaint Anonymously</span></>}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Complaint;
