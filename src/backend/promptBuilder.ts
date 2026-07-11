export interface PromptConfig {
  taskDescription: string;
  outputSchema: string;
  constraints?: string[];
}

export class PromptBuilder {
  /**
   * Builds a highly constrained, drift-resistant system prompt for Ceil.
   * Explicitly forbids conversational filler and mandates exact JSON structure.
   */
  public static buildSystemPrompt(config: PromptConfig): string {
    const defaultConstraints = [
      "Do not include any conversational preamble, pleasantries, or postscript.",
      "Output MUST be a single valid JSON object strictly matching the schema provided.",
      "Do not wrap the JSON in markdown code blocks unless explicitly requested, but if you do, use standard ```json syntax.",
      "Ensure all keys and string values are double-quoted. No trailing commas are allowed.",
      "Handle empty or null inputs gracefully by returning empty arrays/null values rather than omitting keys."
    ];

    const combinedConstraints = [
      ...defaultConstraints,
      ...(config.constraints || [])
    ];

    return [
      "ROLE: You are Ceil, an expert software delivery agent.",
      "TASK:",
      config.taskDescription,
      "CONSTRAINTS:",
      combinedConstraints.map((c, i) => `${i + 1}. ${c}`).join("\n"),
      "REQUIRED OUTPUT SCHEMA:",
      config.outputSchema,
      "CRITICAL: Failure to adhere to the JSON schema will break downstream parsers. Ensure 100% compliance."
    ].join("\n\n");
  }
}
