const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Vulnerability = require("../models/Vulnerability");

exports.runSAST = async (project, codeContent) => {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let useOpenAI = false;
    
    if (openaiKey && !openaiKey.startsWith("sk-abcd")) {
      useOpenAI = true;
    }

    if (!useOpenAI && !geminiKey) {
      throw new Error("No valid OPENAI_API_KEY or GEMINI_API_KEY provided in .env");
    }

    let findingsData = [];

    const systemPrompt = `You are a senior security researcher and SAST tool engine. 
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
          4. Do NOT include any markdown or text outside the JSON object.`;

    const userPrompt = `Project: ${project.name}\nDescription: ${project.description}\n\n### SOURCE CODE TO ANALYZE:\n${codeContent}`;

    if (useOpenAI) {
      console.log("Using OpenAI for SAST scan...");
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
      findingsData = result.vulnerabilities || [];
    } else {
      console.log("Using Gemini for SAST scan...");
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
      const jsonText = result.response.text();
      const parsed = JSON.parse(jsonText);
      findingsData = parsed.vulnerabilities || [];
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
    throw new Error("Failed to run AI SAST analysis: " + err.message);
  }
};
