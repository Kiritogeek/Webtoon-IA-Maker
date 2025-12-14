-- Migration SQL pour ajouter les colonnes de background normalisées à la table projects
-- Structure normalisée : background_type, background_preset, background_image_url

-- Ajouter les colonnes si elles n'existent pas déjà
DO $$ 
BEGIN
  -- background_type : 'preset' | 'custom'
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'background_type'
  ) THEN
    ALTER TABLE projects ADD COLUMN background_type TEXT;
  END IF;

  -- background_preset : nom du preset sélectionné
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'background_preset'
  ) THEN
    ALTER TABLE projects ADD COLUMN background_preset TEXT;
  END IF;

  -- background_image_url : URL de l'image personnalisée
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'background_image_url'
  ) THEN
    ALTER TABLE projects ADD COLUMN background_image_url TEXT;
  END IF;
END $$;

-- Note: gradient_background est conservé pour compatibilité avec les anciens projets
-- Il ne doit plus être utilisé pour la logique, uniquement pour le fallback
