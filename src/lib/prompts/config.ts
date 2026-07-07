// src/lib/prompts/config.ts
// Centralise la version active des prompts
// Pour changer de version : modifier ACTIVE_PROMPT_VERSION

export const ACTIVE_PROMPT_VERSION = 'v1.0.0'

export function getLanguageInstruction(locale: string): string {
  if (locale === 'fr') {
    return `IMPORTANT: Tu dois répondre UNIQUEMENT en français. Tous les textes, descriptions, justifications et explications doivent être rédigés en français. Les noms techniques (noms de tables, de colonnes, de modules, de technologies) restent en anglais.`
  }
  return `IMPORTANT: You must respond ONLY in English. All texts, descriptions, justifications and explanations must be written in English. Technical names (table names, columns, modules, technologies) remain in English.`
}
