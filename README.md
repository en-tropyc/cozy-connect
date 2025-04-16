# Cozy Connect

![cozy_bg](https://github.com/user-attachments/assets/fc9c25c3-c3e0-4036-a2ed-c37319504419)

Cozy Connect is a modern web application built with Next.js that helps connect people in meaningful ways. It serves as the digital hub for our community, enabling members to discover and connect with each other.

🌐 **Live Demo**: [https://cozy-connect.vercel.app](https://cozy-connect.vercel.app)

## Table of Contents
- [Features](#features)
- [Data Architecture](#data-architecture)
  - [Profiles Table](#profiles-table-tbl9jj8piuabtsxro)
  - [Matches Table](#matches-table-tblfmoco0onzsxf1b)
  - [Data Flow](#data-flow)
- [Frontend Architecture](#frontend-architecture)
  - [Key Technologies](#key-technologies)
  - [Directory Structure](#directory-structure)
  - [Common Contribution Areas](#common-contribution-areas)
  - [Getting Started with Frontend Development](#getting-started-with-frontend-development)
  - [Design Principles](#design-principles)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
  - [Airtable Configuration](#airtable-configuration-required-for-all-development)
  - [Authentication Configuration](#authentication-configuration-optional---only-if-working-on-auth-features)
  - [AWS S3 Configuration](#aws-s3-configuration-optional)
  - [Email Service](#email-service-optional)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Support](#support)
- [Acknowledgments](#acknowledgments)

## Features

Core Features:
- User profiles and connections within our community
- Access to our network of entrepreneurs, creators, and professionals
- Modern, responsive UI built with Next.js
- TypeScript for type safety
- Tailwind CSS for styling

Integrations:
- Airtable as our community database (required)
- Google OAuth for authentication
- AWS S3 for profile picture storage
- Email notifications via Resend

## Data Architecture

The application uses Airtable as its primary database, with the following structure:

### Profiles Table (`tbl9Jj8pIUABtsXRo`)
Stores user profiles with bilingual fields (English/Chinese):
- `Name 名子` - User's full name
- `Email 電子信箱` - User's email address
- `Picture 照片` - Profile picture (stored as Airtable attachment)
- `Company/Title 公司職稱` - User's company and title
- `🌏 Where are you from? 你從哪裡來？` - User's origin location
- `Short intro 簡短介紹自己` - Brief self-introduction
- `LinkedIn Link` - Professional profile
- `Instagram` - Social media handle
- `Categories/Skills 分類` - User's skills and categories
- `I am looking for 我在尋找什麼？` - What the user seeks
- `I can offer 我可以提供什麼？` - What the user can provide

### Matches Table (`tblfmOco0ONZsxF1b`)
Manages connections between users:
- `Swiper` - ID of the user who initiated the connection
- `Swiped` - ID of the user who was connected with
- `Status` - Connection status (pending/accepted/rejected)

### Data Flow
1. User profiles are created/updated via the `/api/profile` endpoint
2. Profile pictures are processed and optimized before storage
3. Matches are created when users connect
4. The system uses server-side Airtable SDK for all database operations

To customize the data layer:
1. Update the environment variables with your Airtable credentials
2. Modify the table IDs in `src/lib/airtable.ts`
3. Adjust the field names and types as needed

## Frontend Architecture

The frontend is built with modern React and Next.js, emphasizing component reusability and user experience.

### Key Technologies
- Next.js 14 (App Router)
- React 19
- Tailwind CSS for styling
- Framer Motion for animations
- HeadlessUI for accessible components

### Directory Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication-related routes
│   ├── api/               # API routes
│   ├── discover/          # Discovery/matching feature
│   ├── profile/           # Profile management
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── ui/               # Basic UI components
│   ├── forms/            # Form components
│   └── features/         # Feature-specific components
├── lib/                  # Utilities and configurations
└── styles/               # Global styles and Tailwind config
```

### Common Contribution Areas

#### UI Components (`src/components/ui/`)
These are our building blocks:
- Buttons, inputs, and form elements
- Cards and containers
- Navigation components
- Modal dialogs

#### Feature Components (`src/components/features/`)
Higher-level components that implement specific features:
- Profile cards and editors
- Match interface
- Discovery feed
- Settings panels

#### Pages and Layouts (`src/app/`)
Next.js pages and layouts that compose our features:
- Main discovery interface
- Profile editing
- Match management
- Settings and preferences

### Getting Started with Frontend Development

1. Key files to familiarize yourself with:
   - `src/components/ui/Button.tsx` - Our button component patterns
   - `src/components/features/ProfileCard.tsx` - Profile display logic
   - `src/app/discover/page.tsx` - Main discovery interface
   - `src/styles/globals.css` - Global styles and Tailwind customizations

2. Common development tasks:
   ```bash
   # Start development server
   npm run dev

   # Run linter
   npm run lint

   # Type checking
   npm run type-check
   ```

3. Development Tips:
   - Use the `components/ui` directory for new reusable components
   - Follow existing patterns for component props and types
   - Maintain bilingual support in user-facing text
   - Use Tailwind CSS for styling
   - Ensure mobile responsiveness

4. Before submitting changes:
   - Test on both desktop and mobile viewports
   - Ensure smooth animations and transitions
   - Verify accessibility with keyboard navigation
   - Check bilingual text support
   - Run linter and type checks

### Design Principles
1. **Mobile-First**: Design and test for mobile devices first
2. **Accessibility**: Ensure keyboard navigation and screen reader support
3. **Performance**: Keep components lightweight and optimize renders
4. **Bilingual**: Support both English and Chinese interfaces
5. **Smooth Transitions**: Use Framer Motion for fluid animations

## Prerequisites

Required for all development:
- Node.js 18.x or later
- npm or yarn package manager
- Airtable account with access to our base (contact maintainers)

Required only if working on authentication:
- Google OAuth credentials

Optional features:
- AWS S3 bucket (for profile picture storage)
- Resend account (for email notifications)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cozy_connect.git
cd cozy_connect
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Copy the environment variables file:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:

```env
# Required - Airtable Configuration (needed for all development)
AIRTABLE_API_KEY=your_airtable_api_key_here        # Your Airtable API key for accessing our community database
AIRTABLE_BASE_ID=appXPGzvT71UhNsjl                 # Our community's base ID (pre-configured)
AIRTABLE_TABLE_NAME=Profiles                       # Main profiles table name (pre-configured)

# Optional - Google OAuth and NextAuth (needed only for working on authentication features)
NEXTAUTH_SECRET=your_generated_secret_here         # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000                 # Your local development URL
GOOGLE_CLIENT_ID=your_google_client_id_here        # From Google Cloud Console
GOOGLE_CLIENT_SECRET=your_google_client_secret     # From Google Cloud Console

# Optional - AWS S3 Configuration (needed only for profile picture features)
AWS_REGION=your_aws_region_here                    # e.g., us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here      # For profile picture storage
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key   # For profile picture storage
AWS_BUCKET_NAME=your_bucket_name                   # Your S3 bucket for profile pictures

# Optional - Email Service (needed only for notification features)
RESEND_API_KEY=your_resend_api_key_here           # For sending email notifications
```

### Environment Variables Explained

#### Airtable Configuration (Required for all development)
- `AIRTABLE_API_KEY`: Your personal API key for accessing our community database. You'll need to request access from the maintainers.
- `AIRTABLE_BASE_ID`: Pre-configured to point to our community's database. Don't change this unless you're setting up a separate instance.
- `AIRTABLE_TABLE_NAME`: The name of our profiles table. This should remain as "Profiles" to maintain compatibility.

#### Authentication Configuration (Optional - only if working on auth features)
If you're not working on authentication-related features, you can skip these settings:
- `NEXTAUTH_SECRET`: A random string used to encrypt session data
- `NEXTAUTH_URL`: The base URL of your application
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: OAuth credentials from Google Cloud Console

To set up Google OAuth (only if working on auth features):
1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google OAuth2 API
4. Create OAuth 2.0 credentials (type: Web application)
5. Add authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (development)
   - https://your-domain.com/api/auth/callback/google (production)

#### AWS S3 Configuration (Optional)
Only needed if you're working on profile picture features:
1. Create an S3 bucket in your AWS account
2. Configure CORS settings for your bucket
3. Create an IAM user with S3 access
4. Add the credentials to your environment variables

#### Email Service (Optional)
Only needed if you're working on notification features:
1. Create an account on [Resend](https://resend.com)
2. Generate an API key
3. Add it to your environment variables

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Customizing External Services

### Authentication
The default implementation uses Google OAuth, but you can:
1. Use a different OAuth provider supported by NextAuth
2. Implement your own authentication logic
3. Remove authentication entirely

To modify authentication:
1. Update `src/app/api/auth/[...nextauth]/route.ts`
2. Modify the auth provider configuration in your `.env.local`

### Storage
The default implementation uses AWS S3 for storing profile pictures, but you can:
1. Use a different cloud storage provider
2. Use local file system storage
3. Remove media storage entirely

To modify storage:
1. Update the storage utility functions in `src/utils/storage.ts`
2. Update your environment variables accordingly

### Database
The default implementation uses Airtable, but you can:
1. Use any database of your choice
2. Use local storage
3. Implement your own data layer

To modify the database:
1. Update the database utility functions in `src/utils/db.ts`
2. Update your environment variables accordingly

### Email Notifications
The default implementation uses Resend, but you can:
1. Use a different email service provider
2. Remove email notifications entirely

To modify email notifications:
1. Update the email utility functions in `src/utils/email.ts`
2. Update your environment variables accordingly

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## Security

For security issues, please see our [Security Policy](SECURITY.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:
1. Check the documentation
2. Open an issue
3. Start a discussion

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Vercel](https://vercel.com/)
