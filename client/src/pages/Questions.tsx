import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

const diffColor: any = { EASY: '#4ade80', MEDIUM: '#fbbf24', HARD: '#f87171' }

export default function Questions() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`http://localhost:3000/questions?categoryId=${id}`)
      .then(res => res.json())
      .then(data => { setQuestions(data); setLoading(false) })
  }, [id])

  if (loading) return <Layout><p style={{ color: '#8a6a58' }}>Загрузка...</p></Layout>

  return (
    <Layout>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#8a6a58', cursor: 'pointer', fontSize: '14px', padding: 0, marginBottom: '24px' }}>
        ← Назад
      </button>
      <h1 style={{ fontSize: '28px', fontWeight: 600, margin: '0 0 24px' }}>Вопросы</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {questions.map((q: any) => (
          <div key={q.id} onClick={() => navigate(`/practice/${q.id}`)}
            style={{ border: '1px solid #3d1a08', borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', background: 'rgba(61,26,8,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e07040'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(61,26,8,0.5)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#3d1a08'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(61,26,8,0.2)' }}
          >
            <span style={{ fontSize: '15px' }}>{q.title}</span>
            <span style={{ fontSize: '12px', color: diffColor[q.difficulty], border: `1px solid ${diffColor[q.difficulty]}`, borderRadius: '999px', padding: '2px 10px' }}>{q.difficulty}</span>
          </div>
        ))}
      </div>
    </Layout>
  )
}