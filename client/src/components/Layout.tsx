import { useNavigate } from 'react-router-dom'

const bg = 'radial-gradient(ellipse at 50% 30%, #3d1a08 0%, #1c0d05 50%, #0f0704 100%)'

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'Inter, system-ui, sans-serif', color: '#fff' }}>
      <nav style={{ borderBottom: '1px solid #3d1a08', padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={() => navigate('/')} style={{ fontSize: '18px', fontWeight: 600, cursor: 'pointer', color: '#fff' }}>
          HireReady
        </span>
        <span style={{ fontSize: '13px', color: '#8a6a58' }}>✦ AI-powered prep</span>
      </nav>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 32px' }}>
        {children}
      </div>
    </div>
  )
}