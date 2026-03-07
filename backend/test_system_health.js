const axios = require('axios');

async function testSystemHealth() {
    console.log('Testing System Health API...');
    try {
        const res = await axios.get('http://localhost:5001/api/reports/system');
        console.log('✅ Success! System Data received:');
        console.log(JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('❌ Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testSystemHealth();
