-- Migration SQL pour créer la table project_visual_references
-- Système d'identité visuelle avec plusieurs images de référence (moodboard)

-- Créer la table project_visual_references
CREATE TABLE IF NOT EXISTS project_visual_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0, -- Pour réordonner les images
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur project_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_project_visual_references_project_id ON project_visual_references(project_id);

-- Créer un index sur display_order pour le tri
CREATE INDEX IF NOT EXISTS idx_project_visual_references_display_order ON project_visual_references(project_id, display_order);

-- Ajouter les colonnes de style dans projects si elles n'existent pas déjà
DO $$ 
BEGIN
  -- visual_style_summary : Résumé textuel généré automatiquement par l'IA
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'visual_style_summary'
  ) THEN
    ALTER TABLE projects ADD COLUMN visual_style_summary TEXT;
  END IF;

  -- visual_style_prompt : Prompt de style ajustable manuellement (optionnel)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'visual_style_prompt'
  ) THEN
    ALTER TABLE projects ADD COLUMN visual_style_prompt TEXT;
  END IF;
END $$;

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_project_visual_references_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_project_visual_references_updated_at ON project_visual_references;
CREATE TRIGGER trigger_update_project_visual_references_updated_at
  BEFORE UPDATE ON project_visual_references
  FOR EACH ROW
  EXECUTE FUNCTION update_project_visual_references_updated_at();

-- Commentaires pour documentation
COMMENT ON TABLE project_visual_references IS 'Images de référence pour l''identité visuelle du projet. Collection de type moodboard servant de base stylistique pour toutes les générations IA.';
COMMENT ON COLUMN project_visual_references.display_order IS 'Ordre d''affichage des images dans le moodboard. Permet la réorganisation.';
COMMENT ON COLUMN projects.visual_style_summary IS 'Résumé textuel du style visuel déduit automatiquement par l''IA à partir des références. Ex: "Style semi-réaliste, couleurs contrastées, ambiance sombre et dramatique, traits nets, inspirations webtoon/manhwa."';
COMMENT ON COLUMN projects.visual_style_prompt IS 'Prompt de style ajustable manuellement par l''utilisateur (optionnel). Permet de fine-tuner la compréhension IA.';
