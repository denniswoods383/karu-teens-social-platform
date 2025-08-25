// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dybwvr0tn',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'karu_uploads',
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '526439948612699'
};

// Fallback upload using fetch API
export const uploadToCloudinaryFetch = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  
  let resourceType = 'image';
  if (file.type.startsWith('video/')) {
    resourceType = 'video';
  } else if (!file.type.startsWith('image/')) {
    resourceType = 'raw';
  }
  
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
  }
  
  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    format: data.format,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
    duration: data.duration,
    originalName: file.name
  };
};

export const uploadToCloudinary = async (file: File, onProgress?: (progress: number) => void): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  
  // Ensure public access for documents
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    formData.append('type', 'upload');
    formData.append('access_mode', 'public');
  }
  
  // Determine resource type based on file type
  let resourceType = 'auto';
  if (file.type.startsWith('video/')) {
    resourceType = 'video';
  } else if (file.type.startsWith('image/')) {
    resourceType = 'image';
  } else {
    resourceType = 'raw';
  }
  
  formData.append('resource_type', resourceType);
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.secure_url,
            publicId: data.public_id,
            resourceType: data.resource_type,
            format: data.format,
            bytes: data.bytes,
            width: data.width,
            height: data.height,
            duration: data.duration,
            originalName: file.name
          });
        } catch (error) {
          console.error('Failed to parse Cloudinary response:', xhr.responseText);
          reject(new Error('Failed to parse response'));
        }
      } else {
        console.error('Cloudinary upload failed:', xhr.status, xhr.responseText);
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });
    
    xhr.addEventListener('error', () => {
      console.error('XHR upload error, trying fallback method');
      // Try fallback method
      uploadToCloudinaryFetch(file)
        .then(resolve)
        .catch(() => reject(new Error('Upload failed with both methods')));
    });
    
    let uploadResourceType = 'image';
    if (file.type.startsWith('video/')) {
      uploadResourceType = 'video';
    } else if (file.type.startsWith('image/')) {
      uploadResourceType = 'image';
    } else {
      uploadResourceType = 'raw';
    }
    
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${uploadResourceType}/upload`);
    xhr.send(formData);
  });
};