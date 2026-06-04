import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'radial-gradient(ellipse at 50% 20%, #3d1a08 0%, #1c0d05 55%, #0f0704 100%)', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', color: '#fff' }}>

      {/* Навбар */}
      <nav style={{ borderBottom: '1px solid #2a1005', padding: '0 32px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>HireReady</span>
        <span style={{ fontSize: '12px', color: '#8a6a58', border: '1px solid #3d1a08', borderRadius: '999px', padding: '4px 12px' }}>✦ AI-powered</span>
      </nav>

      {/* Герой */}
      <div style={{ textAlign: 'center', padding: '64px 32px 48px', position: 'relative' }}>
        {/* Свечение */}
        <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', width: '320px', height: '120px', background: 'radial-gradient(ellipse, rgba(224,112,64,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #5a2d10', borderRadius: '999px', padding: '5px 14px', fontSize: '12px', color: '#e07040', marginBottom: '28px' }}>
          ✦ Powered by Claude AI & pgvector
        </div>

        <h1 style={{ fontSize: '52px', fontWeight: 700, margin: '0 0 16px', lineHeight: 1.1, background: 'linear-gradient(135deg, #fff 0%, #e07040 60%, #ff9a6c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Подготовься к<br />техническому<br />собеседованию
        </h1>

        <p style={{ fontSize: '16px', color: '#8a6a58', margin: '0 auto 36px', lineHeight: 1.6, maxWidth: '380px' }}>
          Отвечай на вопросы, получай AI-оценку и отслеживай прогресс
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/categories')}
            style={{ background: '#e07040', border: 'none', borderRadius: '8px', padding: '12px 28px', color: '#fff', fontSize: '15px', cursor: 'pointer', fontWeight: 500 }}>
            Начать практику →
          </button>
          <button style={{ background: 'none', border: '1px solid #3d1a08', borderRadius: '8px', padding: '12px 28px', color: '#8a6a58', fontSize: '15px', cursor: 'pointer' }}>
            Как это работает
          </button>
        </div>
      </div>

      {/* Шаги */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0', padding: '0 32px 48px' }}>
        {[
          { num: '1', title: 'Выбери тему', desc: 'JavaScript, Node.js, Docker и другие' },
          { num: '2', title: 'Ответь на вопрос', desc: 'Пиши развёрнутый ответ своими словами' },
          { num: '3', title: 'Получи фидбек', desc: 'AI оценит и укажет на пробелы' },
          { num: '4', title: 'Повторяй', desc: 'Spaced repetition запомнит слабые места' },
        ].map((step, i, arr) => (
          <div key={i} style={{ textAlign: 'center', flex: 1, maxWidth: '160px', position: 'relative' }}>
            {i < arr.length - 1 && (
              <div style={{ position: 'absolute', top: '20px', left: '50%', width: '100%', height: '1px', borderTop: '1px dashed #3d1a08' }} />
            )}
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e07040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: '#e07040', margin: '0 auto 12px', background: '#0f0704', position: 'relative', zIndex: 1 }}>
              {step.num}
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 4px' }}>{step.title}</p>
            <p style={{ fontSize: '11px', color: '#8a6a58', margin: 0, lineHeight: 1.4 }}>{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Статистика */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', padding: '24px 0', borderTop: '1px solid #1f0d04', borderBottom: '1px solid #1f0d04', margin: '0 32px' }}>
        {[
          { num: '50+', label: 'вопросов' },
          { num: '5', label: 'категорий' },
          { num: 'AI', label: 'оценка ответов' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>{s.num}</div>
            <div style={{ fontSize: '12px', color: '#8a6a58', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

    </div>
  )
}