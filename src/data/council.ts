export interface CouncilMember {
  id: string;
  role: string;
  name: string;
  year: string;
  avatarSeed: string; // Used to generate unique avatar visuals
}

export const councilMembers: CouncilMember[] = [
  {
    id: "tushar-kalbhut",
    role: "PRESIDENT",
    name: "Tushar Kalbhut",
    year: "B.Pharm III Year",
    avatarSeed: "TK"
  },
  {
    id: "harshal-hatwar",
    role: "VICE PRESIDENT",
    name: "Harshal Hatwar",
    year: "B.Pharm II Year",
    avatarSeed: "HH"
  },
  {
    id: "vinay-deogade",
    role: "GENERAL SECRETARY",
    name: "Vinay Deogade",
    year: "B.Pharm II Year",
    avatarSeed: "VD"
  },
  {
    id: "varsha-damahe",
    role: "SECRETARY",
    name: "Varsha Damahe",
    year: "B.Pharm III Year",
    avatarSeed: "VD2"
  },
  {
    id: "laksh-jaiswal",
    role: "TREASURER",
    name: "Laksh Jaiswal",
    year: "B.Pharm II Year",
    avatarSeed: "LJ"
  },
  {
    id: "rohan-bhil",
    role: "TREASURER",
    name: "Rohan Bhil",
    year: "B.Pharm III Year",
    avatarSeed: "RB"
  },
  {
    id: "shivam-waghmare",
    role: "NSS INCHARGE",
    name: "Shivam Waghmare",
    year: "B.Pharm III Year",
    avatarSeed: "SW"
  },
  {
    id: "shruti-kamble",
    role: "CULTURAL SECRETARY",
    name: "Shruti Kamble",
    year: "B.Pharm II Year",
    avatarSeed: "SK"
  },
  {
    id: "akash-gaiwad",
    role: "OVERALL SECRETARY",
    name: "Akash Gaiwad",
    year: "B.Pharm III Year",
    avatarSeed: "AG"
  },
  {
    id: "nayan-thote",
    role: "EVENTS & WORKSHOP COORDINATOR",
    name: "Nayan Thote",
    year: "B.Pharm I Year",
    avatarSeed: "NT"
  },
  {
    id: "anjali-hardas",
    role: "ANTI-RAGGING INCHARGE",
    name: "Anjali Hardas",
    year: "B.Pharm I Year",
    avatarSeed: "AH"
  },
  {
    id: "nandini-rajurkar",
    role: "COLLEGE ISSUES REPRESENTATIVE",
    name: "Nandini Rajurkar",
    year: "B.Pharm III Year",
    avatarSeed: "NR"
  },
  {
    id: "himani-kambale",
    role: "SOCIAL MEDIA INCHARGE",
    name: "Himani Kambale",
    year: "B.Pharm I Year",
    avatarSeed: "HK"
  }
];
