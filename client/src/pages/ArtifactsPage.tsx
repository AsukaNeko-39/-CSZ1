import CatalogPage from "./CatalogPage";
import { artifactItems, introCopy } from "@/data/catalog";

export default function ArtifactsPage({ onBack }: { onBack: () => void }) {
  return (
    <CatalogPage
      title="重要文物"
      introduction={introCopy.artifacts}
      items={artifactItems}
      kind="artifacts"
      onBack={onBack}
    />
  );
}
