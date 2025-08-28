# 🎬 Cloudinary Setup for Streaming Uploads

## Step 1: Create Upload Preset in Cloudinary

### For Regular Uploads (karu_uploads):
1. **Login to Cloudinary Dashboard**
2. **Go to Settings** → **Upload**
3. **Click "Add upload preset"**
4. **Configure:**
   - **Preset name:** `karu_uploads`
   - **Signing Mode:** `Unsigned`
   - **Folder:** `karu_social` (optional)
   - **Resource Type:** `Auto`
   - **Format:** `Auto`
   - **Quality:** `Auto`

### For Streaming Content (streaming_uploads):
1. **Click "Add upload preset"** again
2. **Configure:**
   - **Preset name:** `streaming_uploads`
   - **Signing Mode:** `Unsigned`
   - **Folder:** `streaming_content`
   - **Resource Type:** `Video`
   - **Format:** `Auto`
   - **Quality:** `Auto`
   - **Video Codec:** `Auto`
   - **Max file size:** `100MB` (or higher)

## Step 2: Get Your Credentials

### From Cloudinary Dashboard:
1. **Cloud Name:** Found on dashboard homepage
2. **API Key:** Settings → Security → API Keys
3. **Upload Presets:** Settings → Upload → Upload presets

## Step 3: Environment Variables

```bash
# Primary Cloudinary (for regular uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=karu_uploads
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key

# Streaming Cloudinary (for movies/recordings)
NEXT_PUBLIC_STREAMING_CLOUDINARY_1=your_streaming_cloud_name
NEXT_PUBLIC_STREAMING_PRESET_1=streaming_uploads
```

## Step 4: Test Upload Presets

### Test in Browser Console:
```javascript
// Test regular upload
const formData = new FormData();
formData.append('file', yourFile);
formData.append('upload_preset', 'karu_uploads');

fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload', {
  method: 'POST',
  body: formData
}).then(r => r.json()).then(console.log);

// Test streaming upload
const streamData = new FormData();
streamData.append('file', yourVideoFile);
streamData.append('upload_preset', 'streaming_uploads');

fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/video/upload', {
  method: 'POST',
  body: streamData
}).then(r => r.json()).then(console.log);
```

## 📋 Quick Setup Checklist:
- [ ] Create `karu_uploads` preset (unsigned)
- [ ] Create `streaming_uploads` preset (unsigned, video)
- [ ] Copy cloud name to env vars
- [ ] Copy API key to env vars
- [ ] Test both presets work
- [ ] Set folder organization (optional)

## 🔧 Troubleshooting:
- **Upload fails:** Check preset is `unsigned`
- **Video issues:** Ensure preset allows video files
- **Size limits:** Increase max file size in preset
- **CORS errors:** Cloudinary handles CORS automatically for unsigned presets