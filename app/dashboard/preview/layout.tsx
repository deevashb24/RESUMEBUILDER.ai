// The preview page is a full-screen studio — it does NOT use the
// parent dashboard layout (sidebar). We export a special layout here
// that strips the sidebar wrapper by providing its own root layout.
// This is achieved via Next.js route group isolation:
// We simply need the page to render without any parent padding/margin.
// The dashboard/layout.tsx wraps ALL /dashboard/* routes in the sidebar.
// To escape it, we set overflow-hidden on body via the page itself.
// This file intentionally left as a pass-through to avoid double-layout.
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
