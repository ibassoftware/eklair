export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-xl mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-gray-900 font-bold text-lg mb-1">Eklair Influencer Search</h3>
            <p className="text-gray-600 text-sm">Find perfect influencers for your campaigns</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.ibasuite.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-900 hover:text-blue-700 transition-colors font-medium text-sm"
            >
              www.ibasuite.com
            </a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
          © 2025 iBAS Software. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
