export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  type: "academic" | "cultural" | "sports" | "social";
  time?: string;
  venue?: string;
  coordinators?: string[];
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  deadline: string; // Format: YYYY-MM-DD for JavaScript parsing
  prizeInfo: string;
  participationInfo: string;
  googleFormUrl: string;
}

export interface Coordinator {
  name: string;
  phone?: string;
  role?: 'student' | 'faculty';
}

export interface ScheduleEventItem {
  id: string;
  name: string;
  time: string;
  venue: string;
  category?: 'academic' | 'cultural' | 'sports' | 'social';
  highlight?: boolean;
  notes?: string;
}

export interface ScheduleDay {
  srNo: number;
  date: string;         // e.g. "13/10/2026"
  dateIso: string;      // e.g. "2026-10-13"
  dayOfWeek: string;    // e.g. "TUESDAY"
  title: string;
  events: ScheduleEventItem[];
  studentCoordinators: Coordinator[];
  facultyCoordinators?: Coordinator[];
}

export const eventScheduleDays: ScheduleDay[] = [
  {
    srNo: 1,
    date: "13/10/2026",
    dateIso: "2026-10-13",
    dayOfWeek: "TUESDAY",
    title: "Inauguration, Induction Programme & Movie Screening",
    studentCoordinators: [
      { name: "Tushar Kalbhut", phone: "7387215641", role: "student" },
      { name: "Sahil Kamble", phone: "9673864672", role: "student" }
    ],
    facultyCoordinators: [
      { name: "Faculty Advisory Committee", role: "faculty" }
    ],
    events: [
      {
        id: "day1-inauguration",
        name: "INAUGURATION & INDUCTION PROGRAMME",
        time: "10:00 AM - 12:00 PM",
        venue: "JRD TATA HALL",
        category: "academic",
        highlight: true,
        notes: "Welcome ceremony, address by Principal, Council orientation and academic overview."
      },
      {
        id: "day1-flashmob",
        name: "FLASH MOB",
        time: "12:30 PM - 1:30 PM",
        venue: "IN FRONT OF FIRST BUILDING",
        category: "cultural",
        highlight: true,
        notes: "High-energy outdoor dance showcase by senior and junior batches."
      },
      {
        id: "day1-movie",
        name: "CAMPUS MOVIE SCREENING",
        time: "1:30 PM - 4:30 PM",
        venue: "JRD TATA HALL",
        category: "social",
        notes: "Special theatrical screening session for all enrolled students and staff."
      }
    ]
  },
  {
    srNo: 2,
    date: "14/10/2026",
    dateIso: "2026-10-14",
    dayOfWeek: "WEDNESDAY",
    title: "Pharma Quiz, SciToons & Reel Making",
    studentCoordinators: [
      { name: "Rohan Bhil", phone: "7499744133", role: "student" },
      { name: "Vinay Deogade", phone: "8767489450", role: "student" }
    ],
    facultyCoordinators: [
      { name: "Faculty Advisory Committee", role: "faculty" }
    ],
    events: [
      {
        id: "day2-quiz",
        name: "PHARMA & GENERAL KNOWLEDGE QUIZ",
        time: "10:00 AM - 11:00 AM",
        venue: "JRD TATA HALL",
        category: "academic",
        highlight: true,
        notes: "Inter-batch buzzer round testing pharmaceutical science, general aptitude, and current affairs."
      },
      {
        id: "day2-scitoons",
        name: "SciToons (Scientific Cartoons Contest)",
        time: "11:00 AM - 12:00 PM",
        venue: "JRD TATA HALL",
        category: "academic",
        notes: "Express complex biomedical concepts through creative humor and illustrative cartoons."
      },
      {
        id: "day2-reelmaking",
        name: "CAMPUS REEL MAKING CONTEST",
        time: "12:30 PM - 1:00 PM",
        venue: "JRD TATA HALL & CAMPUS",
        category: "cultural",
        notes: "Capture creative video reels highlighting student life, science, and campus moments."
      }
    ]
  },
  {
    srNo: 3,
    date: "15/10/2026",
    dateIso: "2026-10-15",
    dayOfWeek: "THURSDAY",
    title: "Cultural Extravaganza - Dance, Singing, Drama, Open Mic & Ramp Walk",
    studentCoordinators: [
      { name: "Shruti Kamble", phone: "9307037025", role: "student" },
      { name: "Varsha Damahe", phone: "7821924489", role: "student" }
    ],
    facultyCoordinators: [
      { name: "Faculty Advisory Committee", role: "faculty" }
    ],
    events: [
      {
        id: "day3-cultural-day",
        name: "DANCE, SINGING, DRAMA, OPEN MIC & RAMP WALK",
        time: "10:00 AM - 5:30 PM",
        venue: "JRD TATA HALL",
        category: "cultural",
        highlight: true,
        notes: "Full day stage performance carnival: Solo/Group Dance, Singing, Theatrical Drama, Open Mic Poetry/Standup, and Fashion Ramp Walk."
      }
    ]
  },
  {
    srNo: 4,
    date: "16/10/2026",
    dateIso: "2026-10-16",
    dayOfWeek: "FRIDAY",
    title: "Grand Traditional Garba Celebration & Dandiya Raas",
    studentCoordinators: [
      { name: "Disha Bhave", phone: "9270255651", role: "student" },
      { name: "Adwait Hingwe", phone: "9561503252", role: "student" },
      { name: "Akash Gaikwad", phone: "9156580306", role: "student" }
    ],
    facultyCoordinators: [
      { name: "Faculty Advisory Committee", role: "faculty" }
    ],
    events: [
      {
        id: "day4-garba",
        name: "TRADITIONAL GARBA & DANDIYA",
        time: "1:00 PM - 5:00 PM",
        venue: "IN FRONT OF THIRD BUILDING",
        category: "cultural",
        highlight: true,
        notes: "Traditional attire celebration with DJ folk beats, live dhol rhythms, and student performances."
      },
      {
        id: "day4-refreshment",
        name: "REFRESHMENTS & TEA BREAK",
        time: "3:30 PM onwards",
        venue: "IN FRONT OF THIRD BUILDING",
        category: "social",
        notes: "Evening refreshments provided for all student participants and faculty members."
      }
    ]
  },
  {
    srNo: 5,
    date: "17/10/2026",
    dateIso: "2026-10-17",
    dayOfWeek: "SATURDAY",
    title: "E-Sports, Treasure Hunt & Closing Ceremony",
    studentCoordinators: [
      { name: "Sahil Kamble", phone: "9673864672", role: "student" },
      { name: "Sumit Butle", phone: "7498676729", role: "student" },
      { name: "Tushar Kalbhut", phone: "7387215641", role: "student" }
    ],
    facultyCoordinators: [
      { name: "Faculty Advisory Committee", role: "faculty" }
    ],
    events: [
      {
        id: "day5-esports-bgmi",
        name: "E-SPORTS: BGMI TOURNAMENT",
        time: "10:00 AM - 12:30 PM",
        venue: "FINAL YEAR CLASSROOM",
        category: "sports",
        highlight: true,
        notes: "Squad battle royale matches with custom room lobbies and live scoring."
      },
      {
        id: "day5-esports-freefire",
        name: "E-SPORTS: FREE FIRE TOURNAMENT",
        time: "10:00 AM - 12:30 PM",
        venue: "FINAL YEAR CLASSROOM",
        category: "sports",
        notes: "Action clash squads showdown across multiple competitive elimination brackets."
      },
      {
        id: "day5-treasurehunt",
        name: "CAMPUS TREASURE HUNT",
        time: "1:00 PM - 3:00 PM",
        venue: "FIRST BUILDING",
        category: "sports",
        highlight: true,
        notes: "Solve scientific riddles, decipher cipher clues, and race across campus to unearth the hidden treasure."
      },
      {
        id: "day5-prize-distribution",
        name: "PRIZE DISTRIBUTION & CLOSING CEREMONY",
        time: "3:00 PM - 3:30 PM",
        venue: "JRD TATA HALL",
        category: "academic",
        highlight: true,
        notes: "Felicitation of competition winners, distribution of trophies & certificates, and council vote of thanks."
      }
    ]
  }
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "gathering-day1-2026",
    title: "Day 1: Inauguration, Induction & Movie Premiere",
    date: "October 13, 2026",
    time: "10:00 AM - 4:30 PM",
    venue: "JRD Tata Hall & First Building",
    description: "Grand Inauguration and Induction Programme (10:00 AM - 12:00 PM at JRD Tata Hall), followed by an electrifying Flash Mob (12:30 - 1:30 PM in front of First Building) and Campus Movie Screening (1:30 - 4:30 PM). Coordinators: Tushar Kalbhut [7387215641], Sahil Kamble [9673864672].",
    type: "academic",
    coordinators: ["Tushar Kalbhut (7387215641)", "Sahil Kamble (9673864672)"]
  },
  {
    id: "gathering-day2-2026",
    title: "Day 2: Pharma Quiz, SciToons & Reel Making",
    date: "October 14, 2026",
    time: "10:00 AM - 1:00 PM",
    venue: "JRD Tata Hall",
    description: "Intellectual showdown featuring Inter-Batch Pharma Quiz (10:00 - 11:00 AM), SciToons Cartoon Competition (11:00 AM - 12:00 PM), and Creative Reel Making contest (12:30 - 1:00 PM). Coordinators: Rohan Bhil [7499744133], Vinay Deogade [8767489450].",
    type: "academic",
    coordinators: ["Rohan Bhil (7499744133)", "Vinay Deogade (8767489450)"]
  },
  {
    id: "gathering-day3-2026",
    title: "Day 3: Cultural Day (Dance, Singing, Drama, Open Mic, Ramp Walk)",
    date: "October 15, 2026",
    time: "10:00 AM - 5:30 PM",
    venue: "JRD Tata Hall",
    description: "The grand cultural stage celebration of TGPCOP! Featuring solo/group Dance, Singing competitions, theatrical Drama, Open Mic poetry/stand-up, and Fashion Ramp Walk. Coordinators: Shruti Kamble [9307037025], Varsha Damahe [7821924489].",
    type: "cultural",
    coordinators: ["Shruti Kamble (9307037025)", "Varsha Damahe (7821924489)"]
  },
  {
    id: "gathering-day4-2026",
    title: "Day 4: Traditional Garba & Dandiya Festival",
    date: "October 16, 2026",
    time: "1:00 PM - 5:00 PM",
    venue: "In Front of Third Building",
    description: "Grand traditional Garba celebration with ethnic dress codes, DJ dhol beats, and student dandiya performances (1:00 - 5:00 PM), with refreshments served at 3:30 PM. Coordinators: Disha Bhave [9270255651], Adwait Hingwe [9561503252], Akash Gaikwad [9156580306].",
    type: "cultural",
    coordinators: ["Disha Bhave (9270255651)", "Adwait Hingwe (9561503252)", "Akash Gaikwad (9156580306)"]
  },
  {
    id: "gathering-day5-2026",
    title: "Day 5: E-Sports (BGMI/Free Fire), Treasure Hunt & Valedictory",
    date: "October 17, 2026",
    time: "10:00 AM - 3:30 PM",
    venue: "Final Year Classroom & JRD Tata Hall",
    description: "High-octane E-Sports Tournament (BGMI & Free Fire from 10:00 AM - 12:30 PM in Final Year Classroom), Campus Treasure Hunt (1:00 - 3:00 PM at First Building), followed by Grand Prize Distribution and Closing Ceremony (3:00 - 3:30 PM in JRD Tata Hall). Coordinators: Sahil Kamble [9673864672], Sumit Butle [7498676729], Tushar Kalbhut [7387215641].",
    type: "sports",
    coordinators: ["Sahil Kamble (9673864672)", "Sumit Butle (7498676729)", "Tushar Kalbhut (7387215641)"]
  },
  {
    id: "b100dda7-ea02-4026-b104-d0ae7e11fe26",
    title: "Blood Donation Drive 2026 🩸",
    date: "July 01, 2026",
    description: "Donate Blood, Donate Life! Be a Hero. Save a Life.\n\nOrganized by TGPCOP at the TGPCOP Campus. All donors receive refreshments, water bottle/tiffin, and blood donor priority card.",
    type: "social"
  },
  {
    id: "world-pharmacist-2025",
    title: "World Pharmacist Day Celebrations",
    date: "September 25, 2025",
    description: "Free diabetes & blood pressure health checkup camp in neighboring villages, followed by a public awareness rally and guest lecture by FDA Joint Commissioner.",
    type: "social"
  },
  {
    id: "aura-fest-2026",
    title: "Annual Pharma-Fest 'AURA 2026'",
    date: "February 12-14, 2026",
    description: "TGPCOP's flagship 3-day annual festival with scientific exhibits, technical presentations, and cultural nights. Over 15 pharmacy colleges participated.",
    type: "cultural"
  },
  {
    id: "pv-seminar-2026",
    title: "National Seminar on Modern Pharmacovigilance",
    date: "April 08, 2026",
    description: "A state-of-the-art national seminar on Adverse Drug Reaction (ADR) reporting tools, signal detection, and clinical trials databases with Sun Pharma & Lupin speakers.",
    type: "academic"
  },
  {
    id: "sports-week-2026",
    title: "TGPCOP Sports Week 'SPARX'",
    date: "May 02-05, 2026",
    description: "Cricket tournaments, badminton singles, table tennis, volleyball, and chess competitions held across the college sports complex.",
    type: "sports"
  }
];

export const competitions: Competition[] = [
  {
    id: "bgmi-tournament-2026",
    title: "E-Sports BGMI Championship 2026",
    description: "Squad Battle Royale on custom Erangel lobbies. Bring your four-player team and battle for the ultimate campus chicken dinner and e-sports glory.",
    deadline: "2026-10-16",
    prizeInfo: "🏆 Winner Squad Cash Prize + Champion Certificates",
    participationInfo: "Open to all TGPCOP B.Pharm & D.Pharm batches (4 players per squad).",
    googleFormUrl: "#register"
  },
  {
    id: "free-fire-2026",
    title: "Free Fire Clash Squad Showdown",
    description: "Fast-paced clash squads tournament. Strategize with your crew, eliminate opponents, and survive to win the tournament trophy.",
    deadline: "2026-10-16",
    prizeInfo: "🏆 Winner & Runner-up Trophies + Merit Badges",
    participationInfo: "Open to all students. Squad mode (4 members).",
    googleFormUrl: "#register"
  },
  {
    id: "campus-treasure-hunt-2026",
    title: "Campus Mega Treasure Hunt",
    description: "A race against time! Decipher pharmaceutical riddles, decode chemistry ciphers, and find hidden checkpoints across the First Building.",
    deadline: "2026-10-17",
    prizeInfo: "🏆 Grand Treasure Prize Bag + Mystery Hampers",
    participationInfo: "Teams of 2 to 4 members. Registration at venue desk.",
    googleFormUrl: "#register"
  },
  {
    id: "scitoons-contest-2026",
    title: "SciToons: Scientific Cartooning Contest",
    description: "Convey serious pharmacy, pharmacovigilance, or medical discoveries with wit and humor! Submit original hand-drawn or digital cartoons.",
    deadline: "2026-10-14",
    prizeInfo: "🏆 Cash prizes up to ₹3,000 + Display in College Magazine",
    participationInfo: "Individual submission. Drawing sheets provided.",
    googleFormUrl: "#register"
  },
  {
    id: "pharma-quiz-2026",
    title: "Pharma Quiz 2026",
    description: "Test your rapid-fire knowledge on pharmacology, pharmaceutics, pharmacognosy, and clinical chemistry. Teams of 2 compete across interactive buzzer rounds.",
    deadline: "2026-10-14",
    prizeInfo: "🏆 Cash prizes up to ₹5,000 + Merit Certificates",
    participationInfo: "Open to B.Pharm and D.Pharm students of all years.",
    googleFormUrl: "#register"
  },
  {
    id: "reel-making-2026",
    title: "Creative Campus Reel Making",
    description: "Shoot and edit high-quality 30-60 second Instagram reels highlighting the vibe, events, and scientific spirit of TGPCOP.",
    deadline: "2026-10-14",
    prizeInfo: "🏆 Best Reel Featured on Official Instagram + Exciting Goodies",
    participationInfo: "Individual or Team entry (Max 2 members).",
    googleFormUrl: "#register"
  }
];
