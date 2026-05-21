export const metadata = {
  title: 'StoryDrop — AI Interactive Stories',
  description: 'Every story is uniquely yours. Claude writes your adventure live as you play.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
