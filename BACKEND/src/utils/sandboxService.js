const OpenAI = require("openai");
const Vulnerability = require("../models/Vulnerability");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


exports.runDAST = async (project, apiEndpoints) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a penetration tester. Given the following API routes, identify potential dynamic vulnerabilities (DAST) and generate attack payloads.
          Return ONLY a JSON array of objects with the following structure:
          [
            {
              "title": "Vulnerability Name",
              "severity": "Critical|High|Medium|Low",
              "description": "Exploit explanation",
              "mitigation": "Recommended fix",
              "payload": "Example attack payload (HTTP request or data format)"
            }
          ]`,
        },
        {
          role: "user",
          content: `Project: ${project.name}\nEndpoints Identified:\n${apiEndpoints.join("\n")}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    
    let findingsData = [];
    if (Array.isArray(result)) {
      findingsData = result;
    } else if (result.vulnerabilities && Array.isArray(result.vulnerabilities)) {
      findingsData = result.vulnerabilities;
    } else {
      findingsData = Object.values(result).find(v => Array.isArray(v)) || (typeof result === 'object' ? [result] : []);
    }

    const normalizeSeverity = (s) => {
      const severity = String(s || "").toLowerCase();
      if (severity.includes("crit")) return "Critical";
      if (severity.includes("high")) return "High";
      if (severity.includes("med")) return "Medium";
      if (severity.includes("low")) return "Low";
      return "Info";
    };

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
    throw new Error("Failed to run AI DAST testing");
  }
};
