import { Outlet } from 'react-router-dom'
import Footer from '../shared/components/Footer'
import Navbar from '../shared/components/Navbar'

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-arc-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
