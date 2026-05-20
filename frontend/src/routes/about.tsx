import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About StudentHub</h1>
        <div className="prose text-gray-600 space-y-6">
          <p className="text-lg">
            StudentHub is the premier online community designed exclusively for students. 
            Our mission is to create a supportive environment where students can share knowledge, 
            ask questions, and build lasting connections during their academic journey.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Why Join Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Peer Support</h3>
              <p>Get help with tricky assignments and exam preparation from fellow students who have been exactly where you are today.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Resource Sharing</h3>
              <p>Discover study guides, recommended reading materials, and helpful links curated by the student community.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Advice</h3>
              <p>Discuss internships, resume building, and interview tips with alumni and seniors entering the workforce.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Campus Life</h3>
              <p>Chat about campus events, clubs, housing, and everything else that makes the student experience memorable.</p>
            </div>
          </div>
          
          <div className="mt-12 text-center bg-blue-50 p-8 rounded-xl border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to join the conversation?</h3>
            <button className="bg-primary text-white font-medium py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
              Create your account today
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}