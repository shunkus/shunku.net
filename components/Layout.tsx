// components/Layout.tsx

import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-white py-4 shadow">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                className="text-2xl font-bold text-black hover:text-cyan-600"
                href="/"
              >
                shunku
              </Link>
            </div>
            <div>
              <Link
                className="text-gray-600 hover:text-cyan-600 mx-2 sm:mx-4"
                href="/projects"
              >
                Projects
              </Link>
              <Link
                className="text-gray-600 hover:text-cyan-600 mx-2 sm:mx-4"
                href="/skills"
              >
                Skills
              </Link>
              <Link
                className="text-gray-600 hover:text-cyan-600 mx-2 sm:mx-4"
                href="https://dev.to/shunku"
                target="_blank"
              >
                Blog
              </Link>
              <Link
                className="text-gray-600 hover:text-cyan-600 mx-2 sm:mx-4"
                href="https://www.linkedin.com/in/shun-kushigami-b9964272/"
                target="_blank"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow">{children}</main>
      <footer className="bg-white shadow py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">
            © {currentYear} shunku. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
