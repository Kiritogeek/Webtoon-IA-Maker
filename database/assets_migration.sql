-- Migration SQL pour la table assets
-- Table pour gérer les ressources visuelles secondaires réutilisables

-- Créer la table assets si elle n'existe pas
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Informations de base
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('object', 'effect', 'symbol', 'environment', 'narrative', 'custom')),
  
  -- Contexte optionnel
  usage_context TEXT, -- combat, magie, décor, émotion, etc.
  emotion_intensity TEXT, -- léger, violent, dramatique, épique
  
  -- Image
  image_url TEXT NOT NULL,
  created_by_ai BOOLEAN DEFAULT true,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_assets_updated_at();

-- Table de liaison pour suivre l'utilisation des assets dans les chapitres/scenes
CREATE TABLE IF NOT EXISTS asset_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour asset_usage
CREATE INDEX IF NOT EXISTS idx_asset_usage_asset_id ON asset_usage(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_usage_chapter_id ON asset_usage(chapter_id);
CREATE INDEX IF NOT EXISTS idx_asset_usage_scene_id ON asset_usage(scene_id);

-- Commentaires pour la documentation
COMMENT ON TABLE assets IS 'Ressources visuelles secondaires réutilisables dans plusieurs chapitres';
COMMENT ON COLUMN assets.type IS 'Type d''asset: object, effect, symbol, environment, narrative, custom';
COMMENT ON COLUMN assets.usage_context IS 'Contexte d''utilisation: combat, magie, décor, émotion, etc.';
COMMENT ON COLUMN assets.emotion_intensity IS 'Intensité émotionnelle: léger, violent, dramatique, épique';
COMMENT ON TABLE asset_usage IS 'Suivi de l''utilisation des assets dans les chapitres/scenes';

