// CFETP (Career Field Education and Training Plan) Database
// Official AF training requirements by AFSC
// Sources: https://static.e-publishing.af.mil/

export const cfetpDatabase = {
  "3F5X1": {
    title: "Administration",
    cfetpUrl: "https://static.e-publishing.af.mil/production/1/af_a1/publication/cfetp3f5x1/cfetp3f5x1.pdf",
    epubsUrl: "https://www.e-publishing.af.mil/",
    lastUpdated: "15 March 2023",
    description: "Performs and manages administrative functions and programs",
    careerFieldManager: "HQ USAF/A1 (Manpower, Personnel & Services)",
    
    skillLevels: {
      apprentice: {
        level: "3-Level",
        awardedAfter: "Completion of Administration Apprentice Course",
        description: "Entry level after completing technical training",
        requirements: [
          "Complete Administration Apprentice Course at Keesler AFB",
          "Complete mandatory CDC enrollment within 45 days of assignment",
          "Begin on-the-job training (OJT)",
          "Complete core tasks identified in STS"
        ],
        trainingTime: "Approximately 35 days technical training",
        cdc: null,
        coreTasksRequired: true
      },
      journeyman: {
        level: "5-Level",
        description: "Qualified to perform duties with minimal supervision",
        requirements: [
          "Complete CDC 3F551 - Administration Journeyman",
          "Complete all mandatory AFQTPs",
          "Demonstrate proficiency on all core tasks",
          "Pass End of Course (EOC) examination",
          "Minimum 12 months in upgrade training",
          "Commander/supervisor recommendation"
        ],
        cdcVolumes: ["3F551"],
        cdcEnrollment: "Within 45 days of entering UGT",
        cdcCompletion: "Not later than 18 months from enrollment",
        minTimeInGrade: "12 months as 3-level",
        coreTasksCount: 23
      },
      craftsman: {
        level: "7-Level",
        description: "Fully qualified technician capable of training others",
        requirements: [
          "Complete CDC 3F571 - Administration Craftsman (if applicable)",
          "Complete 7-level core task qualifications",
          "Demonstrate ability to plan, organize, and direct functions",
          "Complete NCOA or equivalent PME",
          "Minimum 12 months as 5-level"
        ],
        minTimeInGrade: "12 months as 5-level",
        pme: "NCOA in-residence or correspondence"
      },
      superintendent: {
        level: "9-Level",
        description: "Senior enlisted leader and technical expert",
        requirements: [
          "Selected for 9-level by AFPC",
          "Complete SNCOA",
          "Demonstrate mastery of career field functions",
          "Proven leadership capability"
        ],
        pme: "SNCOA"
      }
    },

    coreCompetencies: [
      "Personnel Programs Management",
      "Official Mail and Distribution",
      "Records Management",
      "Publications and Forms Management",
      "Task Management",
      "Information Management",
      "Customer Service Operations",
      "Unit Program Management",
      "Privacy Act and FOIA Processing",
      "Commander's Support Staff Functions"
    ],

    specialtyTrainingStandard: {
      section1: {
        title: "Personnel Programs",
        tasks: [
          "Process personnel actions",
          "Manage awards and decorations program",
          "Coordinate evaluation reports",
          "Process separations and retirements",
          "Manage promotions program"
        ]
      },
      section2: {
        title: "Information Management",
        tasks: [
          "Manage official mail",
          "Process classified material",
          "Maintain filing systems",
          "Manage publications library",
          "Process FOIA requests"
        ]
      },
      section3: {
        title: "Commander Support",
        tasks: [
          "Prepare correspondence",
          "Manage suspense systems",
          "Coordinate staff packages",
          "Process congressional inquiries",
          "Manage executive support"
        ]
      }
    },

    formalCourses: [
      { 
        number: "J3ABR3F531 000A", 
        title: "Administration Apprentice Course", 
        location: "Keesler AFB, MS (338 TRS)", 
        mandatory: true,
        duration: "35 academic days",
        prerequisites: "None"
      },
      { 
        number: "Various", 
        title: "Unit Deployment Manager Course", 
        location: "Online/ADLS", 
        mandatory: false,
        duration: "16 hours"
      },
      {
        number: "Various",
        title: "Records Management Course",
        location: "Online/ADLS",
        mandatory: false,
        duration: "4 hours"
      }
    ],

    cdcCourses: [
      { 
        number: "3F551", 
        title: "Administration Journeyman", 
        level: "5-Level",
        volumes: 2,
        estimatedHours: 90,
        ureRequired: true
      }
    ],

    additionalTraining: [
      { title: "Privacy Act Training", frequency: "Annual", source: "myLearning" },
      { title: "Records Management Training", frequency: "Initial/Annual", source: "ADLS" },
      { title: "OPSEC Awareness", frequency: "Annual", source: "myLearning" },
      { title: "Information Protection", frequency: "Initial", source: "Unit" }
    ],

    references: [
      { number: "AFI 36-2670", title: "Total Force Development", description: "Training and professional development guidance" },
      { number: "AFMAN 36-2100", title: "Military Utilization and Classification", description: "AFSC classification and management" },
      { number: "AFI 33-322", title: "Records Management and Information Governance", description: "Records management procedures" },
      { number: "AFMAN 33-363", title: "Management of Records", description: "Records disposition" },
      { number: "AFI 33-360", title: "Publications and Forms Management", description: "Publications program management" },
      { number: "DoDM 5200.01", title: "DoD Information Security Program", description: "Classified information handling" }
    ],

    careerPath: [
      { rank: "AB-A1C", skill: "3-Level", position: "Administration Apprentice", focus: "Learn core tasks, complete CDCs" },
      { rank: "SrA-SSgt", skill: "5-Level", position: "Administration Journeyman", focus: "Execute duties independently, train others" },
      { rank: "TSgt-MSgt", skill: "7-Level", position: "Administration Craftsman/Superintendent", focus: "Supervise, manage programs" },
      { rank: "SMSgt-CMSgt", skill: "9-Level", position: "Career Field Manager/Superintendent", focus: "Lead organizations, develop policy" }
    ]
  },

  "3E5X1": {
    title: "Engineering",
    cfetpUrl: "https://static.e-publishing.af.mil/production/1/af_a4/publication/cfetp3e5x1/cfetp3e5x1.pdf",
    epubsUrl: "https://www.e-publishing.af.mil/",
    lastUpdated: "1 April 2021",
    description: "Civil Engineer Engineering Specialty - provides engineering support for construction and facilities",
    
    skillLevels: {
      apprentice: {
        level: "3-Level",
        description: "Entry level after completing Engineering Apprentice Course",
        requirements: [
          "Complete Engineering Apprentice Course (J5ABA3E531 000) at Sheppard AFB",
          "Complete mandatory CDC enrollment within 45 days",
          "Demonstrate proficiency in core tasks"
        ],
        trainingTime: "63 academic days"
      },
      journeyman: {
        level: "5-Level", 
        description: "Qualified to perform duties with minimal supervision",
        requirements: [
          "Complete CDC 3E551 - Engineering Journeyman (Volumes A & B)",
          "Complete all AFQTPs for 5-level",
          "Pass End of Course examination",
          "Minimum 12 months in upgrade training"
        ],
        cdcVolumes: ["3E551A", "3E551B"]
      },
      craftsman: {
        level: "7-Level",
        description: "Fully qualified, can train others and manage programs",
        requirements: [
          "Complete 7-skill level CDCs if applicable",
          "Complete all 7-level AFQTPs",
          "12 months as 5-level minimum",
          "Demonstrate leadership and training abilities"
        ]
      },
      superintendent: {
        level: "9-Level",
        description: "Senior manager and technical expert",
        requirements: [
          "Complete SNCOA",
          "Demonstrate mastery of career field",
          "Selected for superintendent duties"
        ]
      }
    },

    coreCompetencies: [
      "Project Management",
      "Blueprint/Drawing Interpretation", 
      "Site Development Planning",
      "Construction Inspection",
      "Materials Testing",
      "Surveying Operations",
      "Contract Administration",
      "Environmental Compliance",
      "Real Property Management",
      "GeoBase Operations"
    ],

    formalCourses: [
      { number: "J5ABA3E531 000", title: "Engineering Apprentice Course", location: "366 TRS, Sheppard AFB", mandatory: true, duration: "63 days" },
      { number: "J4AST3E571 001", title: "Contract Construction Inspector Course", location: "366 TRS (MTT)", mandatory: false },
      { number: "J3AZP3E571 005", title: "Construction Materials Testing", location: "366 TRS", mandatory: false },
      { number: "J3AZP3E571 003", title: "Engineering Design", location: "366 TRS", mandatory: false },
      { number: "J3AZP3E571 004", title: "Construction Surveying", location: "366 TRS", mandatory: false }
    ],

    cdcCourses: [
      { number: "3E551A", title: "Engineering Journeyman Volume A", level: "5-Level" },
      { number: "3E551B", title: "Engineering Journeyman Volume B", level: "5-Level" }
    ],

    contingencyTraining: {
      catI: "Knowledge-level training: Prime BEEF orientation, field sanitation, expedient methods",
      catII: "Task-oriented training: weapons, tent construction, convoy security",
      catIII: "Silver Flag Exercise Sites (Tyndall AFB, Ramstein AB, Kadena AB)",
      frequency: "Active duty: every 30 months, ARC: every 45 months"
    },

    references: [
      { number: "AFI 10-210", title: "Prime Base Engineer Emergency Force (BEEF) Program" },
      { number: "AFPAM 10-219 Vol 1-10", title: "Contingency and Wartime Planning Series" },
      { number: "AFH 10-222", title: "Bare Base Development Series" },
      { number: "UFC 1-200-01", title: "DoD Building Code" }
    ]
  },

  "3D0X2": {
    title: "Cyber Systems Operations",
    cfetpUrl: "https://static.e-publishing.af.mil/production/1/saf_cio_a6/publication/cfetp3d0x2/cfetp3d0x2.pdf",
    epubsUrl: "https://www.e-publishing.af.mil/",
    description: "Operates and maintains cyber systems, networks, and infrastructure",
    
    skillLevels: {
      apprentice: {
        level: "3-Level",
        requirements: [
          "Complete Cyber Systems Operations Apprentice Course at Keesler AFB",
          "Obtain CompTIA Security+ within 6 months of assignment (IAW DoD 8570)",
          "Begin CDC enrollment within 45 days"
        ],
        trainingTime: "65 academic days"
      },
      journeyman: {
        level: "5-Level",
        requirements: [
          "Complete CDC 3D052 - Cyber Systems Operations Journeyman",
          "Pass all URE exams with 70% or higher",
          "Complete all core task certifications",
          "Maintain Security+ certification",
          "Minimum 12 months in upgrade training"
        ],
        cdcVolumes: ["3D052"]
      },
      craftsman: {
        level: "7-Level",
        requirements: [
          "Complete 7-level CDCs",
          "Demonstrate ability to train others",
          "Complete leadership/supervisor training",
          "Minimum 12 months as 5-level"
        ]
      }
    },

    coreCompetencies: [
      "Network Administration",
      "System Security Implementation",
      "Windows/Linux Server Management",
      "Active Directory Administration",
      "Vulnerability Assessment",
      "Incident Response",
      "Virtualization Technologies",
      "Cloud Services Management",
      "Network Troubleshooting",
      "Cybersecurity Operations"
    ],

    certifications: [
      { name: "CompTIA Security+", required: true, timeline: "Within 6 months of assignment", reference: "DoD 8570.01-M" },
      { name: "CompTIA Network+", required: false, recommended: true },
      { name: "CompTIA A+", required: false, recommended: true },
      { name: "Microsoft Certified: Azure Administrator", required: false, recommended: true },
      { name: "CISSP", required: false, recommended: "For 7-level and NCOs" }
    ],

    formalCourses: [
      { number: "3D052", title: "Cyber Systems Operations Apprentice Course", location: "Keesler AFB, MS", mandatory: true, duration: "65 days" },
      { number: "Various", title: "Security+ Certification Prep", location: "Unit/Online", mandatory: true }
    ],

    references: [
      { number: "AFI 17-130", title: "Cybersecurity Program Management" },
      { number: "AFMAN 17-1301", title: "Computer Security" },
      { number: "DoD 8570.01-M", title: "Information Assurance Workforce Improvement Program" }
    ]
  },

  "1N0X1": {
    title: "Operations Intelligence",
    cfetpUrl: "https://static.e-publishing.af.mil/production/1/af_a2/publication/cfetp1n0x1/cfetp1n0x1.pdf",
    description: "Analyzes intelligence to support air, space, and cyber operations",
    
    skillLevels: {
      apprentice: {
        level: "3-Level",
        requirements: [
          "Complete Intelligence Fundamentals Course at Goodfellow AFB",
          "Obtain/maintain TS/SCI security clearance",
          "Begin CDC enrollment"
        ],
        trainingTime: "Approximately 90 days"
      },
      journeyman: {
        level: "5-Level",
        requirements: [
          "Complete CDC 1N051 - Operations Intelligence Journeyman",
          "Complete all core task qualifications",
          "Pass URE examinations",
          "Minimum 12 months in UGT"
        ],
        cdcVolumes: ["1N051A", "1N051B"]
      }
    },

    coreCompetencies: [
      "Intelligence Analysis",
      "Threat Assessment",
      "Target Development",
      "Collection Management",
      "Briefing Techniques",
      "Geospatial Intelligence",
      "Signals Intelligence Awareness",
      "All-Source Analysis",
      "Intelligence Systems Operations",
      "Mission Planning Support"
    ],

    formalCourses: [
      { title: "Intelligence Fundamentals Course", location: "Goodfellow AFB, TX", mandatory: true },
      { title: "Advanced Intelligence Analysis", location: "Various", mandatory: false }
    ]
  },

  "2A3X3": {
    title: "A-10, F-15, and U-2 Avionics Systems",
    cfetpUrl: "https://static.e-publishing.af.mil/",
    description: "Maintains aircraft avionics and electronics systems",
    
    skillLevels: {
      apprentice: {
        level: "3-Level",
        requirements: [
          "Complete Avionics Fundamentals Course at Sheppard AFB",
          "Complete aircraft-specific initial qualification",
          "Begin CDC enrollment"
        ]
      },
      journeyman: {
        level: "5-Level",
        requirements: [
          "Complete CDC 2A333 - Avionics Systems Journeyman",
          "Qualify on assigned aircraft systems",
          "Complete all AFQTPs",
          "Pass EOC exam"
        ],
        cdcVolumes: ["2A333A", "2A333B"]
      }
    },

    coreCompetencies: [
      "Avionics Troubleshooting",
      "Technical Order Compliance",
      "Wire Repair and Maintenance",
      "LRU Replacement",
      "Built-In Test Analysis",
      "System Integration",
      "Safety Procedures",
      "Radar Systems",
      "Navigation Systems",
      "Communication Systems"
    ],

    formalCourses: [
      { title: "Avionics Fundamentals", location: "Sheppard AFB, TX", mandatory: true },
      { title: "Aircraft-Specific Qualification", location: "Operational Unit", mandatory: true }
    ]
  },

  "1C3X1": {
    title: "Command Post",
    cfetpUrl: "https://static.e-publishing.af.mil/production/1/af_a3/publication/cfetp1c3x1/cfetp1c3x1.pdf",
    description: "Operates command and control facilities supporting nuclear and conventional operations",
    
    skillLevels: {
      apprentice: {
        level: "3-Level",
        requirements: [
          "Complete Command Post Apprentice Course at Keesler AFB",
          "Obtain security clearance",
          "Begin CDC enrollment"
        ]
      },
      journeyman: {
        level: "5-Level",
        requirements: [
          "Complete CDC 1C331 - Command Post Journeyman",
          "Qualify on all emergency action procedures",
          "Complete core task certifications",
          "Pass EOC examination"
        ],
        cdcVolumes: ["1C331"]
      }
    },

    coreCompetencies: [
      "Emergency Action Procedures",
      "Crisis Management",
      "OPREP-3 Processing",
      "Secure Communications",
      "Checklist Execution",
      "Reporting Procedures",
      "Command and Control Systems",
      "Nuclear Command and Control",
      "Continuity of Operations"
    ]
  }
};

// UGT (Upgrade Training) Program Requirements
export const ugtRequirements = {
  overview: {
    reference: "AFI 36-2670, Total Force Development",
    purpose: "Upgrade Training (UGT) prepares Airmen to perform duties at the next higher skill level",
    components: [
      "Career Development Courses (CDCs)",
      "On-the-Job Training (OJT)",
      "Qualification Training Packages (QTPs)",
      "Core Task Certification"
    ]
  },
  
  timeline: {
    cdcEnrollment: "Within 45 days of entering UGT",
    cdcCompletion: "Not later than 24 months from enrollment",
    ureScheduling: "After completing 50% of assigned CDC material",
    minimumUgtTime: "12 months in upgrade training",
    extension: "May be extended up to 6 months by commander"
  },

  cdcProgram: {
    description: "Career Development Courses provide knowledge-based training through self-study",
    components: [
      "CDC Volumes (text-based study material)",
      "Unit Review Exercises (UREs) - practice tests",
      "End of Course (EOC) Examination"
    ],
    passingScore: 70,
    ureMinimum: 2,
    retestPolicy: "Wait 30 days before retest, additional volume review required",
    waivers: "Commander may waive for extenuating circumstances"
  },

  ojtProgram: {
    description: "On-the-Job Training provides hands-on experience in actual work environment",
    components: [
      "Core Tasks - mandatory for skill level award",
      "CDC-related tasks",
      "Supervisor-assigned tasks"
    ],
    documentation: "Documented in Training Business Area (TBA) or AF Form 623",
    trainer: "Must be certified at least one skill level higher"
  },

  coreTasks: {
    description: "Tasks designated as critical for performing at the next skill level",
    requirements: [
      "Must demonstrate proficiency (not just knowledge)",
      "Trainer must be certified on the task",
      "Documentation required in training record"
    ],
    certification: "Trainee must 'go/no-go' on task performance"
  },

  roleResponsibilities: {
    trainee: [
      "Maintain current training records",
      "Complete CDC volumes within prescribed timelines",
      "Actively pursue OJT opportunities",
      "Request training when ready for task certification",
      "Notify supervisor of any training barriers"
    ],
    trainer: [
      "Provide hands-on training and demonstrations",
      "Evaluate trainee performance",
      "Document completed training",
      "Provide feedback to supervisor"
    ],
    supervisor: [
      "Develop training plan",
      "Monitor trainee progress",
      "Conduct monthly progress reviews",
      "Recommend for skill level upgrade",
      "Address training deficiencies"
    ],
    commander: [
      "Approve skill level upgrade",
      "Authorize training extensions",
      "Review training program effectiveness"
    ]
  }
};

// Actual training plans by AFSC and skill level
export const trainingPlans = {
  "3F5X1": {
    "3-to-5": {
      title: "3F5X1 Administration: 3-Level to 5-Level Upgrade Training Plan",
      duration: "12-18 months",
      phases: [
        {
          phase: 1,
          name: "Foundation Phase",
          weeks: "1-4",
          objectives: [
            "Enroll in CDC 3F551 within 45 days",
            "Review CFETP Part II (Specialty Training Standard)",
            "Meet with supervisor to develop training plan",
            "Begin Volume 1 study"
          ],
          tasks: [
            { task: "Complete CDC enrollment through AFVEC", week: 1 },
            { task: "Review AFI 36-2670 (Total Force Development)", week: 1 },
            { task: "Obtain CFETP 3F5X1 from e-Publishing", week: 1 },
            { task: "Meet with supervisor - establish study schedule", week: 2 },
            { task: "Begin CDC Volume 1, Unit 1", week: 2 },
            { task: "Start core task training on personnel programs", week: 3 }
          ],
          resources: [
            { title: "CDC 3F551 Volume 1", type: "CDC", source: "AFVEC enrollment" },
            { title: "CFETP 3F5X1", type: "PDF", url: "https://static.e-publishing.af.mil/production/1/af_a1/publication/cfetp3f5x1/cfetp3f5x1.pdf" },
            { title: "AFI 36-2670", type: "Publication", url: "https://www.e-publishing.af.mil/" }
          ]
        },
        {
          phase: 2,
          name: "Knowledge Building Phase",
          weeks: "5-16",
          objectives: [
            "Complete CDC Volume 1",
            "Schedule and pass URE 1",
            "Certify on 50% of core tasks",
            "Begin Volume 2 study"
          ],
          weeklySchedule: [
            { week: "5-6", focus: "CDC Vol 1, Units 2-3: Personnel Programs", hours: 5 },
            { week: "7-8", focus: "CDC Vol 1, Units 4-5: Records Management", hours: 5 },
            { week: "9-10", focus: "CDC Vol 1, Unit 6: Publications", hours: 5 },
            { week: "11-12", focus: "Volume 1 Review & URE 1 Prep", hours: 6 },
            { week: "13", focus: "URE 1 Examination", hours: 2 },
            { week: "14-16", focus: "Begin Volume 2, continue OJT", hours: 5 }
          ],
          milestones: [
            { milestone: "Complete CDC Volume 1", week: 12 },
            { milestone: "Pass URE 1 (70% minimum)", week: 13 },
            { milestone: "50% core tasks certified", week: 16 }
          ]
        },
        {
          phase: 3,
          name: "Mastery Phase",
          weeks: "17-28",
          objectives: [
            "Complete CDC Volume 2",
            "Schedule and pass URE 2",
            "Complete remaining core tasks",
            "Prepare for EOC examination"
          ],
          weeklySchedule: [
            { week: "17-20", focus: "CDC Vol 2: Information Management", hours: 5 },
            { week: "21-24", focus: "CDC Vol 2: Commander Support", hours: 5 },
            { week: "25-26", focus: "Volume 2 Review & URE 2 Prep", hours: 6 },
            { week: "27", focus: "URE 2 Examination", hours: 2 },
            { week: "28", focus: "EOC Prep - comprehensive review", hours: 8 }
          ],
          milestones: [
            { milestone: "Complete CDC Volume 2", week: 26 },
            { milestone: "Pass URE 2 (70% minimum)", week: 27 },
            { milestone: "100% core tasks certified", week: 28 }
          ]
        },
        {
          phase: 4,
          name: "Certification Phase",
          weeks: "29-32",
          objectives: [
            "Pass End of Course (EOC) Examination",
            "Complete all training documentation",
            "Supervisor recommendation for 5-level"
          ],
          tasks: [
            { task: "Schedule EOC with Base Education Office", week: 29 },
            { task: "Final EOC review - focus on weak areas", week: 29 },
            { task: "Take EOC Examination (70% to pass)", week: 30 },
            { task: "Supervisor final review of training records", week: 31 },
            { task: "Commander approval for 5-level upgrade", week: 32 }
          ],
          finalRequirements: [
            "EOC score of 70% or higher",
            "All core tasks certified in TBA",
            "Minimum 12 months in UGT",
            "Commander recommendation"
          ]
        }
      ],
      studyTips: {
        visual: [
          "Create flowcharts for personnel action processes",
          "Use color-coded tabs in CDC volumes",
          "Watch training videos on AF Portal",
          "Draw diagrams of records filing systems"
        ],
        auditory: [
          "Read CDC sections aloud",
          "Discuss concepts with experienced 5-levels",
          "Record key procedures and listen during commute",
          "Join study groups with other UGT trainees"
        ],
        reading: [
          "Take detailed notes from each CDC unit",
          "Rewrite key procedures in your own words",
          "Create written summaries after each study session",
          "Write practice questions for self-testing"
        ],
        kinesthetic: [
          "Practice procedures on actual systems",
          "Shadow experienced personnel during processes",
          "Use hands-on approach during OJT",
          "Take short breaks every 25-30 minutes while studying"
        ]
      }
    }
  },

  "3D0X2": {
    "3-to-5": {
      title: "3D0X2 Cyber Systems Operations: 3-Level to 5-Level Upgrade Training Plan",
      duration: "12-18 months",
      phases: [
        {
          phase: 1,
          name: "Foundation & Certification Phase",
          weeks: "1-8",
          objectives: [
            "Obtain Security+ certification (DoD 8570 requirement)",
            "Enroll in CDC 3D052",
            "Begin core task training"
          ],
          tasks: [
            { task: "Begin Security+ study", week: 1 },
            { task: "Enroll in CDC through AFVEC", week: 2 },
            { task: "Register for Security+ exam", week: 4 },
            { task: "Pass Security+ certification", week: 6 },
            { task: "Begin CDC Volume study", week: 7 }
          ],
          resources: [
            { title: "CompTIA Security+ Study Guide", type: "Book", url: "https://www.comptia.org/certifications/security" },
            { title: "Professor Messer Security+ Videos", type: "Video", url: "https://www.youtube.com/c/professormesser" },
            { title: "CDC 3D052", type: "CDC", source: "AFVEC" }
          ]
        },
        {
          phase: 2,
          name: "Technical Knowledge Phase",
          weeks: "9-24",
          objectives: [
            "Complete CDC material",
            "Pass URE examinations",
            "Certify on technical core tasks"
          ],
          weeklySchedule: [
            { week: "9-12", focus: "Network Administration fundamentals", hours: 5 },
            { week: "13-16", focus: "System Security & Hardening", hours: 5 },
            { week: "17-20", focus: "Server Management & AD", hours: 5 },
            { week: "21-24", focus: "Troubleshooting & Incident Response", hours: 5 }
          ]
        }
      ],
      certificationPath: [
        { cert: "CompTIA Security+", timeline: "Within 6 months", required: true },
        { cert: "CompTIA Network+", timeline: "Optional - enhances skills", required: false },
        { cert: "Microsoft Certified: Azure Fundamentals", timeline: "After 5-level", required: false }
      ]
    }
  }
};

// Common CFETP structure information
export const cfetpStructure = {
  partI: {
    sectionA: "General Information - How the CFETP will be used",
    sectionB: "Career Field Progression - Duties, responsibilities, training strategies",
    sectionC: "Skill Level Training Requirements - Specialty qualifications",
    sectionD: "Resource Constraints",
    sectionE: "Transitional Training Guide"
  },
  partII: {
    sectionA: "Specialty Training Standard (STS) - Duties, tasks, technical references",
    sectionB: "Course Objective List - Training standards",
    sectionC: "Support Materials - QTPs, CerTests",
    sectionD: "Training Course Index",
    sectionE: "MAJCOM Unique Requirements",
    sectionF: "Home Station Training"
  }
};

// Training terminology
export const trainingTerms = {
  AFSC: "Air Force Specialty Code - identifies career field",
  CDC: "Career Development Course - self-study material for upgrade training",
  CFETP: "Career Field Education and Training Plan - comprehensive training document",
  AFQTP: "Air Force Qualification Training Package - standardized task training",
  STS: "Specialty Training Standard - lists duties and tasks required",
  URE: "Unit Review Exercise - practice test for CDC material (min 70% to pass)",
  EOC: "End of Course Examination - final CDC test (min 70% to pass)",
  OJT: "On-the-Job Training - hands-on training at duty station",
  UGT: "Upgrade Training - process to achieve next skill level",
  TBA: "Training Business Area - system for tracking training",
  "3-Level": "Apprentice skill level - entry level after tech school",
  "5-Level": "Journeyman skill level - can work independently",
  "7-Level": "Craftsman skill level - can supervise and train others",
  "9-Level": "Superintendent skill level - senior enlisted leader",
  CoreTask: "Mandatory task for skill level award - must demonstrate proficiency",
  AFI: "Air Force Instruction - policy document",
  AFMAN: "Air Force Manual - procedures document"
};

// Official AF resources
export const officialResources = {
  epubs: {
    name: "AF e-Publishing",
    url: "https://www.e-publishing.af.mil/",
    description: "Official source for AFIs, CFETPs, and publications"
  },
  afvec: {
    name: "AF Virtual Education Center (AFVEC)",
    url: "https://afvec.us.af.mil/",
    description: "CDC enrollment, education records, CCAF tracking"
  },
  mylearning: {
    name: "myLearning",
    url: "https://lms-jets.cce.af.mil/moodle/",
    description: "Air Force LMS for required training and ancillary courses"
  },
  adls: {
    name: "Advanced Distributed Learning Service",
    url: "https://www.airuniversity.af.edu/Barnes/ADLS/",
    description: "Online courses and CBTs"
  },
  etca: {
    name: "Education & Training Course Announcements",
    url: "https://cs2.eis.af.mil/sites/10042/",
    description: "Catalog of formal training courses"
  },
  afpc: {
    name: "Air Force Personnel Center",
    url: "https://www.afpc.af.mil/",
    description: "Personnel actions, assignments, promotions"
  }
};

export default { cfetpDatabase, ugtRequirements, trainingPlans, cfetpStructure, trainingTerms, officialResources };
