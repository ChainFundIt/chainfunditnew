# Chainfundit - Modern Fundraising Platform

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🏗️ Project Structure

### Restructured Architecture (Latest)

The project has been restructured to follow the web folder structure from the architecture file, implementing modern Next.js App Router best practices:

```
chainfunditnew/
├── app/                          # Next.js App Router (routes only)
│   ├── (auth)/                   # Auth routes group
│   │   ├── layout.tsx           # Auth layout with carousel
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   ├── signup/
│   │   │   └── page.tsx         # Signup page
│   │   ├── otp/
│   │   │   └── page.tsx         # Email OTP verification
│   │   ├── phone/
│   │   │   └── page.tsx         # Phone linking
│   │   └── phone-otp/
│   │       └── page.tsx         # Phone OTP verification
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Main dashboard
│   │   └── create-campaign/
│   │       └── page.tsx         # Create campaign
│   ├── campaigns/
│   │   └── page.tsx             # Campaigns listing
│   ├── c/                       # Chainer referral redirects
│   │   └── [referral_code]/
│   │       └── page.tsx         # Referral redirect
│   ├── api/                     # API routes
│   │   └── auth/
│   │       └── [...betterauth].ts
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── magicui/                 # Magic UI components
│   ├── auth/                    # Auth components
│   │   ├── login-form.tsx       # Login form
│   │   └── signup-form.tsx      # Signup form
│   ├── campaign/                # Campaign components
│   │   ├── Hero.tsx
│   │   ├── BenefitsCarousel.tsx
│   │   ├── CustomerStories.tsx
│   │   ├── Partners.tsx
│   │   └── Main.tsx
│   ├── dashboard/               # Dashboard components
│   │   ├── CardDetailsDrawer.tsx
│   │   └── notifications-list.tsx
│   ├── forms/                   # Form components
│   │   ├── faqs.tsx
│   │   └── accordion.tsx
│   └── layout/                  # Layout components
│       ├── Navbar.tsx
│       └── Footer.tsx
├── hooks/                       # Custom React hooks
│   └── use-auth.ts              # Auth hook
├── lib/                         # Utility functions
│   ├── auth.ts                  # Auth utilities
│   ├── db.ts                    # Database utilities
│   ├── utils.ts                 # General utilities
│   ├── payments/                # Payment utilities
│   └── validations/             # Validation schemas
│       └── auth.ts              # Auth validations
└── public/                      # Static assets
    └── images/                  # Image assets
```

### Key Restructuring Changes

#### 1. **Route Groups Implementation**
- **Before**: Direct routes like `/auth/login`, `/auth/signup`
- **After**: Route groups `(auth)` and `(dashboard)` for better organization
- **Benefit**: Cleaner URL structure, better organization, easier middleware implementation

#### 2. **Feature-Based Component Organization**
- **Before**: All components in root `components/` directory
- **After**: Organized by feature (auth, campaign, dashboard, forms, layout)
- **Benefit**: Better scalability, easier to find components, clear separation of concerns

#### 3. **Enhanced Directory Structure**
- **Added**: `hooks/` directory for custom React hooks
- **Added**: `lib/validations/` for Zod validation schemas
- **Added**: `lib/payments/` for payment utilities
- **Benefit**: Better code organization, reusable logic, type safety

#### 4. **Chainer System Foundation**
- **Added**: `/c/[referral_code]` route for referral tracking
- **Added**: Campaign routes for future campaign management
- **Benefit**: Ready for advanced gamification and referral features

## 🔐 Authentication Flow

### Signup Flow
```
1. /signup              # Email/Phone input (route group)
2. /otp                 # Email OTP verification (auto-verify)
3. /phone               # Phone linking (optional)
4. /phone-otp           # Phone OTP verification (auto-verify)
5. /dashboard           # Success redirect (protected)
```

### Login Flow
```
1. /login               # Email/Phone input (route group)
2. /otp                 # OTP verification (auto-verify)
3. /dashboard           # Success redirect (protected)
```

### Key Features
- **Auto-verification**: OTP verification triggers automatically when 6 digits are entered
- **Seamless input**: Auto-focus between OTP fields with backspace support
- **Paste support**: Users can paste 6-digit codes
- **Consistent UI**: All auth pages use the same layout with promotional carousel
- **Responsive design**: Works on all device sizes
- **Route groups**: Clean URL structure without affecting the actual URLs

## 🎨 UI/UX Improvements

### OTP Input Enhancement
- **Auto-focus**: Automatically moves to next field when typing
- **Backspace handling**: Goes to previous field when current is empty
- **Paste functionality**: Supports pasting 6-digit codes
- **Loading states**: Shows verification progress
- **Error handling**: Displays clear error messages

### Layout Consistency
- **Two-column design**: Form on left, promotional carousel on right
- **Centered content**: Main form content vertically centered
- **Bottom social proof**: User testimonials anchored at bottom
- **Responsive**: Adapts to different screen sizes

### Component Organization
- **Feature-based**: Components organized by functionality
- **Reusable**: Shared components in appropriate directories
- **Scalable**: Easy to add new features and components

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🛠️ Technology Stack

- **Framework**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Magic UI
- **Authentication**: Better Auth
- **Icons**: Lucide React
- **Package Manager**: pnpm
- **Validation**: Zod (planned)
- **State Management**: React Query (planned)

## 📁 File Organization Principles

1. **Routes in `app/`**: Only route-related files with route groups for organization
2. **Components in `components/`**: Feature-based organization (auth, campaign, dashboard, etc.)
3. **Hooks in `hooks/`**: Custom React hooks for reusable logic
4. **Utilities in `lib/`**: Helper functions, validations, and configurations
5. **Assets in `public/`**: Static files like images
6. **Consistent naming**: kebab-case for files, PascalCase for components

## 🔄 Migration Notes

If you're migrating from the old structure:
1. Update imports to use new component paths (e.g., `@/components/auth/login-form`)
2. Use route groups for better organization
3. Follow feature-based component organization
4. Test all authentication flows with new structure

## 🎯 Future Roadmap

### Phase 1: Foundation ✅
- ✅ Route groups implementation
- ✅ Component organization
- ✅ Authentication flow
- ✅ Basic dashboard structure

## ⚙️ Environment Variables

Alongside existing payment and auth secrets, the compliance and payout workflow now expects:

- `DIDIT_API_KEY` – Didit API token for payout-time KYC
- `DIDIT_APP_ID` – Didit environment identifier
- `DIDIT_APP_NAME` – Didit inquiry app name
- `DIDIT_WEBHOOK_SECRET` – Shared secret used to validate incoming Persona webhooks
- `CRON_SECRET` – Shared bearer token protecting compliance worker routes
- `OPENAI_API_KEY` – Enables automated moderation during campaign screening

Set these in `.env.local` before running migrations.
### Phase 2: Campaign Management
- ✅ Campaign creation and management
- ✅ Campaign listing and search
- ✅ Campaign detail pages
- ✅ Media upload and management

### Phase 3: Chainer System
- ✅ Referral link generation
- ✅ Commission tracking
- ✅ Leaderboards
- ✅ Analytics dashboard

### Phase 4: Advanced Features (Ongoing)
- ✅ Payment integration (PayPal, Paystack)
- ✅ Multi-currency support
- AI writing assistance
- Advanced analytics

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
