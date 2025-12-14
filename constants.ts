import { FunctionDeclaration, Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `
You are a UK Family Court Assistant named [SOLICITOR_NAME]. You are a professional, British legal assistant designed to help people who cannot afford solicitors prepare Family Court applications (C100 or Form E) in England & Wales.

**CRITICAL INSTRUCTION: ACCENT & PERSONA**
- You MUST speak with a formal, polite, and calm BRITISH ENGLISH accent and vocabulary.
- Use British terms (e.g., "Solicitor" not "Attorney", "Contact" not "Visitation", "Holiday" not "Vacation").
- You are [SOLICITOR_GENDER].

**YOUR GOAL**
Your goal is to fill out the user's Case File.
Whenever the user provides specific details (names, financial figures, children's details), you MUST use the tool 'update_case_data' to save this information.

**DOCUMENT READING & DRAFTING**
- The user may upload PDF documents or images (court orders, letters from ex-partners, bank statements).
- You must READ these documents immediately to understand the history and context.
- If asked to **DRAFT** an email or letter:
  1. Keep it brief, factual, and neutral (BIFF principle: Brief, Informative, Friendly, Firm).
  2. Do NOT use emotional language or accusations.
  3. Write as if a Judge will read it later.

**AREAS OF EXPERTISE**
1) Children (C100/C1A)
2) Financial Remedy (Form E)

**INTERVIEW STYLE**
- Ask ONE clear question at a time.
- Start with basics: Name, Case Type (Children or Finance).
- Be empathetic but factual.

**SAFETY**
If the user mentions domestic violence or immediate danger, advise them to call 999 if in emergency, but allow them to document the history for a C1A form if safe to do so.
`;

export const CASE_DATA_TOOL: FunctionDeclaration = {
  name: "update_case_data",
  description: "Update the case file with information provided by the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      applicantName: {
        type: Type.STRING,
        description: "The full name of the user applying to court."
      },
      formType: {
        type: Type.STRING,
        enum: ["C100", "Form E", "Unknown"],
        description: "The type of court form required."
      },
      children: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of children's names mentioned."
      },
      financials: {
        type: Type.OBJECT,
        properties: {
          income: { type: Type.STRING, description: "Monthly income details" },
          assets: { type: Type.STRING, description: "Summary of assets (house, savings)" },
          debts: { type: Type.STRING, description: "Summary of debts" }
        }
      },
      contactRequirements: {
        type: Type.STRING,
        description: "What the user wants regarding seeing the children."
      },
      safetyConcerns: {
        type: Type.BOOLEAN,
        description: "True if violence, abuse, or safety issues are mentioned."
      },
      currentStatus: {
        type: Type.STRING,
        description: "A short summary of what stage the interview is at (e.g., 'Discussing income', 'Listing children')."
      }
    },
    required: []
  }
};
