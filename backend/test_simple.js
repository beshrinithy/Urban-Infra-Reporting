const axios = require('axios');

const API_URL = 'http://localhost:5001/api/reports';

async function testSimple() {
    console.log('🧪 Testing Simple Text-Only Report\n');

    const testData = {
        title: 'Test Report',
        description: 'Simple test without image',
        latitude: 12.9716,
        longitude: 77.5946
    };

    console.log('📤 Submitting...');
    const startTime = Date.now();

    try {
        const response = await axios.post(API_URL, testData);
        const responseTime = Date.now() - startTime;

        console.log(`\n✅ Response Time: ${responseTime} ms`);
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testSimple();
