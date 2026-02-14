// constants/mockFormations.js
export const mockFormations = [
  {
    id: "1",
    title: "React Native Avancé",
    description:
      "Maîtrisez React Native avec Expo, Firebase et les bonnes pratiques professionnelles",
    category: "Développement Mobile",
    status: "ongoing",
    startDate: "2024-03-15",
    endDate: "2024-06-30",
    schedule: "Lundi & Jeudi 18h-20h",
    maxLearners: 20,
    currentLearners: 12,
    attendanceRate: 85,
    progressionRate: 72,
    invitationCode: "RNADV2024",
    modules: 8,
    completedModules: 5,
    color: "#2563EB",
  },
  {
    id: "2",
    title: "UX/UI Design Pratique",
    description:
      "De la théorie à la pratique : créez des interfaces utilisateur impactantes",
    category: "Design",
    status: "upcoming", // "planned", "ongoing", "completed", "cancelled"
    startDate: "2024-04-01",
    endDate: "2024-07-15",
    schedule: "Mardi 19h-21h",
    maxLearners: 15,
    currentLearners: 8,
    attendanceRate: 92,
    progressionRate: 45,
    invitationCode: "UXUI2024",
    modules: 6,
    completedModules: 2,
    color: "#7C3AED",
  },
  {
    id: "3",
    title: "Gestion de Projet Agile",
    description: "Méthodologies Agile, Scrum et gestion d'équipe efficace",
    category: "Gestion",
    status: "completed", // "planned", "ongoing", "completed", "cancelled"
    startDate: "2024-01-10",
    endDate: "2024-03-20",
    schedule: "Mercredi 17h-19h",
    maxLearners: 25,
    currentLearners: 22,
    attendanceRate: 88,
    progressionRate: 95,
    invitationCode: "AGILE2024",
    modules: 10,
    completedModules: 10,
    color: "#16A34A",
  },
];

// Catégories disponibles
export const formationCategories = [
  { label: "Développement Web & Mobile", value: "web-mobile" },
  { label: "Design UI/UX", value: "design-ui-ux" },
  { label: "Marketing Digital", value: "marketing-digital" },
  { label: "Gestion & Management", value: "gestion-management" },
  { label: "Entrepreneuriat", value: "entrepreneuriat" },
  { label: "Data & Intelligence Artificielle", value: "data-ai" },
  { label: "Soft Skills & Leadership", value: "soft-skills" },
  { label: "Autre", value: "other" },
];

// Statuts
export const formationStatuses = [
  { label: "planned", value: "planned", color: "#6B7280" },
  { label: "ongoing", value: "ongoing", color: "#2563EB" },
  { label: "completed", value: "completed", color: "#16A34A" },
  { label: "cancelled", value: "cancelled", color: "#DC2626" },
];
