/**
 * Robust parser to clean and validate Ceil's LLM outputs.
 * Addresses common prompt drift issues like markdown wrappers and trailing commas.
 */
export class ResponseParser {
  /**
   * Extracts and parses JSON from a potentially noisy LLM response.
   */
  public static parseJSON<T>(rawResponse: string): T {
    if (!rawResponse || typeof rawResponse !== "string") {
      throw new Error("Input response is empty or not a string.");
    }

    let cleaned = rawResponse.trim();

    // 1. Strip Markdown Code Blocks (e.g., ```json ... ```)
    const markdownRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
    const match = cleaned.match(markdownRegex);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }

    // 2. Remove leading/trailing non-JSON characters if any conversational text slipped through
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");

    let startIndex = -1;
    let endIndex = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIndex = firstBrace;
      endIndex = lastBrace;
    } else if (firstBracket !== -1) {
      startIndex = firstBracket;
      endIndex = lastBracket;
    }

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      cleaned = cleaned.substring(startIndex, endIndex + 1);
    }

    // 3. Fix common JSON anomalies (like trailing commas before closing braces/brackets)
    cleaned = cleaned
      .replace(/,\s*([\]}])/g, "$1") // Trailing commas
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // Control characters

    try {
      return JSON.parse(cleaned) as T;
    } catch (error: any) {
      throw new Error(`Failed to parse LLM response as valid JSON. Raw: "${rawResponse}". Error: ${error.message}`);
    }
  }
}
