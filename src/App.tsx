import { AnimatePresence, motion } from 'framer-motion'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Home } from './pages/Home'
import { CategoryDraw } from './pages/CategoryDraw'
import { Progress } from './pages/Progress'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/categorie/:categoryId" element={<CategoryDraw />} />
          <Route path="/progression" element={<Progress />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-cream pb-8 dark:bg-neutral-950">
        <AnimatedRoutes />
      </div>
    </HashRouter>
  )
}

export default App
