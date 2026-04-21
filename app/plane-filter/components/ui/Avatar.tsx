export interface AvatarProps {
  name: string
  size?: number
}

export function Avatar({ name, size = 20 }: AvatarProps) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue},45%,35%)`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 14, fontWeight: 600,
      color: `hsl(${hue},60%,85%)`, fontFamily: 'var(--mono)',
    }}>
      {initials}
    </div>
  )
}
