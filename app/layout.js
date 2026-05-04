import './globals.css'
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'StoryForge',
  description: 'Collaborative AI Storytelling',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}