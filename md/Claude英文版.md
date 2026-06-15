# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
```bash
# Development server with TLS disabled and Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Database Commands
```bash
# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Reset database
npx prisma migrate reset

# View database in browser
npx prisma studio
```

## Architecture Overview

### Framework Stack
- **Next.js 15** with App Router architecture
- **React 19** with Server Components (RSC) prioritized
- **TypeScript** with strict type safety
- **Prisma ORM** with PostgreSQL
- **NextAuth.js v5** for authentication
- **shadcn/ui + Radix UI** components with Tailwind CSS
- **Zustand** for client-side state management

### Authentication System
The app implements a multi-provider authentication system in `auth.ts`:

**Providers:**
- **GitHub & Google OAuth** - Standard social login
- **Email verification codes** - 6-digit codes, 5-minute expiry
- **Phone verification codes** - SMS-based authentication via Alibaba Cloud

**Key Features:**
- Account merging based on email addresses
- Automatic user creation and default avatar assignment
- JWT session strategy with database synchronization
- Custom login page at `/login`

**Database Schema:**
- `User` - Core user information with avatar fields (`avatarType`, `avatarStyle`, `avatarSeed`)
- `Account` - OAuth and credential provider links
- `Session` - JWT session management
- `VerificationToken` - Temporary codes for email/phone verification

### File Upload & Storage
**OSS Integration** (`lib/oss.ts`):
- Alibaba Cloud OSS wrapper class `AliyunOssClient`
- Supports direct server uploads and frontend policy generation
- Used for avatar uploads via `/api/profile/avatar`

**Local Storage:**
- Avatar files stored in `public/uploads/avatars/` with UUID naming
- File validation: JPG/PNG/GIF, max 5MB

### State Management Architecture
**Server State:**
- NextAuth session handling
- Prisma database operations
- RSC data fetching

**Client State:**
- **Profile Store** (`lib/store/profile-store.ts`) - Zustand store for user profile caching
- Minimal client state following Next.js 15 best practices
- Uses `useActionState` instead of deprecated `useFormState`

### Component Architecture
**Layout Structure:**
- Root layout in `app/layout.tsx` with `AuthProvider`
- User section layout in `app/user/layout.tsx` with navigation
- Responsive navigation components in `app/user/layout/`

**Key Components:**
- **Avatar System** - `ProfileAvatar.tsx`, `AvatarDialog.tsx`, `DiceBearAvatarPanel.tsx`
- **Navigation** - `navBar.tsx`, `user-menu.tsx`, `mobile-menu.tsx`
- **UI Components** - shadcn/ui components in `components/ui/`

### API Routes Structure
```
app/api/
├── auth/
│   ├── [...nextauth]/route.ts    # NextAuth handlers
│   └── send-code/route.ts        # Email verification codes
├── profile/
│   ├── route.ts                  # User profile CRUD
│   ├── avatar/route.ts           # Avatar upload
│   └── sync/route.ts             # Profile synchronization
└── oss/
    ├── policy/route.ts           # OSS upload policies
    └── sign-url/route.ts         # OSS signed URLs
```

### Routing & Middleware
**Middleware** (`middleware.ts`):
- Rewrites root `/` to `/user`
- Rewrites `/aigc` to `/user/aigc`

**Protected Routes:**
- All `/user/*` pages require authentication
- `/admin` section for administrative functions
- `/login` page handles all authentication flows

## Development Guidelines

### Code Style (from .cursor/rules/)
- **React Components**: Favor RSC, minimize 'use client' directives
- **TypeScript**: Use interfaces over types, avoid enums, use const maps
- **Naming**: Descriptive names with auxiliary verbs (isLoading, hasError)
- **Functions**: Prefix event handlers with "handle", use lowercase-dash for directories
- **State**: Use `useActionState` for forms, implement URL state with nuqs when needed

### Clean Code Principles
- Single responsibility functions
- Meaningful names that explain purpose
- Comments explain "why", not "what"
- DRY principle with proper abstractions
- Early returns for readability

### Next.js 15 Patterns
- Always use async versions of runtime APIs:
  ```typescript
  const cookieStore = await cookies()
  const headersList = await headers()
  const params = await props.params
  ```
- Structure components: exports, subcomponents, helpers, types
- Optimize for Web Vitals and performance

### Environment Configuration
Required environment variables:
```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# OAuth Providers
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email Service (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Alibaba Cloud (Optional)
ALIBABA_CLOUD_ACCESS_KEY_ID="..."
ALIBABA_CLOUD_ACCESS_KEY_SECRET="..."
ALI_OSS_REGION="..."
ALI_OSS_BUCKET="..."
```

## Key Features Implementation

### AIGC Module
Located in `app/user/aigc/` with sub-modules:
- Chat interface (`chat/page.tsx`)
- AI agents (`agent/page.tsx`)
- Creative tools (`creative/page.tsx`)
- Knowledge base (`knowledge/page.tsx`)
- Image generation (`image/page.tsx`)
- Video processing (`video/page.tsx`)

### User Profile Management
- Avatar upload with real-time preview
- DiceBear avatar generation with customizable styles
- Profile synchronization across providers
- Provider badge display system

### Navigation System
- Responsive navigation with shadcn/ui components
- Mobile-first design with collapsible menu
- Context-aware user menu with authentication state

## Testing & Quality Assurance

### ESLint Configuration
- Relaxed rules (warnings > errors) for development efficiency
- TypeScript-specific rules for type safety
- API routes and test files have specialized rule sets
- Console logging allowed in API routes and test directories