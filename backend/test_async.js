const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5001/api/reports';

// Read test image
const imagePath = path.join(__dirname, '..', 'test_pothole.jpg');
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

async function testAsyncArchitecture() {
    console.log('🧪 Testing Async Architecture Refactor\n');

    const testData = {
        title: 'Test Pothole Report',
        description: 'Large pothole causing accidents on highway',
        image: base64Image,
        latitude: 12.9716,
        longitude: 77.5946
    };

    console.log('📤 Submitting report with image...');
    const startTime = Date.now();

    try {
        const response = await axios.post(API_URL, testData);
        const responseTime = Date.now() - startTime;

        console.log('\n✅ Response received!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`⚡ API Response Time: ${responseTime} ms`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\nResponse Data:');
        console.log(JSON.stringify(response.data, null, 2));

        console.log('\n🔍 Verification:');
        console.log(`   Status: ${response.data.status}`);
        console.log(`   Trace ID: ${response.data.traceId}`);
        console.log(`   Report ID: ${response.data.reportId}`);

        if (responseTime < 100) {
            console.log('\n✅ SUCCESS: Response time < 100ms (Async architecture working!)');
        } else {
            console.log('\n⚠️  WARNING: Response time > 100ms (May still be blocking)');
        }

        console.log('\n📝 Next: Check worker logs for inference completion (~1.2s)');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testAsyncArchitecture();
