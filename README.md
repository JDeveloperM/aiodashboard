# AIonet Dashboard

AIonet is an AI-powered trading platform for crypto, forex, and stock markets.

## Deployment to Netlify

This project is configured for deployment to Netlify using pnpm. We've set up the project to work with Netlify's static site hosting while maintaining authentication with Clerk.

### Deployment Methods

#### Method 1: Git-based Deployment (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to Netlify and click "Add new site" > "Import an existing project"
3. Connect to your Git provider and select the repository
4. Configure the build settings:
   - Build command: `pnpm netlify`
   - Publish directory: `out`
5. Add the environment variables (see below)
6. Click "Deploy site"

#### Method 2: Drag and Drop Deployment

1. Build the project locally:
   ```bash
   pnpm build
   ```
2. Go to [Netlify](https://app.netlify.com/)
3. Drag and drop the `out` directory onto the Netlify dashboard
4. After deployment, go to "Site settings" > "Environment variables" and add the required variables

### Environment Variables

Make sure to add the following environment variables in the Netlify dashboard:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: `/`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: `/`

### Important Files for Netlify Deployment

- `netlify.toml`: Configuration for Netlify
- `public/_redirects`: Handles client-side routing
- `build.js`: Custom build script for Netlify
- `next.config.js`: Next.js configuration for static export
- `middleware.js`: Clerk authentication middleware

## Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server (after build)
pnpm start
```

## Troubleshooting Netlify Deployment

### Authentication Issues

If you're experiencing authentication issues:

1. Make sure all environment variables are set correctly in Netlify
2. Check that the `_redirects` file is properly deployed
3. Verify that the Clerk domains are configured correctly in your Clerk dashboard

### Routing Issues

If pages aren't loading correctly:

1. Check the `_redirects` file in your deployed site
2. Verify that the Netlify configuration is correct
3. Make sure the `next.config.js` file has the correct settings

### Build Failures

If the build is failing:

1. Check the build logs in Netlify
2. Try building locally with `pnpm build` to see if there are any errors
3. Make sure you're using the correct Node.js version (20.11.1 or later)

## Technologies Used

- Next.js 15
- React 19
- Clerk Authentication
- Tailwind CSS
- Shadcn UI
- Recharts

## Project Structure

- `app/`: Next.js app directory
- `components/`: React components
- `public/`: Static assets
- `styles/`: CSS styles
- `lib/`: Utility functions
- `hooks/`: Custom React hooks
- `services/`: Service functions
- `contexts/`: React contexts
