import { useState } from 'react';
import { showcaseCatalog } from './showcaseCatalog';
import { showcaseScenes, type ShowcaseId } from './showcases';

export function ExampleApp() {
  const [activeSceneId, setActiveSceneId] = useState<ShowcaseId>(showcaseCatalog[0]!.id);
  const ActiveScene = showcaseScenes[activeSceneId];

  return (
    <ActiveScene
      catalog={showcaseCatalog}
      activeSceneId={activeSceneId}
      onSelectScene={setActiveSceneId}
    />
  );
}
