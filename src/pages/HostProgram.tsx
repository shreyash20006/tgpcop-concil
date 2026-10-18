import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Rocket, Sparkles, Plus, Trash2, Calendar, Clock,
  MapPin, Trophy, Users, ArrowRight, Check,
  Globe, Phone, Mail, Search,
  Layers, Laptop, Music, HelpCircle,
  Briefcase, GraduationCap, X, Download,
  ChevronRight, ExternalLink
} from 'lucide-react';
import {
  getStoredPrograms, saveHostedProgram,
  deleteHostedProgram, getProgramRegistrations
} from '../data/hostedPrograms';
import type {
  HostedProgram, ProgramType, ProgramRound, PrizeBreakdown,
  ProgramCoordinator, ProgramRegistration
} from '../data/hostedPrograms';
import { PageHeader } from '../components/PageHeader';
import { ScienceBackground } from '../components/ScienceBackground';

// Curated high-res Unstop style banners
const BANNER_PRESETS = [
  { name: 'AI & Hackathon', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Science & Pharma Quiz', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cultural & Music Fest', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' },
  { name: 'E-Sports Gaming', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Case Study & Pitching', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Workshop & Masterclass', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80' }
];

const PROGRAM_TYPES: { id: ProgramType; label: string; icon: any; desc: string }[] = [
  { id: 'hackathon', label: 'Hackathon & Coding', icon: Laptop, desc: 'Prototype technical or biomedical solutions in team sprints' },
  { id: 'quiz', label: 'Quiz & Trivia', icon: HelpCircle, desc: 'MCQ screenings, speed buzzer rounds, and subject contests' },
  { id: 'cultural', label: 'Cultural Fest', icon: Music, desc: 'Dance, Singing, Drama, Fashion Ramp Walk & Talent hunts' },
  { id: 'case_comp', label: 'Case Competition', icon: Briefcase, desc: 'Business cases, pitch decks, healthcare strategy' },
  { id: 'esports', label: 'E-Sports Tournament', icon: Trophy, desc: 'Competitive BGMI, Free Fire, Valorant, or Chess' },
  { id: 'workshop', label: 'Workshop / Webinar', icon: GraduationCap, desc: 'Hands-on training, industry guest sessions, symposiums' },
];

export const HostProgram: React.FC = () => {
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState<'create' | 'manage' | 'explore'>('create');
  const [hostedList, setHostedList] = useState<HostedProgram[]>([]);
  const [exploreFilter, setExploreFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Program Registrations Modal
  const [selectedProgramForRegs, setSelectedProgramForRegs] = useState<HostedProgram | null>(null);
  const [programRegistrations, setProgramRegistrations] = useState<ProgramRegistration[]>([]);

  // Wizard Steps (1: Essentials, 2: Registration, 3: Rounds, 4: Prizes, 5: Coordinators & Rules)
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Form State
  const [form, setForm] = useState<HostedProgram>({
    id: '',
    title: '',
    tagline: '',
    programType: 'hackathon',
    organization: 'TGPCOP Student Council',
    category: 'Technical',
    bannerUrl: BANNER_PRESETS[0].url,
    about: '',
    eligibility: 'Open to all undergraduate & postgraduate students from Pharmacy, Engineering, and Science colleges.',
    participationType: 'team',
    minTeamSize: 2,
    maxTeamSize: 4,
    registrationFee: 0,
    registrationDeadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16),
    startDate: new Date(Date.now() + 16 * 86400000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 18 * 86400000).toISOString().slice(0, 16),
    venue: 'TGPCOP Campus & JRD Tata Hall',
    mode: 'hybrid',
    maxCapacity: 150,
    registeredCount: 0,
    totalPrizePool: '₹25,000',
    prizes: [
      { position: '1st Place Winner', amount: '₹15,000', perks: 'Winner Trophy + Certificate of Excellence' },
      { position: '1st Runner Up', amount: '₹7,000', perks: 'Silver Trophy + Merit Certificate' },
      { position: '2nd Runner Up', amount: '₹3,000', perks: 'Bronze Medal + Certificate' }
    ],
    rounds: [
      {
        id: 'r1',
        roundNumber: 1,
        title: 'Round 1: Screening & Idea Abstract',
        type: 'submission',
        startDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16),
        description: 'Submit a 3-5 slide proposal or video introduction outlining your concept.',
        venueOrLink: 'Online Submission Portal'
      },
      {
        id: 'r2',
        roundNumber: 2,
        title: 'Round 2: Grand Finale & Stage Showcase',
        type: 'presentation',
        startDate: new Date(Date.now() + 16 * 86400000).toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 18 * 86400000).toISOString().slice(0, 16),
        description: 'Live demonstration and jury evaluation in front of panel judges.',
        venueOrLink: 'JRD Tata Hall, TGPCOP Campus'
      }
    ],
    rules: [
      'Participants must bring a valid student ID card.',
      'Plagiarism or misconduct will result in immediate disqualification.',
      'Organizers reserve the right to alter the schedule in unforeseen circumstances.'
    ],
    coordinators: [
      { name: 'Student Lead', role: 'Event Coordinator', phone: '9876543210', email: 'coordinator@tgpcopcouncil.online' }
    ],
    websiteUrl: '',
    whatsappGroupUrl: '',
    status: 'published',
    hostEmail: 'organizer@tgpcop.edu',
    hostName: 'Student Council Lead',
    createdAt: new Date().toISOString()
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const refreshList = () => {
    const list = getStoredPrograms();
    setHostedList(list);
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleOpenRegistrations = (p: HostedProgram) => {
    setSelectedProgramForRegs(p);
    const regs = getProgramRegistrations(p.id);
    setProgramRegistrations(regs);
  };

  const handleExportCSV = () => {
    if (!selectedProgramForRegs || programRegistrations.length === 0) return;
    const headers = ['Registration ID', 'Lead Name', 'Lead Email', 'Phone', 'College', 'Year', 'Team Name', 'Members'];
    const rows = programRegistrations.map(r => [
      r.id,
      `"${r.leaderName}"`,
      r.leaderEmail,
      r.leaderPhone,
      `"${r.college}"`,
      r.year,
      `"${r.teamName || 'Solo'}"`,
      `"${r.members.map(m => `${m.name} (${m.email})`).join('; ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedProgramForRegs.id}-registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add/remove rounds
  const handleAddRound = () => {
    const newRoundNum = form.rounds.length + 1;
    const newRound: ProgramRound = {
      id: `r${Date.now()}`,
      roundNumber: newRoundNum,
      title: `Round ${newRoundNum}: Stage Title`,
      type: 'submission',
      startDate: form.startDate,
      endDate: form.endDate,
      description: 'Describe stage guidelines, format, and evaluation parameters.',
      venueOrLink: 'Campus Venue or Link'
    };
    setForm(p => ({ ...p, rounds: [...p.rounds, newRound] }));
  };

  const handleRemoveRound = (idx: number) => {
    setForm(p => ({
      ...p,
      rounds: p.rounds.filter((_, i) => i !== idx).map((r, i) => ({ ...r, roundNumber: i + 1 }))
    }));
  };

  // Add/remove prizes
  const handleAddPrize = () => {
    const newPrize: PrizeBreakdown = {
      position: 'Special Category Award',
      amount: '₹2,000',
      perks: 'Special Trophy + Certificate of Innovation'
    };
    setForm(p => ({ ...p, prizes: [...p.prizes, newPrize] }));
  };

  const handleRemovePrize = (idx: number) => {
    setForm(p => ({ ...p, prizes: p.prizes.filter((_, i) => i !== idx) }));
  };

  // Add/remove coordinators
  const handleAddCoordinator = () => {
    setForm(p => ({
      ...p,
      coordinators: [...p.coordinators, { name: '', role: 'Co-Organizer', phone: '', email: '' }]
    }));
  };

  const handleRemoveCoordinator = (idx: number) => {
    setForm(p => ({ ...p, coordinators: p.coordinators.filter((_, i) => i !== idx) }));
  };

  // Add/remove rules
  const handleAddRule = () => {
    setForm(p => ({ ...p, rules: [...p.rules, 'New rule requirement or guideline'] }));
  };

  const handleRemoveRule = (idx: number) => {
    setForm(p => ({ ...p, rules: p.rules.filter((_, i) => i !== idx) }));
  };

  const handlePublishProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.tagline || !form.about) {
      showToast('⚠️ Please fill in all required fields (Title, Tagline, About)');
      return;
    }

    const programSlug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `opportunity-${Date.now()}`;

    const newProgram: HostedProgram = {
      ...form,
      id: programSlug,
      createdAt: new Date().toISOString()
    };

    saveHostedProgram(newProgram);
    refreshList();
    showToast('🚀 Program published successfully on TGPCOP Unstop!');
    navigate(`/programs/${programSlug}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this hosted program?')) {
      deleteHostedProgram(id);
      refreshList();
      showToast('Program removed.');
    }
  };

  const filteredExplorePrograms = hostedList.filter(p => {
    const matchType = exploreFilter === 'all' || p.programType === exploreFilter;
    const matchQuery =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchQuery;
  });

  return (
    <div className="relative min-h-screen bg-[#050B18] text-white pb-24 overflow-hidden">
      <ScienceBackground />
      <div className="absolute top-[15%] right-[5%] w-[450px] h-[450px] rounded-full ambient-orb-orange z-0 pointer-events-none" />
      <div className="absolute top-[50%] left-[5%] w-[400px] h-[400px] rounded-full ambient-orb-gold z-0 pointer-events-none" />
      <div className="absolute inset-0 grid-bg-overlay opacity-15 z-0 pointer-events-none" />

      {/* Header */}
      <PageHeader
        icon={<Rocket className="w-6 h-6 animate-pulse text-orange-burnt" />}
        title="Host a Program"
        subtitle="Create, publish, and host college hackathons, quizzes, cultural fests, and competitions just like on Unstop."
        breadcrumb="Host Opportunity"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        
        {/* Toast alert */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-[#0F1E42] border border-orange-burnt/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-display text-xs font-bold"
            >
              <Sparkles className="w-4 h-4 text-orange-burnt animate-spin" />
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main 3 Navigation Tabs */}
        <div className="flex items-center justify-center mb-10">
          <div className="bg-white/5 p-1.5 rounded-2xl flex flex-wrap justify-center gap-1.5 border border-white/5 backdrop-blur-xl">
            <button
              onClick={() => setActiveMainTab('create')}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-wide transition-all ${
                activeMainTab === 'create'
                  ? 'bg-[#0F1E42] text-white border border-white/10 shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Rocket className="w-4 h-4 text-orange-burnt" />
              <span>Host New Program</span>
            </button>

            <button
              onClick={() => { setActiveMainTab('manage'); refreshList(); }}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-wide transition-all ${
                activeMainTab === 'manage'
                  ? 'bg-[#0F1E42] text-white border border-white/10 shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-orange-burnt" />
              <span>My Hosted Programs ({hostedList.length})</span>
            </button>

            <button
              onClick={() => { setActiveMainTab('explore'); refreshList(); }}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-wide transition-all ${
                activeMainTab === 'explore'
                  ? 'bg-[#0F1E42] text-white border border-white/10 shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 text-orange-burnt" />
              <span>Explore Opportunities</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            TAB 1: CREATE / HOST PROGRAM WIZARD
           ======================================================== */}
        {activeMainTab === 'create' && (
          <div className="bg-[#0B1530]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
            
            {/* Step Wizard Header */}
            <div className="mb-8 border-b border-white/10 pb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-burnt/10 border border-orange-burnt/25 text-orange-burnt font-mono text-[10px] uppercase font-bold tracking-wider mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Unstop-Powered Program Creator</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                    Publish an Opportunity for College Students
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/50">Step {wizardStep} of 5</span>
                </div>
              </div>

              {/* Progress Steps Indicators */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { step: 1, label: 'Fundamentals' },
                  { step: 2, label: 'Registration' },
                  { step: 3, label: 'Rounds' },
                  { step: 4, label: 'Prizes' },
                  { step: 5, label: 'Coordinators' },
                ].map(s => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setWizardStep(s.step)}
                    className={`h-2 rounded-full transition-all ${
                      wizardStep >= s.step ? 'bg-orange-burnt' : 'bg-white/10'
                    }`}
                    title={s.label}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handlePublishProgram} className="space-y-8">
              
              {/* STEP 1: FUNDAMENTALS */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-orange-burnt font-bold mb-3">
                      1. Select Opportunity Track *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {PROGRAM_TYPES.map(t => {
                        const Icon = t.icon;
                        const isSelected = form.programType === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => setForm(p => ({ ...p, programType: t.id }))}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#0F1E42] border-orange-burnt text-white shadow-lg shadow-orange-burnt/20 ring-1 ring-orange-burnt'
                                : 'bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-orange-burnt text-white' : 'bg-white/5 text-orange-burnt'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-display font-bold text-sm text-white">{t.label}</span>
                            </div>
                            <p className="text-[11px] text-white/50 font-sans leading-snug">{t.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Program Title *</label>
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. PharmaHacks 2026: 36-Hour AI Hackathon"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-burnt/60 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Organizing Body / Club *</label>
                      <input
                        type="text"
                        required
                        value={form.organization}
                        onChange={(e) => setForm(p => ({ ...p, organization: e.target.value }))}
                        placeholder="e.g. TGPCOP Student Council / Pharmacology Club"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-burnt/60 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Catchy Tagline / One-Liner *</label>
                    <input
                      type="text"
                      required
                      value={form.tagline}
                      onChange={(e) => setForm(p => ({ ...p, tagline: e.target.value }))}
                      placeholder="e.g. Prototype targeted therapeutics, win ₹50,000 cash prize pool!"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-burnt/60 transition-colors"
                    />
                  </div>

                  {/* Banner Presets Picker */}
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-2">Program Banner Cover *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
                      {BANNER_PRESETS.map((bp, i) => (
                        <div
                          key={i}
                          onClick={() => setForm(p => ({ ...p, bannerUrl: bp.url }))}
                          className={`h-20 rounded-xl overflow-hidden cursor-pointer relative border transition-all ${
                            form.bannerUrl === bp.url ? 'border-orange-burnt ring-2 ring-orange-burnt' : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={bp.url} alt={bp.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                            <span className="text-[10px] font-bold text-white drop-shadow">{bp.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <input
                      type="url"
                      value={form.bannerUrl}
                      onChange={(e) => setForm(p => ({ ...p, bannerUrl: e.target.value }))}
                      placeholder="Or enter custom image URL"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Detailed Overview & About the Program *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.about}
                      onChange={(e) => setForm(p => ({ ...p, about: e.target.value }))}
                      placeholder="Provide a comprehensive introduction, themes, problem statements, expected deliverables, and perks..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-burnt/60 transition-colors"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-6 py-3 rounded-xl bg-orange-burnt hover:bg-[#E06D2B] text-white font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                      <span>Proceed to Registration Setup</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: REGISTRATION & ELIGIBILITY */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Participation Mode</label>
                      <select
                        value={form.participationType}
                        onChange={(e) => setForm(p => ({ ...p, participationType: e.target.value as any }))}
                        className="w-full px-3 py-3 rounded-xl bg-[#080F25] border border-white/10 text-white text-xs"
                      >
                        <option value="individual">Solo Only</option>
                        <option value="team">Team Only</option>
                        <option value="both">Both (Solo or Team)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Min Team Size</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={form.minTeamSize}
                        onChange={(e) => setForm(p => ({ ...p, minTeamSize: Number(e.target.value) }))}
                        className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Max Team Size</label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={form.maxTeamSize}
                        onChange={(e) => setForm(p => ({ ...p, maxTeamSize: Number(e.target.value) }))}
                        className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Event Format</label>
                      <select
                        value={form.mode}
                        onChange={(e) => setForm(p => ({ ...p, mode: e.target.value as any }))}
                        className="w-full px-3 py-3 rounded-xl bg-[#080F25] border border-white/10 text-white text-xs uppercase"
                      >
                        <option value="hybrid">Hybrid (Online & Campus)</option>
                        <option value="offline">Offline on Campus</option>
                        <option value="online">100% Online / Virtual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Registration Fee (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={form.registrationFee}
                        onChange={(e) => setForm(p => ({ ...p, registrationFee: Number(e.target.value) }))}
                        placeholder="0 for Free Entry"
                        className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                      />
                      <span className="text-[10px] text-white/40 block mt-1">Set 0 for free participant entry.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Max Seat Capacity</label>
                      <input
                        type="number"
                        value={form.maxCapacity}
                        onChange={(e) => setForm(p => ({ ...p, maxCapacity: Number(e.target.value) }))}
                        className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Registration Deadline *</label>
                      <input
                        type="datetime-local"
                        required
                        value={form.registrationDeadline}
                        onChange={(e) => setForm(p => ({ ...p, registrationDeadline: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Event Start Date *</label>
                      <input
                        type="datetime-local"
                        required
                        value={form.startDate}
                        onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Event End Date *</label>
                      <input
                        type="datetime-local"
                        required
                        value={form.endDate}
                        onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Venue Location Details *</label>
                    <input
                      type="text"
                      required
                      value={form.venue}
                      onChange={(e) => setForm(p => ({ ...p, venue: e.target.value }))}
                      placeholder="e.g. JRD Tata Hall, TGPCOP Campus, Mohgaon, Nagpur"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Eligibility Criteria Description *</label>
                    <textarea
                      rows={3}
                      value={form.eligibility}
                      onChange={(e) => setForm(p => ({ ...p, eligibility: e.target.value }))}
                      placeholder="Specify who can apply: courses, college restrictions, prerequisite tools..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="px-6 py-3 rounded-xl bg-orange-burnt hover:bg-[#E06D2B] text-white font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                      <span>Proceed to Stages & Rounds</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: MULTI-STAGE ROUNDS (Unstop Signature) */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-display font-bold text-white">Program Rounds & Timeline</h3>
                      <p className="text-xs text-white/50 font-sans">Break down your competition into screening, submission, or stage presentation rounds.</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddRound}
                      className="px-4 py-2 rounded-xl bg-orange-burnt/15 border border-orange-burnt/30 text-orange-burnt hover:bg-orange-burnt hover:text-white text-xs font-display font-bold transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Round</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.rounds.map((round, rIdx) => (
                      <div key={round.id} className="p-5 rounded-2xl bg-[#080F25] border border-white/10 space-y-4 relative">
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <span className="font-display font-bold text-sm text-orange-burnt">
                            Stage #{round.roundNumber}
                          </span>
                          {form.rounds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRound(rIdx)}
                              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-mono text-white/60 block mb-1">Round Title</label>
                            <input
                              type="text"
                              required
                              value={round.title}
                              onChange={(e) => {
                                const newR = [...form.rounds];
                                newR[rIdx].title = e.target.value;
                                setForm(p => ({ ...p, rounds: newR }));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-mono text-white/60 block mb-1">Stage Type</label>
                            <select
                              value={round.type}
                              onChange={(e) => {
                                const newR = [...form.rounds];
                                newR[rIdx].type = e.target.value as any;
                                setForm(p => ({ ...p, rounds: newR }));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[#0B1530] border border-white/10 text-white text-xs"
                            >
                              <option value="submission">Document / Pitch Deck Submission</option>
                              <option value="online_quiz">Online Quiz / Screening MCQ</option>
                              <option value="offline_stage">Live Stage Performance</option>
                              <option value="presentation">Grand Jury Pitching</option>
                              <option value="hackathon">Sprint / Hackathon Coding</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-mono text-white/60 block mb-1">Start Date & Time</label>
                            <input
                              type="datetime-local"
                              required
                              value={round.startDate}
                              onChange={(e) => {
                                const newR = [...form.rounds];
                                newR[rIdx].startDate = e.target.value;
                                setForm(p => ({ ...p, rounds: newR }));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-mono text-white/60 block mb-1">End Date & Time</label>
                            <input
                              type="datetime-local"
                              required
                              value={round.endDate}
                              onChange={(e) => {
                                const newR = [...form.rounds];
                                newR[rIdx].endDate = e.target.value;
                                setForm(p => ({ ...p, rounds: newR }));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-white/60 block mb-1">Round Instructions & Deliverables</label>
                          <textarea
                            rows={2}
                            value={round.description}
                            onChange={(e) => {
                              const newR = [...form.rounds];
                              newR[rIdx].description = e.target.value;
                              setForm(p => ({ ...p, rounds: newR }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(4)}
                      className="px-6 py-3 rounded-xl bg-orange-burnt hover:bg-[#E06D2B] text-white font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                      <span>Proceed to Prizes & Rewards</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PRIZES & REWARDS */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Total Prize Pool Heading *</label>
                    <input
                      type="text"
                      required
                      value={form.totalPrizePool}
                      onChange={(e) => setForm(p => ({ ...p, totalPrizePool: e.target.value }))}
                      placeholder="e.g. ₹50,000 or ₹25,000 + Goodies"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold text-yellow-400"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <h3 className="text-base font-display font-bold text-white">Prize Breakdown</h3>
                    <button
                      type="button"
                      onClick={handleAddPrize}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-orange-burnt font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Prize Tier</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.prizes.map((pz, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#080F25] border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        <div>
                          <input
                            type="text"
                            value={pz.position}
                            onChange={(e) => {
                              const newP = [...form.prizes];
                              newP[idx].position = e.target.value;
                              setForm(p => ({ ...p, prizes: newP }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={pz.amount}
                            onChange={(e) => {
                              const newP = [...form.prizes];
                              newP[idx].amount = e.target.value;
                              setForm(p => ({ ...p, prizes: newP }));
                            }}
                            placeholder="Amount (e.g. ₹15,000)"
                            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-yellow-400 text-xs font-mono font-bold"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={pz.perks}
                            onChange={(e) => {
                              const newP = [...form.prizes];
                              newP[idx].perks = e.target.value;
                              setForm(p => ({ ...p, prizes: newP }));
                            }}
                            placeholder="Trophy, Certificate, Medals"
                            className="flex-grow px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                          />
                          {form.prizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePrize(idx)}
                              className="text-red-400 p-1 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(5)}
                      className="px-6 py-3 rounded-xl bg-orange-burnt hover:bg-[#E06D2B] text-white font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                      <span>Proceed to Coordinators & Rules</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: COORDINATORS, GUIDELINES & FINAL LAUNCH */}
              {wizardStep === 5 && (
                <div className="space-y-6">
                  {/* Coordinators */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-display font-bold text-white">Program Coordinators</h3>
                      <button
                        type="button"
                        onClick={handleAddCoordinator}
                        className="text-xs text-orange-burnt hover:underline font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Coordinator</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {form.coordinators.map((c, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#080F25] border border-white/5 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
                          <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={c.name}
                            onChange={(e) => {
                              const newC = [...form.coordinators];
                              newC[idx].name = e.target.value;
                              setForm(p => ({ ...p, coordinators: newC }));
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Role (e.g. Lead Organizer)"
                            value={c.role}
                            onChange={(e) => {
                              const newC = [...form.coordinators];
                              newC[idx].role = e.target.value;
                              setForm(p => ({ ...p, coordinators: newC }));
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                          />
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={c.phone}
                            onChange={(e) => {
                              const newC = [...form.coordinators];
                              newC[idx].phone = e.target.value;
                              setForm(p => ({ ...p, coordinators: newC }));
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-mono"
                          />
                          <div className="flex items-center gap-1.5">
                            <input
                              type="email"
                              placeholder="Email"
                              value={c.email}
                              onChange={(e) => {
                                const newC = [...form.coordinators];
                                newC[idx].email = e.target.value;
                                setForm(p => ({ ...p, coordinators: newC }));
                              }}
                              className="flex-grow px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-mono"
                            />
                            {form.coordinators.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCoordinator(idx)}
                                className="text-red-400 p-1 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rules */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-display font-bold text-white">Rules & Guidelines</h3>
                      <button
                        type="button"
                        onClick={handleAddRule}
                        className="text-xs text-orange-burnt hover:underline font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Rule</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {form.rules.map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={rule}
                            onChange={(e) => {
                              const newR = [...form.rules];
                              newR[idx] = e.target.value;
                              setForm(p => ({ ...p, rules: newR }));
                            }}
                            className="flex-grow px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                          />
                          {form.rules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRule(idx)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social / WhatsApp Group */}
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Participant WhatsApp Community / Discord Link</label>
                    <input
                      type="url"
                      value={form.whatsappGroupUrl}
                      onChange={(e) => setForm(p => ({ ...p, whatsappGroupUrl: e.target.value }))}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>

                  {/* Launch Bar */}
                  <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(4)}
                      className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-burnt to-[#E06D2B] hover:scale-[1.02] text-white font-display text-sm font-extrabold uppercase tracking-wider shadow-xl shadow-orange-burnt/30 transition-all flex items-center gap-2"
                    >
                      <Rocket className="w-4 h-4" />
                      <span>Launch & Publish Program 🚀</span>
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        )}

        {/* ========================================================
            TAB 2: MANAGE HOSTED PROGRAMS & VIEW APPLICANTS
           ======================================================== */}
        {activeMainTab === 'manage' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-extrabold text-white">My Hosted Programs</h3>
                <p className="text-xs text-white/60 font-sans">Monitor participant registrations, inspect teams, and export applicant CSVs.</p>
              </div>

              <button
                onClick={() => setActiveMainTab('create')}
                className="px-4 py-2 rounded-xl bg-orange-burnt text-white font-display text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-burnt/20"
              >
                <Plus className="w-4 h-4" />
                <span>Host Another</span>
              </button>
            </div>

            {hostedList.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-3xl p-6 max-w-md mx-auto">
                <Rocket className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <h4 className="font-display font-bold text-white">No Programs Hosted Yet</h4>
                <p className="text-xs text-white/50 mt-1 mb-4">Start creating your first hackathon, quiz, or fest opportunity.</p>
                <button
                  onClick={() => setActiveMainTab('create')}
                  className="px-5 py-2 rounded-xl bg-orange-burnt text-white font-display text-xs font-bold"
                >
                  Create Program Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostedList.map(prog => (
                  <div
                    key={prog.id}
                    className="bg-[#0B1530]/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-orange-burnt/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-36 relative overflow-hidden bg-navy-dark">
                        <img src={prog.bannerUrl} alt={prog.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                            {prog.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <span className="text-[10px] font-mono uppercase text-orange-burnt font-bold tracking-wider block">
                          {prog.programType} • {prog.category}
                        </span>
                        <h4 className="font-display font-bold text-base text-white leading-snug line-clamp-2">
                          {prog.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs font-mono text-white/60 pt-2 border-t border-white/5">
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Trophy className="w-3.5 h-3.5" />
                            {prog.totalPrizePool}
                          </span>
                          <span className="flex items-center gap-1 text-cyan-300">
                            <Users className="w-3.5 h-3.5" />
                            {prog.registeredCount} Applied
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenRegistrations(prog)}
                        className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-orange-burnt" />
                        <span>Applicants</span>
                      </button>

                      <Link
                        to={`/programs/${prog.id}`}
                        className="py-2 rounded-xl bg-orange-burnt hover:bg-[#E06D2B] text-white font-display text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <span>View Page</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: EXPLORE ALL OPPORTUNITIES (UNSTOP DISCOVERY FEED)
           ======================================================== */}
        {activeMainTab === 'explore' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#0F1E42]/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
                {[
                  { id: 'all', label: 'All Opportunities' },
                  { id: 'hackathon', label: 'Hackathons' },
                  { id: 'quiz', label: 'Quizzes' },
                  { id: 'cultural', label: 'Cultural' },
                  { id: 'case_comp', label: 'Case Comps' },
                  { id: 'esports', label: 'E-Sports' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setExploreFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold whitespace-nowrap transition-all ${
                      exploreFilter === f.id
                        ? 'bg-orange-burnt text-white shadow-md shadow-orange-burnt/30'
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative sm:w-64">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search programs, hackathons..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-burnt/50"
                />
              </div>
            </div>

            {/* Opportunities Grid (Unstop Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExplorePrograms.map(prog => (
                <div
                  key={prog.id}
                  className="bg-[#0B1530]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-orange-burnt/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Banner Image */}
                    <div className="h-44 w-full relative overflow-hidden bg-navy-dark">
                      <img
                        src={prog.bannerUrl}
                        alt={prog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80";
                        }}
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-orange-burnt text-white uppercase shadow">
                          {prog.programType}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#080F25]/80 text-cyan-300 border border-white/10 uppercase">
                          {prog.mode}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <span className="text-[11px] font-mono text-white/50 block">
                        Hosted by {prog.organization}
                      </span>

                      <h4 className="font-display font-bold text-base text-white group-hover:text-orange-burnt transition-colors leading-snug line-clamp-2">
                        {prog.title}
                      </h4>

                      <p className="text-xs text-white/65 font-sans line-clamp-2 leading-relaxed">
                        {prog.tagline}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5 text-xs font-mono">
                        <div className="text-yellow-400 font-bold flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{prog.totalPrizePool}</span>
                        </div>
                        <div className="text-emerald-400 font-bold">
                          {prog.registrationFee === 0 ? 'Free Entry' : `₹${prog.registrationFee}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      to={`/programs/${prog.id}`}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-burnt to-[#E06D2B] hover:scale-[1.01] active:scale-[0.99] text-white font-display text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-burnt/20"
                    >
                      <span>View & Register</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* Registrations List Inspection Modal */}
      <AnimatePresence>
        {selectedProgramForRegs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B1530] border border-white/15 rounded-3xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl my-8 max-h-[85vh] flex flex-col justify-between"
            >
              <button
                onClick={() => setSelectedProgramForRegs(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pr-10">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-orange-burnt font-bold">Applicant Roster</span>
                    <h3 className="text-xl font-display font-bold text-white">{selectedProgramForRegs.title}</h3>
                  </div>

                  {programRegistrations.length > 0 && (
                    <button
                      onClick={handleExportCSV}
                      className="px-3.5 py-1.5 rounded-xl bg-orange-burnt/20 border border-orange-burnt/40 text-orange-burnt hover:bg-orange-burnt hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto max-h-[50vh] space-y-3 pr-2 scrollbar-thin">
                  {programRegistrations.length === 0 ? (
                    <div className="text-center py-12 text-white/50 text-xs">
                      No student applications submitted yet for this program.
                    </div>
                  ) : (
                    programRegistrations.map((reg) => (
                      <div key={reg.id} className="p-4 rounded-xl bg-[#080F25] border border-white/5 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-display font-bold text-sm text-white">
                            {reg.leaderName} {reg.teamName ? `(${reg.teamName})` : '(Solo)'}
                          </span>
                          <span className="font-mono text-[10px] text-orange-burnt font-bold bg-orange-burnt/10 px-2 py-0.5 rounded">
                            {reg.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-white/60">
                          <span>📧 {reg.leaderEmail}</span>
                          <span>📱 {reg.leaderPhone}</span>
                          <span>🎓 {reg.year} • {reg.college}</span>
                        </div>
                        {reg.members && reg.members.length > 0 && (
                          <div className="pt-2 border-t border-white/5 text-[11px] text-white/50">
                            <strong>Teammates: </strong>
                            {reg.members.map(m => `${m.name} (${m.email})`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedProgramForRegs(null)}
                  className="px-5 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
                >
                  Close Roster
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HostProgram;
