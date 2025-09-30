import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import LayoutDetail from './pages/LayoutDetail'
import MediaLibrary from './pages/MediaLibrary'
import EventParties from './pages/EventParties'
import EventGalleryPage from './pages/EventGalleryPage'
import PhotoGallery from './pages/PhotoGallery'
import PublicGallery from './pages/PublicGallery'
import { useInitializeData } from './hooks/useData'

function App() {
  const { isLoading, error } = useInitializeData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-red-600">
          <p>Error loading application: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public routes without layout */}
        <Route path="/public/:eventSlug" element={<PublicGallery />} />
        
        {/* Admin routes with layout */}
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/property/:propertyId" element={<PropertyDetail />} />
              <Route path="/property/:propertyId/layout/:layoutId" element={<LayoutDetail />} />
              <Route path="/events" element={<EventParties />} />
              <Route path="/events/:eventId" element={<EventGalleryPage />} />
              <Route path="/gallery" element={<PhotoGallery />} />
              <Route path="/media" element={<MediaLibrary />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App