const OpenAI = require("openai");
const Vulnerability = require("../models/Vulnerability");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI-assisted Static Code Analysis (SAST) using GPT-4o-mini
 */
exports.runSAST = async (project, codeContent) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a senior security researcher. Analyze the provided backend source code for vulnerabilities.
          Focus on:
          1. BOLA (Broken Object Level Authorization): Instances where records are fetched by ID without owner verification.
          2. NoSQL/SQL Injection: Unsanitized inputs used in database queries.
          3. Broken Authentication: Weak password or token handling.
          4. Generic OWASP API Security Top 10 patterns.
          
          Return ONLY a JSON array...`,
        },
        {
          role: "user",
          content: `Project: ${project.name}\nDescription: ${project.description}\n\nSource Code Content:\n${codeContent}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // API10:2023 - Unsafe Consumption of APIs Protection
    // Ensure the third-party response is properly structured
    let findingsData = [];
    if (Array.isArray(result)) {
      findingsData = result;
    } else if (result.vulnerabilities && Array.isArray(result.vulnerabilities)) {
      findingsData = result.vulnerabilities;
    } else {
      // Handle non-standard formats safely
      findingsData = Object.values(result).find(v => Array.isArray(v)) || [];
    }

    const findings = findingsData
      .filter(f => f.title && f.severity) // Validation
      .map((f) => ({
        project: project._id,
        title: String(f.title),
        severity: String(f.severity),
        type: "SAST",
        description: String(f.description || ""),
        mitigation: String(f.mitigation || ""),
        location: String(f.location || "unknown"),
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
