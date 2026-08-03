import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { CategoryDraw } from './pages/CategoryDraw'
import { Progress } from './pages/Progress'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorie/:categoryId" element={<CategoryDraw />} />
          <Route path="/progression" element={<Progress />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
