/**
 * @file aiScannerService.js
 * @purpose Performs Static Application Security Testing (SAST) on uploaded
 *   source code by querying an AI model and normalizing its findings into
 *   structured Vulnerability documents stored in MongoDB.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [API10:2023 - Unsafe Consumption of APIs]
 *   - AI model responses are never trusted blindly. All returned vulnerability
 *     data is parsed, validated, and normalized before being stored.
 *   - Severity values are normalized via normalizeSeverity() to an exact
 *     enum set ("Critical", "High", "Medium", "Low", "Info"), preventing
 *     arbitrary strings from the AI from corrupting the database.
 *   - String fields are explicitly cast and truncated (title to 100 chars).
 *   - Object-type payloads are serialized to JSON strings.
 *
 * [Missing Encryption of Sensitive Data]
 *   - Source code is passed to the AI only in-memory during the scan; it is
 *     never logged, stored in plaintext, or transmitted beyond the API call.
 *
 * [API4:2023 - Unrestricted Resource Consumption]
 *   - AI API keys are validated before making any API calls, preventing
 *     wasted quota on invalid credentials.
 *
 * [API2:2023 - Broken Authentication]
 *   - API keys are sourced exclusively from environment variables.
 *   - OpenAI keys that match the placeholder pattern ("sk-abcd...") are
 *     detected and rejected before use, avoiding 401 errors at scan time.
 *
 * [Reliance on Untrusted Inputs]
 *   - Empty or whitespace-only code content is detected before the AI call
 *     (enforced in projectController) to avoid wasting API tokens.
 */

const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Vulnerability = require("../models/Vulnerability");

/**
 * Shared system prompt for SAST analysis.
 * Instructs the AI to return a strict JSON object with a "vulnerabilities"
 * array, focused on OWASP API Security Top 10.
 */
const SYSTEM_PROMPT = `You are a senior security researcher and SAST tool engine. 
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

/**
 * normalizeSeverity: Map an AI-returned severity string to a safe enum value.
 *
 * [API10:2023 - Unsafe Consumption of APIs]
 * AI models may return inconsistent severity labels (e.g., "CRITICAL", "crit",
 * "critical-severity"). This function normalizes all variants to the exact
 * values accepted by the Vulnerability model's enum field.
 *
 * @param {string} s - Raw severity string from AI response
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
 * runSAST: Run AI-powered static analysis on source code.
 *
 * [API10:2023 - Unsafe Consumption of APIs / API2:2023 - Broken Authentication]
 * - Selects the AI provider based on key availability: OpenAI is preferred
 *   if a real (non-placeholder) key is set; Gemini is the fallback.
 * - AI response is parsed and every field is explicitly normalized before
 *   being inserted into MongoDB — raw AI output is never trusted.
 *
 * [API4:2023 - Unrestricted Resource Consumption]
 * - Invalid/placeholder API keys are detected before any network call is made.
 *
 * @param {Object} project     - Mongoose Project document ({ _id, name, description })
 * @param {string} codeContent - Decrypted source code string to analyze
 * @returns {Array}            - Array of normalized finding objects inserted into DB
 * @throws {Error}             - If no valid API key is available or AI call fails
 */
exports.runSAST = async (project, codeContent) => {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    /**
     * [API2:2023 - Broken Authentication]
     * Detect placeholder OpenAI keys (start with "sk-abcd") and skip them.
     * This prevents 401 errors at scan time from wasted API calls.
     */
    const useOpenAI = openaiKey && !openaiKey.startsWith("sk-abcd");

    if (!useOpenAI && !geminiKey) {
      throw new Error("No valid OPENAI_API_KEY or GEMINI_API_KEY provided in .env");
    }

    const userPrompt = `Project: ${project.name}\nDescription: ${project.description}\n\n### SOURCE CODE TO ANALYZE:\n${codeContent}`;

    let findingsData = [];

    if (useOpenAI) {
      console.log("Using OpenAI for SAST scan...");
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: userPrompt },
        ],
        response_format: { type: "json_object" }, // Enforce JSON output from OpenAI
      });
      const result = JSON.parse(response.choices[0].message.content);
      findingsData = result.vulnerabilities || [];
    } else {
      console.log("Using Gemini for SAST scan...");
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model:             "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }, // Enforce JSON output from Gemini
      });
      const result = await model.generateContent(SYSTEM_PROMPT + "\n\n" + userPrompt);
      const parsed = JSON.parse(result.response.text());
      findingsData = parsed.vulnerabilities || [];
    }

    /**
     * [API10:2023 - Unsafe Consumption of APIs]
     * Normalize each finding from the AI response:
     * - Filter out entries that have neither a title nor a description
     * - Truncate title to 100 chars (DB field limit)
     * - Normalize severity to an exact enum value
     * - Cast all string fields to String to prevent type-confusion attacks
     * - Serialize object-type payloads to JSON strings
     */
    const findings = findingsData
      .filter(f => f && (f.title || f.description))
      .map((f) => ({
        project:     project._id,
        title:       String(f.title).substring(0, 100),
        severity:    normalizeSeverity(f.severity),
        type:        "SAST",
        description: String(f.description || "No detailed description available."),
        mitigation:  String(f.mitigation  || "Consult OWASP guidelines for this vulnerability type."),
        location:    String(f.location    || "Multiple files"),
        payload:     typeof f.payload === "object"
          ? JSON.stringify(f.payload, null, 2)
          : String(f.payload || ""),
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
