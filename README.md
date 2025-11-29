# Notion Clone

A full-featured Notion clone built with Next.js 14, Convex, Clerk, and BlockNote.

## Features

- **Real-time Database**: Powered by [Convex](https://www.convex.dev/).
- **Authentication**: Secure user authentication with [Clerk](https://clerk.com/).
- **Rich Text Editor**: Block-based editing using [BlockNote](https://www.blocknotejs.org/).
- **Real-time Collaboration**: Share documents with other users via email and edit them together.
- **File Storage**: Image uploads handled by [EdgeStore](https://edgestore.dev/).
- **Dark Mode**: Built-in dark mode support.
- **Nested Documents**: Infinite nesting of documents.
- **Trash Management**: Soft delete and restore functionality.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Shadcn UI
- **Backend**: Convex
- **Auth**: Clerk
- **Storage**: EdgeStore

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
# Deployment used by `npx convex dev`
CONVEX_DEPLOYMENT=

# Team and project names
NEXT_PUBLIC_CONVEX_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# EdgeStore
EDGE_STORE_ACCESS_KEY=
EDGE_STORE_SECRET_KEY=
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/cpt-soap-mactavish/notion-clone.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Convex dev server:
   ```bash
   npx convex dev
   ```

4. Start the Next.js dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project is set up to be easily deployed on Vercel.

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add the environment variables in the Vercel dashboard.
4. Deploy!
