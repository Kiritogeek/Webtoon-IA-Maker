import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image, Group, Text, Transformer, Rect } from 'react-konva'
import { supabase } from '@/lib/supabase'
import type { Scene, Character } from '@/lib/supabase'

interface CanvasItem {
  id: string
  type: 'character' | 'place' | 'asset'
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
  sceneId: string // ID de la scène à laquelle appartient l'item
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

interface WebtoonEditorProps {
  chapterId: string
  projectId: string
  scenes: Scene[]
  characters: Character[]
  onScenesUpdate: () => void
}

export default function WebtoonEditor({ 
  chapterId, 
  projectId, 
  scenes, 
  characters, 
  onScenesUpdate 
}: WebtoonEditorProps) {
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<{ type: 'character' | 'place' | 'asset', data: any } | null>(null)
  const [showAIBubble, setShowAIBubble] = useState<string | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingElements, setLoadingElements] = useState(true)
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Largeur du canvas Webtoon (format vertical)
  const CANVAS_WIDTH = 800
  const PANEL_HEIGHT = 1200 // Hauteur d'une planche Webtoon

  useEffect(() => {
    loadCanvasData()
    loadPlacesAndAssets()
  }, [scenes, projectId])

  const loadPlacesAndAssets = async () => {
    setLoadingElements(true)
    try {
      // Charger les lieux (si la table existe)
      try {
        const { data: placesData, error: placesError } = await supabase
          .from('places')
          .select('*')
          .eq('project_id', projectId)
        
        if (!placesError && placesData) {
          setPlaces(placesData)
        }
      } catch (error) {
        // Table n'existe pas encore
        console.log('Places table not available')
      }

      // Charger les assets (si la table existe)
      try {
        const { data: assetsData, error: assetsError } = await supabase
          .from('assets')
          .select('*')
          .eq('project_id', projectId)
        
        if (!assetsError && assetsData) {
          setAssets(assetsData)
        }
      } catch (error) {
        // Table n'existe pas encore
        console.log('Assets table not available')
      }
    } catch (error) {
      console.error('Error loading places and assets:', error)
    } finally {
      setLoadingElements(false)
    }
  }

  const loadCanvasData = async () => {
    // Charger les données de toutes les scènes
    const allItems: CanvasItem[] = []
    scenes.forEach((scene) => {
      if (scene.canvas_data) {
        const items = scene.canvas_data as any[]
        items.forEach(item => {
          allItems.push({
            ...item,
            sceneId: scene.id // Associer chaque item à sa scène
          })
        })
      }
    })
    setCanvasItems(allItems)
  }

  const saveCanvasData = async (sceneId: string, items: CanvasItem[]) => {
    try {
      // Enlever sceneId avant de sauvegarder (c'est juste pour l'organisation interne)
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
    const containerRect = container.getBoundingClientRect()
    const stageRect = stage.getStage()?.getContainer().getBoundingClientRect()
    
    if (!stageRect) return

    // Calculer la position relative dans le stage (en tenant compte du scroll)
    const scrollTop = container.scrollTop
    const relativeY = point.y + scrollTop

    // Déterminer dans quelle scène on est (basé sur la position Y)
    const sceneIndex = Math.floor(relativeY / PANEL_HEIGHT)
    const targetScene = scenes[sceneIndex]
    
    if (!targetScene) return

    // Position relative dans la scène (sans le décalage de la scène)
    const yInScene = relativeY - (sceneIndex * PANEL_HEIGHT)

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
      sceneId: targetScene.id // Associer l'item à sa scène
    }

    const updatedItems = [...canvasItems, newItem]
    setCanvasItems(updatedItems)
    
    // Sauvegarder dans la scène - filtrer les items de cette scène
    const sceneItems = updatedItems.filter(item => item.sceneId === targetScene.id)
    saveCanvasData(targetScene.id, sceneItems)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleItemClick = (itemId: string) => {
    setSelectedId(itemId)
    setShowAIBubble(itemId)
  }

  const handleAIAction = async () => {
    if (!selectedId || !aiPrompt.trim()) return

    const item = canvasItems.find(i => i.id === selectedId)
    if (!item) return

    setGenerating(true)
    try {
      // Appeler l'API IA pour appliquer la pose/émotion/cadrage
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${aiPrompt}. Personnage: ${item.name}. Style webtoon vertical, pose, émotion, cadrage.`,
          characterName: item.name,
          existingImage: item.imageUrl
        }),
      })

      if (!response.ok) throw new Error('Failed to generate image')

      const { imageUrl } = await response.json()

      // Mettre à jour l'item avec la nouvelle image
      const updatedItems = canvasItems.map(i =>
        i.id === selectedId ? { ...i, imageUrl } : i
      )
      setCanvasItems(updatedItems)

      // Sauvegarder dans la scène correspondante
      const targetScene = scenes.find(s => s.id === item.sceneId)
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
        item.id === itemId
          ? {
              ...item,
              x: transform.x,
              y: transform.y,
              rotation: transform.rotation,
              scaleX: transform.scaleX,
              scaleY: transform.scaleY,
            }
          : item
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

  const totalHeight = scenes.length * PANEL_HEIGHT

  return (
    <div className="flex gap-4 h-full">
      {/* Palette de drag & drop */}
      <div className="w-64 bg-darker/90 backdrop-blur-sm rounded-xl p-4 border-2 border-white/10 flex-shrink-0">
        <h3 className="text-white font-semibold mb-4">Éléments</h3>
        
        {/* Personnages */}
        <div className="mb-6">
          <h4 className="text-white/70 text-sm font-medium mb-2">Personnages</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
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
        <div className="mb-6">
          <h4 className="text-white/70 text-sm font-medium mb-2">Lieux</h4>
          {loadingElements ? (
            <div className="text-white/40 text-xs p-2 bg-darkest/30 rounded text-center">
              Chargement...
            </div>
          ) : places.length === 0 ? (
            <div className="text-white/40 text-xs p-2 bg-darkest/30 rounded text-center">
              Aucun lieu créé
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
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
          <h4 className="text-white/70 text-sm font-medium mb-2">Assets</h4>
          {loadingElements ? (
            <div className="text-white/40 text-xs p-2 bg-darkest/30 rounded text-center">
              Chargement...
            </div>
          ) : assets.length === 0 ? (
            <div className="text-white/40 text-xs p-2 bg-darkest/30 rounded text-center">
              Aucun asset créé
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
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

      {/* Canvas Webtoon vertical */}
      <div className="flex-1 bg-darker/90 backdrop-blur-sm rounded-xl border-2 border-white/10 overflow-hidden">
        <div
          ref={containerRef}
          className="w-full h-full overflow-y-auto custom-scrollbar"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div style={{ width: CANVAS_WIDTH, height: totalHeight, position: 'relative' }}>
            <Stage
              ref={stageRef}
              width={CANVAS_WIDTH}
              height={totalHeight}
              style={{ background: '#0A0A0F' }}
            >
              <Layer>
                {/* Dessiner les panneaux pour chaque scène */}
                {scenes.map((scene, index) => {
                  const y = index * PANEL_HEIGHT
                  const isCover = index === 0

                  return (
                    <Group key={scene.id}>
                      {/* Fond du panneau */}
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
                      {index === 0 && (
                        <Text
                          x={10}
                          y={y + 10}
                          text="COUVERTURE"
                          fontSize={12}
                          fill="#6366F1"
                          fontStyle="bold"
                        />
                      )}

                      {/* Titre de la scène */}
                      <Text
                        x={20}
                        y={y + (isCover ? 40 : 20)}
                        text={scene.title}
                        fontSize={16}
                        fill="#FFFFFF"
                        fontStyle="bold"
                      />

                      {/* Items du canvas pour cette scène */}
                      {canvasItems
                        .filter(item => item.sceneId === scene.id)
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

      {/* Bulle IA */}
      {showAIBubble && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-darker/95 backdrop-blur-md rounded-2xl p-6 border-2 border-primary/50 max-w-md w-full">
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

  // Déterminer la couleur selon le type
  const getTypeColor = () => {
    switch (item.type) {
      case 'character':
        return '#6366F1' // primary
      case 'place':
        return '#8B5CF6' // secondary
      case 'asset':
        return '#EC4899' // accent
      default:
        return '#6366F1'
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
