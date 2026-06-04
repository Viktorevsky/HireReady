import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Practice() {
  const [question, setQuestion] = useState<any>(null)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:3000/questions/${id}`).then(res => res.json()),
      fetch('http://localhost:3000/sessions', { method: 'POST' }).then(res => res.json())
    ]).then(([questionData, sessionData]) => {
      setQuestion(questionData)
      setSessionId(sessionData.sessionId)
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async () => {
    setSubmitting(true)
    const res = await fetch('http://localhost:3000/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: Number(id), userAnswer: answer, sessionId })
    })
    const data = await res.json()
    setResult(data)
    setSubmitting(false)
  }

  if (loading) return <Layout><p style={{ color: '#8a6a58' }}>Загрузка...</p></Layout>

  return (
    <Layout>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#8a6a58', cursor: 'pointer', fontSize: '14px', padding: 0, marginBottom: '24px' }}>
        ← Назад
      </button>
      <div style={{ border: '1px solid #3d1a08', borderRadius: '12px', padding: '24px', marginBottom: '24px', background: 'rgba(61,26,8,0.2)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 12px' }}>{question.title}</h2>
        <p style={{ color: '#c4a090', margin: 0, lineHeight: 1.6 }}>{question.body}</p>
      </div>

      {!result ? (
        <>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Введи свой ответ..."
            rows={8}
            style={{ width: '100%', background: 'rgba(61,26,8,0.3)', border: '1px solid #3d1a08', borderRadius: '12px', padding: '16px', color: '#fff', fontSize: '15px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !answer}
            style={{ marginTop: '12px', background: submitting || !answer ? '#3d1a08' : '#e07040', border: 'none', borderRadius: '8px', padding: '12px 28px', color: '#fff', fontSize: '15px', cursor: submitting || !answer ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            {submitting ? 'Оцениваю...' : 'Отправить'}
          </button>
        </>
      ) : (
        <div style={{ border: '1px solid #3d1a08', borderRadius: '12px', padding: '24px', background: 'rgba(61,26,8,0.2)' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#e07040', marginBottom: '16px' }}>
            {result.aiScore} <span style={{ fontSize: '18px', color: '#8a6a58' }}>/ 10</span>
          </div>
          <p style={{ color: '#c4a090', lineHeight: 1.6, margin: '0 0 20px' }}>{result.aiFeedback}</p>
          <button onClick={() => navigate(-1)}
            style={{ background: 'none', border: '1px solid #3d1a08', borderRadius: '8px', padding: '10px 20px', color: '#8a6a58', cursor: 'pointer', fontSize: '14px' }}>
            ← К вопросам
          </button>
        </div>
      )}
    </Layout>
  )
}