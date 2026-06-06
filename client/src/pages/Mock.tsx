import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

// Три состояния страницы — state machine на фронте зеркалит state machine на бэке
type Screen = 'setup' | 'interview' | 'report'

type Category = { id: number; name: string; description: string }
type Question = { id: number; title: string; body: string; difficulty: string }
type ReportAnswer = {
  question: { id: number; title: string; body: string; difficulty: string }
  userAnswer: string
  aiScore: number
  aiFeedback: string
}

const diffColor: Record<string, string> = {
  EASY: '#4ade80',
  MEDIUM: '#fbbf24',
  HARD: '#f87171',
}

// Вспомогательный компонент — прогресс бар
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: '#8a6a58' }}>Вопрос {current} из {total}</span>
        <span style={{ fontSize: '13px', color: '#8a6a58' }}>{pct}%</span>
      </div>
      <div style={{ height: '4px', background: '#3d1a08', borderRadius: '2px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#e07040', borderRadius: '2px', transition: 'width 0.3s ease' }} />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Экран 1: Setup
// ──────────────────────────────────────────────
function SetupScreen({ onStart }: { onStart: (categoryId: number, count: number) => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [questionCount, setQuestionCount] = useState(5)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3000/categories')
      .then(res => res.json())
      .then(data => { setCategories(data); setLoading(false) })
  }, [])

  if (loading) return <p style={{ color: '#8a6a58' }}>Загрузка...</p>

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px' }}>Mock Interview</h1>
        <p style={{ color: '#8a6a58', margin: 0 }}>Симуляция реального собеседования</p>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '13px', color: '#8a6a58', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Выбери тему</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              style={{
                border: `1px solid ${selectedCategoryId === cat.id ? '#e07040' : '#3d1a08'}`,
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                background: selectedCategoryId === cat.id ? 'rgba(224,112,64,0.1)' : 'rgba(61,26,8,0.2)',
                transition: 'all 0.15s',
              }}
            >
              <p style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 2px' }}>{cat.name}</p>
              <p style={{ fontSize: '12px', color: '#8a6a58', margin: 0 }}>{cat.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', color: '#8a6a58', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Количество вопросов: <span style={{ color: '#e07040', fontWeight: 600 }}>{questionCount}</span>
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[3, 5, 7, 10].map(n => (
            <button
              key={n}
              onClick={() => setQuestionCount(n)}
              style={{
                flex: 1,
                padding: '10px',
                border: `1px solid ${questionCount === n ? '#e07040' : '#3d1a08'}`,
                borderRadius: '8px',
                background: questionCount === n ? 'rgba(224,112,64,0.1)' : 'transparent',
                color: questionCount === n ? '#e07040' : '#8a6a58',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => selectedCategoryId && onStart(selectedCategoryId, questionCount)}
        disabled={!selectedCategoryId}
        style={{
          width: '100%',
          padding: '14px',
          background: selectedCategoryId ? '#e07040' : '#3d1a08',
          border: 'none',
          borderRadius: '10px',
          color: selectedCategoryId ? '#fff' : '#5a3020',
          fontSize: '16px',
          fontWeight: 600,
          cursor: selectedCategoryId ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s',
        }}
      >
        Начать интервью →
      </button>
    </div>
  )
}

// ──────────────────────────────────────────────
// Экран 2: Interview
// ──────────────────────────────────────────────
function InterviewScreen({
  sessionId,
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
}: {
  sessionId: string
  question: Question
  currentIndex: number
  totalQuestions: number
  onAnswer: (questionId: number, answer: string) => void
}) {
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setSubmitting(true)
    await onAnswer(question.id, answer)
    // Не сбрасываем answer здесь — родитель поменяет question
    setAnswer('')
    setSubmitting(false)
  }

  return (
    <div>
      <ProgressBar current={currentIndex + 1} total={totalQuestions} />

      <div style={{ border: '1px solid #3d1a08', borderRadius: '12px', padding: '24px', marginBottom: '20px', background: 'rgba(61,26,8,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{question.title}</h2>
          <span style={{
            fontSize: '11px',
            color: diffColor[question.difficulty],
            border: `1px solid ${diffColor[question.difficulty]}`,
            borderRadius: '999px',
            padding: '2px 10px',
            whiteSpace: 'nowrap',
            marginLeft: '12px',
          }}>
            {question.difficulty}
          </span>
        </div>
        <p style={{ color: '#c4a090', margin: 0, lineHeight: 1.6 }}>{question.body}</p>
      </div>

      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Введи развёрнутый ответ..."
        rows={8}
        style={{
          width: '100%',
          background: 'rgba(61,26,8,0.3)',
          border: '1px solid #3d1a08',
          borderRadius: '12px',
          padding: '16px',
          color: '#fff',
          fontSize: '15px',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: 1.6,
        }}
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting || !answer.trim()}
          style={{
            flex: 1,
            padding: '12px',
            background: submitting || !answer.trim() ? '#3d1a08' : '#e07040',
            border: 'none',
            borderRadius: '8px',
            color: submitting || !answer.trim() ? '#5a3020' : '#fff',
            fontSize: '15px',
            fontWeight: 500,
            cursor: submitting || !answer.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {submitting
            ? 'Сохраняю...'
            : currentIndex + 1 < totalQuestions
              ? 'Следующий вопрос →'
              : 'Завершить интервью →'}
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#5a3020', textAlign: 'center', marginTop: '12px' }}>
        Оценки ты увидишь в конце — как на реальном собеседовании
      </p>
    </div>
  )
}

// ──────────────────────────────────────────────
// Экран 3: Report
// ──────────────────────────────────────────────
function ReportScreen({
  averageScore,
  answers,
  onRestart,
}: {
  averageScore: number
  answers: ReportAnswer[]
  onRestart: () => void
}) {
  const navigate = useNavigate()

  const scoreColor = averageScore >= 7 ? '#4ade80' : averageScore >= 4 ? '#fbbf24' : '#f87171'

  return (
    <div>
      {/* Итог */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ fontSize: '13px', color: '#8a6a58', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Итоговая оценка
        </p>
        <div style={{ fontSize: '72px', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>
          {averageScore}
        </div>
        <div style={{ fontSize: '18px', color: '#8a6a58', marginTop: '4px' }}>/ 10</div>
        <p style={{ color: '#8a6a58', marginTop: '12px' }}>
          {averageScore >= 7
            ? 'Отличный результат! Ты хорошо подготовлен.'
            : averageScore >= 4
              ? 'Неплохо, но есть над чем поработать.'
              : 'Стоит ещё поучить эти темы.'}
        </p>
      </div>

      {/* Детали по каждому вопросу */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {answers.map((item, i) => (
          <div
            key={item.question.id}
            style={{ border: '1px solid #3d1a08', borderRadius: '12px', padding: '20px', background: 'rgba(61,26,8,0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#8a6a58' }}>Вопрос {i + 1}</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '11px',
                  color: diffColor[item.question.difficulty],
                  border: `1px solid ${diffColor[item.question.difficulty]}`,
                  borderRadius: '999px',
                  padding: '1px 8px',
                }}>
                  {item.question.difficulty}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#e07040' }}>
                  {item.aiScore}<span style={{ fontSize: '12px', color: '#8a6a58' }}>/10</span>
                </span>
              </div>
            </div>

            <p style={{ fontWeight: 500, margin: '0 0 8px' }}>{item.question.title}</p>

            <details style={{ marginTop: '8px' }}>
              <summary style={{ fontSize: '13px', color: '#8a6a58', cursor: 'pointer', listStyle: 'none' }}>
                ↓ Твой ответ
              </summary>
              <p style={{ fontSize: '13px', color: '#c4a090', margin: '8px 0 0', lineHeight: 1.6 }}>
                {item.userAnswer}
              </p>
            </details>

            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(224,112,64,0.08)', borderRadius: '8px', borderLeft: '2px solid #e07040' }}>
              <p style={{ fontSize: '13px', color: '#c4a090', margin: 0, lineHeight: 1.6 }}>
                {item.aiFeedback}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onRestart}
          style={{ flex: 1, padding: '12px', background: '#e07040', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}
        >
          Пройти ещё раз
        </button>
        <button
          onClick={() => navigate('/')}
          style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid #3d1a08', borderRadius: '8px', color: '#8a6a58', fontSize: '15px', cursor: 'pointer' }}
        >
          На главную
        </button>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Главный компонент — управляет состоянием
// ──────────────────────────────────────────────
export default function Mock() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [report, setReport] = useState<{ averageScore: number; answers: ReportAnswer[] } | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)

  // Создаём сессию и переходим к интервью
  const handleStart = async (categoryId: number, questionCount: number) => {
    const res = await fetch('http://localhost:3000/mock/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, questionCount }),
    })
    const data = await res.json()

    setSessionId(data.sessionId)
    setCurrentQuestion(data.question)
    setCurrentIndex(data.currentIndex)
    setTotalQuestions(data.totalQuestions)
    setScreen('interview')
  }

  // Отправляем ответ, получаем следующий вопрос или переходим к отчёту
  const handleAnswer = async (questionId: number, userAnswer: string) => {
    const res = await fetch(`http://localhost:3000/mock/sessions/${sessionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, userAnswer }),
    })
    const data = await res.json()

    if (data.finished) {
      // Запрашиваем отчёт
      setLoadingReport(true)
      const reportRes = await fetch(`http://localhost:3000/mock/sessions/${sessionId}/report`)
      const reportData = await reportRes.json()
      setReport(reportData)
      setLoadingReport(false)
      setScreen('report')
    } else {
      setCurrentQuestion(data.question)
      setCurrentIndex(data.currentIndex)
    }
  }

  const handleRestart = () => {
    setScreen('setup')
    setSessionId(null)
    setCurrentQuestion(null)
    setCurrentIndex(0)
    setTotalQuestions(0)
    setReport(null)
  }

  return (
    <Layout>
      {screen === 'setup' && (
        <SetupScreen onStart={handleStart} />
      )}

      {screen === 'interview' && currentQuestion && (
        <InterviewScreen
          sessionId={sessionId!}
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          onAnswer={handleAnswer}
        />
      )}

      {screen === 'report' && loadingReport && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#8a6a58', fontSize: '16px' }}>Оцениваю твои ответы...</p>
          <p style={{ color: '#5a3020', fontSize: '13px', marginTop: '8px' }}>Это может занять 10–20 секунд</p>
        </div>
      )}

      {screen === 'report' && !loadingReport && report && (
        <ReportScreen
          averageScore={report.averageScore}
          answers={report.answers}
          onRestart={handleRestart}
        />
      )}
    </Layout>
  )
}