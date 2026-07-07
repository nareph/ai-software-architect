// src/lib/agents/factory.ts
import type { ArtifactType } from './types'
import type { BaseAgent } from './base'
import { RequirementsAnalystAgent } from './implementations/requirements-analyst'
import { SolutionArchitectAgent } from './implementations/solution-architect'
import { DatabaseArchitectAgent } from './implementations/database-architect'
import { DiagramGeneratorAgent } from './implementations/diagram-generator'
import { ProjectManagerAgent } from './implementations/project-manager'

export class AgentFactory {
  static create(type: ArtifactType): BaseAgent {
    switch (type) {
      case 'business_analysis': return new RequirementsAnalystAgent()
      case 'architecture':      return new SolutionArchitectAgent()
      case 'database_schema':   return new DatabaseArchitectAgent()
      case 'diagrams':          return new DiagramGeneratorAgent()
      case 'backlog':           return new ProjectManagerAgent()
      default:
        throw new Error(`Unknown artifact type: ${type}`)
    }
  }
}
