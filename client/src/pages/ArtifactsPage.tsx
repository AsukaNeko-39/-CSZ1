import type { NavigateCulture } from "@/components/CultureScenery";
import CatalogPage from "./CatalogPage";
import { artifactItems, introCopy } from "@/data/catalog";

export default function ArtifactsPage({
  onBack,
  onNavigate,
  initialTarget,
}: {
  onBack: () => void;
  onNavigate?: NavigateCulture;
  initialTarget?: string;
}) {
  return (
    <CatalogPage
      title="重要文物"
      introduction={introCopy.artifacts}
      items={artifactItems}
      kind="artifacts"
      onBack={onBack}
      onNavigate={onNavigate}
      initialTarget={initialTarget}
    />
  );
}
