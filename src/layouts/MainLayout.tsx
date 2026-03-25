import { Outlet } from 'react-router-dom'
import Footer from '../shared/components/Footer'
import Navbar from '../shared/components/Navbar'
import ScrollToTop from '../shared/components/ScrollToTop'

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only z-[60] m-2 rounded-lg bg-primary px-3 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:shadow-lift"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
