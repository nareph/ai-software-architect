#!/bin/bash
# cleanup-dead-files.sh
# Supprime les placeholders jamais implémentés et les routes API legacy
# Lancer depuis la racine du projet : bash cleanup-dead-files.sh

set -e

echo "🧹 Cleaning up dead placeholder files..."

# Layout placeholders (jamais utilisés depuis le refactor i18n)
rm -fv src/components/layout/Navbar.tsx
rm -fv src/components/layout/Footer.tsx

# Artifacts placeholders (remplacés par ArtifactSidebar + views/)
rm -fv src/components/artifacts/ArtifactTabs.tsx
rm -fv src/components/artifacts/ArtifactViewer.tsx
rm -fv src/components/artifacts/CoherenceScore.tsx
rm -fv src/components/artifacts/MarkdownRenderer.tsx
rm -fv src/components/artifacts/VersionHistory.tsx

# Export / Feedback placeholders (pas encore implémentés — Phase 5)
rm -fv src/components/export/ExportMenu.tsx
rm -fv src/components/feedback/ChatPanel.tsx
rm -fv src/components/feedback/RatingForm.tsx

# Generation placeholders (remplacés par la logique inline dans generate/page.tsx)
rm -fv src/components/generation/GenerationProgress.tsx
rm -fv src/components/generation/StepIndicator.tsx
rm -fv src/components/generation/StreamListener.tsx

# Project placeholders (remplacés par ProjectCard/ProjectRow/ProjectHeader)
rm -fv src/components/project/ProjectForm.tsx
rm -fv src/components/project/ProjectStatus.tsx

# Routes API legacy — remplacées par stream/route.ts + orchestrator
echo ""
echo "⚠️  Vérifie AVANT de continuer que ces routes ne sont pas appelées :"
echo "    - src/app/api/generate/[projectId]/route.ts"
echo "    - src/app/api/generate/[projectId]/status/route.ts"
echo ""
read -p "Confirmer la suppression de ces 2 routes API ? (y/N) " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
  rm -fv "src/app/api/generate/[projectId]/route.ts"
  rm -fv "src/app/api/generate/[projectId]/status/route.ts"
  echo "✅ Routes API legacy supprimées"
else
  echo "⏭️  Routes API legacy conservées"
fi

# Nettoyer les dossiers vides résultants
find src/components -type d -empty -delete 2>/dev/null || true
find src/app/api -type d -empty -delete 2>/dev/null || true

echo ""
echo "✅ Cleanup done. Run 'pnpm type-check' to verify nothing broke."