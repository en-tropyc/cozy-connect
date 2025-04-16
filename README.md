# Cozy Connect

Cozy Connect is a modern web application built with Next.js that helps connect people in meaningful ways. 

## Features

- User authentication with Google OAuth
- Profile management with AWS S3 for image storage
- Data management using Airtable as a backend
- Email notifications via Resend
- Modern, responsive UI

## Prerequisites

Before you begin, ensure you have the following:
- Node.js 18.x or later
- npm or yarn package manager
- Access to the following services:
  - Google Cloud Console (for OAuth)
  - AWS S3
  - Airtable
  - Resend

## Installation

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

4. Configure your environment variables in `.env.local` with your service credentials.

## Configuration

You'll need to set up the following services:

### Airtable
1. Create an Airtable base
2. Create a table named "Profiles"
3. Generate an API key
4. Add credentials to `.env.local`

### Google OAuth
1. Create a project in Google Cloud Console
2. Configure OAuth consent screen
3. Create OAuth 2.0 credentials
4. Add credentials to `.env.local`

### AWS S3
1. Create an S3 bucket
2. Create IAM credentials
3. Add credentials to `.env.local`

### Resend
1. Sign up for Resend
2. Generate an API key
3. Add the key to `.env.local`

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

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
- Styled with Tailwind CSS
- Powered by Vercel
