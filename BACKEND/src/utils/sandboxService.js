const OpenAI = require("openai");
const Vulnerability = require("../models/Vulnerability");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Automated Dynamic Security Testing (DAST) using GPT-4o-mini
 */
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
    const findingsData = Array.isArray(result) ? result : (result.vulnerabilities || Object.values(result)[0] || []);

    const findings = findingsData.map((f) => ({
      project: project._id,
      title: f.title,
      severity: f.severity,
      type: "DAST",
      description: f.description,
      mitigation: f.mitigation,
      payload: f.payload,
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
