import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  cfetpDatabase,
  officialResources,
  trainingTerms,
  ugtRequirements,
  trainingPlans,
} from "../data/cfetpData";

// Fetch dynamic training resources based on AFSC and learning style
export async function fetchTrainingResources(apiKey, afsc, learningStyle) {
  if (!apiKey) throw new Error("API key required");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  // Get CFETP data if available
  const cfetpInfo = cfetpDatabase[afsc] || null;
  const cfetpContext = cfetpInfo
    ? `
Known CFETP Information for ${afsc}:
- Title: ${cfetpInfo.title}
- Core Competencies: ${cfetpInfo.coreCompetencies?.join(", ")}
- CDC Volumes: ${
        cfetpInfo.skillLevels?.journeyman?.cdcVolumes?.join(", ") ||
        "Check e-Publishing"
      }
- Required Certifications: ${
        cfetpInfo.certifications
          ?.filter((c) => c.required)
          .map((c) => c.name)
          .join(", ") || "See CFETP"
      }
`
    : "";

  const prompt = `You are a training resource curator for Air Force personnel. Find REAL, CURRENT training resources for AFSC ${afsc}.
${cfetpContext}

Based on the ${
    learningStyle || "general"
  } learning style, provide resources in this EXACT JSON format:

{
  "afsc": "${afsc}",
  "title": "Career field title",
  "learningStyle": "${learningStyle || "general"}",
  "cfetpInfo": {
    "cdcVolumes": ["Volume numbers"],
    "formalCourses": ["Course names"],
    "skillProgression": "3-level to 5-level to 7-level requirements summary"
  },
  "videos": [
    {
      "title": "Video title",
      "url": "https://youtube.com/watch?v=REAL_ID",
      "duration": "XX min",
      "description": "Brief description",
      "source": "YouTube channel name",
      "relevance": "How this helps with CDC/upgrade training"
    }
  ],
  "courses": [
    {
      "title": "Course name",
      "provider": "Provider (Coursera, LinkedIn Learning, Udemy, AF e-Learning, ADLS)",
      "url": "https://...",
      "duration": "X hours",
      "free": true/false,
      "relevance": "How this aligns with CFETP requirements"
    }
  ],
  "articles": [
    {
      "title": "Article title",
      "url": "https://...",
      "source": "Website name"
    }
  ],
  "podcasts": [
    {
      "title": "Podcast name",
      "url": "https://...",
      "episode": "Relevant episode"
    }
  ],
  "practiceResources": [
    {
      "title": "Resource name",
      "type": "Flashcards/Quiz/Practice Test/CerTest Prep",
      "url": "https://..."
    }
  ],
  "officialResources": [
    {
      "title": "Official resource name",
      "type": "CFETP/AFI/AFMAN/TO",
      "url": "https://www.e-publishing.af.mil/...",
      "description": "Description",
      "accessInfo": "How to access"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "required": true/false,
      "studyResources": ["Resource URLs"],
      "timeline": "When required"
    }
  ],
  "studyTips": [
    "Tips specific to this learning style and AFSC CDCs"
  ]
}

IMPORTANT:
- Provide REAL URLs to actual resources
- Include official AF resources (e-Publishing, ADLS, myLearning)
- For ${
    learningStyle === "visual"
      ? "VISUAL learners: prioritize video content, diagrams, YouTube tutorials"
      : ""
  }
${
  learningStyle === "auditory"
    ? "AUDITORY learners: prioritize podcasts, video lectures, audio content"
    : ""
}
${
  learningStyle === "reading"
    ? "READING/WRITING learners: prioritize articles, study guides, written materials, flashcards"
    : ""
}
${
  learningStyle === "kinesthetic"
    ? "KINESTHETIC learners: prioritize hands-on labs, simulations, interactive exercises, virtual labs"
    : ""
}
- Include CompTIA, vendor certifications relevant to the AFSC
- Reference specific CDC volumes and CFETP requirements
- Return ONLY valid JSON`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const resources = JSON.parse(text);

    // Merge with known CFETP data
    if (cfetpInfo) {
      resources.cfetpData = cfetpInfo;
      resources.cfetpUrl = cfetpInfo.cfetpUrl;
    }

    return resources;
  } catch (error) {
    console.error("Error fetching resources:", error);
    throw error;
  }
}

// Fetch CFETP information for an AFSC
export async function fetchCFETPInfo(apiKey, afsc) {
  // First check local database
  if (cfetpDatabase[afsc]) {
    return {
      ...cfetpDatabase[afsc],
      source: "local",
      officialLinks: officialResources,
    };
  }

  // If not in database, use AI to find information
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const prompt = `Provide CFETP (Career Field Education and Training Plan) information for Air Force AFSC ${afsc}.

Return this JSON format:
{
  "afsc": "${afsc}",
  "title": "Career field title",
  "description": "Brief description of the career field",
  "skillLevels": {
    "apprentice": {
      "level": "3-Level",
      "requirements": ["List of requirements"],
      "trainingTime": "Typical duration"
    },
    "journeyman": {
      "level": "5-Level",
      "requirements": ["List of requirements"],
      "cdcVolumes": ["CDC volume numbers"]
    },
    "craftsman": {
      "level": "7-Level",
      "requirements": ["List of requirements"]
    }
  },
  "coreCompetencies": ["List of core competencies"],
  "certifications": [
    {"name": "Cert name", "required": true/false, "timeline": "When needed"}
  ],
  "formalCourses": [
    {"title": "Course name", "location": "Base/Location", "mandatory": true/false}
  ],
  "references": [
    {"title": "AFI/AFMAN number", "description": "Description"}
  ],
  "cfetpUrl": "https://www.e-publishing.af.mil/ or specific URL if known"
}

Use accurate information based on Air Force career field requirements.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const cfetpInfo = JSON.parse(text);
    cfetpInfo.source = "generated";
    cfetpInfo.officialLinks = officialResources;

    return cfetpInfo;
  } catch (error) {
    console.error("Error fetching CFETP:", error);
    throw error;
  }
}

// Search YouTube videos specifically
export async function searchYouTubeVideos(apiKey, query, learningStyle) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const styleContext = {
    visual: "tutorials with diagrams, animations, and visual demonstrations",
    auditory: "lectures, explanations, and verbal walkthroughs",
    reading: "presentations with text, slides, and written content on screen",
    kinesthetic:
      "hands-on demonstrations, lab walkthroughs, and practical exercises",
  };

  const prompt = `Find 8-10 REAL YouTube videos for: "${query}"
  
Prefer videos that are ${
    styleContext[learningStyle] || "comprehensive and educational"
  }.

Return ONLY this JSON format:
{
  "videos": [
    {
      "title": "Exact video title",
      "url": "https://www.youtube.com/watch?v=REAL_VIDEO_ID",
      "channel": "Channel name",
      "duration": "XX:XX",
      "views": "XXK views",
      "description": "Brief description",
      "cdcRelevance": "How this helps with CDC study"
    }
  ]
}

ONLY return real, existing YouTube videos with valid URLs.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error searching videos:", error);
    return { videos: [] };
  }
}

// Fetch learning resources by topic
export async function fetchTopicResources(apiKey, topic, afsc, learningStyle) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const cfetpInfo = cfetpDatabase[afsc];

  const prompt = `Find comprehensive learning resources for "${topic}" relevant to Air Force AFSC ${afsc}.
${
  cfetpInfo
    ? `This AFSC focuses on: ${cfetpInfo.coreCompetencies?.join(", ")}`
    : ""
}

Optimize for ${learningStyle || "general"} learning style.

Return ONLY this JSON:
{
  "topic": "${topic}",
  "resources": {
    "beginner": [
      {"title": "...", "type": "video/article/course", "url": "https://...", "duration": "..."}
    ],
    "intermediate": [
      {"title": "...", "type": "video/article/course", "url": "https://...", "duration": "..."}
    ],
    "advanced": [
      {"title": "...", "type": "video/article/course", "url": "https://...", "duration": "..."}
    ]
  },
  "practiceExercises": [
    {"title": "...", "url": "https://...", "type": "lab/quiz/project"}
  ],
  "certifications": [
    {"name": "...", "provider": "...", "url": "https://...", "relevance": "Why this matters for ${afsc}"}
  ],
  "cdcAlignment": "How this topic aligns with CDC requirements"
}

Use REAL URLs to actual resources.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching topic resources:", error);
    throw error;
  }
}

// Generate a personalized study plan based on CFETP
export async function generateStudyPlan(apiKey, profile) {
  const { afsc, learningStyle, availableHours, timeline, weakAreas } = profile;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const cfetpInfo = cfetpDatabase[afsc];
  const cfetpContext = cfetpInfo
    ? `
CFETP Requirements for ${afsc}:
- CDC Volumes: ${
        cfetpInfo.skillLevels?.journeyman?.cdcVolumes?.join(", ") || "See CFETP"
      }
- Core Competencies: ${cfetpInfo.coreCompetencies?.join(", ")}
- Required Certifications: ${
        cfetpInfo.certifications
          ?.filter((c) => c.required)
          .map((c) => c.name)
          .join(", ") || "None specified"
      }
- Formal Courses: ${
        cfetpInfo.formalCourses?.map((c) => c.title).join(", ") || "See CFETP"
      }
`
    : "";

  const prompt = `Create a detailed, personalized study plan for an Airman based on their CFETP requirements:

- AFSC: ${afsc}
- Learning Style: ${learningStyle}
- Available Study Hours: ${availableHours} hours per week
- Target Completion: ${timeline}
- Areas Needing Improvement: ${weakAreas?.join(", ") || "General CDC content"}
${cfetpContext}

Return a comprehensive plan in this JSON format:
{
  "overview": {
    "totalWeeks": X,
    "hoursPerWeek": ${availableHours},
    "mainGoals": ["Complete CDC volumes", "Prepare for URE", "etc"],
    "cfetpAlignment": "How this plan meets CFETP requirements"
  },
  "weeklyPlan": [
    {
      "week": 1,
      "theme": "Week theme (e.g., CDC Volume 1 Unit 1-2)",
      "goals": ["Specific goals"],
      "activities": [
        {
          "day": "Monday",
          "duration": "X hours",
          "activity": "Study CDC section X, watch video Y",
          "resources": [
            {"title": "Resource name", "url": "https://...", "type": "video/reading/practice"}
          ]
        }
      ],
      "milestone": "What should be achieved by end of week",
      "urePrep": "URE practice questions to complete"
    }
  ],
  "dailyRoutine": {
    "warmup": "5-10 min review activity for ${learningStyle} learner",
    "mainStudy": "Core study approach",
    "practice": "Application activity",
    "review": "End of session review method"
  },
  "resources": {
    "primary": [{"title": "...", "url": "https://...", "why": "Why this resource for ${learningStyle} learner"}],
    "supplementary": [{"title": "...", "url": "https://..."}],
    "official": [{"title": "CFETP/AFI", "url": "https://www.e-publishing.af.mil/..."}]
  },
  "assessmentSchedule": [
    {"week": X, "type": "URE Practice/Self-test/Review", "focus": "Topic", "passingScore": "70%"}
  ],
  "certificationPath": [
    {"cert": "Certification name", "prepWeeks": "X-Y", "examDate": "Target date"}
  ]
}

Include REAL resource URLs. Tailor all activities to the ${learningStyle} learning style.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const plan = JSON.parse(text);

    // Add CFETP reference
    if (cfetpInfo) {
      plan.cfetpReference = cfetpInfo;
    }

    return plan;
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw error;
  }
}

// Get training terminology
export function getTrainingTerms() {
  return trainingTerms;
}

// Get official resources
export function getOfficialResources() {
  return officialResources;
}

// Get UGT requirements
export function getUgtRequirements() {
  return ugtRequirements;
}

// Get actual training plan for AFSC
export function getTrainingPlan(afsc, upgradeLevel = "3-to-5") {
  if (trainingPlans[afsc] && trainingPlans[afsc][upgradeLevel]) {
    return trainingPlans[afsc][upgradeLevel];
  }
  return null;
}
