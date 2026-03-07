const axios = require('axios');

async function testAnalytics() {
    console.log('Testing Analytics API...');
    try {
        const res = await axios.get('http://localhost:5001/api/reports/analytics');
        console.log('✅ Success! Data received:');
        console.log(JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('❌ Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testAnalytics();
