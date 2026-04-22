const OpenAI = require("openai");
const Vulnerability = require("../models/Vulnerability");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


exports.runSAST = async (project, codeContent) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a senior security researcher and SAST tool engine. 
          Analyze the provided backend source code for security vulnerabilities.
          
          MANDATORY JSON OUTPUT FORMAT:
          {
            "vulnerabilities": [
              {
                "title": "Short descriptive title (e.g., SQL Injection in auth.js)",
                "severity": "Critical | High | Medium | Low | Info",
                "description": "Clear explanation of the flaw and its impact.",
                "mitigation": "Step-by-step fix recommendations.",
                "location": "filename:line_number or function name",
                "payload": "Example malicious input or code snippet triggering the flaw"
              }
            ]
          }

          RULES:
          1. Focus on OWASP API Security Top 10.
          2. Be precise about 'location' (filename and line).
          3. If no vulnerabilities are found, return an empty array for "vulnerabilities".
          4. Do NOT include any markdown or text outside the JSON object.`,
        },
        {
          role: "user",
          content: `Project: ${project.name}\nDescription: ${project.description}\n\n### SOURCE CODE TO ANALYZE:\n${codeContent}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    const findingsData = result.vulnerabilities || [];

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
        title: String(f.title).substring(0, 100),
        severity: normalizeSeverity(f.severity),
        type: "SAST",
        description: String(f.description || "No detailed description available."),
        mitigation: String(f.mitigation || "Consult OWASP guidelines for this vulnerability type."),
        location: String(f.location || "Multiple files"),
        payload: typeof f.payload === "object" ? JSON.stringify(f.payload, null, 2) : String(f.payload || ""),
      }));

    if (findings.length > 0) {
      await Vulnerability.insertMany(findings);
    }
    
    return findings;
  } catch (err) {
    console.error("AI SAST Error:", err);
    throw new Error("Failed to run AI SAST analysis");
  }
};
