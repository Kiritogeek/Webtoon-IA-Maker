-- Migration SQL pour étendre la table characters
-- Ajout des champs pour identité visuelle, histoire, traits de caractère, images de référence

-- Ajouter les colonnes si elles n'existent pas déjà
DO $$ 
BEGIN
  -- Identité visuelle - Visage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'characters' AND column_name = 'face_description'
  ) THEN
    ALTER TABLE characters ADD COLUMN face_description TEXT;
  END IF;

  -- Identité visuelle - Corps
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'characters' AND column_name = 'body_description'
  ) THEN
    ALTER TABLE characters ADD COLUMN body_description TEXT;
  END IF;

  -- Histoire du personnage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'characters' AND column_name = 'history'
  ) THEN
    ALTER TABLE characters ADD COLUMN history TEXT;
  END IF;

  -- Traits de caractère (JSON pour stocker une liste)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'characters' AND column_name = 'personality_traits'
  ) THEN
    ALTER TABLE characters ADD COLUMN personality_traits JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Images de référence (JSON pour stocker plusieurs URLs)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'characters' AND column_name = 'reference_images'
  ) THEN
    ALTER TABLE characters ADD COLUMN reference_images JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Image de visage générée/uploadée
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'characters' AND column_name = 'face_image_url'
  ) THEN
    ALTER TABLE characters ADD COLUMN face_image_url TEXT;
  END IF;

  -- Image de corps générée/uploadée
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'characters' AND column_name = 'body_image_url'
  ) THEN
    ALTER TABLE characters ADD COLUMN body_image_url TEXT;
  END IF;
END $$;

-- Créer un index sur personality_traits pour les recherches (optionnel)
CREATE INDEX IF NOT EXISTS idx_characters_personality_traits ON characters USING GIN (personality_traits);

-- Créer un index sur reference_images pour les recherches (optionnel)
CREATE INDEX IF NOT EXISTS idx_characters_reference_images ON characters USING GIN (reference_images);

-- Commentaires pour documentation
COMMENT ON COLUMN characters.face_description IS 'Description textuelle du visage du personnage';
COMMENT ON COLUMN characters.body_description IS 'Description textuelle du corps du personnage';
COMMENT ON COLUMN characters.history IS 'Histoire et background du personnage';
COMMENT ON COLUMN characters.personality_traits IS 'Liste JSON des traits de caractère (ex: ["courageux", "loyal", "impulsif"])';
COMMENT ON COLUMN characters.reference_images IS 'Liste JSON des URLs d''images de référence (uploadées ou générées par IA)';
COMMENT ON COLUMN characters.face_image_url IS 'URL de l''image du visage (générée ou uploadée)';
COMMENT ON COLUMN characters.body_image_url IS 'URL de l''image du corps (générée ou uploadée)';
