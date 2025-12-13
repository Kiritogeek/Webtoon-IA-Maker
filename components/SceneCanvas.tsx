import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image, Group, Text, Transformer } from 'react-konva'
import { supabase } from '@/lib/supabase'
import type { Scene, Character } from '@/lib/supabase'

interface CharacterOnCanvas {
  id: string
  characterId: string
  x: number
  y: number
  rotation: number
  scaleX: number
  scaleY: number
  character?: Character
}

interface SceneCanvasProps {
  scene: Scene
  characters: Character[]
  onSceneUpdate: () => void
}

export default function SceneCanvas({ scene, characters, onSceneUpdate }: SceneCanvasProps) {
  const [canvasData, setCanvasData] = useState<CharacterOnCanvas[]>([])
  const [description, setDescription] = useState(scene.description || '')
  const [generating, setGenerating] = useState(false)
  const stageRef = useRef<any>(null)
  const [draggedCharacter, setDraggedCharacter] = useState<Character | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    // Load canvas data from scene
    if (scene.canvas_data) {
      const loaded = scene.canvas_data as CharacterOnCanvas[]
      // Enrich with character data
      const enriched = loaded.map(item => ({
        ...item,
        character: characters.find(c => c.id === item.characterId)
      }))
      setCanvasData(enriched)
    }
  }, [scene, characters])

  const handleDragEnd = (e: any, itemId: string) => {
    const node = e.target
    setCanvasData(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              x: node.x(),
              y: node.y(),
            }
          : item
      )
    )
    saveCanvasData()
  }

  const handleTransformEnd = (e: any, itemId: string) => {
    const node = e.target
    setCanvasData(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
            }
          : item
      )
    )
    saveCanvasData()
  }

  const saveCanvasData = async () => {
    try {
      const dataToSave = canvasData.map(({ character, ...rest }) => rest)
      const { error } = await supabase
        .from('scenes')
        .update({
          canvas_data: dataToSave,
          description: description || null,
        })
        .eq('id', scene.id)

      if (error) throw error
    } catch (error) {
      console.error('Error saving canvas data:', error)
    }
  }

  const addCharacterToCanvas = (character: Character) => {
    const newItem: CharacterOnCanvas = {
      id: `char-${Date.now()}`,
      characterId: character.id,
      x: 200,
      y: 200,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      character,
    }
    setCanvasData([...canvasData, newItem])
    setTimeout(saveCanvasData, 100)
  }

  const removeCharacterFromCanvas = (itemId: string) => {
    setCanvasData(canvasData.filter(item => item.id !== itemId))
    setTimeout(saveCanvasData, 100)
  }

  const generateSceneImage = async () => {
    if (!description.trim()) {
      alert('Veuillez entrer une description de la scène')
      return
    }

    setGenerating(true)
    try {
      // Call AI endpoint
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: description,
          characters: characters.filter(c => 
            canvasData.some(item => item.characterId === c.id)
          ).map(c => c.name).join(', '),
        }),
      })

      if (!response.ok) throw new Error('Failed to generate image')

      const { imageUrl } = await response.json()

      // Save image URL to scene
      const { error } = await supabase
        .from('scenes')
        .update({ image_url: imageUrl })
        .eq('id', scene.id)

      if (error) throw error

      onSceneUpdate()
      alert('Image générée avec succès!')
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Erreur lors de la génération de l\'image')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="bg-darker/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border-2 border-orange-dark/50">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 gradient-text">{scene.title}</h2>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            setTimeout(saveCanvasData, 500)
          }}
          placeholder="Description de la scène..."
          className="w-full px-4 py-3 bg-darkest border-2 border-orange-dark rounded-xl focus:outline-none focus:border-yellow transition text-white mb-4 resize-none"
          rows={3}
        />
        <button
          onClick={generateSceneImage}
          disabled={generating}
          className="btn-creative bg-gradient-to-r from-yellow to-orange text-darkest px-4 py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 font-bold"
        >
          {generating ? '⏳ Génération...' : '🎨 Générer Scène IA'}
        </button>
      </div>

      {/* Character palette */}
      <div className="mb-4 p-4 bg-yellow/10 backdrop-blur-sm rounded-xl border-2 border-yellow/20">
        <p className="text-sm font-medium mb-3 text-white">Glisser-déposer un personnage:</p>
        <div className="flex gap-2 flex-wrap">
          {characters.map((character) => (
            <div
              key={character.id}
              draggable
              onDragStart={() => setDraggedCharacter(character)}
              onDragEnd={() => setDraggedCharacter(null)}
              className="cursor-move bg-darker p-2 rounded-lg border-2 border-dashed border-yellow/30 hover:border-yellow transition"
            >
              {character.image_url ? (
                <img
                  src={character.image_url}
                  alt={character.name}
                  className="w-16 h-16 object-cover rounded"
                  draggable={false}
                />
              ) : (
                <div className="w-16 h-16 bg-yellow/20 rounded flex items-center justify-center text-xs text-center text-yellow">
                  {character.name}
                </div>
              )}
              <p className="text-xs mt-1 text-center text-white/80">{character.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        onDrop={(e) => {
          e.preventDefault()
          if (draggedCharacter) {
            const stage = stageRef.current
            const point = stage.getPointerPosition()
            if (point) {
              const newItem: CharacterOnCanvas = {
                id: `char-${Date.now()}`,
                characterId: draggedCharacter.id,
                x: point.x,
                y: point.y,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                character: draggedCharacter,
              }
              setCanvasData([...canvasData, newItem])
              setTimeout(saveCanvasData, 100)
            }
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-yellow/30 rounded-lg overflow-hidden"
      >
        <Stage
          ref={stageRef}
          width={800}
          height={600}
          style={{ background: '#0D0D0D' }}
        >
          <Layer
            onClick={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage()
              if (clickedOnEmpty) {
                setSelectedId(null)
              }
            }}
            onTap={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage()
              if (clickedOnEmpty) {
                setSelectedId(null)
              }
            }}
          >
            {canvasData.map((item) => (
              <CharacterImage
                key={item.id}
                item={item}
                onDragEnd={(e) => handleDragEnd(e, item.id)}
                onTransformEnd={(e) => handleTransformEnd(e, item.id)}
                onRemove={() => removeCharacterFromCanvas(item.id)}
                isSelected={selectedId === item.id}
                onSelect={() => setSelectedId(item.id)}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}

// Component for character image on canvas
function CharacterImage({
  item,
  onDragEnd,
  onTransformEnd,
  onRemove,
  isSelected,
  onSelect,
}: {
  item: CharacterOnCanvas
  onDragEnd: (e: any) => void
  onTransformEnd: (e: any) => void
  onRemove: () => void
  isSelected: boolean
  onSelect: () => void
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const shapeRef = useRef<any>(null)
  const trRef = useRef<any>(null)

  useEffect(() => {
    if (item.character?.image_url) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = item.character.image_url
      img.onload = () => setImage(img)
      img.onerror = () => {
        console.error('Failed to load character image:', item.character?.image_url)
        setImage(null)
      }
    } else {
      setImage(null)
    }
  }, [item.character?.image_url])

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  if (!item.character) return null

  return (
    <>
      <Group
        ref={shapeRef}
        x={item.x}
        y={item.y}
        rotation={item.rotation}
        scaleX={item.scaleX}
        scaleY={item.scaleY}
        draggable
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
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
            width={100}
            height={100}
            shadowBlur={isSelected ? 10 : 0}
            shadowColor="#FEE600"
          />
        ) : (
          <Group>
            <Text
              text={item.character.name}
              fontSize={14}
              fill="#FEE600"
              padding={10}
              align="center"
              width={100}
            />
          </Group>
        )}
        {isSelected && (
          <Group>
            <Text
              text="Double-clic pour supprimer"
              fontSize={10}
              fill="#FF9300"
              y={110}
              width={100}
              align="center"
            />
          </Group>
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit scale
            if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 50) {
              return oldBox
            }
            return newBox
          }}
          borderEnabled={true}
          borderStroke="#FEE600"
          anchorFill="#FF9300"
          anchorStroke="#FF9300"
        />
      )}
    </>
  )
}
