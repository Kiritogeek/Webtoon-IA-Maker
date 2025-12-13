-- Migration SQL pour la table chapters
-- Création de la table chapters avec toutes les fonctionnalités CRUD

-- Supprimer la table si elle existe (pour réinitialisation)
-- DROP TABLE IF EXISTS chapters CASCADE;

-- Créer la table chapters
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter les colonnes optionnelles si elles n'existent pas déjà
DO $$ 
BEGIN
  -- Ajouter la colonne description si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chapters' AND column_name = 'description'
  ) THEN
    ALTER TABLE chapters ADD COLUMN description TEXT;
  END IF;

  -- Ajouter la colonne cover_image_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chapters' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE chapters ADD COLUMN cover_image_url TEXT;
  END IF;
END $$;

-- Créer un index sur project_id pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_chapters_project_id ON chapters(project_id);

-- Créer un index sur order pour améliorer le tri
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(project_id, "order");

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_chapters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS trigger_update_chapters_updated_at ON chapters;
CREATE TRIGGER trigger_update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_chapters_updated_at();

-- RLS (Row Level Security) - Politique de sécurité
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view chapters of their projects" ON chapters;
DROP POLICY IF EXISTS "Users can create chapters in their projects" ON chapters;
DROP POLICY IF EXISTS "Users can update their chapters" ON chapters;
DROP POLICY IF EXISTS "Users can delete their chapters" ON chapters;

-- Politique : Les utilisateurs peuvent voir les chapitres de leurs projets
CREATE POLICY "Users can view chapters of their projects"
  ON chapters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Politique : Les utilisateurs peuvent créer des chapitres dans leurs projets
CREATE POLICY "Users can create chapters in their projects"
  ON chapters
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Politique : Les utilisateurs peuvent modifier leurs chapitres
CREATE POLICY "Users can update their chapters"
  ON chapters
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Politique : Les utilisateurs peuvent supprimer leurs chapitres
CREATE POLICY "Users can delete their chapters"
  ON chapters
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Fonction pour réorganiser automatiquement l'ordre après suppression
CREATE OR REPLACE FUNCTION reorder_chapters_after_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Réorganiser l'ordre des chapitres restants
  UPDATE chapters
  SET "order" = "order" - 1
  WHERE project_id = OLD.project_id
    AND "order" > OLD."order";
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour réorganiser l'ordre après suppression
DROP TRIGGER IF EXISTS trigger_reorder_chapters_after_delete ON chapters;
CREATE TRIGGER trigger_reorder_chapters_after_delete
  AFTER DELETE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION reorder_chapters_after_delete();

-- Commentaires pour la documentation
COMMENT ON TABLE chapters IS 'Table des chapitres de webtoon';
COMMENT ON COLUMN chapters.id IS 'Identifiant unique du chapitre';
COMMENT ON COLUMN chapters.project_id IS 'Référence au projet parent';
COMMENT ON COLUMN chapters.title IS 'Titre du chapitre';
COMMENT ON COLUMN chapters."order" IS 'Ordre d''affichage du chapitre dans le projet';
COMMENT ON COLUMN chapters.description IS 'Description optionnelle du chapitre';
COMMENT ON COLUMN chapters.cover_image_url IS 'URL de l''image de couverture du chapitre';
COMMENT ON COLUMN chapters.created_at IS 'Date de création';
COMMENT ON COLUMN chapters.updated_at IS 'Date de dernière modification';
