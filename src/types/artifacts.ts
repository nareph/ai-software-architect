// TypeScript types for all artifact structures
export type ArtifactType =
  | 'business_analysis'
  | 'architecture'
  | 'database_schema'
  | 'diagrams'
  | 'backlog';

export interface GenerationContext {
  project: {
    description: string;
    template: string | null;
    constraints: string | null;
  };
  artifacts: Partial<Record<ArtifactType, unknown>>;
}
