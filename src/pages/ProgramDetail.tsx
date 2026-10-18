import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Trophy, Users, ArrowLeft, ArrowRight,
  Share2, Check, Phone, Mail, Award, AlertCircle,
  CheckCircle2, ShieldCheck, ChevronRight, X, UserPlus, MessageSquare,
  GraduationCap
} from 'lucide-react';
import { getProgramById, registerForProgram } from '../data/hostedPrograms';
import type { HostedProgram, ProgramRound } from '../data/hostedPrograms';
import { ScienceBackground } from '../components/ScienceBackground';
import { downloadICS } from '../utils/ics';

export const ProgramDetail: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const [program, setProgram] = useState<HostedProgram | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rounds' | 'prizes' | 'rules' | 'coordinators'>('overview');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    participationType: 'individual' as 'individual' | 'team',
    teamName: '',
    leaderName: '',
    leaderEmail: '',
    leaderPhone: '',
    college: 'TGPCOP Nagpur',
    year: 'B.Pharm III Year',
    members: [{ name: '', email: '', phone: '' }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regSuccessTicket, setRegSuccessTicket] = useState<string | null>(null);

  useEffect(() => {
    if (programId) {
      const p = getProgramById(programId);
      if (p) {
        setProgram(p);
        setRegForm(prev => ({
          ...prev,
          participationType: p.participationType === 'team' ? 'team' : 'individual',
          members: Array.from({ length: Math.max(0, p.minTeamSize - 1) }).map(() => ({ name: '', email: '', phone: '' }))
        }));
      }
    }
  }, [programId]);

  if (!program) {
    return (
      <div className="min-h-screen bg-[#050B18] text-white flex flex-col items-center justify-center p-6 text-center">
        <ScienceBackground />
        <AlertCircle className="w-16 h-16 text-orange-burnt mb-4 animate-bounce" />
        <h2 className="text-2xl font-display font-extrabold mb-2">Opportunity Not Found</h2>
        <p className="text-white/60 text-sm max-w-md mb-6">
          The program you are looking for may have concluded, been unlisted, or does not exist.
        </p>
        <Link
          to="/host"
          className="px-6 py-2.5 rounded-xl bg-orange-burnt hover:bg-[#E06D2B] text-white font-display text-xs font-bold transition-all shadow-lg shadow-orange-burnt/20"
        >
          Explore All Opportunities
        </Link>
      </div>
    );
  }

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddMember = () => {
    if (regForm.members.length + 1 < program.maxTeamSize) {
      setRegForm(prev => ({
        ...prev,
        members: [...prev.members, { name: '', email: '', phone: '' }]
      }));
    }
  };

  const handleRemoveMember = (idx: number) => {
    setRegForm(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== idx)
    }));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.leaderName || !regForm.leaderEmail || !regForm.leaderPhone) return;
    if (regForm.participationType === 'team' && !regForm.teamName) return;

    setIsSubmitting(true);
    try {
      const res = registerForProgram({
        programId: program.id,
        participationType: regForm.participationType,
        teamName: regForm.teamName,
        leaderName: regForm.leaderName,
        leaderEmail: regForm.leaderEmail,
        leaderPhone: regForm.leaderPhone,
        college: regForm.college,
        year: regForm.year,
        members: regForm.participationType === 'team' ? regForm.members.filter(m => m.name.trim() !== '') : []
      });

      setRegSuccessTicket(res.id);
      setProgram(prev => prev ? ({ ...prev, registeredCount: (prev.registeredCount || 0) + 1 }) : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoundStatusBadge = (r: ProgramRound) => {
    const now = new Date().getTime();
    const start = new Date(r.startDate).getTime();
    const end = new Date(r.endDate).getTime();

    if (now > end) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white/10 text-white/50 border border-white/10 uppercase">Completed</span>;
    }
    if (now >= start && now <= end) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Live Now
        </span>
      );
    }
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">Upcoming</span>;
  };

  return (
    <div className="relative min-h-screen bg-[#050B18] text-white pb-24 overflow-hidden">
      <ScienceBackground />
      <div className="absolute top-[20%] right-[5%] w-[450px] h-[450px] rounded-full ambient-orb-orange z-0 pointer-events-none" />
      <div className="absolute top-[60%] left-[5%] w-[400px] h-[400px] rounded-full ambient-orb-gold z-0 pointer-events-none" />
      <div className="absolute inset-0 grid-bg-overlay opacity-15 z-0 pointer-events-none" />

      {/* Top Banner Navigation */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/host"
            className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-white/60 hover:text-orange-burnt transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Opportunities & Host Portal</span>
          </Link>

          <button
            onClick={handleCopyShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white text-xs font-display font-semibold transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-orange-burnt" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Opportunity'}</span>
          </button>
        </div>

        {/* Opportunity Hero Header (Unstop Inspired) */}
        <div className="bg-[#0B1530]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl mb-8">
          {/* Banner cover image */}
          <div className="h-48 sm:h-64 md:h-80 w-full relative overflow-hidden bg-navy-dark">
            <img
              src={program.bannerUrl}
              alt={program.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1530] via-[#0B1530]/40 to-transparent" />
            
            {/* Top pill tags */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-orange-burnt text-white shadow-lg">
                {program.programType.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-[#080F25]/80 backdrop-blur-md text-cyan-300 border border-white/10">
                {program.mode.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-[#080F25]/80 backdrop-blur-md text-amber-300 border border-white/10">
                {program.category}
              </span>
            </div>
          </div>

          {/* Hero details strip */}
          <div className="p-6 sm:p-8 pt-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
              <div className="space-y-2 max-w-3xl">
                <div className="text-xs font-mono text-orange-burnt font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Hosted by {program.organization}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
                  {program.title}
                </h1>
                <p className="text-sm sm:text-base text-white/70 font-sans leading-relaxed">
                  {program.tagline}
                </p>
              </div>

              {/* Quick stats box */}
              <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3 shrink-0">
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <div>
                    <span className="text-[10px] font-mono text-white/50 uppercase block">Total Prize Pool</span>
                    <span className="text-lg font-display font-extrabold text-yellow-400">{program.totalPrizePool}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-white/60">
                  <Users className="w-4 h-4 text-orange-burnt" />
                  <span>{program.registeredCount} Participants Applied</span>
                </div>
              </div>
            </div>

            {/* Sub-meta bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
              <div className="space-y-1">
                <span className="text-white/40 font-mono text-[10px] uppercase block">Participation</span>
                <span className="font-display font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-orange-burnt" />
                  {program.participationType === 'individual' ? 'Solo' : `Team (${program.minTeamSize}-${program.maxTeamSize} members)`}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-white/40 font-mono text-[10px] uppercase block">Registration Fee</span>
                <span className="font-display font-bold text-emerald-400">
                  {program.registrationFee === 0 ? 'Free Entry' : `₹${program.registrationFee}`}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-white/40 font-mono text-[10px] uppercase block">Deadline</span>
                <span className="font-display font-bold text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {new Date(program.registrationDeadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-white/40 font-mono text-[10px] uppercase block">Venue / Mode</span>
                <span className="font-display font-bold text-cyan-300 flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{program.venue}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Layout: Main content + Sticky Action Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs Selector Navigation */}
            <div className="flex items-center gap-1.5 bg-[#0F1E42]/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'rounds', label: `Rounds (${program.rounds.length})` },
                { id: 'prizes', label: 'Prizes & Rewards' },
                { id: 'rules', label: 'Rules & Guidelines' },
                { id: 'coordinators', label: 'Coordinators' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl font-display text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-orange-burnt text-white shadow-md shadow-orange-burnt/25'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="bg-[#0B1530]/80 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-display font-bold text-white mb-3">About the Opportunity</h3>
                  <div className="text-sm text-white/75 font-sans leading-relaxed whitespace-pre-line space-y-3">
                    {program.about}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-orange-burnt" />
                    <span>Eligibility Criteria</span>
                  </h3>
                  <p className="text-xs text-white/70 font-sans leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    {program.eligibility}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Rounds & Timeline (Unstop Visual Timeline) */}
            {activeTab === 'rounds' && (
              <div className="bg-[#0B1530]/80 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-display font-bold text-white">Stages & Timeline</h3>
                  <span className="text-xs text-white/40 font-mono">{program.rounds.length} Total Stages</span>
                </div>

                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-orange-burnt before:via-gold-accent before:to-orange-burnt">
                  {program.rounds.map((round) => (
                    <div key={round.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-[#080F25] border-2 border-orange-burnt flex items-center justify-center text-[10px] font-mono font-bold text-orange-burnt shadow-md">
                        {round.roundNumber}
                      </div>

                      <div className="bg-[#080F25]/90 border border-white/5 rounded-2xl p-5 hover:border-white/15 transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h4 className="font-display font-bold text-base text-white">
                            {round.title}
                          </h4>
                          {getRoundStatusBadge(round)}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/50 mb-3">
                          <span className="flex items-center gap-1 text-amber-300">
                            <Clock className="w-3.5 h-3.5 text-orange-burnt" />
                            {new Date(round.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {new Date(round.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {round.venueOrLink && (
                            <span className="flex items-center gap-1 text-cyan-300">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                              {round.venueOrLink}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-white/70 font-sans leading-relaxed whitespace-pre-line">
                          {round.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Prizes & Rewards */}
            {activeTab === 'prizes' && (
              <div className="bg-[#0B1530]/80 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-display font-bold text-white mb-1">Prizes, Cash Grants & Accolades</h3>
                  <p className="text-xs text-white/50 font-sans">Total Prize Pool of {program.totalPrizePool} with verified certificates.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {program.prizes.map((prize, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border text-center flex flex-col justify-between transition-all ${
                        idx === 0
                          ? 'bg-gradient-to-b from-yellow-500/15 via-[#080F25] to-[#080F25] border-yellow-500/30'
                          : idx === 1
                          ? 'bg-gradient-to-b from-slate-400/15 via-[#080F25] to-[#080F25] border-slate-400/30'
                          : 'bg-gradient-to-b from-amber-700/15 via-[#080F25] to-[#080F25] border-amber-700/30'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center bg-white/5 border border-white/10">
                          <Trophy className={`w-5 h-5 ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : 'text-amber-600'}`} />
                        </div>
                        <h4 className="font-display font-extrabold text-sm text-white">{prize.position}</h4>
                        <div className="text-2xl font-display font-extrabold text-yellow-400 font-mono">{prize.amount}</div>
                      </div>
                      <p className="text-[11px] text-white/60 font-sans mt-4 pt-3 border-t border-white/5 leading-snug">
                        {prize.perks}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                  <Award className="w-5 h-5 text-orange-burnt shrink-0" />
                  <p className="text-xs text-white/70 font-sans">
                    <strong>Participation Certificates:</strong> All verified participants who submit rounds or attend the program will receive official verified digital certificates from TGPCOP Student Council.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: Rules & Guidelines */}
            {activeTab === 'rules' && (
              <div className="bg-[#0B1530]/80 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
                <h3 className="text-lg font-display font-bold text-white mb-2">Rules & Code of Conduct</h3>
                
                <ul className="space-y-3 font-sans text-xs text-white/75 leading-relaxed">
                  {program.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-orange-burnt shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tab 5: Coordinators */}
            {activeTab === 'coordinators' && (
              <div className="bg-[#0B1530]/80 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-display font-bold text-white mb-1">Program Organizing Team</h3>
                  <p className="text-xs text-white/50 font-sans">Feel free to reach out for queries regarding registrations, problem statements, or accommodations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {program.coordinators.map((c, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#080F25] border border-white/5 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-orange-burnt font-bold block">{c.role}</span>
                        <h4 className="font-display font-bold text-white text-base mt-0.5">{c.name}</h4>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs font-mono">
                        {c.phone && (
                          <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-white/70 hover:text-orange-burnt transition-colors">
                            <Phone className="w-3.5 h-3.5 text-orange-burnt" />
                            <span>{c.phone}</span>
                          </a>
                        )}
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-white/70 hover:text-orange-burnt transition-colors truncate">
                            <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{c.email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sticky Sidebar Action Card (Unstop Signature) */}
          <div className="sticky top-24 space-y-4">
            <div className="bg-[#0B1530]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase block">Registration</span>
                  <span className="text-xl font-display font-extrabold text-emerald-400">
                    {program.registrationFee === 0 ? 'Free Entry' : `₹${program.registrationFee}`}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  Registrations Open
                </span>
              </div>

              {/* Big Register Button */}
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-burnt to-[#E06D2B] hover:scale-[1.02] active:scale-[0.98] text-white font-display font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-orange-burnt/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Register Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Calendar add */}
              <button
                onClick={() => downloadICS(program.title, program.tagline, program.startDate, program.venue)}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-display text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5 text-orange-burnt" />
                <span>Add to My Calendar (.ics)</span>
              </button>

              {/* WhatsApp Community */}
              {program.whatsappGroupUrl && (
                <a
                  href={program.whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 font-display text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Join Participant WhatsApp Group</span>
                </a>
              )}

              {/* Key Highlights */}
              <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs font-sans text-white/70">
                <div className="flex items-center justify-between">
                  <span className="text-white/40">Team Size:</span>
                  <span className="font-bold text-white font-mono">{program.minTeamSize} - {program.maxTeamSize} Members</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40">Mode:</span>
                  <span className="font-bold text-white uppercase font-mono">{program.mode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40">Certificate:</span>
                  <span className="font-bold text-emerald-400 font-mono">Provided to All</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40">Capacity:</span>
                  <span className="font-bold text-white font-mono">{program.registeredCount} / {program.maxCapacity} Seats</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isRegisterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0B1530] border border-white/15 rounded-3xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl my-8 overflow-hidden"
            >
              <button
                onClick={() => { setIsRegisterOpen(false); setRegSuccessTicket(null); }}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {regSuccessTicket ? (
                /* Success Ticket Screen */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-white">Registration Successful!</h3>
                  <p className="text-xs text-white/60 font-sans max-w-sm mx-auto">
                    You have successfully registered for <strong>{program.title}</strong>. Save your official confirmation pass below.
                  </p>

                  <div className="bg-[#080F25] border border-white/10 rounded-2xl p-4 text-left font-mono text-xs space-y-2 mt-4">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/40">Registration Pass ID:</span>
                      <span className="text-orange-burnt font-bold">{regSuccessTicket}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Lead Participant:</span>
                      <span className="text-white">{regForm.leaderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Email:</span>
                      <span className="text-white truncate max-w-[200px]">{regForm.leaderEmail}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setIsRegisterOpen(false); setRegSuccessTicket(null); }}
                    className="w-full py-3 rounded-xl bg-orange-burnt hover:bg-[#E06D2B] text-white font-display text-xs font-bold transition-all shadow-md"
                  >
                    Done & Close
                  </button>
                </div>
              ) : (
                /* Form Fields */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-orange-burnt font-bold">Unstop Application</span>
                    <h3 className="text-xl font-display font-bold text-white">Apply for {program.title}</h3>
                  </div>

                  {/* Participation Type toggle if both */}
                  {program.participationType === 'both' && (
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setRegForm(p => ({ ...p, participationType: 'individual' }))}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-display font-bold ${regForm.participationType === 'individual' ? 'bg-orange-burnt text-white' : 'text-white/60'}`}
                      >
                        Individual
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegForm(p => ({ ...p, participationType: 'team' }))}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-display font-bold ${regForm.participationType === 'team' ? 'bg-orange-burnt text-white' : 'text-white/60'}`}
                      >
                        Team ({program.minTeamSize}-{program.maxTeamSize})
                      </button>
                    </div>
                  )}

                  {regForm.participationType === 'team' && (
                    <div>
                      <label className="text-xs font-mono text-white/70 block mb-1">Team Name *</label>
                      <input
                        type="text"
                        required
                        value={regForm.teamName}
                        onChange={(e) => setRegForm(p => ({ ...p, teamName: e.target.value }))}
                        placeholder="e.g. PharmaTitans"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-burnt/60"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono text-white/70 block mb-1">Full Name (Lead) *</label>
                      <input
                        type="text"
                        required
                        value={regForm.leaderName}
                        onChange={(e) => setRegForm(p => ({ ...p, leaderName: e.target.value }))}
                        placeholder="Your full name"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-burnt/60"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-white/70 block mb-1">WhatsApp Phone *</label>
                      <input
                        type="tel"
                        required
                        value={regForm.leaderPhone}
                        onChange={(e) => setRegForm(p => ({ ...p, leaderPhone: e.target.value }))}
                        placeholder="10-digit number"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-burnt/60"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono text-white/70 block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={regForm.leaderEmail}
                        onChange={(e) => setRegForm(p => ({ ...p, leaderEmail: e.target.value }))}
                        placeholder="yourname@gmail.com"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-burnt/60"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-white/70 block mb-1">Year / Semester *</label>
                      <select
                        value={regForm.year}
                        onChange={(e) => setRegForm(p => ({ ...p, year: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-[#080F25] border border-white/10 text-white text-xs focus:outline-none focus:border-orange-burnt/60"
                      >
                        <option value="B.Pharm I Year">B.Pharm I Year</option>
                        <option value="B.Pharm II Year">B.Pharm II Year</option>
                        <option value="B.Pharm III Year">B.Pharm III Year</option>
                        <option value="B.Pharm Final Year">B.Pharm Final Year</option>
                        <option value="D.Pharm">D.Pharm</option>
                        <option value="Other College / Stream">Other College / Stream</option>
                      </select>
                    </div>
                  </div>

                  {/* Team Members if Team mode */}
                  {regForm.participationType === 'team' && (
                    <div className="pt-2 border-t border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-display font-bold text-white">Team Members</span>
                        {regForm.members.length + 1 < program.maxTeamSize && (
                          <button
                            type="button"
                            onClick={handleAddMember}
                            className="text-[11px] font-mono text-orange-burnt hover:underline flex items-center gap-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Add Member</span>
                          </button>
                        )}
                      </div>

                      {regForm.members.map((member, mIdx) => (
                        <div key={mIdx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-white/40">
                            <span>Member #{mIdx + 2}</span>
                            {regForm.members.length > Math.max(0, program.minTeamSize - 1) && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(mIdx)}
                                className="text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Full Name"
                              value={member.name}
                              onChange={(e) => {
                                const newMembers = [...regForm.members];
                                newMembers[mIdx].name = e.target.value;
                                setRegForm(p => ({ ...p, members: newMembers }));
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                            />
                            <input
                              type="email"
                              required
                              placeholder="Email"
                              value={member.email}
                              onChange={(e) => {
                                const newMembers = [...regForm.members];
                                newMembers[mIdx].email = e.target.value;
                                setRegForm(p => ({ ...p, members: newMembers }));
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-orange-burnt to-[#E06D2B] text-white font-display font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-burnt/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Confirm & Submit Registration</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgramDetail;
