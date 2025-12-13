-- Migration SQL pour ajouter la colonne identity_visual_reference_url à la table projects
-- Cette colonne stocke le template/identité visuelle utilisé par l'IA pour la cohérence graphique

-- Ajouter la colonne si elle n'existe pas déjà
DO $$ 
BEGIN
  -- Ajouter la colonne identity_visual_reference_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'identity_visual_reference_url'
  ) THEN
    ALTER TABLE projects ADD COLUMN identity_visual_reference_url TEXT;
  END IF;
END $$;

-- Commentaire pour documentation
COMMENT ON COLUMN projects.identity_visual_reference_url IS 'URL du template/identité visuelle sélectionné. Utilisé par l''IA pour garantir la cohérence graphique de tous les éléments générés (personnages, lieux, assets, etc.).';
