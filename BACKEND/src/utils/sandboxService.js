const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Vulnerability = require("../models/Vulnerability");

const normalizeSeverity = (s) => {
  const severity = String(s || "").toLowerCase();
  if (severity.includes("crit")) return "Critical";
  if (severity.includes("high")) return "High";
  if (severity.includes("med")) return "Medium";
  if (severity.includes("low")) return "Low";
  return "Info";
};

exports.runDAST = async (project, apiEndpoints) => {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const useOpenAI = openaiKey && !openaiKey.startsWith("sk-abcd");

    if (!useOpenAI && !geminiKey) {
      throw new Error("No valid OPENAI_API_KEY or GEMINI_API_KEY provided in .env");
    }

    const systemPrompt = `You are a penetration tester. Given the following API routes, identify potential dynamic vulnerabilities (DAST) and generate attack payloads.
          Return ONLY a JSON object with a "vulnerabilities" key containing an array of objects with the following structure:
          {
            "vulnerabilities": [
              {
                "title": "Vulnerability Name",
                "severity": "Critical|High|Medium|Low",
                "description": "Exploit explanation",
                "mitigation": "Recommended fix",
                "payload": "Example attack payload (HTTP request or data format)"
              }
            ]
          }`;

    const userPrompt = `Project: ${project.name}\nEndpoints Identified:\n${apiEndpoints.join("\n")}`;

    let findingsData = [];

    if (useOpenAI) {
      console.log("Using OpenAI for DAST scan...");
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      });
      const result = JSON.parse(response.choices[0].message.content);
      if (Array.isArray(result)) {
        findingsData = result;
      } else if (result.vulnerabilities && Array.isArray(result.vulnerabilities)) {
        findingsData = result.vulnerabilities;
      } else {
        findingsData = Object.values(result).find(v => Array.isArray(v)) || [];
      }
    } else {
      console.log("Using Gemini for DAST scan...");
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
      const parsed = JSON.parse(result.response.text());
      if (Array.isArray(parsed)) {
        findingsData = parsed;
      } else if (parsed.vulnerabilities && Array.isArray(parsed.vulnerabilities)) {
        findingsData = parsed.vulnerabilities;
      } else {
        findingsData = Object.values(parsed).find(v => Array.isArray(v)) || [];
      }
    }

    const findings = findingsData
      .filter(f => f && (f.title || f.description))
      .map((f) => ({
        project: project._id,
        title: String(f.title || "Unknown Security Issue"),
        severity: normalizeSeverity(f.severity),
        type: "DAST",
        description: String(f.description || f.title || "No description provided"),
        mitigation: String(f.mitigation || "Consult security best practices for this issue type."),
        payload: typeof f.payload === "object" ? JSON.stringify(f.payload, null, 2) : String(f.payload || ""),
      }));

    if (findings.length > 0) {
      await Vulnerability.insertMany(findings);
    }
    
    return findings;
  } catch (err) {
    console.error("AI DAST Error:", err);
    throw new Error("Failed to run AI DAST testing: " + err.message);
  }
};
