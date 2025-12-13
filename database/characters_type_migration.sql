-- Migration SQL pour ajouter le champ 'type' à la table characters
-- Permet de distinguer Personnages, Monstres et Ennemis

DO $$ 
BEGIN
  -- Ajouter la colonne 'type' si elle n'existe pas déjà
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'characters' AND column_name = 'type'
  ) THEN
    ALTER TABLE characters ADD COLUMN type VARCHAR(20) DEFAULT 'character' NOT NULL;
    
    -- Ajouter un commentaire pour la colonne
    COMMENT ON COLUMN characters.type IS 'Type de personnage: character (personnage), monster (monstre), enemy (ennemi)';
    
    -- Créer un index pour améliorer les performances des requêtes filtrées par type
    CREATE INDEX IF NOT EXISTS idx_characters_type ON characters(project_id, type);
  END IF;
END $$;

-- Vérifier que la colonne existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'characters' AND column_name = 'type'
  ) THEN
    RAISE NOTICE 'Colonne "type" ajoutée avec succès à la table characters';
  ELSE
    RAISE EXCEPTION 'Erreur: La colonne "type" n''a pas pu être ajoutée';
  END IF;
END $$;
