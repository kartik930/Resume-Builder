const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Initialize Google Generative AI client
 */
const getAIClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
        throw new Error("Gemini API key is not configured. Please add GEMINI_API_KEY to your backend/.env file.");
    }
    return new GoogleGenerativeAI(apiKey);
};

/**
 * Optimize resume data using Gemini 1.5 Flash
 * @param {Object} resumeData The original resume data
 * @returns {Promise<Object>} The optimized resume sections (summary, experience, projects, skills)
 */
const optimizeResume = async (resumeData) => {
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `
You are an elite professional resume writer and career coach specializing in ATS (Applicant Tracking System) optimization. 
Analyze the following resume JSON and optimize it to make it highly professional, impact-driven, and recruiter-friendly.

Input Resume JSON:
${JSON.stringify(resumeData, null, 2)}

Instructions for optimization:
1. **Professional Summary** (personalInfo.summary):
   - Rewrite this to be a compelling, action-oriented elevator pitch (3-4 sentences).
   - Inject relevant keywords and focus on value proposition and key domains.
   - Do NOT change other personalInfo fields like name, email, phone, links, or address.

2. **Internships & Experience** (internships):
   - Review each internship experience.
   - Optimize the 'description' array of bullet points.
   - Every bullet point should start with a strong action verb (e.g., "Led", "Engineered", "Optimized", "Architected").
   - Follow the STAR (Situation, Task, Action, Result) methodology. Add quantifiable metrics or achievements where possible (if none exist, construct realistic placeholders like "by 20%", "saving 10 hours weekly", or "delivering 2 weeks ahead of schedule" that fit the context).
   - Retain the company, role, dates, and locations exactly as they are.

3. **Projects** (projects):
   - Optimize the 'description' array of bullet points for each project.
   - Highlight technologies used, technical challenges overcome, and the ultimate outcome.
   - Retain project titles, dates, and links.

4. **Technical Skills** (technicalSkills):
   - Clean up spelling and capitalization (e.g., change "reactjs" to "React.js", "nodejs" to "Node.js").
   - Suggest 2-3 highly relevant, high-demand industry skills that match their job title and experience but are currently missing, and append them to the list.

Output Requirement:
You MUST return ONLY a valid JSON object matching the schema below. Do not output any conversational text or explanations. Your response must parse directly as JSON.

Schema to return:
{
  "personalInfo": {
    "summary": "Optimized summary text"
  },
  "internships": [
    {
      "role": "Same role",
      "company": "Same company",
      "description": [
        "Optimized bullet point 1",
        "Optimized bullet point 2"
      ]
    }
  ],
  "projects": [
    {
      "title": "Same title",
      "description": [
        "Optimized bullet point 1",
        "Optimized bullet point 2"
      ]
    }
  ],
  "technicalSkills": ["Skill 1", "Skill 2", "Skill 3"]
}

Ensure the order of items in internships and projects matches the input.
`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Strip markdown code block wrapper if present
        const cleanJsonString = responseText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const optimizedData = JSON.parse(cleanJsonString);
        return optimizedData;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error(`AI Optimization failed: ${error.message}`);
    }
};

module.exports = {
    optimizeResume
};
