import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket, Plus, Trash2, Trophy, Users, Search,
  Download, ExternalLink, ArrowRight,
  Eye, CheckCircle2,
  Layers, Laptop, Music, HelpCircle,
  Briefcase, GraduationCap, X, Edit3
} from 'lucide-react';
import {
  getStoredPrograms, saveHostedProgram,
  deleteHostedProgram, getProgramRegistrations
} from '../../data/hostedPrograms';
import type {
  HostedProgram, ProgramType, ProgramRound, PrizeBreakdown,
  ProgramRegistration
} from '../../data/hostedPrograms';

// Curated high-res Unstop style banners for admin quick selection
const BANNER_PRESETS = [
  { name: 'AI & Hackathon', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Science & Pharma Quiz', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cultural & Music Fest', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' },
  { name: 'E-Sports Gaming', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Case Study & Pitching', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Workshop & Masterclass', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80' }
];

export const AdminOpportunities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'publish' | 'roster'>('list');
  const [programs, setPrograms] = useState<HostedProgram[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<ProgramRegistration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal for Viewing Registrations of a specific program
  const [selectedProgForRegs, setSelectedProgForRegs] = useState<HostedProgram | null>(null);
  const [activeModalRegs, setActiveModalRegs] = useState<ProgramRegistration[]>([]);
  const [modalSearch, setModalSearch] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Wizard Step for Publishing
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);

  // Form State for Opportunity Wizard
  const initialFormState = {
    title: '',
    tagline: '',
    programType: 'hackathon' as ProgramType,
    organization: 'TGPCOP Student Council & Innovation Hub',
    category: 'Technical / Innovation',
    bannerUrl: BANNER_PRESETS[0].url,
    about: '',
    eligibility: 'Open to B.Pharm, M.Pharm, and all College Students across India.',
    participationType: 'team' as 'individual' | 'team' | 'both',
    minTeamSize: 2,
    maxTeamSize: 4,
    registrationFee: 0,
    registrationDeadline: '2026-11-15T23:59',
    startDate: '2026-11-20T09:00',
    endDate: '2026-11-21T18:00',
    venue: 'JRD Tata Hall & TGPCOP Innovation Labs',
    mode: 'hybrid' as 'online' | 'offline' | 'hybrid',
    maxCapacity: 150,
    totalPrizePool: '₹50,000',
    prizes: [
      { position: 'Winner (1st Place)', amount: '₹25,000', perks: 'Champion Trophy + Gold Medal + Certificate of Excellence' },
      { position: '1st Runner Up', amount: '₹15,000', perks: 'Silver Trophy + Merit Certificate' },
      { position: '2nd Runner Up', amount: '₹10,000', perks: 'Bronze Trophy + Merit Certificate' }
    ] as PrizeBreakdown[],
    rounds: [
      {
        id: 'r1',
        roundNumber: 1,
        title: 'Executive Summary & Abstract Submission',
        type: 'submission' as const,
        startDate: '2026-11-01T10:00',
        endDate: '2026-11-15T23:59',
        description: 'Submit a 3-page PDF abstract or presentation deck detailing your innovation or approach.',
        venueOrLink: 'Online Submission Portal'
      },
      {
        id: 'r2',
        roundNumber: 2,
        title: 'Grand Finale Demo & Jury Presentation',
        type: 'offline_stage' as const,
        startDate: '2026-11-20T10:00',
        endDate: '2026-11-21T17:00',
        description: 'Shortlisted teams present their solution live before an esteemed jury panel and industry experts.',
        venueOrLink: 'TGPCOP Auditorium / JRD Tata Hall'
      }
    ] as ProgramRound[],
    rules: [
      'Teams must adhere strictly to submission deadlines.',
      'Plagiarism or use of undisclosed proprietary materials will lead to immediate disqualification.',
      'All registered participants receive official digital certificates of participation.',
      'The organizing committee and jury decisions are final and binding.'
    ],
    coordinators: [
      { name: 'Dr. V. N. Wankhede', role: 'Faculty Coordinator', phone: '9822334455', email: 'coordinator@tgpcop.edu.in' },
      { name: 'Tushar Kalbhut', role: 'Student Convener', phone: '7387215641', email: 'student.council@tgpcop.edu.in' }
    ],
    status: 'published' as 'published' | 'draft' | 'closed'
  };

  const [form, setForm] = useState(initialFormState);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    const list = getStoredPrograms();
    setPrograms(list);
    const regs = getProgramRegistrations();
    setAllRegistrations(regs);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Metrics
  const totalOpportunities = programs.length;
  const activeOpportunities = programs.filter(p => p.status === 'published').length;
  const totalRegistrations = allRegistrations.length || programs.reduce((acc, p) => acc + (p.registeredCount || 0), 0);

  // Filtered Programs
  const filteredPrograms = programs.filter(prog => {
    const matchesSearch = !searchQuery.trim() ||
      prog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || prog.status === statusFilter;
    const matchesType = typeFilter === 'all' || prog.programType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle Delete Opportunity
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this opportunity? All associated application data will be permanently cleared.')) {
      deleteHostedProgram(id);
      loadData();
      showToast('Opportunity removed successfully.');
    }
  };

  // Handle Status Toggle (published / draft / closed)
  const handleStatusChange = (prog: HostedProgram, newStatus: 'published' | 'draft' | 'closed') => {
    const updated = { ...prog, status: newStatus };
    saveHostedProgram(updated);
    loadData();
    showToast(`Opportunity marked as ${newStatus.toUpperCase()}`);
  };

  // Start Editing Opportunity
  const handleEdit = (prog: HostedProgram) => {
    setEditingProgramId(prog.id);
    setForm({
      title: prog.title,
      tagline: prog.tagline,
      programType: prog.programType,
      organization: prog.organization,
      category: prog.category,
      bannerUrl: prog.bannerUrl,
      about: prog.about,
      eligibility: prog.eligibility,
      participationType: prog.participationType,
      minTeamSize: prog.minTeamSize,
      maxTeamSize: prog.maxTeamSize,
      registrationFee: prog.registrationFee,
      registrationDeadline: prog.registrationDeadline?.substring(0, 16) || '',
      startDate: prog.startDate?.substring(0, 16) || '',
      endDate: prog.endDate?.substring(0, 16) || '',
      venue: prog.venue,
      mode: prog.mode,
      maxCapacity: prog.maxCapacity || 100,
      totalPrizePool: prog.totalPrizePool,
      prizes: prog.prizes || [],
      rounds: prog.rounds || [],
      rules: prog.rules || [],
      coordinators: prog.coordinators || [],
      status: prog.status
    });
    setWizardStep(1);
    setActiveTab('publish');
  };

  // Open Registrations Modal
  const handleOpenRegistrations = (prog: HostedProgram) => {
    setSelectedProgForRegs(prog);
    const regs = getProgramRegistrations(prog.id);
    setActiveModalRegs(regs);
    setModalSearch('');
  };

  // Export CSV for single program or master roster
  const exportToCSV = (regs: ProgramRegistration[], filename: string) => {
    if (regs.length === 0) {
      alert('No registrations available to export.');
      return;
    }
    const headers = ['Registration ID', 'Program ID', 'Type', 'Team Name', 'Leader Name', 'Leader Email', 'Phone', 'College', 'Year', 'Registered At', 'Team Members'];
    const rows = regs.map(r => [
      r.id,
      r.programId,
      r.participationType,
      `"${r.teamName || 'N/A'}"`,
      `"${r.leaderName}"`,
      r.leaderEmail,
      r.leaderPhone,
      `"${r.college}"`,
      `"${r.year}"`,
      r.registeredAt,
      `"${(r.members || []).map(m => `${m.name} (${m.email})`).join('; ')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV downloaded successfully.');
  };

  // Handle Form Submission for Publishing/Updating
  const handleSubmitOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please provide a Program Title');
      return;
    }

    const programSlug = editingProgramId || form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + `-${Date.now().toString().slice(-4)}`;

    const newProgram: HostedProgram = {
      id: programSlug,
      title: form.title.trim(),
      tagline: form.tagline.trim(),
      programType: form.programType,
      organization: form.organization.trim(),
      category: form.category.trim(),
      bannerUrl: form.bannerUrl,
      about: form.about.trim() || `${form.title} organized by ${form.organization} for college students.`,
      eligibility: form.eligibility.trim(),
      participationType: form.participationType,
      minTeamSize: Number(form.minTeamSize),
      maxTeamSize: Number(form.maxTeamSize),
      registrationFee: Number(form.registrationFee),
      registrationDeadline: form.registrationDeadline,
      startDate: form.startDate,
      endDate: form.endDate,
      venue: form.venue.trim(),
      mode: form.mode,
      maxCapacity: Number(form.maxCapacity),
      registeredCount: editingProgramId ? (programs.find(p => p.id === editingProgramId)?.registeredCount || 0) : 0,
      totalPrizePool: form.totalPrizePool,
      prizes: form.prizes,
      rounds: form.rounds,
      rules: form.rules.filter(r => r.trim().length > 0),
      coordinators: form.coordinators.filter(c => c.name.trim().length > 0),
      status: form.status,
      hostEmail: 'admin@tgpcop.edu.in',
      hostName: 'TGPCOP Admin Console',
      createdAt: new Date().toISOString()
    };

    saveHostedProgram(newProgram);
    loadData();
    showToast(editingProgramId ? 'Opportunity updated successfully!' : '🎉 Opportunity published live for students!');
    setEditingProgramId(null);
    setForm(initialFormState);
    setWizardStep(1);
    setActiveTab('list');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-burnt to-[#E06D2B] text-white font-display text-sm font-bold shadow-2xl shadow-orange-burnt/40 flex items-center gap-2 border border-white/20 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header Strip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0F1E42]/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-orange-burnt/20 text-orange-burnt border border-orange-burnt/30">
              Unstop Engine v2.0
            </span>
            <span className="text-white/40 text-xs font-mono">• College Student Opportunities</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
            <Rocket className="w-7 h-7 text-orange-burnt animate-pulse" />
            <span>Publish an Opportunity for College Students</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-sans max-w-2xl">
            Host campus hackathons, quizzes, case comps, and fests. Configure multi-stage rounds, cash prizes, registration rules, and manage applicant lists.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch md:self-auto">
          <button
            onClick={() => {
              setEditingProgramId(null);
              setForm(initialFormState);
              setActiveTab('publish');
            }}
            className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-burnt to-[#E06D2B] hover:scale-[1.02] text-white font-display text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-orange-burnt/30 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New</span>
          </button>

          <Link
            to="/programs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-display text-xs font-semibold flex items-center gap-2 transition-colors"
            title="Open student discovery page"
          >
            <span>Live Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-orange-burnt" />
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B1530]/80 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-burnt/15 border border-orange-burnt/20 flex items-center justify-center text-orange-burnt">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-white/50 block">Opportunities</span>
            <span className="text-2xl font-display font-extrabold text-white">{totalOpportunities}</span>
          </div>
        </div>

        <div className="bg-[#0B1530]/80 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-white/50 block">Active Live</span>
            <span className="text-2xl font-display font-extrabold text-emerald-300">{activeOpportunities}</span>
          </div>
        </div>

        <div className="bg-[#0B1530]/80 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-white/50 block">Total Applicants</span>
            <span className="text-2xl font-display font-extrabold text-white">{totalRegistrations}</span>
          </div>
        </div>

        <div className="bg-[#0B1530]/80 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-white/50 block">Prize Pools</span>
            <span className="text-2xl font-display font-extrabold text-yellow-300">Active</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all ${
              activeTab === 'list'
                ? 'bg-orange-burnt text-white shadow-lg shadow-orange-burnt/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            All Opportunities ({programs.length})
          </button>

          <button
            onClick={() => setActiveTab('publish')}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all ${
              activeTab === 'publish'
                ? 'bg-orange-burnt text-white shadow-lg shadow-orange-burnt/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {editingProgramId ? 'Edit Opportunity' : 'Publish Opportunity Wizard'}
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all ${
              activeTab === 'roster'
                ? 'bg-orange-burnt text-white shadow-lg shadow-orange-burnt/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Master Applicant Roster ({allRegistrations.length})
          </button>
        </div>

        {activeTab === 'list' && (
          <div className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${viewMode === 'grid' ? 'bg-orange-burnt text-white' : 'text-white/60'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${viewMode === 'table' ? 'bg-orange-burnt text-white' : 'text-white/60'}`}
            >
              Table
            </button>
          </div>
        )}
      </div>

      {/* ======================================================================
          TAB 1: ALL OPPORTUNITIES LIST (GRID & TABLE)
         ====================================================================== */}
      {activeTab === 'list' && (
        <div className="space-y-5">
          {/* Filter and Search Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#0F1E42]/60 border border-white/10 p-4 rounded-2xl">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search opportunities by title, club or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:border-orange-burnt/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                aria-label="Filter by Status"
                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none"
              >
                <option value="all" className="bg-[#0B1530]">All Statuses</option>
                <option value="published" className="bg-[#0B1530]">Published (Live)</option>
                <option value="draft" className="bg-[#0B1530]">Draft</option>
                <option value="closed" className="bg-[#0B1530]">Closed</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter by Category"
                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none"
              >
                <option value="all" className="bg-[#0B1530]">All Types</option>
                <option value="hackathon" className="bg-[#0B1530]">Hackathons</option>
                <option value="quiz" className="bg-[#0B1530]">Quizzes</option>
                <option value="cultural" className="bg-[#0B1530]">Cultural Fests</option>
                <option value="case_comp" className="bg-[#0B1530]">Case Competitions</option>
                <option value="esports" className="bg-[#0B1530]">E-Sports</option>
                <option value="workshop" className="bg-[#0B1530]">Workshops</option>
              </select>

              <button
                onClick={() => exportToCSV(allRegistrations, `Master_TGPCOP_Unstop_Applicants_${Date.now()}.csv`)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Download all registrations across all programs"
              >
                <Download className="w-3.5 h-3.5 text-orange-burnt" />
                <span>Export Master CSV</span>
              </button>
            </div>
          </div>

          {/* Empty State */}
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl p-8 max-w-lg mx-auto">
              <Rocket className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-white">No Opportunities Found</h3>
              <p className="text-xs text-white/50 mt-1 mb-5">
                {searchQuery ? 'Try adjusting your search query or filters.' : 'Get started by publishing your first opportunity for students.'}
              </p>
              <button
                onClick={() => {
                  setEditingProgramId(null);
                  setForm(initialFormState);
                  setActiveTab('publish');
                }}
                className="px-5 py-2.5 rounded-xl bg-orange-burnt text-white font-display text-xs font-bold shadow-lg shadow-orange-burnt/30"
              >
                Publish First Opportunity
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map(prog => (
                <div
                  key={prog.id}
                  className="bg-[#0B1530]/90 border border-white/10 rounded-3xl overflow-hidden shadow-xl hover:border-orange-burnt/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Banner Image */}
                    <div className="h-40 relative overflow-hidden bg-navy-dark">
                      <img
                        src={prog.bannerUrl}
                        alt={prog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1530] via-transparent to-transparent" />
                      
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 uppercase">
                          {prog.programType}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <select
                          value={prog.status}
                          onChange={(e) => handleStatusChange(prog, e.target.value as any)}
                          aria-label={`Status for ${prog.title}`}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border cursor-pointer ${
                            prog.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : prog.status === 'draft'
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                              : 'bg-red-500/20 text-red-300 border-red-500/40'
                          }`}
                        >
                          <option value="published" className="bg-[#0B1530] text-emerald-300">Live</option>
                          <option value="draft" className="bg-[#0B1530] text-yellow-300">Draft</option>
                          <option value="closed" className="bg-[#0B1530] text-red-300">Closed</option>
                        </select>
                      </div>

                      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-xs font-mono">
                        <span className="text-orange-burnt font-bold flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          {prog.totalPrizePool}
                        </span>
                        <span className="text-white/60 bg-black/40 px-2 py-0.5 rounded-md text-[10px]">
                          {prog.mode.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider block mb-1">
                          {prog.organization}
                        </span>
                        <h4 className="font-display font-bold text-base text-white leading-snug line-clamp-2">
                          {prog.title}
                        </h4>
                        <p className="text-xs text-white/60 font-sans line-clamp-2 mt-1">
                          {prog.tagline}
                        </p>
                      </div>

                      {/* Timeline / Rounds Chip */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/60">
                        <span className="flex items-center gap-1 text-cyan-300">
                          <Users className="w-3.5 h-3.5" />
                          {prog.registeredCount || 0} Applicants
                        </span>
                        <span>
                          {prog.rounds?.length || 1} Stage{(prog.rounds?.length || 1) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-5 pt-0 border-t border-white/5 flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleOpenRegistrations(prog)}
                      className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      title="View registered students & teams"
                    >
                      <Eye className="w-3.5 h-3.5 text-orange-burnt" />
                      <span>Applicants ({prog.registeredCount || 0})</span>
                    </button>

                    <Link
                      to={`/programs/${prog.id}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
                      title="View public live page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleEdit(prog)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
                      title="Edit opportunity details"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-300" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(prog.id, e)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
                      title="Delete opportunity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-[#0B1530]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-white/60 font-mono uppercase tracking-wider">
                      <th className="p-4">Opportunity</th>
                      <th className="p-4">Type & Mode</th>
                      <th className="p-4">Prize Pool</th>
                      <th className="p-4">Applicants</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPrograms.map(prog => (
                      <tr key={prog.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={prog.bannerUrl} alt={prog.title} className="w-12 h-9 rounded-lg object-cover shrink-0" />
                            <div>
                              <span className="font-display font-bold text-white block text-sm line-clamp-1">{prog.title}</span>
                              <span className="text-[11px] text-white/50">{prog.organization}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-white/80 uppercase block">{prog.programType}</span>
                          <span className="text-[10px] text-white/50 capitalize">{prog.mode}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-orange-burnt">
                          {prog.totalPrizePool}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleOpenRegistrations(prog)}
                            className="font-mono font-bold text-cyan-300 hover:underline flex items-center gap-1"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{prog.registeredCount || 0} Registered</span>
                          </button>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            prog.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : prog.status === 'draft'
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                              : 'bg-red-500/20 text-red-300 border-red-500/30'
                          }`}>
                            {prog.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenRegistrations(prog)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                              title="Applicants"
                            >
                              <Eye className="w-3.5 h-3.5 text-orange-burnt" />
                            </button>
                            <Link
                              to={`/programs/${prog.id}`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                              title="Public Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleEdit(prog)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-cyan-300" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(prog.id, e)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
          TAB 2: PUBLISH AN OPPORTUNITY FOR COLLEGE STUDENTS (WIZARD)
         ====================================================================== */}
      {activeTab === 'publish' && (
        <div className="bg-[#0B1530]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Wizard Progress Stepper */}
          <div className="mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[
                { step: 1, label: 'Fundamentals' },
                { step: 2, label: 'Registration & Policy' },
                { step: 3, label: 'Multi-Stage Rounds' },
                { step: 4, label: 'Prizes & Perks' },
                { step: 5, label: 'Rules & Coordinators' }
              ].map(s => {
                const isPassed = wizardStep > s.step;
                const isCurrent = wizardStep === s.step;
                return (
                  <div
                    key={s.step}
                    onClick={() => setWizardStep(s.step)}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-orange-burnt text-white ring-4 ring-orange-burnt/20 scale-110 shadow-lg'
                        : isPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                      {isPassed ? '✓' : s.step}
                    </div>
                    <span className={`text-[10px] font-sans font-semibold tracking-wide hidden sm:block ${
                      isCurrent ? 'text-orange-burnt font-bold' : isPassed ? 'text-white/80' : 'text-white/40'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmitOpportunity} className="space-y-6">
            {/* ----------------- STEP 1: FUNDAMENTALS ----------------- */}
            {wizardStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-display font-extrabold text-white">Step 1: Core Fundamentals & Opportunity Type</h3>
                  <p className="text-xs text-white/50">Define the opportunity name, organizing body, category, and visual banner.</p>
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-burnt/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Organizing Body / Student Council *</label>
                    <input
                      type="text"
                      required
                      value={form.organization}
                      onChange={(e) => setForm(p => ({ ...p, organization: e.target.value }))}
                      placeholder="e.g. TGPCOP Student Council & Innovation Hub"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-burnt/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 mb-1.5">Tagline / One-Liner *</label>
                  <input
                    type="text"
                    required
                    value={form.tagline}
                    onChange={(e) => setForm(p => ({ ...p, tagline: e.target.value }))}
                    placeholder="e.g. Build targeted therapeutics and digital pharmacy solutions, win ₹50,000!"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-burnt/60"
                  />
                </div>

                {/* Opportunity Type Select Grid */}
                <div>
                  <label className="block text-xs font-mono text-white/70 mb-2">Select Opportunity Type *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'hackathon', label: 'Hackathon', icon: Laptop },
                      { id: 'quiz', label: 'Quiz / Trivia', icon: HelpCircle },
                      { id: 'cultural', label: 'Cultural Fest', icon: Music },
                      { id: 'case_comp', label: 'Case Comp', icon: Briefcase },
                      { id: 'esports', label: 'E-Sports', icon: Trophy },
                      { id: 'workshop', label: 'Workshop', icon: GraduationCap },
                      { id: 'conference', label: 'Conference', icon: Layers }
                    ].map(t => {
                      const Icon = t.icon;
                      const isSel = form.programType === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setForm(p => ({ ...p, programType: t.id as ProgramType }))}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                            isSel
                              ? 'bg-orange-burnt/15 border-orange-burnt text-white ring-1 ring-orange-burnt'
                              : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSel ? 'text-orange-burnt' : 'text-white/40'}`} />
                          <span className="font-display font-bold text-xs">{t.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Banner Presets */}
                <div>
                  <label className="block text-xs font-mono text-white/70 mb-2">Banner Cover *</label>
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
                    placeholder="Or paste custom image URL..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 mb-1.5">Detailed Overview & Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={form.about}
                    onChange={(e) => setForm(p => ({ ...p, about: e.target.value }))}
                    placeholder="Explain what the program is about, problem statements, expected deliverables, and how college students can benefit..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-burnt/60"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-orange-burnt text-white font-display text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-burnt/20"
                  >
                    <span>Next: Registration & Policy</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------- STEP 2: REGISTRATION & POLICY ----------------- */}
            {wizardStep === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-display font-extrabold text-white">Step 2: Registration, Eligibility & Mode</h3>
                  <p className="text-xs text-white/50">Configure participation rules, individual/team sizes, dates, and venue.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Mode of Event</label>
                    <select
                      value={form.mode}
                      onChange={(e) => setForm(p => ({ ...p, mode: e.target.value as any }))}
                      className="w-full px-4 py-3 rounded-xl bg-[#0B1530] border border-white/10 text-white text-xs font-mono focus:outline-none"
                    >
                      <option value="offline">Offline (On Campus)</option>
                      <option value="online">Online (Virtual)</option>
                      <option value="hybrid">Hybrid (Online Prelims + Offline Finale)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Participation Policy</label>
                    <select
                      value={form.participationType}
                      onChange={(e) => setForm(p => ({ ...p, participationType: e.target.value as any }))}
                      className="w-full px-4 py-3 rounded-xl bg-[#0B1530] border border-white/10 text-white text-xs font-mono focus:outline-none"
                    >
                      <option value="individual">Individual Only</option>
                      <option value="team">Teams Only</option>
                      <option value="both">Both Individual & Teams Allowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Registration Fee (₹ 0 for Free)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.registrationFee}
                      onChange={(e) => setForm(p => ({ ...p, registrationFee: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {form.participationType !== 'individual' && (
                  <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Min Team Size</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={form.minTeamSize}
                        onChange={(e) => setForm(p => ({ ...p, minTeamSize: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1.5">Max Team Size</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={form.maxTeamSize}
                        onChange={(e) => setForm(p => ({ ...p, maxTeamSize: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Registration Deadline *</label>
                    <input
                      type="datetime-local"
                      required
                      value={form.registrationDeadline}
                      onChange={(e) => setForm(p => ({ ...p, registrationDeadline: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B1530] border border-white/10 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Program Start Date *</label>
                    <input
                      type="datetime-local"
                      required
                      value={form.startDate}
                      onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B1530] border border-white/10 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Program End Date *</label>
                    <input
                      type="datetime-local"
                      required
                      value={form.endDate}
                      onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B1530] border border-white/10 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Venue / Online Link *</label>
                    <input
                      type="text"
                      required
                      value={form.venue}
                      onChange={(e) => setForm(p => ({ ...p, venue: e.target.value }))}
                      placeholder="e.g. JRD Tata Hall, TGPCOP Campus"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1.5">Eligibility Criteria *</label>
                    <input
                      type="text"
                      required
                      value={form.eligibility}
                      onChange={(e) => setForm(p => ({ ...p, eligibility: e.target.value }))}
                      placeholder="e.g. Open to all Pharmacy, Tech, and Degree students."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-3">
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
                    className="px-6 py-2.5 rounded-xl bg-orange-burnt text-white font-display text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-burnt/20"
                  >
                    <span>Next: Multi-Stage Rounds</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------- STEP 3: MULTI-STAGE ROUNDS ----------------- */}
            {wizardStep === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-display font-extrabold text-white">Step 3: Multi-Stage Rounds & Timeline</h3>
                    <p className="text-xs text-white/50">Unstop-style multi-round progressions (e.g. Round 1 Quiz, Round 2 PPT Deck, Round 3 Grand Finale).</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newRound: ProgramRound = {
                        id: `r-${Date.now()}`,
                        roundNumber: form.rounds.length + 1,
                        title: `Round ${form.rounds.length + 1}: Final Pitch`,
                        type: 'offline_stage',
                        startDate: form.startDate,
                        endDate: form.endDate,
                        description: 'Detailed instructions for this round.',
                        venueOrLink: form.venue
                      };
                      setForm(p => ({ ...p, rounds: [...p.rounds, newRound] }));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-orange-burnt" />
                    <span>Add Another Round</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {form.rounds.map((round, idx) => (
                    <div key={round.id || idx} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-burnt/20 text-orange-burnt border border-orange-burnt/30 text-xs font-mono font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-display font-bold text-white text-sm">Round #{idx + 1}</span>
                        </div>
                        {form.rounds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = form.rounds.filter((_, i) => i !== idx);
                              setForm(p => ({ ...p, rounds: updated }));
                            }}
                            className="text-red-400 hover:text-red-300 text-xs font-mono flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-white/50 mb-1">Round Title</label>
                          <input
                            type="text"
                            value={round.title}
                            onChange={(e) => {
                              const updated = [...form.rounds];
                              updated[idx].title = e.target.value;
                              setForm(p => ({ ...p, rounds: updated }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-white/50 mb-1">Round Type</label>
                          <select
                            value={round.type}
                            onChange={(e) => {
                              const updated = [...form.rounds];
                              updated[idx].type = e.target.value as any;
                              setForm(p => ({ ...p, rounds: updated }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-[#0B1530] border border-white/10 text-white text-xs font-mono"
                          >
                            <option value="online_quiz">Online MCQ Quiz</option>
                            <option value="submission">Document / Pitch Deck Submission</option>
                            <option value="offline_stage">On-Stage Live Presentation</option>
                            <option value="hackathon">Coding / Prototyping Sprint</option>
                            <option value="interview">Panel Interview</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-white/50 mb-1">Guidelines & Criteria</label>
                        <textarea
                          rows={2}
                          value={round.description}
                          onChange={(e) => {
                            const updated = [...form.rounds];
                            updated[idx].description = e.target.value;
                            setForm(p => ({ ...p, rounds: updated }));
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-3">
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
                    className="px-6 py-2.5 rounded-xl bg-orange-burnt text-white font-display text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-burnt/20"
                  >
                    <span>Next: Prizes & Rewards</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------- STEP 4: PRIZES & PERKS ----------------- */}
            {wizardStep === 4 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-display font-extrabold text-white">Step 4: Prizes, Perks & Certificates</h3>
                  <p className="text-xs text-white/50">Set total prize pool and podium reward tiers to attract top student talent.</p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 mb-1.5">Total Prize Pool Heading *</label>
                  <input
                    type="text"
                    required
                    value={form.totalPrizePool}
                    onChange={(e) => setForm(p => ({ ...p, totalPrizePool: e.target.value }))}
                    placeholder="e.g. ₹50,000 Cash Pool + Certificates"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm font-mono"
                  />
                </div>

                <div className="space-y-3">
                  {form.prizes.map((pz, idx) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-white/50 mb-1">Rank / Position</label>
                        <input
                          type="text"
                          value={pz.position}
                          onChange={(e) => {
                            const updated = [...form.prizes];
                            updated[idx].position = e.target.value;
                            setForm(p => ({ ...p, prizes: updated }));
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-white/50 mb-1">Cash Award (₹)</label>
                        <input
                          type="text"
                          value={pz.amount}
                          onChange={(e) => {
                            const updated = [...form.prizes];
                            updated[idx].amount = e.target.value;
                            setForm(p => ({ ...p, prizes: updated }));
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono text-yellow-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-white/50 mb-1">Perks & Trophies</label>
                        <input
                          type="text"
                          value={pz.perks}
                          onChange={(e) => {
                            const updated = [...form.prizes];
                            updated[idx].perks = e.target.value;
                            setForm(p => ({ ...p, prizes: updated }));
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-3">
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
                    className="px-6 py-2.5 rounded-xl bg-orange-burnt text-white font-display text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-burnt/20"
                  >
                    <span>Next: Rules & Final Launch</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------- STEP 5: RULES & COORDINATORS ----------------- */}
            {wizardStep === 5 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-display font-extrabold text-white">Step 5: Terms, Rules & Coordinators</h3>
                  <p className="text-xs text-white/50">Finalize guidelines, POC student/faculty coordinators, and launch your opportunity.</p>
                </div>

                {/* Coordinators */}
                <div>
                  <label className="block text-xs font-mono text-white/70 mb-2">Faculty & Student Coordinators</label>
                  <div className="space-y-3">
                    {form.coordinators.map((c, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/10 p-3 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="Name"
                          value={c.name}
                          onChange={(e) => {
                            const updated = [...form.coordinators];
                            updated[idx].name = e.target.value;
                            setForm(p => ({ ...p, coordinators: updated }));
                          }}
                          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Role (e.g. Student Lead)"
                          value={c.role}
                          onChange={(e) => {
                            const updated = [...form.coordinators];
                            updated[idx].role = e.target.value;
                            setForm(p => ({ ...p, coordinators: updated }));
                          }}
                          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Phone Number"
                          value={c.phone}
                          onChange={(e) => {
                            const updated = [...form.coordinators];
                            updated[idx].phone = e.target.value;
                            setForm(p => ({ ...p, coordinators: updated }));
                          }}
                          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={c.email}
                          onChange={(e) => {
                            const updated = [...form.coordinators];
                            updated[idx].email = e.target.value;
                            setForm(p => ({ ...p, coordinators: updated }));
                          }}
                          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Publishing Status */}
                <div className="bg-white/[0.02] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-display font-bold text-white text-sm block">Initial Status</span>
                    <span className="text-xs text-white/50">Live opportunities appear immediately on the student portal.</span>
                  </div>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(p => ({ ...p, status: e.target.value as any }))}
                    className="px-4 py-2 rounded-xl bg-[#0B1530] border border-white/10 text-white text-xs font-mono"
                  >
                    <option value="published">Published (Live to Students)</option>
                    <option value="draft">Draft (Private)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-burnt to-[#E06D2B] hover:scale-[1.02] text-white font-display text-sm font-extrabold uppercase tracking-wider shadow-xl shadow-orange-burnt/40 transition-all flex items-center gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>{editingProgramId ? 'Update & Save Opportunity' : 'Publish Opportunity for College Students 🚀'}</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ======================================================================
          TAB 3: MASTER APPLICANT ROSTER (ALL STUDENTS ACROSS ALL OPPORTUNITIES)
         ====================================================================== */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0F1E42]/60 border border-white/10 p-4 rounded-2xl">
            <div>
              <h3 className="font-display font-bold text-white text-base">Master Student Applicant Roster</h3>
              <p className="text-xs text-white/50">Comprehensive registration log of students and teams participating in college opportunities.</p>
            </div>

            <button
              onClick={() => exportToCSV(allRegistrations, `Master_TGPCOP_Registrations_${Date.now()}.csv`)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-burnt to-[#E06D2B] text-white font-display text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-burnt/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Full CSV ({allRegistrations.length})</span>
            </button>
          </div>

          {allRegistrations.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-3xl p-6">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-2" />
              <h4 className="font-display font-bold text-white">No Registrations Yet</h4>
              <p className="text-xs text-white/50 mt-1">Registrations submitted on public pages will populate here automatically.</p>
            </div>
          ) : (
            <div className="bg-[#0B1530]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-white/60 font-mono uppercase tracking-wider">
                      <th className="p-4">Reg ID & Date</th>
                      <th className="p-4">Student Lead</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">College & Year</th>
                      <th className="p-4">Opportunity</th>
                      <th className="p-4">Type / Team</th>
                      <th className="p-4">Members</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allRegistrations.map(reg => {
                      const prog = programs.find(p => p.id === reg.programId);
                      return (
                        <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono">
                            <span className="text-white/80 block">{reg.id}</span>
                            <span className="text-[10px] text-white/40">{new Date(reg.registeredAt).toLocaleDateString()}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-display font-bold text-white block">{reg.leaderName}</span>
                            {reg.teamName && (
                              <span className="text-[10px] font-mono text-orange-burnt font-semibold">Team: {reg.teamName}</span>
                            )}
                          </td>
                          <td className="p-4 font-mono">
                            <span className="text-white/80 block">{reg.leaderEmail}</span>
                            <span className="text-white/50 text-[11px]">{reg.leaderPhone}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-white/80 block">{reg.college}</span>
                            <span className="text-[10px] text-white/50">{reg.year}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-display font-bold text-white text-xs line-clamp-1">
                              {prog?.title || reg.programId}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/5 text-white/70 border border-white/10">
                              {reg.participationType}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-white/60">
                            {reg.members && reg.members.length > 0 ? (
                              <span>{reg.members.length} member{reg.members.length > 1 ? 's' : ''}</span>
                            ) : (
                              <span className="text-white/30">Solo</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
          MODAL: VIEW APPLICANTS FOR A SPECIFIC PROGRAM
         ====================================================================== */}
      {selectedProgForRegs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1530] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <span className="text-[10px] font-mono uppercase text-orange-burnt font-bold tracking-wider block">
                  Applicants Roster
                </span>
                <h3 className="font-display font-extrabold text-lg text-white">
                  {selectedProgForRegs.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportToCSV(activeModalRegs, `${selectedProgForRegs.id}_Applicants.csv`)}
                  className="px-3 py-1.5 rounded-xl bg-orange-burnt/15 hover:bg-orange-burnt/25 border border-orange-burnt/30 text-orange-burnt font-display text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setSelectedProgForRegs(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-white/5 bg-white/[0.01]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Filter applicants by student name, college, email..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeModalRegs.length === 0 ? (
                <div className="text-center py-12 text-white/50">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No students have registered for this opportunity yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeModalRegs
                    .filter(r =>
                      !modalSearch.trim() ||
                      r.leaderName.toLowerCase().includes(modalSearch.toLowerCase()) ||
                      r.leaderEmail.toLowerCase().includes(modalSearch.toLowerCase()) ||
                      r.college.toLowerCase().includes(modalSearch.toLowerCase()) ||
                      (r.teamName && r.teamName.toLowerCase().includes(modalSearch.toLowerCase()))
                    )
                    .map(reg => (
                      <div key={reg.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-white text-sm">{reg.leaderName}</span>
                            {reg.teamName && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-orange-burnt/15 text-orange-burnt border border-orange-burnt/30">
                                Team: {reg.teamName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono text-white/60">
                            {reg.leaderEmail} • {reg.leaderPhone}
                          </p>
                          <p className="text-[11px] text-white/40">
                            {reg.college} • {reg.year}
                          </p>
                        </div>

                        <div className="text-left md:text-right font-mono text-xs text-white/50">
                          <span className="block font-semibold text-white/80">{reg.id}</span>
                          <span className="text-[10px]">{new Date(reg.registeredAt).toLocaleString()}</span>
                          {reg.members && reg.members.length > 0 && (
                            <div className="mt-1 text-[11px] text-cyan-300">
                              {reg.members.length} additional team member(s)
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOpportunities;
