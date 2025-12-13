import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image, Group, Text, Transformer, Rect, Line, Circle } from 'react-konva'
import { supabase } from '@/lib/supabase'
import type { Scene, Character, Project } from '@/lib/supabase'

const CANVAS_WIDTH = 800
const DEFAULT_PANEL_HEIGHT = 1200
const MIN_TRANSITION_HEIGHT = 20
const MAX_TRANSITION_HEIGHT = 200

// Types selon la nouvelle logique PANELS + TRANSITIONS
interface Panel {
  id: string
  sceneId: string
  type: 'panel' | 'cover'
  order: number
  background?: {
    placeId?: string
    imageUrl?: string
    color?: string
  }
  characters: PanelCharacter[]
  assets: PanelAsset[]
  texts: PanelText[]
  dialogues: PanelDialogue[]
  narrativeRole?: 'action' | 'dialogue' | 'pause' | 'climax' | 'introduction'
  visualDensity?: 'low' | 'medium' | 'high'
  description?: string
  y: number
  height: number
}

interface PanelCharacter {
  id: string
  characterId: string
  name: string
  imageUrl?: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  zIndex: number
  opacity: number
}

interface PanelAsset {
  id: string
  assetId?: string
  name: string
  imageUrl?: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  zIndex: number
  opacity: number
}

interface PanelText {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  fill: string
  align: 'left' | 'center' | 'right'
}

interface PanelDialogue {
  id: string
  text: string
  characterId?: string
  x: number
  y: number
  width: number
  bubbleType: 'speech' | 'thought' | 'narration'
}

interface Transition {
  id: string
  type: 'empty' | 'fade_black' | 'blur' | 'splash' | 'cut' | 'action_lines'
  height: number
  order: number // Position entre deux panels
  y: number
}

interface WebtoonPanelEditorProps {
  chapterId: string
  projectId: string
  project: Project | null
  scenes: Scene[]
  characters: Character[]
  onScenesUpdate: () => void
}

type Tool = 'select' | 'move' | 'text' | 'dialogue' | 'effects'

export default function WebtoonPanelEditor({
  chapterId,
  projectId,
  project,
  scenes,
  characters,
  onScenesUpdate
}: WebtoonPanelEditorProps) {
  const [panels, setPanels] = useState<Panel[]>([])
  const [transitions, setTransitions] = useState<Transition[]>([])
  const [selectedTool, setSelectedTool] = useState<Tool>('select')
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null)
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(null)
  const [hoveredPanelId, setHoveredPanelId] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<{ type: 'character' | 'place' | 'asset' | 'transition' | 'text' | 'dialogue', data: any } | null>(null)
  const [showAIBubble, setShowAIBubble] = useState<{ type: 'panel' | 'character' | 'transition', id: string } | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [places, setPlaces] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Templates de bulles de texte et dialogue
  const textTemplates = [
    { id: 'text-simple', label: 'Texte simple', type: 'text' as const, fontSize: 16, fontFamily: 'Arial', fill: '#000000' },
    { id: 'text-title', label: 'Titre', type: 'text' as const, fontSize: 24, fontFamily: 'Arial', fill: '#000000', fontWeight: 'bold' },
    { id: 'text-caption', label: 'Légende', type: 'text' as const, fontSize: 12, fontFamily: 'Arial', fill: '#666666' },
  ]

  const dialogueTemplates = [
    { id: 'dialogue-speech', label: '💬 Bulle de dialogue', type: 'dialogue' as const, bubbleType: 'speech' as const, width: 200 },
    { id: 'dialogue-thought', label: '💭 Pensée', type: 'dialogue' as const, bubbleType: 'thought' as const, width: 200 },
    { id: 'dialogue-narration', label: '📖 Narration', type: 'dialogue' as const, bubbleType: 'narration' as const, width: 300 },
  ]

  useEffect(() => {
    loadPanelsFromScenes()
    loadPlacesAndAssets()
  }, [scenes, projectId])

  const loadPanelsFromScenes = () => {
    const loadedPanels: Panel[] = []
    scenes.forEach((scene, index) => {
      const panel: Panel = {
        id: `panel-${scene.id}`,
        sceneId: scene.id,
        type: index === 0 ? 'cover' : 'panel',
        order: index,
        background: scene.canvas_data?.background || {},
        characters: scene.canvas_data?.characters || [],
        assets: scene.canvas_data?.assets || [],
        texts: scene.canvas_data?.texts || [],
        dialogues: scene.canvas_data?.dialogues || [],
        narrativeRole: scene.canvas_data?.narrativeRole || 'action',
        visualDensity: scene.canvas_data?.visualDensity || 'medium',
        description: scene.description || '',
        y: 0, // Calculé dynamiquement
        height: DEFAULT_PANEL_HEIGHT
      }
      loadedPanels.push(panel)
    })
    setPanels(loadedPanels)
    calculatePositions()
  }

  const calculatePositions = () => {
    let currentY = 0
    const updatedPanels: Panel[] = []
    const updatedTransitions: Transition[] = []

    panels.forEach((panel, index) => {
      const panelWithY = { ...panel, y: currentY }
      updatedPanels.push(panelWithY)
      currentY += panel.height
      
      // Trouver ou créer transition après ce panel
      if (index < panels.length - 1) {
        let transition = transitions.find(t => t.order === index)
        if (!transition) {
          transition = {
            id: `transition-${index}`,
            type: 'empty' as const,
            height: 40,
            order: index,
            y: currentY
          }
        }
        transition.y = currentY
        updatedTransitions.push(transition)
        currentY += transition.height
      }
    })

    setPanels(updatedPanels)
    if (updatedTransitions.length > 0) {
      setTransitions(updatedTransitions)
    }
  }

  useEffect(() => {
    if (panels.length > 0) {
      calculatePositions()
    }
  }, [panels.length])

  const loadPlacesAndAssets = async () => {
    try {
      try {
        const { data: placesData } = await supabase
          .from('places')
          .select('*')
          .eq('project_id', projectId)
        if (placesData) setPlaces(placesData)
      } catch (error) {
        console.log('Places table not available')
      }

      try {
        const { data: assetsData } = await supabase
          .from('assets')
          .select('*')
          .eq('project_id', projectId)
        if (assetsData) setAssets(assetsData)
      } catch (error) {
        console.log('Assets table not available')
      }
    } catch (error) {
      console.error('Error loading places and assets:', error)
    }
  }

  const [dropZones, setDropZones] = useState<Array<{ y: number, type: 'panel' | 'transition' }>>([])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedItem || !stageRef.current) return

    const stage = stageRef.current
    const point = stage.getPointerPosition()
    if (!point) return

    const container = containerRef.current
    if (!container) return

    const scrollTop = container.scrollTop
    const relativeY = point.y + scrollTop

    // Trouver le panel cible ou la zone de drop la plus proche
    const targetPanel = panels.find(p => 
      relativeY >= p.y && relativeY <= p.y + p.height
    )

    // Zones de drop intelligentes : snap entre panels
    const snapThreshold = 50
    let snappedY = relativeY
    let shouldCreateNewPanel = false

    // Vérifier si on est proche d'un bord de panel
    for (const panel of panels) {
      const distanceToTop = Math.abs(relativeY - panel.y)
      const distanceToBottom = Math.abs(relativeY - (panel.y + panel.height))
      
      if (distanceToTop < snapThreshold) {
        snappedY = panel.y
        break
      } else if (distanceToBottom < snapThreshold) {
        snappedY = panel.y + panel.height
        shouldCreateNewPanel = true
        break
      }
    }

    if (draggedItem.type === 'character' && targetPanel) {
      // Ajouter personnage au panel
      const newCharacter: PanelCharacter = {
        id: `char-${Date.now()}`,
        characterId: draggedItem.data.id,
        name: draggedItem.data.name,
        imageUrl: draggedItem.data.image_url,
        x: Math.max(0, Math.min(point.x, CANVAS_WIDTH - 200)),
        y: relativeY - targetPanel.y,
        width: 200,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        zIndex: 0,
        opacity: 1
      }

      const updatedPanels = panels.map(p =>
        p.id === targetPanel.id
          ? { ...p, characters: [...p.characters, newCharacter] }
          : p
      )
      setPanels(updatedPanels)
      savePanel(targetPanel.sceneId, updatedPanels.find(p => p.id === targetPanel.id)!)
    } else if (draggedItem.type === 'place' && targetPanel) {
      // Définir le fond du panel
      const updatedPanels = panels.map(p =>
        p.id === targetPanel.id
          ? {
              ...p,
              background: {
                placeId: draggedItem.data.id,
                imageUrl: draggedItem.data.image_url
              }
            }
          : p
      )
      setPanels(updatedPanels)
      savePanel(targetPanel.sceneId, updatedPanels.find(p => p.id === targetPanel.id)!)
    } else if (draggedItem.type === 'asset' && targetPanel) {
      // Ajouter asset au panel
      const newAsset: PanelAsset = {
        id: `asset-${Date.now()}`,
        assetId: draggedItem.data.id,
        name: draggedItem.data.name,
        imageUrl: draggedItem.data.image_url,
        x: Math.max(0, Math.min(point.x, CANVAS_WIDTH - 150)),
        y: relativeY - targetPanel.y,
        width: 150,
        height: 150,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        zIndex: 0,
        opacity: 1
      }

      const updatedPanels = panels.map(p =>
        p.id === targetPanel.id
          ? { ...p, assets: [...p.assets, newAsset] }
          : p
      )
      setPanels(updatedPanels)
      savePanel(targetPanel.sceneId, updatedPanels.find(p => p.id === targetPanel.id)!)
    } else if (draggedItem.type === 'character' && (!targetPanel || shouldCreateNewPanel)) {
      // Créer un nouveau panel avec le personnage (selon Produit.md : Drop = création automatique d'un panel)
      createNewPanelWithCharacter(draggedItem.data, snappedY)
    } else if (draggedItem.type === 'text' && targetPanel) {
      // Ajouter texte au panel
      const newText: PanelText = {
        id: `text-${Date.now()}`,
        text: 'Nouveau texte',
        x: Math.max(0, Math.min(point.x, CANVAS_WIDTH - 200)),
        y: relativeY - targetPanel.y,
        fontSize: draggedItem.data.fontSize || 16,
        fontFamily: draggedItem.data.fontFamily || 'Arial',
        fill: draggedItem.data.fill || '#000000',
        align: 'left'
      }

      const updatedPanels = panels.map(p =>
        p.id === targetPanel.id
          ? { ...p, texts: [...p.texts, newText] }
          : p
      )
      setPanels(updatedPanels)
      savePanel(targetPanel.sceneId, updatedPanels.find(p => p.id === targetPanel.id)!)
    } else if (draggedItem.type === 'dialogue' && targetPanel) {
      // Ajouter dialogue au panel
      const newDialogue: PanelDialogue = {
        id: `dialogue-${Date.now()}`,
        text: 'Nouveau dialogue',
        x: Math.max(0, Math.min(point.x, CANVAS_WIDTH - draggedItem.data.width)),
        y: relativeY - targetPanel.y,
        width: draggedItem.data.width || 200,
        bubbleType: draggedItem.data.bubbleType || 'speech'
      }

      const updatedPanels = panels.map(p =>
        p.id === targetPanel.id
          ? { ...p, dialogues: [...p.dialogues, newDialogue] }
          : p
      )
      setPanels(updatedPanels)
      savePanel(targetPanel.sceneId, updatedPanels.find(p => p.id === targetPanel.id)!)
    }

    setDropZones([])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedItem || !stageRef.current) return

    const stage = stageRef.current
    const point = stage.getPointerPosition()
    if (!point) return

    const container = containerRef.current
    if (!container) return

    const scrollTop = container.scrollTop
    const relativeY = point.y + scrollTop

    // Afficher les zones de drop intelligentes
    const zones: Array<{ y: number, type: 'panel' | 'transition' }> = []
    
    panels.forEach((panel) => {
      // Zone au-dessus du panel
      if (Math.abs(relativeY - panel.y) < 50) {
        zones.push({ y: panel.y, type: 'panel' })
      }
      // Zone en-dessous du panel
      if (Math.abs(relativeY - (panel.y + panel.height)) < 50) {
        zones.push({ y: panel.y + panel.height, type: 'transition' })
      }
    })

    setDropZones(zones)
  }

  const createNewPanelWithCharacter = async (character: any, y: number) => {
    try {
      // Trouver l'ordre approprié
      const panelBefore = panels.find(p => p.y + p.height < y)
      const order = panelBefore ? panelBefore.order + 1 : panels.length

      // Créer une nouvelle scène
      const { data: newScene, error } = await supabase
        .from('scenes')
        .insert([{
          chapter_id: chapterId,
          title: `Panel ${order + 1}`,
          order: order,
          description: null
        }])
        .select()
        .single()

      if (error) throw error

      // Créer le panel avec le personnage
      const newCharacter: PanelCharacter = {
        id: `char-${Date.now()}`,
        characterId: character.id,
        name: character.name,
        imageUrl: character.image_url,
        x: CANVAS_WIDTH / 2 - 100,
        y: DEFAULT_PANEL_HEIGHT / 2 - 100,
        width: 200,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        zIndex: 0,
        opacity: 1
      }

      const panelData = {
        background: {},
        characters: [newCharacter],
        assets: [],
        texts: [],
        dialogues: [],
        narrativeRole: 'action',
        visualDensity: 'medium'
      }

      await supabase
        .from('scenes')
        .update({ canvas_data: panelData })
        .eq('id', newScene.id)

      onScenesUpdate()
    } catch (error) {
      console.error('Error creating new panel:', error)
      alert('Erreur lors de la création du panel')
    }
  }

  const savePanel = async (sceneId: string, panel: Panel) => {
    try {
      const dataToSave = {
        background: panel.background,
        characters: panel.characters,
        assets: panel.assets,
        texts: panel.texts,
        dialogues: panel.dialogues,
        narrativeRole: panel.narrativeRole,
        visualDensity: panel.visualDensity
      }

      const { error } = await supabase
        .from('scenes')
        .update({ canvas_data: dataToSave, description: panel.description || null })
        .eq('id', sceneId)

      if (error) throw error
      onScenesUpdate()
    } catch (error) {
      console.error('Error saving panel:', error)
    }
  }

  const handlePanelClick = (panelId: string) => {
    setSelectedPanelId(panelId)
    setSelectedTransitionId(null)
    setShowPropertiesPanel(true)
  }

  const handleTransitionClick = (transitionId: string) => {
    setSelectedTransitionId(transitionId)
    setSelectedPanelId(null)
    setShowAIBubble({ type: 'transition', id: transitionId })
  }

  const handleCharacterClick = (panelId: string, characterId: string) => {
    setSelectedPanelId(panelId)
    setShowAIBubble({ type: 'character', id: characterId })
  }

  const handleAIAction = async () => {
    if (!showAIBubble || !aiPrompt.trim() || !project) return

    setGenerating(true)
    try {
      // Vérifier les objectifs avant action IA (selon Produit.md)
      // TODO: Charger les objectifs du chapitre et vérifier

      let contextPrompt = ''
      if (showAIBubble.type === 'character') {
        const panel = panels.find(p => p.id === selectedPanelId)
        const character = panel?.characters.find(c => c.id === showAIBubble.id)
        contextPrompt = `
          Style: ${project.style_graphique || 'webtoon'}
          Ambiance: ${project.ambiance || 'moderne'}
          Format: Webtoon vertical, ${CANVAS_WIDTH}x${DEFAULT_PANEL_HEIGHT}px
          ${aiPrompt}
          Personnage: ${character?.name}
          Pose, émotion, cadrage webtoon vertical.
        `.trim()
      } else if (showAIBubble.type === 'panel') {
        const panel = panels.find(p => p.id === showAIBubble.id)
        contextPrompt = `
          Style: ${project.style_graphique || 'webtoon'}
          Format: Webtoon vertical
          Rôle narratif: ${panel?.narrativeRole || 'action'}
          Densité: ${panel?.visualDensity || 'medium'}
          ${aiPrompt}
          Optimiser le panel pour le webtoon.
        `.trim()
      } else if (showAIBubble.type === 'transition') {
        contextPrompt = `
          Style: ${project.style_graphique || 'webtoon'}
          Format: Webtoon vertical
          ${aiPrompt}
          Créer une transition visuelle entre panels.
        `.trim()
      }

      // Utiliser identity_visual_reference_url en priorité pour la cohérence graphique
      const identityVisualReference = project.identity_visual_reference_url || project.style_reference_image_url

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: contextPrompt,
          styleReference: identityVisualReference,
          format: 'webtoon_vertical'
        }),
      })

      if (!response.ok) throw new Error('Failed to generate image')

      const { imageUrl } = await response.json()

      // Appliquer selon le type
      if (showAIBubble.type === 'character' && selectedPanelId) {
        const updatedPanels = panels.map(p => {
          if (p.id === selectedPanelId) {
            return {
              ...p,
              characters: p.characters.map(c =>
                c.id === showAIBubble.id ? { ...c, imageUrl } : c
              )
            }
          }
          return p
        })
        setPanels(updatedPanels)
        const panel = updatedPanels.find(p => p.id === selectedPanelId)
        if (panel) savePanel(panel.sceneId, panel)
      }

      setShowAIBubble(null)
      setAiPrompt('')
      alert('Action IA appliquée avec succès!')
    } catch (error) {
      console.error('Error applying AI action:', error)
      alert('Erreur lors de l\'application de l\'IA')
    } finally {
      setGenerating(false)
    }
  }

  const addTransition = (type: Transition['type'], afterPanelOrder: number) => {
    const newTransition: Transition = {
      id: `transition-${Date.now()}`,
      type,
      height: type === 'empty' ? 40 : 80,
      order: afterPanelOrder,
      y: 0 // Calculé dans calculatePositions
    }
    setTransitions([...transitions, newTransition])
    calculatePositions()
  }

  const updateTransitionHeight = (transitionId: string, newHeight: number) => {
    const updatedTransitions = transitions.map(t =>
      t.id === transitionId
        ? { ...t, height: Math.max(MIN_TRANSITION_HEIGHT, Math.min(MAX_TRANSITION_HEIGHT, newHeight)) }
        : t
    )
    setTransitions(updatedTransitions)
    calculatePositions()
  }

  const selectedPanel = panels.find(p => p.id === selectedPanelId)
  const selectedTransition = transitions.find(t => t.id === selectedTransitionId)
  
  // Calculer la hauteur totale
  const totalHeight = panels.length > 0
    ? panels[panels.length - 1].y + panels[panels.length - 1].height
    : DEFAULT_PANEL_HEIGHT

  return (
    <div className="flex h-full bg-darkest">
      {/* Sidebar gauche - Outils Webtoon */}
      <div className="w-64 bg-darker/90 backdrop-blur-sm border-r border-white/10 flex flex-col">
        {/* Outils */}
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold mb-3 text-sm">🧰 Outils</h3>
          <div className="space-y-2">
            {(['select', 'move', 'text', 'dialogue', 'effects'] as Tool[]).map((tool) => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                  selectedTool === tool
                    ? 'bg-primary text-white'
                    : 'bg-darkest/50 text-white/70 hover:bg-darkest/70'
                }`}
              >
                {tool === 'select' && '✋ Sélection'}
                {tool === 'move' && '↔️ Déplacement'}
                {tool === 'text' && '📝 Texte'}
                {tool === 'dialogue' && '💬 Dialogue'}
                {tool === 'effects' && '✨ Effets visuels'}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu selon l'outil sélectionné */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {selectedTool === 'select' || selectedTool === 'move' ? (
            <>
              {/* Personnages */}
              <div className="p-4 border-b border-white/10">
                <h4 className="text-white/70 text-sm font-medium mb-2">👤 Personnages</h4>
                {characters.length === 0 ? (
                  <div className="text-white/40 text-xs p-2 bg-darkest/30 rounded text-center">
                    Aucun personnage créé
                  </div>
                ) : (
                  <div className="space-y-2">
                    {characters.map((character) => (
                      <div
                        key={character.id}
                        draggable
                        onDragStart={() => setDraggedItem({ type: 'character', data: character })}
                        onDragEnd={() => setDraggedItem(null)}
                        className="p-2 bg-darkest/50 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 cursor-move transition"
                      >
                        {character.image_url ? (
                          <img
                            src={character.image_url}
                            alt={character.name}
                            className="w-full h-20 object-cover rounded mb-1"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-20 bg-primary/20 rounded mb-1 flex items-center justify-center text-white/60 text-xs">
                            {character.name}
                          </div>
                        )}
                        <p className="text-white/80 text-xs text-center">{character.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lieux */}
              <div className="p-4 border-b border-white/10">
                <h4 className="text-white/70 text-sm font-medium mb-2">🌍 Lieux</h4>
                {places.length === 0 ? (
                  <div className="text-white/40 text-xs p-2 bg-darkest/30 rounded text-center">
                    Aucun lieu créé
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {places.map((place) => (
                      <div
                        key={place.id}
                        draggable
                        onDragStart={() => setDraggedItem({ type: 'place', data: place })}
                        onDragEnd={() => setDraggedItem(null)}
                        className="p-2 bg-darkest/50 rounded-lg border-2 border-dashed border-secondary/30 hover:border-secondary/60 cursor-move transition"
                      >
                        {place.image_url ? (
                          <img
                            src={place.image_url}
                            alt={place.name}
                            className="w-full h-20 object-cover rounded mb-1"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-20 bg-secondary/20 rounded mb-1 flex items-center justify-center text-white/60 text-xs">
                            {place.name}
                          </div>
                        )}
                        <p className="text-white/80 text-xs text-center">{place.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assets */}
              <div className="p-4 border-b border-white/10">
                <h4 className="text-white/70 text-sm font-medium mb-2">🧰 Assets</h4>
                {assets.length === 0 ? (
                  <div className="text-white/40 text-xs p-2 bg-darkest/30 rounded text-center">
                    Aucun asset créé
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {assets.map((asset) => (
                      <div
                        key={asset.id}
                        draggable
                        onDragStart={() => setDraggedItem({ type: 'asset', data: asset })}
                        onDragEnd={() => setDraggedItem(null)}
                        className="p-2 bg-darkest/50 rounded-lg border-2 border-dashed border-accent/30 hover:border-accent/60 cursor-move transition"
                      >
                        {asset.image_url ? (
                          <img
                            src={asset.image_url}
                            alt={asset.name}
                            className="w-full h-20 object-cover rounded mb-1"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-20 bg-accent/20 rounded mb-1 flex items-center justify-center text-white/60 text-xs">
                            {asset.name}
                          </div>
                        )}
                        <p className="text-white/80 text-xs text-center">{asset.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : selectedTool === 'text' ? (
            <div className="p-4">
              <h4 className="text-white/70 text-sm font-medium mb-3">📝 Bulles de texte</h4>
              <div className="space-y-2">
                {textTemplates.map((template) => (
                  <div
                    key={template.id}
                    draggable
                    onDragStart={() => setDraggedItem({ type: 'text', data: template })}
                    onDragEnd={() => setDraggedItem(null)}
                    className="p-3 bg-darkest/50 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 cursor-move transition"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 bg-primary/20 rounded flex items-center justify-center text-white/60 text-xs">
                        📝
                      </div>
                      <div className="flex-1">
                        <p className="text-white/90 text-sm font-medium">{template.label}</p>
                        <p className="text-white/50 text-xs">{template.fontSize}px</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedTool === 'dialogue' ? (
            <div className="p-4">
              <h4 className="text-white/70 text-sm font-medium mb-3">💬 Bulles de dialogue</h4>
              <div className="space-y-2">
                {dialogueTemplates.map((template) => (
                  <div
                    key={template.id}
                    draggable
                    onDragStart={() => setDraggedItem({ type: 'dialogue', data: template })}
                    onDragEnd={() => setDraggedItem(null)}
                    className="p-3 bg-darkest/50 rounded-lg border-2 border-dashed border-accent/30 hover:border-accent/60 cursor-move transition"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 bg-accent/20 rounded flex items-center justify-center text-white/60 text-xs">
                        {template.bubbleType === 'speech' && '💬'}
                        {template.bubbleType === 'thought' && '💭'}
                        {template.bubbleType === 'narration' && '📖'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white/90 text-sm font-medium">{template.label}</p>
                        <p className="text-white/50 text-xs">{template.width}px</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedTool === 'effects' ? (
            <div className="p-4">
              <h4 className="text-white/70 text-sm font-medium mb-3">✨ Effets visuels</h4>
              <div className="text-white/40 text-xs p-2 bg-darkest/30 rounded text-center">
                Bientôt disponible
              </div>
            </div>
          ) : null}
        </div>

        {/* Transitions */}
        <div className="p-4">
          <h4 className="text-white/70 text-sm font-medium mb-2">🔀 Transitions</h4>
          <div className="space-y-2">
            {(['empty', 'fade_black', 'blur', 'splash', 'cut', 'action_lines'] as Transition['type'][]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  const lastPanel = panels[panels.length - 1]
                  if (lastPanel) {
                    addTransition(type, lastPanel.order)
                  }
                }}
                className="w-full px-3 py-2 bg-darkest/50 hover:bg-darkest/70 text-white/80 rounded-lg text-xs text-left transition"
              >
                {type === 'empty' && '⚪ Espacement vide (silence)'}
                {type === 'fade_black' && '⬛ Dégradé noir'}
                {type === 'blur' && '🌫️ Flou progressif'}
                {type === 'splash' && '✨ Splash lumineux'}
                {type === 'cut' && '⚡ Cut sec'}
                {type === 'action_lines' && '💥 Transition action (lignes)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas central */}
      <div className="flex-1 flex flex-col bg-darker/50">
        {/* Barre d'outils supérieure */}
        <div className="h-16 bg-darker/90 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="px-3 py-1.5 bg-darkest/50 hover:bg-darkest/70 text-white rounded-lg text-sm transition"
            >
              ➖
            </button>
            <span className="text-white/70 text-sm">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="px-3 py-1.5 bg-darkest/50 hover:bg-darkest/70 text-white rounded-lg text-sm transition"
            >
              ➕
            </button>
          </div>
          <div className="text-white/50 text-xs">
            Format Webtoon: {CANVAS_WIDTH}px × {DEFAULT_PANEL_HEIGHT}px
          </div>
        </div>

        {/* Canvas vertical Webtoon */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto custom-scrollbar"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDropZones([])}
        >
          <div className="flex justify-center p-8">
            <div
              style={{
                width: CANVAS_WIDTH * zoom,
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
              }}
            >
              <Stage
                ref={stageRef}
                width={CANVAS_WIDTH}
                height={totalHeight}
                style={{ background: '#FFFFFF' }}
              >
                <Layer>
                  {/* Zones de drop intelligentes (prévisualisation) */}
                  {dropZones.map((zone, index) => (
                    <Line
                      key={`drop-zone-${index}`}
                      points={[0, zone.y, CANVAS_WIDTH, zone.y]}
                      stroke="#6366F1"
                      strokeWidth={2}
                      dash={[10, 5]}
                      opacity={0.6}
                    />
                  ))}

                  {/* Panels */}
                  {panels.map((panel) => (
                    <PanelComponent
                      key={panel.id}
                      panel={panel}
                      isSelected={selectedPanelId === panel.id}
                      isHovered={hoveredPanelId === panel.id}
                      onSelect={() => handlePanelClick(panel.id)}
                      onHover={() => setHoveredPanelId(panel.id)}
                      onUnhover={() => setHoveredPanelId(null)}
                      onCharacterClick={(characterId) => handleCharacterClick(panel.id, characterId)}
                      project={project}
                    />
                  ))}

                  {/* Transitions */}
                  {transitions.map((transition) => (
                    <TransitionComponent
                      key={transition.id}
                      transition={transition}
                      isSelected={selectedTransitionId === transition.id}
                      onSelect={() => handleTransitionClick(transition.id)}
                      onHeightChange={(newHeight) => updateTransitionHeight(transition.id, newHeight)}
                    />
                  ))}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau de propriétés droite */}
      {showPropertiesPanel && selectedPanel && (
        <div className="w-80 bg-darker/90 backdrop-blur-sm border-l border-white/10 p-4 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Propriétés du Panel</h3>
            <button
              onClick={() => {
                setShowPropertiesPanel(false)
                setSelectedPanelId(null)
              }}
              className="text-white/50 hover:text-white transition"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">Description</label>
              <textarea
                value={selectedPanel.description || ''}
                onChange={(e) => {
                  const updatedPanels = panels.map(p =>
                    p.id === selectedPanel.id ? { ...p, description: e.target.value } : p
                  )
                  setPanels(updatedPanels)
                }}
                onBlur={() => {
                  const panel = panels.find(p => p.id === selectedPanel.id)
                  if (panel) savePanel(panel.sceneId, panel)
                }}
                className="w-full px-3 py-2 bg-darkest border border-white/10 rounded-lg text-white text-sm resize-none"
                rows={3}
                placeholder="Description du panel..."
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Rôle narratif</label>
              <select
                value={selectedPanel.narrativeRole || 'action'}
                onChange={(e) => {
                  const updatedPanels = panels.map(p =>
                    p.id === selectedPanel.id ? { ...p, narrativeRole: e.target.value as any } : p
                  )
                  setPanels(updatedPanels)
                  const panel = updatedPanels.find(p => p.id === selectedPanel.id)
                  if (panel) savePanel(panel.sceneId, panel)
                }}
                className="w-full px-3 py-2 bg-darkest border border-white/10 rounded-lg text-white text-sm"
              >
                <option value="action">Action</option>
                <option value="dialogue">Dialogue</option>
                <option value="pause">Pause</option>
                <option value="climax">Climax</option>
                <option value="introduction">Introduction</option>
              </select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Densité visuelle</label>
              <select
                value={selectedPanel.visualDensity || 'medium'}
                onChange={(e) => {
                  const updatedPanels = panels.map(p =>
                    p.id === selectedPanel.id ? { ...p, visualDensity: e.target.value as any } : p
                  )
                  setPanels(updatedPanels)
                  const panel = updatedPanels.find(p => p.id === selectedPanel.id)
                  if (panel) savePanel(panel.sceneId, panel)
                }}
                className="w-full px-3 py-2 bg-darkest border border-white/10 rounded-lg text-white text-sm"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
              </select>
            </div>

            <button
              onClick={() => {
                setShowAIBubble({ type: 'panel', id: selectedPanel.id })
                setShowPropertiesPanel(false)
              }}
              className="w-full px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-sm font-semibold hover:shadow-lg transition"
            >
              🎨 Optimiser avec l'IA
            </button>
          </div>
        </div>
      )}

      {/* Bulle IA contextuelle */}
      {showAIBubble && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div
            className="bg-darker/95 backdrop-blur-md rounded-2xl p-6 border-2 border-primary/50 max-w-md w-full"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Interaction IA</h3>
            <p className="text-white/70 text-sm mb-4">
              {showAIBubble.type === 'character' && 'Décrivez la pose, l\'émotion ou le cadrage à appliquer au personnage'}
              {showAIBubble.type === 'panel' && 'Décrivez comment optimiser ce panel (rythme, émotion, cadrage...)'}
              {showAIBubble.type === 'transition' && 'Décrivez l\'effet de transition souhaité'}
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={
                showAIBubble.type === 'character' ? 'Ex: Faire lever les bras au personnage' :
                showAIBubble.type === 'panel' ? 'Ex: Rendre la scène plus dramatique' :
                'Ex: Ajouter un effet de flou progressif'
              }
              className="w-full px-4 py-3 bg-darkest border-2 border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white mb-4 resize-none"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={handleAIAction}
                disabled={!aiPrompt.trim() || generating}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? 'Application...' : 'Appliquer'}
              </button>
              <button
                onClick={() => {
                  setShowAIBubble(null)
                  setAiPrompt('')
                }}
                className="px-6 py-3 bg-darkest border-2 border-white/10 text-white rounded-xl hover:bg-darkest/80 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Composant Panel
function PanelComponent({
  panel,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onUnhover,
  onCharacterClick,
  project
}: {
  panel: Panel
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
  onHover: () => void
  onUnhover: () => void
  onCharacterClick: (characterId: string) => void
  project: Project | null
}) {
  return (
    <Group
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
      onClick={onSelect}
    >
      {/* Fond du panel avec halo au survol (micro-interaction) */}
      <Rect
        x={0}
        y={panel.y}
        width={CANVAS_WIDTH}
        height={panel.height}
        fill={panel.type === 'cover' ? '#F5F5F5' : '#FFFFFF'}
        stroke={isSelected ? '#6366F1' : isHovered ? '#818CF8' : '#E5E5E5'}
        strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
        shadowBlur={isHovered ? 20 : isSelected ? 10 : 0}
        shadowColor={isHovered ? '#818CF8' : '#6366F1'}
        opacity={isHovered ? 0.95 : 1}
      />

      {/* Label couverture */}
      {panel.type === 'cover' && (
        <Group>
          <Rect
            x={10}
            y={panel.y + 10}
            width={120}
            height={24}
            fill="#6366F1"
            opacity={0.9}
            cornerRadius={4}
          />
          <Text
            x={20}
            y={panel.y + 16}
            text="COUVERTURE"
            fontSize={12}
            fill="#FFFFFF"
            fontStyle="bold"
          />
        </Group>
      )}

      {/* Fond (lieu) */}
      {panel.background?.imageUrl && (
        <Image
          x={0}
          y={panel.y}
          width={CANVAS_WIDTH}
          height={panel.height}
          image={(() => {
            const img = new window.Image()
            img.src = panel.background!.imageUrl!
            return img
          })()}
          opacity={0.6}
        />
      )}

      {/* Personnages */}
      {panel.characters.map((character) => (
        <CharacterComponent
          key={character.id}
          character={character}
          panelY={panel.y}
          onClick={() => onCharacterClick(character.id)}
        />
      ))}

      {/* Assets */}
      {panel.assets.map((asset) => (
        <AssetComponent
          key={asset.id}
          asset={asset}
          panelY={panel.y}
        />
      ))}

      {/* Textes */}
      {panel.texts.map((text) => (
        <Text
          key={text.id}
          x={text.x}
          y={panel.y + text.y}
          text={text.text}
          fontSize={text.fontSize}
          fontFamily={text.fontFamily}
          fill={text.fill}
          align={text.align}
        />
      ))}

      {/* Dialogues */}
      {panel.dialogues.map((dialogue) => (
        <DialogueComponent
          key={dialogue.id}
          dialogue={dialogue}
          panelY={panel.y}
        />
      ))}
    </Group>
  )
}

// Composant Character
function CharacterComponent({
  character,
  panelY,
  onClick
}: {
  character: PanelCharacter
  panelY: number
  onClick: () => void
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (character.imageUrl) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = character.imageUrl
      img.onload = () => setImage(img)
      img.onerror = () => setImage(null)
    } else {
      setImage(null)
    }
  }, [character.imageUrl])

  return (
    <Group
      x={character.x}
      y={panelY + character.y}
      rotation={character.rotation}
      scaleX={character.scaleX}
      scaleY={character.scaleY}
      opacity={character.opacity}
      onClick={(e) => {
        e.cancelBubble = true
        onClick()
      }}
    >
      {image ? (
        <Image
          image={image}
          width={character.width}
          height={character.height}
        />
      ) : (
        <Group>
          <Rect
            width={character.width}
            height={character.height}
            fill="#6366F1"
            opacity={0.3}
            stroke="#6366F1"
            strokeWidth={2}
          />
          <Text
            text={character.name}
            fontSize={14}
            fill="#FFFFFF"
            padding={10}
            align="center"
            width={character.width}
          />
        </Group>
      )}
    </Group>
  )
}

// Composant Asset
function AssetComponent({
  asset,
  panelY
}: {
  asset: PanelAsset
  panelY: number
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (asset.imageUrl) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = asset.imageUrl
      img.onload = () => setImage(img)
      img.onerror = () => setImage(null)
    } else {
      setImage(null)
    }
  }, [asset.imageUrl])

  return (
    <Group
      x={asset.x}
      y={panelY + asset.y}
      rotation={asset.rotation}
      scaleX={asset.scaleX}
      scaleY={asset.scaleY}
      opacity={asset.opacity}
    >
      {image ? (
        <Image
          image={image}
          width={asset.width}
          height={asset.height}
        />
      ) : (
        <Group>
          <Rect
            width={asset.width}
            height={asset.height}
            fill="#EC4899"
            opacity={0.3}
            stroke="#EC4899"
            strokeWidth={2}
          />
          <Text
            text={asset.name}
            fontSize={12}
            fill="#FFFFFF"
            padding={8}
            align="center"
            width={asset.width}
          />
        </Group>
      )}
    </Group>
  )
}

// Composant Dialogue
function DialogueComponent({
  dialogue,
  panelY
}: {
  dialogue: PanelDialogue
  panelY: number
}) {
  return (
    <Group x={dialogue.x} y={panelY + dialogue.y}>
      {/* Bulle de dialogue */}
      <Rect
        width={dialogue.width}
        height={60}
        fill={dialogue.bubbleType === 'thought' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)'}
        cornerRadius={8}
        stroke={dialogue.bubbleType === 'thought' ? '#8B5CF6' : '#6366F1'}
        strokeWidth={2}
      />
      <Text
        x={10}
        y={10}
        text={dialogue.text}
        fontSize={14}
        fill="#000000"
        width={dialogue.width - 20}
        wrap="word"
      />
    </Group>
  )
}

// Composant Transition
function TransitionComponent({
  transition,
  isSelected,
  onSelect,
  onHeightChange
}: {
  transition: Transition
  isSelected: boolean
  onSelect: () => void
  onHeightChange: (height: number) => void
}) {
  const renderTransition = () => {
    switch (transition.type) {
      case 'empty':
        return <Rect x={0} y={transition.y} width={CANVAS_WIDTH} height={transition.height} fill="#FFFFFF" />
      case 'fade_black':
        return (
          <Rect
            x={0}
            y={transition.y}
            width={CANVAS_WIDTH}
            height={transition.height}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: transition.height }}
            fillLinearGradientColorStops={[0, 'rgba(255,255,255,1)', 1, 'rgba(0,0,0,0.8)']}
          />
        )
      case 'blur':
        return (
          <Group>
            <Rect x={0} y={transition.y} width={CANVAS_WIDTH} height={transition.height} fill="#FFFFFF" opacity={0.8} />
            <Text x={CANVAS_WIDTH / 2} y={transition.y + transition.height / 2} text="🌫️" fontSize={24} align="center" />
          </Group>
        )
      case 'splash':
        return (
          <Group>
            <Rect x={0} y={transition.y} width={CANVAS_WIDTH} height={transition.height} fill="#FFFFFF" />
            <Circle x={CANVAS_WIDTH / 2} y={transition.y + transition.height / 2} radius={transition.height / 4} fill="#FCD34D" opacity={0.6} />
            <Text x={CANVAS_WIDTH / 2} y={transition.y + transition.height / 2} text="✨" fontSize={24} align="center" />
          </Group>
        )
      case 'cut':
        return (
          <Group>
            <Rect x={0} y={transition.y} width={CANVAS_WIDTH} height={transition.height} fill="#FFFFFF" />
            <Line
              points={[0, transition.y, CANVAS_WIDTH, transition.y]}
              stroke="#000000"
              strokeWidth={2}
              dash={[10, 5]}
            />
            <Text x={CANVAS_WIDTH / 2} y={transition.y + 10} text="⚡ CUT" fontSize={12} fill="#000000" align="center" />
          </Group>
        )
      case 'action_lines':
        return (
          <Group>
            <Rect x={0} y={transition.y} width={CANVAS_WIDTH} height={transition.height} fill="#FFFFFF" />
            {[...Array(5)].map((_, i) => (
              <Line
                key={i}
                points={[i * (CANVAS_WIDTH / 5), transition.y, (i + 1) * (CANVAS_WIDTH / 5), transition.y + transition.height]}
                stroke="#EC4899"
                strokeWidth={2}
              />
            ))}
          </Group>
        )
      default:
        return null
    }
  }

  return (
    <Group onClick={onSelect}>
      {renderTransition()}
      {isSelected && (
        <Group>
          <Rect
            x={CANVAS_WIDTH / 2 - 50}
            y={transition.y + transition.height - 20}
            width={100}
            height={20}
            fill="#6366F1"
            cornerRadius={4}
          />
          <Text
            x={CANVAS_WIDTH / 2}
            y={transition.y + transition.height - 10}
            text={`Hauteur: ${transition.height}px`}
            fontSize={10}
            fill="#FFFFFF"
            align="center"
          />
        </Group>
      )}
    </Group>
  )
}
