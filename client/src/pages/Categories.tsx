import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/categories')
      .then(res => res.json())
      .then(data => { setCategories(data); setLoading(false) })
  }, [])

  if (loading) return <Layout><p style={{ color: '#8a6a58' }}>Загрузка...</p></Layout>

  return (
    <Layout>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 600, margin: '0 0 8px' }}>Выбери категорию</h1>
        <p style={{ color: '#8a6a58', margin: 0 }}>Подготовься к техническому собеседованию</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {categories.map((cat: any) => (
          <div key={cat.id} onClick={() => navigate(`/questions/${cat.id}`)}
            style={{ border: '1px solid #3d1a08', borderRadius: '12px', padding: '20px 22px', cursor: 'pointer', background: 'rgba(61,26,8,0.2)', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e07040'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(61,26,8,0.5)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#3d1a08'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(61,26,8,0.2)' }}
          >
            <p style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 4px' }}>{cat.name}</p>
            <p style={{ fontSize: '13px', color: '#8a6a58', margin: 0 }}>{cat.description}</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}