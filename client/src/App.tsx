import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Categories from './pages/Categories'
import Questions from './pages/Questions'
import Practice from './pages/Practice'
import Mock from './pages/Mock'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/questions/:id" element={<Questions />} />
        <Route path="/practice/:id" element={<Practice />} />
        <Route path="/mock" element={<Mock />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App