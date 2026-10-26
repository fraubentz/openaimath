export interface Paper {
  title: string;
  pdf: string;
  abstract: string;
}

export interface Family {
  id: string;
  title: string;
  summary: string;
  discipline: string;
  hasLeanDoc: boolean;
  leanDoc: string | null;
  reasoningTrace: { subject: string; pdf: string } | null;
  papers: Paper[];
  challenges: string[];
  status: 'active' | 'withdrawn' | 'revised';
}

export interface Challenge {
  name: string;
  challengeModule: string;
  solutionModule: string;
  theorems: string[];
  definitions: string[];
  permittedAxioms: string[];
  enableNanoda: boolean;
  lineCount: number;
  preview: string;
  matchedFamilyId: string | null;
}

export interface Stats {
  totalFamilies: number;
  totalPapers: number;
  totalChallenges: number;
  formalizedFamiliesCount: number;
  topLineFormalizationPercent: number;
  topLineFormalizedCount: number;
  supportingFormalizedCount: number;
  disciplines: Record<string, number>;
  axioms: Record<string, number>;
}
