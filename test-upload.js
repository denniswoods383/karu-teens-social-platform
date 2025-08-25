// Simple Cloudinary upload test
const testUpload = async () => {
  const formData = new FormData();
  
  // Create a simple test file
  const testBlob = new Blob(['test'], { type: 'text/plain' });
  const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
  
  formData.append('file', testFile);
  formData.append('upload_preset', 'karu_uploads');
  
  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/dybwvr0tn/image/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    console.log('Upload test result:', result);
    
    if (response.ok) {
      console.log('✅ Upload working! URL:', result.secure_url);
    } else {
      console.log('❌ Upload failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

testUpload();