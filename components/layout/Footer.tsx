import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold">SkillBridge AI</span>
            </Link>
            <p className="text-gray-400 max-w-md">
              Empowering high school students to discover their potential,
              identify skill gaps, and find personalized opportunities for
              growth.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/analyze"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Analyze Skills
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400 cursor-pointer hover:text-white transition-colors">
                  For Students
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-pointer hover:text-white transition-colors">
                  For Parents
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-pointer hover:text-white transition-colors">
                  For Educators
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} SkillBridge AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-gray-400 text-sm cursor-pointer hover:text-white transition-colors">
              Privacy Policy
            </span>
            <span className="text-gray-400 text-sm cursor-pointer hover:text-white transition-colors">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
