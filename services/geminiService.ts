
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';
import { InterviewEntry } from "../types";

const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set. Please ensure it's configured.");
  }
  return apiKey;
};

let ai: GoogleGenAI | null = null;

const getAIInstance = (): GoogleGenAI => {
  if (!ai) {
    try {
      ai = new GoogleGenAI({ apiKey: getApiKey() });
    } catch (error) {
       console.error("Failed to initialize GoogleGenAI:", error);
       throw new Error(`Failed to initialize AI Service: ${error instanceof Error ? error.message : String(error)}. Ensure API_KEY is valid.`);
    }
  }
  return ai;
};

const parseJsonFromMarkdown = <T,>(markdownJson: string): T => {
  let jsonStr = markdownJson.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original string:", markdownJson);
    throw new Error(`Failed to parse AI's JSON response. Raw response: ${markdownJson}`);
  }
};

const parseDataUrl = (dataUrl: string): { mimeType: string; data: string } => {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match || match.length < 3) {
    console.error("Invalid data URL format:", dataUrl.substring(0,100)); // Log only a portion for brevity
    throw new Error("Invalid data URL format. Expected 'data:[mimeType];base64,[data]'");
  }
  return { mimeType: match[1], data: match[2] };
};


export const generateQuestions = async (jobDescription: string, numQuestions: number): Promise<string[]> => {
  const genAI = getAIInstance();
  const prompt = `Based on the following job description, generate ${numQuestions} diverse interview questions.
The questions should cover technical skills, behavioral aspects, and situational scenarios relevant to the role.
Return the questions as a JSON array of strings. For example: ["Question 1?", "Question 2?", "Question 3?"].

Job Description:
---
${jobDescription}
---
`;

  try {
    const response: GenerateContentResponse = await genAI.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });
    
    const questionsArray = parseJsonFromMarkdown<string[]>(response.text);
    if (!Array.isArray(questionsArray) || !questionsArray.every(q => typeof q === 'string')) {
        throw new Error("AI did not return a valid array of question strings.");
    }
    return questionsArray.slice(0, numQuestions);

  } catch (error) {
    console.error("Error generating questions with Gemini API:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) {
         throw error;
    }
    throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateFeedback = async (jobDescription: string, entries: InterviewEntry[]): Promise<string> => {
  const genAI = getAIInstance();
  
  const parts: Part[] = [];

  parts.push({
    text: `You are an expert interview coach. Your primary goal is to provide ACCURATE and CONSTRUCTIVE feedback.
Analyze the following interview session based STRICTLY on the provided job description, the interview questions, the user's transcribed spoken answers, and the video data along with its corresponding analysis guidelines.

Job Description:
---
${jobDescription}
---

Interview Transcript, Videos, and Video Analysis Guidelines:
---
`});

  entries.forEach((entry, index) => {
    parts.push({ text: `\nQuestion ${index + 1}: ${entry.question}\nUser's Transcribed Spoken Answer ${index + 1}: ${entry.answer}` });
    if (entry.videoDataUrl) {
      try {
        const { mimeType, data } = parseDataUrl(entry.videoDataUrl);
        parts.push({ inlineData: { mimeType, data } });
        // Add a text part immediately after to guide analysis for THIS video
        parts.push({ text: `(Video Analysis Guideline for Question ${index + 1} Video: Analyze facial expressions, eye contact, body language, perceived confidence, and engagement based on this video. Correlate these visual observations DIRECTLY with the content of the transcribed spoken answer for Question ${index + 1}.)` });
      } catch (e) {
        console.warn(`Could not process video for Q${index + 1}:`, e);
        parts.push({ text: `(Video for Question ${index + 1} was not available or had processing issues. Base feedback for this question solely on the transcribed answer.)` });
      }
    } else {
      parts.push({ text: `(No video provided for Question ${index + 1}. Base feedback for this question solely on the transcribed answer.)` });
    }
  });

  parts.push({ text: `
---
End of Transcript & Videos.

**CRITICAL INSTRUCTIONS FOR FEEDBACK GENERATION:**
1.  **ACCURACY IS PARAMOUNT:** All feedback, especially regarding what the user said, their facial expressions, and body language, MUST be STRICTLY and EXCLUSIVELY based on the provided job description, the questions, the user's transcribed spoken answers, and the specific video analysis guidelines provided for each video.
2.  **NO FABRICATION OR ASSUMPTIONS:** DO NOT invent topics, statements, examples, or details that are not explicitly present in the user's transcribed answers. If you refer to something the user said, ensure it's a direct quote or a very close paraphrase of their actual transcribed words. Do not infer knowledge or intentions beyond what is stated.
3.  **GROUNDED VIDEO ANALYSIS:** When commenting on video aspects (facial expressions, eye contact, etc.), your analysis MUST be based on the video data provided AND the "Video Analysis Guideline" given for that specific video. Your role is to interpret based on these elements. For example, if the guideline is to check for "confidence in facial expression," your feedback should state observations related to that. Connect these visual observations DIRECTLY to the content of the transcribed answer for that question.
4.  **BE SPECIFIC AND CONCRETE:** Provide concrete examples from the user's transcribed answers (using quotes or close paraphrases) and specific, observed behaviors (based on the video analysis guidelines) to support ALL your points. Avoid vague generalizations. For instance, instead of saying "user seemed nervous," say "In response to Q2 (transcript: '...'), the user's voice was hesitant and they frequently looked away (based on video analysis guideline for Q2 video), which can be perceived as nervousness."

Now, provide comprehensive feedback based on ALL the preceding information, adhering strictly to the critical instructions above.
Structure your feedback using markdown.

IMPORTANT: First, include the following scoring section, using the exact formatting shown:

**Overall Score:** [value]/100 (e.g., 75/100)

**Score Breakdown:**
- **Clarity & Conciseness (from transcript):** [score]/10
- **Relevance to Role (from transcript):** [score]/10
- **Confidence & Engagement (from video analysis - facial expression, body language, eye contact, based on video guidelines):** [score]/10
- **Facial Expression Appropriateness (from video analysis, based on video guidelines):** [score]/10
- **Technical/Behavioral Prowess (from transcript content):** [score]/10

After the scores, include these qualitative sections. ALL qualitative feedback MUST be supported by specific examples from the transcript or video analysis guidelines.

### Overall Impression
Briefly summarize the candidate's performance, reflecting the overall score. Critically, include a summary of their overall facial expressions and non-verbal cues AS GUIDED BY THE VIDEO ANALYSIS INSTRUCTIONS (e.g., "User generally maintained eye contact as suggested by video analysis for Q1, but for Q3, their expression was less varied when discussing..."). Integrate these observations with insights from transcribed answers (e.g., "The confidence conveyed in the transcript for Q1 was mirrored by..."). Ensure this section is based ONLY on provided materials.

### Strengths
Highlight what the candidate did well, contributing to their scores. Reference specific answers (quote or paraphrase from transcript) and, if video was analyzed for that answer, corresponding positive visual cues as per the video analysis guidelines (e.g., "The answer to Q2, where the user stated '...', was particularly strong. This was supported by a confident tone in the transcript and steady eye contact as noted in the video analysis for Q2.").

### Areas for Improvement
For each question/answer/video set, provide specific, actionable advice, explaining how these areas impacted the scores. Ground every point in the transcript or video analysis.
- If a transcribed answer was weak, explain why (e.g., lacks detail, unclear, not relevant) by referencing parts of the transcript, and suggest how it could be improved.
- If video was analyzed, comment on facial expressions (e.g., "During Q1, the transcript shows you said '...', your facial expression appeared X according to the video analysis. To enhance Y, consider Z."), body language (as per video analysis guidelines), eye contact, and perceived confidence. Provide specific examples from the transcript and link them to the video analysis. Suggest concrete improvements like, "When you discussed [topic from transcript for Q3], your facial expression was [observation from video analysis]. Try to [actionable advice] to better convey [desired trait]."
- Focus on clarity, relevance to the job description, STAR method (if applicable for behavioral questions), and technical accuracy based on the transcribed answer. Explicitly state what the user said (from transcript) when providing feedback on it.

### Alignment with Job Description
Discuss how well the candidate's answers (transcribed), skills (as demonstrated in transcript and interpreted via video analysis guidelines), and overall presentation (verbal via transcription, non-verbal via video analysis guidelines, including facial expressions) align with the requirements and responsibilities stated in the job description. Support this with direct references to the transcript and the job description. Reflect how this alignment (or lack thereof) impacted the scores.

### Actionable Advice for Future Interviews
Offer 2-3 key pieces of actionable advice the candidate can use to improve for similar roles. Each piece of advice MUST be based on specific observations from THIS interview's transcript or video analysis. For example: "Practice articulating [specific concept from transcript] more clearly," or "Be mindful of maintaining [specific aspect of facial expression, e.g., a more engaged look] when discussing [type of topic], as observed in Q[X]."

Make the feedback detailed, insightful, and helpful for the candidate's growth. Ensure ALL comments on video aspects (including specific facial expressions) are tied to the video analysis guidelines for that question and linked to the scores and transcribed content. DO NOT INTRODUCE EXTERNAL INFORMATION OR MAKE ASSUMPTIONS.
`});
  
  try {
    const response: GenerateContentResponse = await genAI.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: { parts }, // Pass the array of parts
      config: {
        temperature: 0.5, // Slightly lower temperature might help reduce creativity/fabrication
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating feedback with Gemini API:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) {
         throw error;
    }
    let errorMessage = `Failed to generate feedback: ${error instanceof Error ? error.message : String(error)}`;
    // Potentially log response.error if available and useful for debugging blockages
    // if (error.response && error.response.error) { 
    //   errorMessage += ` | API Error: ${JSON.stringify(error.response.error)}`;
    // }
    throw new Error(errorMessage);
  }
};
