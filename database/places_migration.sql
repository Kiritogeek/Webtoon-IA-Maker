-- Migration SQL pour créer la table places
-- Lieux et décors utilisés comme fonds de chapitre

-- Créer la table places
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter les colonnes optionnelles si elles n'existent pas déjà
DO $$ 
BEGIN
  -- Ambiance du lieu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'ambiance'
  ) THEN
    ALTER TABLE places ADD COLUMN ambiance TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'ambiance_custom'
  ) THEN
    ALTER TABLE places ADD COLUMN ambiance_custom TEXT;
  END IF;

  -- Variations du lieu (JSON pour stocker plusieurs variations)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'variations'
  ) THEN
    ALTER TABLE places ADD COLUMN variations JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Images de référence (JSON pour stocker plusieurs URLs)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'reference_images'
  ) THEN
    ALTER TABLE places ADD COLUMN reference_images JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Créer un index sur project_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_places_project_id ON places(project_id);

-- Créer un index sur variations pour les recherches (optionnel)
CREATE INDEX IF NOT EXISTS idx_places_variations ON places USING GIN (variations);

-- Créer un index sur reference_images pour les recherches (optionnel)
CREATE INDEX IF NOT EXISTS idx_places_reference_images ON places USING GIN (reference_images);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_places_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS trigger_update_places_updated_at ON places;
CREATE TRIGGER trigger_update_places_updated_at
  BEFORE UPDATE ON places
  FOR EACH ROW
  EXECUTE FUNCTION update_places_updated_at();

-- RLS (Row Level Security) - Politique de sécurité
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Les utilisateurs peuvent voir les lieux de leurs projets
CREATE POLICY "Users can view places from their projects"
  ON places FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = places.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Politique RLS : Les utilisateurs peuvent créer des lieux dans leurs projets
CREATE POLICY "Users can create places in their projects"
  ON places FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = places.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Politique RLS : Les utilisateurs peuvent modifier les lieux de leurs projets
CREATE POLICY "Users can update places from their projects"
  ON places FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = places.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Politique RLS : Les utilisateurs peuvent supprimer les lieux de leurs projets
CREATE POLICY "Users can delete places from their projects"
  ON places FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = places.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Commentaires pour documentation
COMMENT ON TABLE places IS 'Lieux et décors utilisés comme fonds de chapitre dans les webtoons';
COMMENT ON COLUMN places.name IS 'Nom du lieu/décor';
COMMENT ON COLUMN places.description IS 'Description du lieu';
COMMENT ON COLUMN places.image_url IS 'URL de l''image principale du lieu';
COMMENT ON COLUMN places.ambiance IS 'Ambiance du lieu (prédéfinie)';
COMMENT ON COLUMN places.ambiance_custom IS 'Ambiance personnalisée du lieu';
COMMENT ON COLUMN places.variations IS 'Liste JSON des variations du lieu (ex: ["jour", "nuit", "pluie"])';
COMMENT ON COLUMN places.reference_images IS 'Liste JSON des URLs d''images de référence (uploadées ou générées par IA)';
