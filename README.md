# Cozy Connect

Cozy Connect is a modern web application built with Next.js that helps connect people in meaningful ways. 

🌐 **Live Demo**: [https://cozy-connect.vercel.app](https://cozy-connect.vercel.app)

## Features

Core Features:
- User profiles and connections
- Modern, responsive UI built with Next.js
- TypeScript for type safety
- Tailwind CSS for styling

Optional Integrations:
- Authentication (default: Google OAuth, but customizable)
- Storage (default: AWS S3 for profile pictures, but customizable)
- Database (default: Airtable for profiles, but customizable)
- Email notifications (default: Resend, but customizable)

## Prerequisites

Required:
- Node.js 18.x or later
- npm or yarn package manager

Optional (based on your needs):
- Authentication provider (Google OAuth or any OAuth provider)
- Storage solution for media files
- Database for user data
- Email service provider

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

4. Configure your environment variables in `.env.local`. The minimum required variables are:
```
# Required
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional - Authentication (if using Google OAuth)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Optional - Storage (if using AWS S3)
AWS_REGION=your_aws_region_here
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_BUCKET_NAME=your_bucket_name_here

# Optional - Database (if using Airtable)
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
AIRTABLE_TABLE_NAME=your_table_name_here

# Optional - Email (if using Resend)
RESEND_API_KEY=your_resend_api_key_here
```

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
