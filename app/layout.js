import './globals.css'
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: {
    default: 'StoryForge | Craft Your Narrative',
    template: '%s | StoryForge'
  },
  description: 'The ultimate collaborative AI storytelling platform. Forge your worlds, characters, and adventures.',
  keywords: ['AI storytelling', 'collaborative writing', 'rpg', 'narrative', 'storyforge'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}