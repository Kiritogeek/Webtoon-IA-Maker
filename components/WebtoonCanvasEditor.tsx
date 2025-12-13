import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image, Group, Text, Transformer, Rect, Line } from 'react-konva'
import { supabase } from '@/lib/supabase'
import type { Scene, Character, Project } from '@/lib/supabase'

interface CanvasItem {
  id: string
  type: 'character' | 'place' | 'asset' | 'text' | 'drawing'
  characterId?: string
  placeId?: string
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
  sceneId: string
  // Pour le texte
  text?: string
  fontSize?: number
  fontFamily?: string
  fill?: string
  // Pour le dessin
  drawingData?: any
}

interface Place {
  id: string
  project_id: string
  name: string
  description: string | null
  image_url: string | null
}

interface Asset {
  id: string
  project_id: string
  name: string
  description: string | null
  image_url: string | null
}

interface WebtoonCanvasEditorProps {
  chapterId: string
  projectId: string
  project: Project | null
  scenes: Scene[]
  characters: Character[]
  onScenesUpdate: () => void
}

export default function WebtoonCanvasEditor({ 
  chapterId, 
  projectId, 
  project,
  scenes, 
  characters, 
  onScenesUpdate 
}: WebtoonCanvasEditorProps) {
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<{ type: 'character' | 'place' | 'asset', data: any } | null>(null)
  const [showAIBubble, setShowAIBubble] = useState<string | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingElements, setLoadingElements] = useState(true)
  const [selectedTool, setSelectedTool] = useState<'select' | 'draw' | 'text'>('select')
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false)
  const [zoom, setZoom] = useState(1)
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Format Webtoon vertical (selon Produit.md)
  const CANVAS_WIDTH = 800 // Largeur standard Webtoon
  const PANEL_HEIGHT = 1200 // Hauteur d'une planche
  const BREATHING_SPACE = 40 // Espace de respiration entre panels (selon Produit.md)

  useEffect(() => {
    loadCanvasData()
    loadPlacesAndAssets()
  }, [scenes, projectId])

  const loadPlacesAndAssets = async () => {
    setLoadingElements(true)
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
    } finally {
      setLoadingElements(false)
    }
  }

  const loadCanvasData = async () => {
    const allItems: CanvasItem[] = []
    scenes.forEach((scene) => {
      if (scene.canvas_data) {
        const items = scene.canvas_data as any[]
        items.forEach(item => {
          allItems.push({
            ...item,
            sceneId: scene.id,
            zIndex: item.zIndex || 0,
            opacity: item.opacity || 1,
          })
        })
      }
    })
    setCanvasItems(allItems)
  }

  const saveCanvasData = async (sceneId: string, items: CanvasItem[]) => {
    try {
      const dataToSave = items.map(({ sceneId: _, ...rest }) => rest)
      const { error } = await supabase
        .from('scenes')
        .update({ canvas_data: dataToSave })
        .eq('id', sceneId)

      if (error) throw error
      onScenesUpdate()
    } catch (error) {
      console.error('Error saving canvas data:', error)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedItem || !stageRef.current || !containerRef.current) return

    const stage = stageRef.current
    const point = stage.getPointerPosition()
    if (!point) return

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const relativeY = point.y + scrollTop

    const sceneIndex = Math.floor(relativeY / (PANEL_HEIGHT + BREATHING_SPACE))
    const targetScene = scenes[sceneIndex]
    if (!targetScene) return

    const yInScene = relativeY - (sceneIndex * (PANEL_HEIGHT + BREATHING_SPACE))

    const newItem: CanvasItem = {
      id: `${draggedItem.type}-${Date.now()}`,
      type: draggedItem.type,
      characterId: draggedItem.type === 'character' ? draggedItem.data.id : undefined,
      placeId: draggedItem.type === 'place' ? draggedItem.data.id : undefined,
      assetId: draggedItem.type === 'asset' ? draggedItem.data.id : undefined,
      name: draggedItem.data.name || draggedItem.data.title || 'Item',
      imageUrl: draggedItem.data.image_url || draggedItem.data.imageUrl,
      x: Math.max(0, Math.min(point.x, CANVAS_WIDTH - 200)),
      y: Math.max(0, Math.min(yInScene, PANEL_HEIGHT - 200)),
      width: 200,
      height: 200,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: 0,
      opacity: 1,
      sceneId: targetScene.id
    }

    const updatedItems = [...canvasItems, newItem]
    setCanvasItems(updatedItems)
    
    const sceneItems = updatedItems.filter(item => item.sceneId === targetScene.id)
    saveCanvasData(targetScene.id, sceneItems)
  }

  const handleItemClick = (itemId: string) => {
    setSelectedId(itemId)
    setShowPropertiesPanel(true)
    if (canvasItems.find(i => i.id === itemId)?.type === 'character') {
      setShowAIBubble(itemId)
    }
  }

  const handleAIAction = async () => {
    if (!selectedId || !aiPrompt.trim()) return

    const item = canvasItems.find(i => i.id === selectedId)
    if (!item || !project) return

    setGenerating(true)
    try {
      // Génération IA avec contexte du projet (selon Produit.md)
      // Utiliser identity_visual_reference_url en priorité pour la cohérence graphique
      const identityVisualReference = project.identity_visual_reference_url || project.style_reference_image_url

      const contextPrompt = `
        Style: ${project.style_graphique || 'webtoon'}
        Ambiance: ${project.ambiance || 'moderne'}
        Format: Webtoon vertical, ${CANVAS_WIDTH}x${PANEL_HEIGHT}px
        Cohérence visuelle: ${identityVisualReference ? 'basée sur l\'identité visuelle du projet' : ''}
        ${aiPrompt}
        Personnage: ${item.name}
        Pose, émotion, cadrage webtoon vertical.
      `.trim()

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: contextPrompt,
          characterName: item.name,
          existingImage: item.imageUrl,
          styleReference: identityVisualReference,
          format: 'webtoon_vertical'
        }),
      })

      if (!response.ok) throw new Error('Failed to generate image')

      const { imageUrl } = await response.json()

      const updatedItems = canvasItems.map(i =>
        i.id === selectedId ? { ...i, imageUrl } : i
      )
      setCanvasItems(updatedItems)

      const sceneIndex = scenes.findIndex(s => s.id === item.sceneId)
      const targetScene = scenes[sceneIndex]
      if (targetScene) {
        const sceneItems = updatedItems.filter(i => i.sceneId === targetScene.id)
        saveCanvasData(targetScene.id, sceneItems)
      }

      setShowAIBubble(null)
      setAiPrompt('')
      alert('Pose/émotion/cadrage appliqués avec succès!')
    } catch (error) {
      console.error('Error applying AI action:', error)
      alert('Erreur lors de l\'application de l\'IA')
    } finally {
      setGenerating(false)
    }
  }

  const handleItemTransform = (itemId: string, transform: any) => {
    setCanvasItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...transform } : item
      )
    )
  }

  const handleItemTransformEnd = (itemId: string) => {
    const item = canvasItems.find(i => i.id === itemId)
    if (!item) return

    const targetScene = scenes.find(s => s.id === item.sceneId)
    if (targetScene) {
      const sceneItems = canvasItems.filter(i => i.sceneId === targetScene.id)
      saveCanvasData(targetScene.id, sceneItems)
    }
  }

  const removeItem = (itemId: string) => {
    const item = canvasItems.find(i => i.id === itemId)
    if (!item) return

    const updatedItems = canvasItems.filter(i => i.id !== itemId)
    setCanvasItems(updatedItems)

    const targetScene = scenes.find(s => s.id === item.sceneId)
    if (targetScene) {
      const sceneItems = updatedItems.filter(i => i.sceneId === targetScene.id)
      saveCanvasData(targetScene.id, sceneItems)
    }
  }

  const selectedItem = canvasItems.find(i => i.id === selectedId)
  const totalHeight = scenes.length * (PANEL_HEIGHT + BREATHING_SPACE)

  return (
    <div className="flex h-full bg-darkest">
      {/* Barre d'outils gauche - Style Canva */}
      <div className="w-64 bg-darker/90 backdrop-blur-sm border-r border-white/10 flex flex-col">
        {/* Outils de dessin */}
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold mb-3 text-sm">Outils</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTool('select')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedTool === 'select'
                  ? 'bg-primary text-white'
                  : 'bg-darkest/50 text-white/70 hover:bg-darkest/70'
              }`}
            >
              ✋ Sélection
            </button>
            <button
              onClick={() => setSelectedTool('draw')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedTool === 'draw'
                  ? 'bg-primary text-white'
                  : 'bg-darkest/50 text-white/70 hover:bg-darkest/70'
              }`}
            >
              ✏️ Dessin
            </button>
            <button
              onClick={() => setSelectedTool('text')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedTool === 'text'
                  ? 'bg-primary text-white'
                  : 'bg-darkest/50 text-white/70 hover:bg-darkest/70'
              }`}
            >
              📝 Texte
            </button>
          </div>
        </div>

        {/* Éléments - Personnages, Lieux, Assets */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {/* Personnages */}
          <div>
            <h4 className="text-white/70 text-sm font-medium mb-2">👤 Personnages</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
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
          </div>

          {/* Lieux */}
          <div>
            <h4 className="text-white/70 text-sm font-medium mb-2">🏛️ Lieux</h4>
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
          <div>
            <h4 className="text-white/70 text-sm font-medium mb-2">📦 Assets</h4>
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
        </div>
      </div>

      {/* Canvas central - Format Webtoon vertical */}
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
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <button
              onClick={() => {
                // Générer toute la planche avec IA
                alert('Génération IA de la planche complète (à implémenter)')
              }}
              className="px-4 py-1.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-sm font-semibold hover:shadow-lg transition"
            >
              🎨 Générer avec IA
            </button>
          </div>
          <div className="text-white/50 text-xs">
            Format Webtoon: {CANVAS_WIDTH}px × {PANEL_HEIGHT}px
          </div>
        </div>

        {/* Canvas vertical Webtoon */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto custom-scrollbar"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex justify-center p-8">
            <div
              style={{
                width: CANVAS_WIDTH * zoom,
                height: totalHeight * zoom,
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
              }}
            >
              <Stage
                ref={stageRef}
                width={CANVAS_WIDTH}
                height={totalHeight}
                style={{ background: '#0A0A0F' }}
              >
                <Layer>
                  {/* Panels Webtoon avec espaces de respiration */}
                  {scenes.map((scene, index) => {
                    const y = index * (PANEL_HEIGHT + BREATHING_SPACE)
                    const isCover = index === 0

                    return (
                      <Group key={scene.id}>
                        {/* Espace de respiration (blanc) */}
                        {index > 0 && (
                          <Rect
                            x={0}
                            y={y - BREATHING_SPACE}
                            width={CANVAS_WIDTH}
                            height={BREATHING_SPACE}
                            fill="#0A0A0F"
                          />
                        )}

                        {/* Fond du panel */}
                        <Rect
                          x={0}
                          y={y}
                          width={CANVAS_WIDTH}
                          height={PANEL_HEIGHT}
                          fill={isCover ? '#1A1A2E' : '#0D0D0D'}
                          stroke={isCover ? '#6366F1' : '#1A1A1F'}
                          strokeWidth={2}
                        />
                        
                        {/* Label couverture */}
                        {isCover && (
                          <Group>
                            <Rect
                              x={10}
                              y={y + 10}
                              width={120}
                              height={24}
                              fill="#6366F1"
                              opacity={0.9}
                              cornerRadius={4}
                            />
                            <Text
                              x={20}
                              y={y + 16}
                              text="COUVERTURE"
                              fontSize={12}
                              fill="#FFFFFF"
                              fontStyle="bold"
                            />
                          </Group>
                        )}

                        {/* Titre de la scène */}
                        <Text
                          x={20}
                          y={y + (isCover ? 50 : 30)}
                          text={scene.title}
                          fontSize={18}
                          fill="#FFFFFF"
                          fontStyle="bold"
                        />

                        {/* Intégration automatique de la couverture du projet (selon Produit.md) */}
                        {/* Note: La couverture sera générée séparément, pas depuis l'identité visuelle */}
                        {isCover && project && (project.identity_visual_reference_url || project.style_reference_image_url) && (
                          <CoverImageComponent
                            imageUrl={project.identity_visual_reference_url || project.style_reference_image_url || ''}
                            x={0}
                            y={y}
                            width={CANVAS_WIDTH}
                            height={PANEL_HEIGHT}
                          />
                        )}

                        {/* Nom du projet sur la couverture (selon Produit.md) */}
                        {isCover && project && (
                          <Group>
                            <Rect
                              x={CANVAS_WIDTH / 2 - 200}
                              y={y + PANEL_HEIGHT / 2 - 40}
                              width={400}
                              height={80}
                              fill="rgba(0, 0, 0, 0.6)"
                              cornerRadius={8}
                            />
                            <Text
                              x={CANVAS_WIDTH / 2}
                              y={y + PANEL_HEIGHT / 2}
                              text={project.name}
                              fontSize={32}
                              fill="#FFFFFF"
                              fontStyle="bold"
                              align="center"
                              width={400}
                            />
                          </Group>
                        )}

                        {/* Items du canvas pour cette scène */}
                        {canvasItems
                          .filter(item => item.sceneId === scene.id)
                          .sort((a, b) => a.zIndex - b.zIndex)
                          .map(item => (
                            <CanvasItemComponent
                              key={item.id}
                              item={item}
                              isSelected={selectedId === item.id}
                              onSelect={() => handleItemClick(item.id)}
                              onTransform={(transform) => handleItemTransform(item.id, transform)}
                              onTransformEnd={() => handleItemTransformEnd(item.id)}
                              onRemove={() => removeItem(item.id)}
                              baseY={y}
                            />
                          ))}
                      </Group>
                    )
                  })}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau de propriétés droite - Style Canva */}
      {showPropertiesPanel && selectedItem && (
        <div className="w-80 bg-darker/90 backdrop-blur-sm border-l border-white/10 p-4 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Propriétés</h3>
            <button
              onClick={() => {
                setShowPropertiesPanel(false)
                setSelectedId(null)
              }}
              className="text-white/50 hover:text-white transition"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">Nom</label>
              <input
                type="text"
                value={selectedItem.name}
                readOnly
                className="w-full px-3 py-2 bg-darkest border border-white/10 rounded-lg text-white text-sm"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Opacité</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedItem.opacity}
                onChange={(e) => {
                  const newOpacity = parseFloat(e.target.value)
                  handleItemTransform(selectedId!, { opacity: newOpacity })
                }}
                className="w-full"
              />
              <span className="text-white/50 text-xs">{Math.round(selectedItem.opacity * 100)}%</span>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Ordre (Z-Index)</label>
              <input
                type="number"
                value={selectedItem.zIndex}
                onChange={(e) => {
                  const newZIndex = parseInt(e.target.value)
                  handleItemTransform(selectedId!, { zIndex: newZIndex })
                }}
                className="w-full px-3 py-2 bg-darkest border border-white/10 rounded-lg text-white text-sm"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Rotation</label>
              <input
                type="number"
                value={selectedItem.rotation}
                onChange={(e) => {
                  const newRotation = parseFloat(e.target.value)
                  handleItemTransform(selectedId!, { rotation: newRotation })
                }}
                className="w-full px-3 py-2 bg-darkest border border-white/10 rounded-lg text-white text-sm"
              />
            </div>

            <button
              onClick={() => removeItem(selectedId!)}
              className="w-full px-4 py-2 bg-red/20 hover:bg-red/30 text-red rounded-lg text-sm font-medium transition"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>
      )}

      {/* Bulle IA pour personnages */}
      {showAIBubble && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div 
            className="bg-darker/95 backdrop-blur-md rounded-2xl p-6 border-2 border-primary/50 max-w-md w-full"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Interaction IA</h3>
            <p className="text-white/70 text-sm mb-4">
              Décrivez la pose, l'émotion ou le cadrage à appliquer au personnage
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ex: Le personnage lève les bras et crie vers le ciel"
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

// Composant pour un item sur le canvas
function CanvasItemComponent({
  item,
  isSelected,
  onSelect,
  onTransform,
  onTransformEnd,
  onRemove,
  baseY,
}: {
  item: CanvasItem
  isSelected: boolean
  onSelect: () => void
  onTransform: (transform: any) => void
  onTransformEnd: () => void
  onRemove: () => void
  baseY: number
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const shapeRef = useRef<any>(null)
  const trRef = useRef<any>(null)

  const getTypeColor = () => {
    switch (item.type) {
      case 'character': return '#6366F1'
      case 'place': return '#8B5CF6'
      case 'asset': return '#EC4899'
      default: return '#6366F1'
    }
  }

  useEffect(() => {
    if (item.imageUrl) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = item.imageUrl
      img.onload = () => setImage(img)
      img.onerror = () => setImage(null)
    } else {
      setImage(null)
    }
  }, [item.imageUrl])

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  const handleTransformEnd = (e: any) => {
    const node = e.target
    onTransform({
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    })
    onTransformEnd()
  }

  return (
    <>
      <Group
        ref={shapeRef}
        x={item.x}
        y={item.y + baseY}
        rotation={item.rotation}
        scaleX={item.scaleX}
        scaleY={item.scaleY}
        opacity={item.opacity}
        draggable
        onDragEnd={handleTransformEnd}
        onClick={(e) => {
          e.cancelBubble = true
          onSelect()
        }}
        onTap={(e) => {
          e.cancelBubble = true
          onSelect()
        }}
        onDblClick={onRemove}
        onDblTap={onRemove}
      >
        {image ? (
          <Image
            image={image}
            width={item.width}
            height={item.height}
            shadowBlur={isSelected ? 10 : 0}
            shadowColor={getTypeColor()}
          />
        ) : (
          <Group>
            <Rect
              width={item.width}
              height={item.height}
              fill={getTypeColor()}
              opacity={0.3}
              stroke={getTypeColor()}
              strokeWidth={2}
            />
            <Text
              text={item.name}
              fontSize={14}
              fill="#FFFFFF"
              padding={10}
              align="center"
              width={item.width}
            />
          </Group>
        )}
        {isSelected && (
          <Text
            text="Double-clic pour supprimer"
            fontSize={10}
            fill="#EC4899"
            y={item.height + 5}
            width={item.width}
            align="center"
          />
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 50) {
              return oldBox
            }
            return newBox
          }}
          borderEnabled={true}
          borderStroke={getTypeColor()}
          anchorFill={getTypeColor()}
          anchorStroke={getTypeColor()}
        />
      )}
    </>
  )
}

// Composant pour l'image de couverture
function CoverImageComponent({ imageUrl, x, y, width, height }: {
  imageUrl: string
  x: number
  y: number
  width: number
  height: number
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (imageUrl) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = imageUrl
      img.onload = () => setImage(img)
      img.onerror = () => {
        console.error('Failed to load cover image:', imageUrl)
        setImage(null)
      }
    } else {
      setImage(null)
    }
  }, [imageUrl])

  if (!image) return null

  return (
    <Image
      x={x}
      y={y}
      width={width}
      height={height}
      image={image}
      opacity={0.5}
    />
  )
}
