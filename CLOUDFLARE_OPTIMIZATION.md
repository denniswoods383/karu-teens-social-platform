# Cloudflare Performance Optimization for KaruTeens

## Critical Settings for LCP < 2.5s, TTI < 3s

### 1. Speed Settings
- **Auto Minify**: Enable CSS, HTML, JS
- **Brotli Compression**: Enable
- **HTTP/3**: Enable
- **0-RTT Connection Resumption**: Enable
- **Early Hints**: Enable

### 2. Caching Rules
```
Cache Rule 1: Static Assets
- Match: *.css, *.js, *.png, *.jpg, *.jpeg, *.gif, *.ico, *.svg, *.woff, *.woff2
- Cache Level: Cache Everything
- Edge TTL: 1 year
- Browser TTL: 1 year

Cache Rule 2: API Routes
- Match: /api/*
- Cache Level: Bypass
- Browser TTL: 0

Cache Rule 3: Pages
- Match: /, /feed, /messages, /comrades
- Cache Level: Standard
- Edge TTL: 4 hours
- Browser TTL: 30 minutes
```

### 3. Page Rules
```
Rule 1: Static Assets
- URL: karuteens.site/_next/static/*
- Settings: Cache Level = Cache Everything, Edge Cache TTL = 1 year

Rule 2: Images
- URL: karuteens.site/ui/*
- Settings: Cache Level = Cache Everything, Edge Cache TTL = 1 month

Rule 3: API Bypass
- URL: karuteens.site/api/*
- Settings: Cache Level = Bypass
```

### 4. Transform Rules
```
HTTP Response Header Modification:
- Add Header: Cache-Control: public, max-age=31536000, immutable
- Condition: URI Path starts with "/_next/static/"

- Add Header: Cache-Control: public, max-age=2592000
- Condition: URI Path starts with "/ui/"
```

### 5. DNS Settings
- **Proxy Status**: Proxied (Orange Cloud)
- **CNAME Flattening**: Flatten at root

### 6. Security Settings
- **SSL/TLS**: Full (Strict)
- **Always Use HTTPS**: On
- **HSTS**: Enable with 6 months max-age
- **Minimum TLS Version**: 1.2

### 7. Network Settings
- **HTTP/2**: Enable
- **HTTP/3 (with QUIC)**: Enable
- **0-RTT Connection Resumption**: Enable
- **gRPC**: Enable
- **WebSockets**: Enable
- **Onion Routing**: Enable

### 8. Scrape Shield
- **Email Address Obfuscation**: On
- **Server-side Excludes**: On
- **Hotlink Protection**: On

## Expected Performance Improvements
- **LCP**: < 2.5s (Target: 1.8s)
- **TTI**: < 3s (Target: 2.2s)
- **FCP**: < 1.8s (Target: 1.2s)
- **CLS**: < 0.1 (Target: 0.05)
- **FID**: < 100ms (Target: 50ms)

## Monitoring
Use Cloudflare Analytics and Web Vitals to track:
- Core Web Vitals scores
- Cache hit ratio (Target: >95%)
- Bandwidth savings from compression
- Origin server load reduction
