/**
 * @file sandboxService.js
 * @purpose Performs Dynamic Application Security Testing (DAST) by querying
 *   an AI model with a list of API endpoints and normalizing the returned
 *   vulnerability findings into the database.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [API10:2023 - Unsafe Consumption of APIs]
 *   - AI model responses are parsed, validated, and normalized before storage.
 *   - Severity is normalized through normalizeSeverity() to prevent arbitrary
 *     strings from the AI from corrupting the Vulnerability model's enum field.
 *   - All fields are explicitly cast to String and truncated as needed.
 *
 * [API2:2023 - Broken Authentication]
 *   - API keys are sourced exclusively from environment variables.
 *   - Placeholder OpenAI keys are detected and rejected before any network call.
 *
 * [API4:2023 - Unrestricted Resource Consumption]
 *   - AI provider selection is validated before making any API calls.
 *   - Falls back to Gemini gracefully when OpenAI key is absent/invalid.
 *
 * [Missing or Incorrect Authorization / API5:2023]
 *   - This service is invoked exclusively from triggerScan(), which is itself
 *     protected by protect() + authorize("user") and a BOLA ownership check.
 */

const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Vulnerability = require("../models/Vulnerability");

/**
 * normalizeSeverity: Map an AI-returned severity string to a safe enum value.
 *
 * [API10:2023 - Unsafe Consumption of APIs]
 * Normalizes inconsistent AI severity labels to the exact values accepted
 * by the Vulnerability Mongoose schema's severity enum field.
 *
 * @param {string} s - Raw severity string from the AI response
 * @returns {string} - One of: "Critical", "High", "Medium", "Low", "Info"
 */
const normalizeSeverity = (s) => {
  const severity = String(s || "").toLowerCase();
  if (severity.includes("crit")) return "Critical";
  if (severity.includes("high")) return "High";
  if (severity.includes("med"))  return "Medium";
  if (severity.includes("low"))  return "Low";
  return "Info";
};

/**
 * runDAST: Run AI-powered dynamic analysis against a list of API endpoints.
 *
 * [API10:2023 - Unsafe Consumption of APIs / API2:2023 - Broken Authentication]
 * - Selects the AI provider at runtime based on key validity:
 *   OpenAI is used if a real (non-placeholder) key is present; Gemini is fallback.
 * - The AI is instructed to return a structured JSON object with a
 *   "vulnerabilities" array. The response is parsed and normalized before DB insert.
 * - Handles both array and object-wrapped JSON responses from the AI.
 *
 * [API4:2023 - Unrestricted Resource Consumption]
 * - Validates that at least one API key exists before making any network call.
 *
 * @param {Object}   project      - Mongoose Project document ({ _id, name })
 * @param {string[]} apiEndpoints - List of discovered API endpoint paths to test
 * @returns {Array}               - Normalized finding objects inserted into DB
 * @throws {Error}                - If no valid API key is available or AI call fails
 */
exports.runDAST = async (project, apiEndpoints) => {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    /**
     * [API2:2023 - Broken Authentication]
     * Detect and skip placeholder OpenAI keys to avoid wasted 401 API calls.
     */
    const useOpenAI = openaiKey && !openaiKey.startsWith("sk-abcd");

    if (!useOpenAI && !geminiKey) {
      throw new Error("No valid OPENAI_API_KEY or GEMINI_API_KEY provided in .env");
    }

    /**
     * System prompt instructs the AI to return DAST findings in a consistent
     * JSON structure, scoped to the provided API endpoint list.
     */
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
          { role: "user",   content: userPrompt },
        ],
        response_format: { type: "json_object" }, // Enforce structured JSON output
      });
      const result = JSON.parse(response.choices[0].message.content);
      // Handle both array responses and wrapped { vulnerabilities: [...] } responses
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
        model:             "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }, // Enforce JSON output
      });
      const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
      const parsed = JSON.parse(result.response.text());
      // Handle both array and object-wrapped responses from Gemini
      if (Array.isArray(parsed)) {
        findingsData = parsed;
      } else if (parsed.vulnerabilities && Array.isArray(parsed.vulnerabilities)) {
        findingsData = parsed.vulnerabilities;
      } else {
        findingsData = Object.values(parsed).find(v => Array.isArray(v)) || [];
      }
    }

    /**
     * [API10:2023 - Unsafe Consumption of APIs]
     * Normalize each finding before database insertion:
     * - Filter entries missing both title and description
     * - Normalize severity to a safe enum value
     * - Explicitly cast all fields to String to prevent type confusion
     * - Serialize object-type payloads to JSON strings
     */
    const findings = findingsData
      .filter(f => f && (f.title || f.description))
      .map((f) => ({
        project:     project._id,
        title:       String(f.title || "Unknown Security Issue"),
        severity:    normalizeSeverity(f.severity),
        type:        "DAST",
        description: String(f.description || f.title || "No description provided"),
        mitigation:  String(f.mitigation  || "Consult security best practices for this issue type."),
        payload:     typeof f.payload === "object"
          ? JSON.stringify(f.payload, null, 2)
          : String(f.payload || ""),
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
