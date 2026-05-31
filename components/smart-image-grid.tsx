'use client'

interface SmartImageGridProps {
  images: string[]
  clickable?: boolean
}

function ImgBox({ url, height = '220px', bg = '#f1f5f9', clickable = true }: { 
  url: string
  height?: string
  bg?: string
  clickable?: boolean 
}) {
  const img = (
    <img 
      src={url} 
      alt="photo" 
      style={{
        width: '100%', 
        height: height, 
        objectFit: 'contain', 
        objectPosition: 'center', 
        background: bg, 
        borderRadius: '8px', 
        display: 'block'
      }}
      className="hover:opacity-95 transition-all duration-200 cursor-zoom-in"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
  
  return clickable ? (
    <a href={url} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', background: bg }}>
      {img}
    </a>
  ) : (
    <div style={{ borderRadius: '8px', overflow: 'hidden', background: bg }}>{img}</div>
  )
}

export function SmartImageGrid({ images, clickable = true }: SmartImageGridProps) {
  if (!images || images.length === 0) return null
  const n = images.length

  if (n === 1) return (
    <div style={{ marginBottom: '12px' }}>
      <ImgBox url={images[0]} height="280px" clickable={clickable} />
    </div>
  )

  if (n === 2) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
      {images.map((url, i) => <ImgBox key={i} url={url} height="200px" clickable={clickable} />)}
    </div>
  )

  if (n === 3) return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '6px', marginBottom: '12px' }}>
      <div style={{ gridRow: '1/3' }}><ImgBox url={images[0]} height="280px" clickable={clickable} /></div>
      <ImgBox url={images[1]} height="137px" clickable={clickable} />
      <ImgBox url={images[2]} height="137px" clickable={clickable} />
    </div>
  )

  if (n === 4) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
      {images.map((url, i) => <ImgBox key={i} url={url} height="150px" clickable={clickable} />)}
    </div>
  )

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', marginBottom: '4px' }}>
        {images.slice(0, 6).map((url, i) => <ImgBox key={i} url={url} height="100px" clickable={clickable} />)}
      </div>
      {images.length > 6 && (
        <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>+{images.length - 6} more photos</div>
      )}
    </div>
  )
}
