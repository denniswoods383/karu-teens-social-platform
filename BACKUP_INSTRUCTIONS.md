# Database Backup Instructions

## Supabase Automated Backups

### 1. Enable Point-in-Time Recovery (PITR)
- Go to Supabase Dashboard → Settings → Database
- Enable "Point in time recovery"
- This provides continuous backup with 7-day retention

### 2. Manual Backups
```bash
# Using Supabase CLI
supabase db dump --db-url "your-database-url" > backup.sql

# Using pg_dump directly
pg_dump "your-database-url" > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Automated Backup Script
Create a cron job to run daily backups:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump "your-database-url" > /backups/karu_teens_$DATE.sql
# Keep only last 30 days
find /backups -name "karu_teens_*.sql" -mtime +30 -delete
```

### 4. Cloud Storage Backup
Upload backups to cloud storage for redundancy:

```bash
# Upload to AWS S3
aws s3 cp backup.sql s3://your-backup-bucket/

# Upload to Google Cloud Storage  
gsutil cp backup.sql gs://your-backup-bucket/
```

## Error Monitoring Setup

### 1. Sentry Integration (Alternative)
```bash
npm install @sentry/nextjs
```

Add to `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');
module.exports = withSentryConfig(config, sentryOptions);
```

### 2. Current Error Logging
- Errors are logged to `error_logs` table
- View errors in Supabase dashboard
- Set up alerts for critical errors

## Analytics Setup

### 1. Plausible Analytics
- Add domain in Plausible dashboard
- Update script src with your domain
- Privacy-compliant, no cookies

### 2. Custom Events Tracked
- Post creation
- Story creation  
- Message sending
- User follows
- Search queries
- Marketplace interactions