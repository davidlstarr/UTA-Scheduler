// Comprehensive AFSC training resources database
export const afscData = {
  "1N0X1": {
    title: "Operations Intelligence",
    description: "Analyzes intelligence data to support military operations",
    cdcVolumes: ["1N051A", "1N051B", "1N071"],
    coreCompetencies: [
      "Intelligence Analysis",
      "Threat Assessment",
      "Briefing Techniques",
      "Collection Management",
      "Target Development",
    ],
    trainingModules: [
      {
        id: "1n0-101",
        title: "Intelligence Fundamentals",
        type: "course",
        duration: "4 hours",
        objectives: [
          "Understand intelligence cycle",
          "Identify collection disciplines",
          "Apply analytical frameworks",
        ],
      },
      {
        id: "1n0-102",
        title: "Threat Analysis Techniques",
        type: "course",
        duration: "6 hours",
        objectives: [
          "Assess adversary capabilities",
          "Develop threat assessments",
          "Brief threat information",
        ],
      },
    ],
    videos: [
      {
        title: "Intelligence Cycle Overview",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "15 min",
      },
      {
        title: "Briefing Best Practices",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "22 min",
      },
    ],
    studyGuides: [
      { title: "CDC Volume 1 Study Guide", type: "PDF" },
      { title: "Intelligence Analyst Handbook", type: "PDF" },
    ],
    practiceTests: [
      { title: "URE Practice Exam 1", questions: 50 },
      { title: "URE Practice Exam 2", questions: 50 },
    ],
  },
  "3D0X2": {
    title: "Cyber Systems Operations",
    description: "Manages and operates cyber systems and networks",
    cdcVolumes: ["3D052A", "3D052B", "3D072"],
    coreCompetencies: [
      "Network Administration",
      "System Security",
      "Troubleshooting",
      "Server Management",
      "Virtualization",
    ],
    trainingModules: [
      {
        id: "3d0-101",
        title: "Network Fundamentals",
        type: "course",
        duration: "8 hours",
        objectives: [
          "Configure network devices",
          "Implement subnetting",
          "Troubleshoot connectivity",
        ],
      },
      {
        id: "3d0-102",
        title: "Windows Server Administration",
        type: "hands-on",
        duration: "12 hours",
        objectives: [
          "Install and configure servers",
          "Manage Active Directory",
          "Implement Group Policy",
        ],
      },
      {
        id: "3d0-103",
        title: "Cybersecurity Fundamentals",
        type: "course",
        duration: "6 hours",
        objectives: [
          "Identify security threats",
          "Implement security controls",
          "Respond to incidents",
        ],
      },
    ],
    videos: [
      {
        title: "CompTIA Network+ Full Course",
        url: "https://www.youtube.com/watch?v=qiQR5rTSshw",
        duration: "14 hrs",
      },
      {
        title: "Windows Server 2019 Tutorial",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "4 hrs",
      },
      {
        title: "Active Directory Basics",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "45 min",
      },
    ],
    studyGuides: [
      { title: "Network+ Study Guide", type: "PDF" },
      { title: "Security+ Study Guide", type: "PDF" },
      { title: "CDC Volume 1 Flashcards", type: "Interactive" },
    ],
    practiceTests: [
      { title: "Network+ Practice Exam", questions: 90 },
      { title: "CDC Block 1 Quiz", questions: 25 },
      { title: "Full URE Simulation", questions: 100 },
    ],
    certifications: [
      { name: "CompTIA Network+", required: true },
      { name: "CompTIA Security+", required: true },
      { name: "Microsoft MCP", required: false },
    ],
  },
  "2A3X3": {
    title: "A-10, F-15, and U-2 Avionics Systems",
    description: "Maintains aircraft avionics and electronics systems",
    cdcVolumes: ["2A333A", "2A333B", "2A373"],
    coreCompetencies: [
      "Avionics Troubleshooting",
      "Wire Repair",
      "LRU Replacement",
      "System Integration",
      "Technical Order Compliance",
    ],
    trainingModules: [
      {
        id: "2a3-101",
        title: "Avionics Fundamentals",
        type: "course",
        duration: "10 hours",
        objectives: [
          "Understand avionics architecture",
          "Read wiring diagrams",
          "Use test equipment",
        ],
      },
      {
        id: "2a3-102",
        title: "F-15 Systems Overview",
        type: "simulator",
        duration: "16 hours",
        objectives: [
          "Navigate F-15 avionics",
          "Perform BIT checks",
          "Troubleshoot faults",
        ],
      },
    ],
    videos: [
      {
        title: "Avionics 101",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "30 min",
      },
      {
        title: "Reading Wiring Diagrams",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "45 min",
      },
    ],
    studyGuides: [
      { title: "Avionics Fundamentals Guide", type: "PDF" },
      { title: "Technical Order Navigation", type: "PDF" },
    ],
    practiceTests: [{ title: "Avionics URE Practice", questions: 75 }],
  },
  "1C3X1": {
    title: "Command Post",
    description: "Operates command and control facilities",
    cdcVolumes: ["1C331A", "1C331B", "1C371"],
    coreCompetencies: [
      "Emergency Actions",
      "Crisis Management",
      "Communications",
      "Reporting Procedures",
      "OPREP-3 Processing",
    ],
    trainingModules: [
      {
        id: "1c3-101",
        title: "Command Post Operations",
        type: "course",
        duration: "8 hours",
        objectives: [
          "Process emergency action messages",
          "Execute checklists",
          "Coordinate responses",
        ],
      },
    ],
    videos: [
      {
        title: "Emergency Action Procedures",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "25 min",
      },
    ],
    studyGuides: [{ title: "Command Post CDC Guide", type: "PDF" }],
    practiceTests: [{ title: "CP URE Practice", questions: 60 }],
  },
  "3E5X1": {
    title: "Engineering",
    description: "Provides engineering support for construction and facilities",
    cdcVolumes: ["3E551A", "3E551B"],
    coreCompetencies: [
      "Project Management",
      "Blueprint Reading",
      "Site Surveys",
      "Cost Estimation",
      "Contract Management",
    ],
    trainingModules: [
      {
        id: "3e5-101",
        title: "Engineering Fundamentals",
        type: "course",
        duration: "12 hours",
        objectives: [
          "Read construction drawings",
          "Perform site surveys",
          "Develop project plans",
        ],
      },
    ],
    videos: [
      {
        title: "Blueprint Reading Basics",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "40 min",
      },
    ],
    studyGuides: [{ title: "Engineering Technician Guide", type: "PDF" }],
    practiceTests: [{ title: "Engineering URE Practice", questions: 50 }],
  },
};

// Learning style specific resources and strategies
export const learningStyleStrategies = {
  visual: {
    name: "Visual Learner",
    description:
      "You learn best through images, diagrams, and visual representations",
    icon: "👁️",
    strategies: [
      "Use color-coded notes and highlighters",
      "Create mind maps and flowcharts",
      "Watch video tutorials and demonstrations",
      "Draw diagrams of systems and processes",
      "Use flashcards with images",
    ],
    resourceTypes: [
      "Videos",
      "Diagrams",
      "Infographics",
      "Mind Maps",
      "Flowcharts",
    ],
    studyTips: [
      "Sit in the front of class to see visuals clearly",
      "Use colored pens to organize notes by topic",
      "Create visual timelines for procedures",
      "Sketch systems while reading TOs",
      "Use the 'picture walk' method before reading",
    ],
    cdcApproach: [
      "Highlight key terms in different colors",
      "Draw process diagrams for each section",
      "Create visual summaries of each unit",
      "Watch related YouTube videos",
      "Use sticky notes for key concepts",
    ],
  },
  auditory: {
    name: "Auditory Learner",
    description: "You learn best through listening and verbal explanation",
    icon: "👂",
    strategies: [
      "Record yourself reading CDCs and listen back",
      "Discuss topics with mentors and peers",
      "Create verbal mnemonics and rhymes",
      "Explain concepts out loud to yourself",
      "Listen to podcasts and audio resources",
    ],
    resourceTypes: [
      "Podcasts",
      "Audio Books",
      "Discussions",
      "Verbal Explanations",
      "Recordings",
    ],
    studyTips: [
      "Read study material out loud",
      "Join or form a study group",
      "Teach concepts to others",
      "Use text-to-speech for CDCs",
      "Record and listen to key procedures",
    ],
    cdcApproach: [
      "Read each section aloud",
      "Record yourself explaining concepts",
      "Discuss material with your trainer",
      "Create audio flashcards",
      "Explain procedures to study partners",
    ],
  },
  reading: {
    name: "Reading/Writing Learner",
    description: "You learn best through reading and writing activities",
    icon: "📝",
    strategies: [
      "Take detailed written notes",
      "Rewrite key concepts in your own words",
      "Create written summaries and outlines",
      "Use lists and written procedures",
      "Keep a learning journal",
    ],
    resourceTypes: [
      "Manuals",
      "Written Guides",
      "Notes",
      "Lists",
      "Written Tests",
    ],
    studyTips: [
      "Outline each CDC chapter before studying",
      "Write practice test questions",
      "Create detailed checklists",
      "Rewrite procedures from memory",
      "Keep a glossary of terms",
    ],
    cdcApproach: [
      "Create written outlines of each unit",
      "Write summaries after each study session",
      "Make your own practice questions",
      "Keep a study journal",
      "Rewrite key procedures in your words",
    ],
  },
  kinesthetic: {
    name: "Kinesthetic Learner",
    description:
      "You learn best through hands-on practice and physical activity",
    icon: "🤲",
    strategies: [
      "Practice procedures hands-on whenever possible",
      "Use simulations and trainers",
      "Take breaks to move during study sessions",
      "Create physical flashcard systems",
      "Walk while reviewing material",
    ],
    resourceTypes: [
      "Simulations",
      "Lab Work",
      "Hands-on Practice",
      "Role-play",
      "Physical Models",
    ],
    studyTips: [
      "Request additional OJT time",
      "Use training equipment during study",
      "Take frequent movement breaks",
      "Stand or walk while reading",
      "Practice procedures step-by-step",
    ],
    cdcApproach: [
      "Study near your work area if possible",
      "Handle related equipment while studying",
      "Take a walk break every 20-30 minutes",
      "Use physical flashcard sorting",
      "Practice procedures in sequence",
    ],
  },
};

// Study schedule templates
export const studyScheduleTemplates = {
  aggressive: {
    name: "Accelerated (4-6 weeks)",
    hoursPerDay: 3,
    daysPerWeek: 6,
    description: "Intensive study for fast upgrade",
    schedule: [
      { week: 1, focus: "CDC Volume 1 - Units 1-3", hours: 18 },
      { week: 2, focus: "CDC Volume 1 - Units 4-6", hours: 18 },
      { week: 3, focus: "CDC Volume 1 Review + Practice Tests", hours: 18 },
      { week: 4, focus: "CDC Volume 2 - Units 1-3", hours: 18 },
      { week: 5, focus: "CDC Volume 2 - Units 4-6", hours: 18 },
      { week: 6, focus: "Full Review + URE Prep", hours: 18 },
    ],
  },
  standard: {
    name: "Standard (8-12 weeks)",
    hoursPerDay: 1.5,
    daysPerWeek: 5,
    description: "Balanced approach with work schedule",
    schedule: [
      { week: "1-2", focus: "CDC Volume 1 - Unit 1", hours: 15 },
      { week: "3-4", focus: "CDC Volume 1 - Units 2-3", hours: 15 },
      { week: "5-6", focus: "CDC Volume 1 - Units 4-6", hours: 15 },
      { week: "7-8", focus: "Volume 1 Review + URE 1", hours: 15 },
      { week: "9-10", focus: "CDC Volume 2", hours: 15 },
      { week: "11-12", focus: "Full Review + Final URE", hours: 15 },
    ],
  },
  relaxed: {
    name: "Extended (16+ weeks)",
    hoursPerDay: 1,
    daysPerWeek: 4,
    description: "Flexible pace for busy schedules",
    schedule: [
      { week: "1-4", focus: "CDC Volume 1 - Units 1-2", hours: 16 },
      { week: "5-8", focus: "CDC Volume 1 - Units 3-4", hours: 16 },
      { week: "9-12", focus: "CDC Volume 1 - Units 5-6 + Review", hours: 16 },
      { week: "13-16", focus: "CDC Volume 2 + URE Prep", hours: 16 },
    ],
  },
};

// Practice questions bank (sample)
export const practiceQuestions = {
  general: [
    {
      question: "What is the primary purpose of the CDC program?",
      options: [
        "A. Replace technical school",
        "B. Provide career field knowledge for upgrade training",
        "C. Prepare for promotion testing only",
        "D. Document OJT progress",
      ],
      correct: "B",
      explanation:
        "CDCs provide the knowledge component of upgrade training, complementing hands-on OJT.",
    },
    {
      question:
        "How long do you have to complete a CDC volume after enrollment?",
      options: ["A. 30 days", "B. 60 days", "C. 90 days", "D. 120 days"],
      correct: "C",
      explanation:
        "Members have 90 days from enrollment to complete each CDC volume.",
    },
  ],
};

// Interactive exercises
export const interactiveExercises = {
  memoryPalace: {
    name: "Memory Palace Technique",
    description: "Associate concepts with familiar locations",
    type: "memory",
    steps: [
      "Choose a familiar place (your house, base)",
      "Identify 10 distinct locations within it",
      "Associate each CDC concept with a location",
      "Mentally walk through to recall information",
    ],
  },
  spaceRepetition: {
    name: "Spaced Repetition",
    description: "Review at increasing intervals for retention",
    type: "review",
    intervals: [
      { day: 1, action: "Initial learning" },
      { day: 2, action: "First review" },
      { day: 4, action: "Second review" },
      { day: 7, action: "Third review" },
      { day: 14, action: "Fourth review" },
      { day: 30, action: "Final review" },
    ],
  },
  activeRecall: {
    name: "Active Recall Practice",
    description: "Test yourself without looking at notes",
    type: "testing",
    method: [
      "Read a section of the CDC",
      "Close the book",
      "Write down everything you remember",
      "Check accuracy and fill gaps",
      "Repeat for difficult areas",
    ],
  },
};

export default {
  afscData,
  learningStyleStrategies,
  studyScheduleTemplates,
  practiceQuestions,
  interactiveExercises,
};
