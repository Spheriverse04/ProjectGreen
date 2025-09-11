import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Project Green',
  description: 'Auth system with phone OTP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <header className="bg-white shadow p-4 flex justify-between">
          <h1 className="font-bold text-xl">Project Green</h1>
          <nav>
            <Link href="/auth/register" className="mr-4 text-blue-600">
              Register
            </Link>
            <Link href="/auth/login" className="text-blue-600">
              Login
            </Link>
          </nav>
        </header>
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}

