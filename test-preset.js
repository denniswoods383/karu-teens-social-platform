// Test if upload preset exists
const testPreset = async () => {
  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/dybwvr0tn/upload_presets/karu_uploads', {
      method: 'GET'
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload preset exists:', result);
    } else {
      console.log('❌ Upload preset not found or not accessible');
      console.log('Creating a simple image upload test...');
      
      // Test with a simple 1x1 pixel image
      const canvas = document.createElement ? document.createElement('canvas') : null;
      if (!canvas) {
        console.log('Cannot create test image in Node.js environment');
        return;
      }
      
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 1, 1);
      
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'test.png');
        formData.append('upload_preset', 'karu_uploads');
        
        const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dybwvr0tn/image/upload', {
          method: 'POST',
          body: formData
        });
        
        const uploadResult = await uploadResponse.json();
        console.log('Upload result:', uploadResult);
      });
    }
  } catch (error) {
    console.log('Error testing preset:', error.message);
  }
};

testPreset();