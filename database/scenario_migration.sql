-- Migration SQL pour créer les tables scenario et chapter_notes
-- Scénario : trame globale, arcs narratifs, notes par chapitre

-- Créer la table scenario
CREATE TABLE IF NOT EXISTS scenario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id) -- Un seul scénario par projet
);

-- Ajouter les colonnes optionnelles si elles n'existent pas déjà
DO $$ 
BEGIN
  -- Trame globale du scénario
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scenario' AND column_name = 'global_plot'
  ) THEN
    ALTER TABLE scenario ADD COLUMN global_plot TEXT;
  END IF;

  -- Arcs narratifs (JSON pour stocker plusieurs arcs)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scenario' AND column_name = 'narrative_arcs'
  ) THEN
    ALTER TABLE scenario ADD COLUMN narrative_arcs JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Créer la table chapter_notes pour les notes par chapitre
CREATE TABLE IF NOT EXISTS chapter_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chapter_id) -- Une seule note par chapitre
);

-- Créer un index sur project_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_scenario_project_id ON scenario(project_id);
CREATE INDEX IF NOT EXISTS idx_chapter_notes_project_id ON chapter_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_chapter_notes_chapter_id ON chapter_notes(chapter_id);

-- Créer un index sur narrative_arcs pour les recherches (optionnel)
CREATE INDEX IF NOT EXISTS idx_scenario_narrative_arcs ON scenario USING GIN (narrative_arcs);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_scenario_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_chapter_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS trigger_update_scenario_updated_at ON scenario;
CREATE TRIGGER trigger_update_scenario_updated_at
  BEFORE UPDATE ON scenario
  FOR EACH ROW
  EXECUTE FUNCTION update_scenario_updated_at();

DROP TRIGGER IF EXISTS trigger_update_chapter_notes_updated_at ON chapter_notes;
CREATE TRIGGER trigger_update_chapter_notes_updated_at
  BEFORE UPDATE ON chapter_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_chapter_notes_updated_at();

-- RLS (Row Level Security) - Politique de sécurité
ALTER TABLE scenario ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_notes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour scenario
CREATE POLICY "Users can view scenario from their projects"
  ON scenario FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scenario.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scenario in their projects"
  ON scenario FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scenario.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scenario from their projects"
  ON scenario FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scenario.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scenario from their projects"
  ON scenario FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scenario.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Politiques RLS pour chapter_notes
CREATE POLICY "Users can view chapter_notes from their projects"
  ON chapter_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapter_notes.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chapter_notes in their projects"
  ON chapter_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapter_notes.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update chapter_notes from their projects"
  ON chapter_notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapter_notes.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete chapter_notes from their projects"
  ON chapter_notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapter_notes.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Commentaires pour documentation
COMMENT ON TABLE scenario IS 'Scénario du projet : trame globale et arcs narratifs';
COMMENT ON COLUMN scenario.global_plot IS 'Trame globale du scénario';
COMMENT ON COLUMN scenario.narrative_arcs IS 'Liste JSON des arcs narratifs avec leurs chapitres associés';
COMMENT ON TABLE chapter_notes IS 'Notes scénaristiques par chapitre';
COMMENT ON COLUMN chapter_notes.notes IS 'Notes scénaristiques pour le chapitre (boussole narrative)';
