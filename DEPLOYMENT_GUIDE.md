# 🚀 Deployment Guide - Karu Teens Social Platform

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup
Replace `your-domain.com` with your actual domain in:
- `.env.local` or `.env.production`
- `src/utils/ipDetection.ts`
- `next.config.js`

### 2. Required Environment Variables
```bash
# Supabase (Primary)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Cloudinary (Primary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=karu_uploads
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key

# Streaming Cloudinary
NEXT_PUBLIC_STREAMING_CLOUDINARY_1=your_streaming_cloud
NEXT_PUBLIC_STREAMING_PRESET_1=streaming_uploads

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
API_URL=https://your-domain.com/api
```

## 🌐 Deployment Platforms

### Vercel (Recommended)
1. **Connect Repository**
   ```bash
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Custom Domain**
   - Add your domain in Vercel settings
   - Update DNS records
   - SSL automatically configured

### Netlify
1. **Build Settings**
   ```bash
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables**
   - Add all env vars in Netlify dashboard
   - Deploy from GitHub

### AWS Amplify
1. **Connect Repository**
2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create new project
- Copy URL and anon key

### 2. Run Database Migrations
Execute these SQL files in Supabase SQL editor:
```sql
-- Run in order:
1. database/study_groups_meetings.sql
2. database/fix_study_groups_rls.sql
3. database/meeting_recordings.sql
```

### 3. Enable RLS Policies
```sql
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- Add other tables as needed
```

## ☁️ Cloudinary Setup

### 1. Create Accounts
- Main account for user uploads
- Separate account for streaming content
- Get cloud names and API keys

### 2. Upload Presets
Create unsigned upload presets:
- `karu_uploads` - For user content
- `streaming_uploads` - For video content

### 3. Security Settings
- Enable unsigned uploads
- Set folder restrictions
- Configure file size limits

## 🔧 Production Optimizations

### 1. Next.js Configuration
```javascript
// next.config.js
module.exports = {
  images: {
    domains: [
      'your-domain.com',
      'res.cloudinary.com',
      'your-project.supabase.co'
    ],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}
```

### 2. Performance
- Enable image optimization
- Configure CDN
- Set up caching headers
- Minimize bundle size

### 3. Security
- Remove development logs
- Secure API endpoints
- Enable HTTPS only
- Configure CORS properly

## 📱 Mobile App Preparation

### 1. PWA Configuration
- Service worker setup
- Manifest.json configuration
- Offline functionality
- Push notifications

### 2. App Store Deployment
- Build mobile app with Capacitor/Expo
- Configure app icons and splash screens
- Set up app store listings
- Handle deep linking

## 🔍 Monitoring & Analytics

### 1. Error Tracking
- Set up Sentry or similar
- Monitor API errors
- Track user issues

### 2. Performance Monitoring
- Core Web Vitals
- Page load times
- API response times

### 3. User Analytics
- Google Analytics
- User behavior tracking
- Feature usage metrics

## 🚀 Deployment Commands

### Build for Production
```bash
npm run build
npm start
```

### Environment-Specific Builds
```bash
# Development
npm run dev

# Production
npm run build && npm start

# Preview
npm run build && npm run preview
```

## ✅ Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Cloudinary accounts set up
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] All features tested in production
- [ ] Error monitoring active
- [ ] Performance metrics baseline established
- [ ] Backup strategy implemented
- [ ] CDN configured (if applicable)

## 🆘 Troubleshooting

### Common Issues
1. **Environment variables not loading**
   - Check variable names match exactly
   - Restart deployment after adding vars

2. **Database connection errors**
   - Verify Supabase URL and key
   - Check RLS policies are correct

3. **Image upload failures**
   - Confirm Cloudinary presets are unsigned
   - Check CORS settings

4. **Build failures**
   - Check for TypeScript errors
   - Verify all dependencies installed

### Support
- Check deployment logs
- Test in staging environment first
- Monitor error tracking tools
- Review performance metrics

Ready for production deployment! 🎉