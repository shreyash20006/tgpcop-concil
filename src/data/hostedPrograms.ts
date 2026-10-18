export type ProgramType = 
  | 'hackathon' 
  | 'quiz' 
  | 'cultural' 
  | 'case_comp' 
  | 'workshop' 
  | 'esports' 
  | 'conference';

export interface ProgramRound {
  id: string;
  roundNumber: number;
  title: string;
  type: 'online_quiz' | 'submission' | 'offline_stage' | 'interview' | 'presentation' | 'hackathon';
  startDate: string;
  endDate: string;
  description: string;
  venueOrLink?: string;
}

export interface PrizeBreakdown {
  position: string;
  amount: string;
  perks: string;
}

export interface ProgramCoordinator {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface ProgramRegistration {
  id: string;
  programId: string;
  participationType: 'individual' | 'team';
  teamName?: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  college: string;
  year: string;
  members: { name: string; email: string; phone?: string }[];
  registeredAt: string;
}

export interface HostedProgram {
  id: string;
  title: string;
  tagline: string;
  programType: ProgramType;
  organization: string;
  category: string;
  bannerUrl: string;
  about: string;
  eligibility: string;
  participationType: 'individual' | 'team' | 'both';
  minTeamSize: number;
  maxTeamSize: number;
  registrationFee: number; // 0 for free
  registrationDeadline: string; // ISO date string
  startDate: string;
  endDate: string;
  venue: string;
  mode: 'online' | 'offline' | 'hybrid';
  maxCapacity: number;
  registeredCount: number;
  totalPrizePool: string;
  prizes: PrizeBreakdown[];
  rounds: ProgramRound[];
  rules: string[];
  coordinators: ProgramCoordinator[];
  websiteUrl?: string;
  whatsappGroupUrl?: string;
  status: 'draft' | 'published' | 'closed';
  hostEmail: string;
  hostName: string;
  createdAt: string;
}

export const INITIAL_HOSTED_PROGRAMS: HostedProgram[] = [
  {
    id: "pharmahacks-2026",
    title: "PharmaHacks 2026: 36-Hour Drug Delivery & AI Hackathon",
    tagline: "Build the future of healthcare with Generative AI, Targeted Therapeutics & Digital Pharmacy.",
    programType: "hackathon",
    organization: "TGPCOP Innovation & Incubation Council",
    category: "Technical / AI",
    bannerUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    about: "PharmaHacks 2026 brings together pharmacy scholars, computer scientists, and healthcare enthusiasts for an intense 36-hour hackathon. Participants will prototype solutions tackling novel drug delivery challenges, pharmacovigilance tracking using LLMs, and hospital pharmacy automation.",
    eligibility: "Open to all undergraduate & postgraduate students from Pharmacy, Engineering, and Life Sciences across India.",
    participationType: "team",
    minTeamSize: 2,
    maxTeamSize: 4,
    registrationFee: 0,
    registrationDeadline: "2026-11-10T23:59:59",
    startDate: "2026-11-14T09:00:00",
    endDate: "2026-11-15T21:00:00",
    venue: "TGPCOP Central Innovation Lab & Hybrid Discord",
    mode: "hybrid",
    maxCapacity: 120,
    registeredCount: 48,
    totalPrizePool: "₹50,000",
    prizes: [
      {
        position: "1st Place Winner",
        amount: "₹25,000",
        perks: "Winner Trophy + Incubation Mentorship + Certificate of Excellence"
      },
      {
        position: "1st Runner Up",
        amount: "₹15,000",
        perks: "Silver Trophy + Merit Certificates + Pro Developer Credits"
      },
      {
        position: "2nd Runner Up",
        amount: "₹10,000",
        perks: "Bronze Medal + Certificate + College Innovation Goodies"
      }
    ],
    rounds: [
      {
        id: "r1",
        roundNumber: 1,
        title: "Idea Abstract & PPT Submission",
        type: "submission",
        startDate: "2026-10-25T10:00:00",
        endDate: "2026-11-10T23:59:59",
        description: "Submit a 5-slide PDF pitch deck summarizing problem statement, proposed biomedical architecture, and expected impact.",
        venueOrLink: "Online Submission Portal"
      },
      {
        id: "r2",
        roundNumber: 2,
        title: "36-Hour Live Prototype Sprint",
        type: "hackathon",
        startDate: "2026-11-14T09:00:00",
        endDate: "2026-11-15T18:00:00",
        description: "Continuous coding & formulation sprint with mentor check-ins at 12-hour intervals.",
        venueOrLink: "TGPCOP Innovation Center & Online Discord"
      },
      {
        id: "r3",
        roundNumber: 3,
        title: "Grand Jury Demo & Pitching",
        type: "presentation",
        startDate: "2026-11-15T18:30:00",
        endDate: "2026-11-15T21:00:00",
        description: "7-minute live demonstration followed by 3-minute Q&A with industry pharmaceutical scientists and VC judges.",
        venueOrLink: "JRD Tata Auditorium"
      }
    ],
    rules: [
      "All code and formulations must be developed during the 36-hour sprint window.",
      "Plagiarism or submission of pre-existing commercial products will lead to instant disqualification.",
      "Inter-college and inter-disciplinary teams are strongly encouraged."
    ],
    coordinators: [
      {
        name: "Tushar Kalbhut",
        role: "Head Student Organizer",
        phone: "7387215641",
        email: "tushar.kalbhut@tgpcopcouncil.online"
      },
      {
        name: "Dr. Faculty Advisor",
        role: "Faculty In-Charge",
        phone: "9823000000",
        email: "incubation@tgpcop.edu"
      }
    ],
    websiteUrl: "https://tgpcopcouncil.online/schedule",
    whatsappGroupUrl: "https://chat.whatsapp.com/sample-hackathon-invite",
    status: "published",
    hostEmail: "council@tgpcop.edu",
    hostName: "TGPCOP Student Council",
    createdAt: "2026-10-18T10:00:00"
  },
  {
    id: "national-pharma-quiz-2026",
    title: "National Pharmacovigilance & Clinical Pharmacology Quiz",
    tagline: "Test your rapid-fire acumen on clinical toxicology, pharmacokinetics & ADR signaling.",
    programType: "quiz",
    organization: "TGPCOP Department of Pharmacology",
    category: "Academic / Quiz",
    bannerUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80",
    about: "A premier national-level academic quiz championship challenging pharmacy students on drug interactions, FDA alerts, clinical trial protocols, and clinical pharmacy case studies.",
    eligibility: "Open to B.Pharm (All Years) and D.Pharm students from PCI-approved institutions.",
    participationType: "team",
    minTeamSize: 2,
    maxTeamSize: 2,
    registrationFee: 0,
    registrationDeadline: "2026-11-05T18:00:00",
    startDate: "2026-11-08T10:00:00",
    endDate: "2026-11-08T15:00:00",
    venue: "JRD Tata Hall & Online Speed Round",
    mode: "hybrid",
    maxCapacity: 200,
    registeredCount: 76,
    totalPrizePool: "₹20,000",
    prizes: [
      {
        position: "National Quiz Champions",
        amount: "₹10,000",
        perks: "Grand Trophy + Certificate of National Merit + Pharma Journal Publication"
      },
      {
        position: "Runner Up",
        amount: "₹6,000",
        perks: "Silver Trophy + Merit Certificates"
      },
      {
        position: "2nd Runner Up",
        amount: "₹4,000",
        perks: "Bronze Trophy + Certificates"
      }
    ],
    rounds: [
      {
        id: "q-r1",
        roundNumber: 1,
        title: "Online Screening Prelims (30 Mins, 45 MCQs)",
        type: "online_quiz",
        startDate: "2026-11-08T10:00:00",
        endDate: "2026-11-08T10:45:00",
        description: "Speed test evaluating rapid pharmacology recall. Top 8 teams advance to live buzzer stages.",
        venueOrLink: "TGPCOP Online Quiz Engine"
      },
      {
        id: "q-r2",
        roundNumber: 2,
        title: "Grand On-Stage Buzzer & Rapid Fire Finale",
        type: "offline_stage",
        startDate: "2026-11-08T13:00:00",
        endDate: "2026-11-08T15:00:00",
        description: "Interactive 4-round stage showdown: Audio-Visual identification, Mechanism of Action buzzer, and Clinical Case SOS.",
        venueOrLink: "JRD Tata Hall, TGPCOP Campus"
      }
    ],
    rules: [
      "Strict negative marking in preliminary round.",
      "No electronic devices permitted during the stage finale.",
      "Decision of the Quizmaster will be final and binding."
    ],
    coordinators: [
      {
        name: "Rohan Bhil",
        role: "Quiz Coordinator",
        phone: "7499744133",
        email: "rohan.bhil@tgpcopcouncil.online"
      },
      {
        name: "Vinay Deogade",
        role: "Technical Coordinator",
        phone: "8767489450",
        email: "vinay.deogade@tgpcopcouncil.online"
      }
    ],
    status: "published",
    hostEmail: "pharmacology@tgpcop.edu",
    hostName: "Pharmacology Club",
    createdAt: "2026-10-18T11:00:00"
  },
  {
    id: "bgmi-esports-showdown-2026",
    title: "Battlegrounds Campus Clash: BGMI Championship",
    tagline: "Drop into Erangel, conquer custom rooms, and claim the campus chicken dinner trophy.",
    programType: "esports",
    organization: "TGPCOP Gaming & E-Sports Guild",
    category: "E-Sports",
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    about: "The ultimate battle royale e-sports event! 25 squads enter custom competitive lobbies with esports point tables, point multipliers, and live casted matches on college big screens.",
    eligibility: "Open to all enrolled college students. Valid BGMI IDs required.",
    participationType: "team",
    minTeamSize: 4,
    maxTeamSize: 4,
    registrationFee: 0,
    registrationDeadline: "2026-10-24T20:00:00",
    startDate: "2026-10-26T11:00:00",
    endDate: "2026-10-26T17:00:00",
    venue: "Final Year Classroom & YouTube Live Stream",
    mode: "hybrid",
    maxCapacity: 100,
    registeredCount: 64,
    totalPrizePool: "₹15,000",
    prizes: [
      {
        position: "Champion Squad (Winner)",
        amount: "₹8,000",
        perks: "Winner Champion Trophy + Gold E-Sports Medals"
      },
      {
        position: "1st Runner Up",
        amount: "₹4,000",
        perks: "Silver Medals + Certificates"
      },
      {
        position: "MVP / Highest Fragger",
        amount: "₹3,000",
        perks: "MVP Shield + Custom Gaming Jersey"
      }
    ],
    rounds: [
      {
        id: "es-r1",
        roundNumber: 1,
        title: "Group Qualifiers (Erangel & Miramar)",
        type: "submission",
        startDate: "2026-10-26T11:00:00",
        endDate: "2026-10-26T13:30:00",
        description: "2 Qualifier matches. Top 8 squads from each group advance to the championship finals.",
        venueOrLink: "Custom Room ID / Password shared on WhatsApp"
      },
      {
        id: "es-r2",
        roundNumber: 2,
        title: "Grand Finals (3 Custom Matches)",
        type: "offline_stage",
        startDate: "2026-10-26T14:30:00",
        endDate: "2026-10-26T17:00:00",
        description: "Official BGIS point rule scoring. Live streaming on projector with student casters.",
        venueOrLink: "Final Year Classroom Stage"
      }
    ],
    rules: [
      "No iPads or tablet devices permitted (Smartphones only).",
      "Emulators, triggers, or third-party game modifiers result in immediate squad ban.",
      "All squad members must record POV gameplay."
    ],
    coordinators: [
      {
        name: "Sahil Kamble",
        role: "Tournament Director",
        phone: "9673864672",
        email: "sahil.kamble@tgpcopcouncil.online"
      },
      {
        name: "Sumit Butle",
        role: "Custom Room Host",
        phone: "7498676729",
        email: "sumit.butle@tgpcopcouncil.online"
      }
    ],
    status: "published",
    hostEmail: "esports@tgpcopcouncil.online",
    hostName: "TGPCOP E-Sports Society",
    createdAt: "2026-10-18T12:00:00"
  }
];

const LOCAL_STORAGE_KEY = 'tgpcop_hosted_programs_v1';
const REGISTRATIONS_STORAGE_KEY = 'tgpcop_program_registrations_v1';

export const getStoredPrograms = (): HostedProgram[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_HOSTED_PROGRAMS));
      return INITIAL_HOSTED_PROGRAMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_HOSTED_PROGRAMS;
  } catch (err) {
    console.error("Error reading stored programs:", err);
    return INITIAL_HOSTED_PROGRAMS;
  }
};

export const saveHostedProgram = (program: HostedProgram): void => {
  try {
    const existing = getStoredPrograms();
    const index = existing.findIndex(p => p.id === program.id);
    let updated: HostedProgram[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = program;
    } else {
      updated = [program, ...existing];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Error saving hosted program:", err);
  }
};

export const deleteHostedProgram = (programId: string): void => {
  try {
    const existing = getStoredPrograms();
    const filtered = existing.filter(p => p.id !== programId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Error deleting program:", err);
  }
};

export const getProgramById = (programId: string): HostedProgram | undefined => {
  const programs = getStoredPrograms();
  return programs.find(p => p.id === programId);
};

export const getProgramRegistrations = (programId?: string): ProgramRegistration[] => {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
    if (!raw) return [];
    const list: ProgramRegistration[] = JSON.parse(raw);
    if (!programId) return list;
    return list.filter(r => r.programId === programId);
  } catch (err) {
    console.error("Error reading program registrations:", err);
    return [];
  }
};

export const registerForProgram = (reg: Omit<ProgramRegistration, 'id' | 'registeredAt'>): ProgramRegistration => {
  const newReg: ProgramRegistration = {
    ...reg,
    id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    registeredAt: new Date().toISOString()
  };

  try {
    const list = getProgramRegistrations();
    list.unshift(newReg);
    localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(list));

    // Also increment registeredCount in the program
    const program = getProgramById(reg.programId);
    if (program) {
      saveHostedProgram({
        ...program,
        registeredCount: (program.registeredCount || 0) + 1
      });
    }
  } catch (err) {
    console.error("Error saving program registration:", err);
  }

  return newReg;
};
