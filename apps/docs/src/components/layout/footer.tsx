import Link from 'next/link'

const footerLinks = {
  Product: [
    { name: 'Features', href: 'https://plinto.dev/features' },
    { name: 'Pricing', href: 'https://plinto.dev/pricing' },
    { name: 'Changelog', href: '/changelog' },
    { name: 'Roadmap', href: 'https://plinto.dev/roadmap' },
  ],
  Developers: [
    { name: 'Documentation', href: '/' },
    { name: 'API Reference', href: '/api' },
    { name: 'SDKs', href: '/sdks' },
    { name: 'Examples', href: '/examples' },
  ],
  Resources: [
    { name: 'Blog', href: 'https://plinto.dev/blog' },
    { name: 'Support', href: 'https://plinto.dev/support' },
    { name: 'Status', href: 'https://status.plinto.dev' },
    { name: 'Security', href: 'https://plinto.dev/security' },
  ],
  Company: [
    { name: 'About', href: 'https://plinto.dev/about' },
    { name: 'Privacy', href: 'https://plinto.dev/privacy' },
    { name: 'Terms', href: 'https://plinto.dev/terms' },
    { name: 'Contact', href: 'https://plinto.dev/contact' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {category}
              </h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                © 2024 Plinto. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="https://github.com/plinto"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                GitHub
              </Link>
              <Link
                href="https://twitter.com/plinto"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Twitter
              </Link>
              <Link
                href="https://discord.gg/plinto"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Discord
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}