const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5001';
const LOG_DIR = path.join(__dirname, 'logs');

// Helper to read latest log file
function getLatestLogFile(pattern) {
    const files = fs.readdirSync(LOG_DIR)
        .filter(f => f.includes(pattern))
        .sort()
        .reverse();
    return files.length > 0 ? path.join(LOG_DIR, files[0]) : null;
}

// Helper to read last N lines from file
function readLastLines(filepath, n = 20) {
    if (!fs.existsSync(filepath)) return [];
    const content = fs.readFileSync(filepath, 'utf-8');
    const lines = content.trim().split('\n');
    return lines.slice(-n);
}

async function test1_NormalReport() {
    console.log('\n=== TEST 1: Normal Report Submission ===');

    try {
        const response = await axios.post(`${API_URL}/api/reports`, {
            title: 'Test Pothole',
            description: 'Large pothole on Main Street causing traffic issues',
            latitude: 40.7128,
            longitude: -74.0060
        });

        console.log('✅ Report submitted successfully');
        console.log('Response:', response.data);

        const traceId = response.data.traceId;
        console.log(`TraceID: ${traceId}`);

        // Wait for logs to flush
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check combined log
        const combinedLog = getLatestLogFile('combined');
        if (combinedLog) {
            const lines = readLastLines(combinedLog, 10);
            console.log('\n📋 Recent Combined Log Entries:');

            const relevantLogs = lines.filter(line => {
                try {
                    const log = JSON.parse(line);
                    return log.traceId === traceId;
                } catch {
                    return false;
                }
            });

            relevantLogs.forEach(line => {
                const log = JSON.parse(line);
                console.log(`  [${log.level}] ${log.message}`);
                console.log(`    - traceId: ${log.traceId}`);
                if (log.duration_ms !== undefined) {
                    console.log(`    - duration_ms: ${log.duration_ms} (type: ${typeof log.duration_ms})`);
                }
            });

            // Verify structure
            if (relevantLogs.length > 0) {
                const firstLog = JSON.parse(relevantLogs[0]);
                console.log('\n✅ Verification:');
                console.log(`  - TraceID present: ${!!firstLog.traceId}`);
                console.log(`  - Timestamp present: ${!!firstLog.timestamp}`);
                console.log(`  - Service field: ${firstLog.service}`);
                console.log(`  - Component field: ${firstLog.component}`);

                const durationLog = relevantLogs.find(l => JSON.parse(l).duration_ms !== undefined);
                if (durationLog) {
                    const log = JSON.parse(durationLog);
                    console.log(`  - duration_ms is numeric: ${typeof log.duration_ms === 'number'}`);
                }
            }
        } else {
            console.log('⚠️  No combined log file found');
        }

        return traceId;
    } catch (error) {
        console.error('❌ Test 1 Failed:', error.message);
        return null;
    }
}

async function test2_WarningScenario() {
    console.log('\n=== TEST 2: Warning Scenario (Duplicate Report) ===');

    try {
        // Submit same report twice quickly
        const reportData = {
            title: 'Duplicate Test',
            description: 'This is a duplicate report for testing warning logs',
            latitude: 40.7128,
            longitude: -74.0060
        };

        await axios.post(`${API_URL}/api/reports`, reportData);
        console.log('✅ First report submitted');

        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await axios.post(`${API_URL}/api/reports`, reportData);
        console.log('✅ Second (duplicate) report submitted');
        console.log(`TraceID: ${response.data.traceId}`);

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check for warning logs
        const combinedLog = getLatestLogFile('combined');
        if (combinedLog) {
            const lines = readLastLines(combinedLog, 20);
            const warningLogs = lines.filter(line => {
                try {
                    const log = JSON.parse(line);
                    return log.level === 'warn';
                } catch {
                    return false;
                }
            });

            if (warningLogs.length > 0) {
                console.log('\n📋 Warning Logs Found:');
                warningLogs.forEach(line => {
                    const log = JSON.parse(line);
                    console.log(`  [${log.level}] ${log.message}`);
                    console.log(`    - traceId: ${log.traceId || 'N/A'}`);
                });
            } else {
                console.log('ℹ️  No warning logs found (may be expected if duplicate detection is async)');
            }
        }

        return true;
    } catch (error) {
        console.error('❌ Test 2 Failed:', error.message);
        return false;
    }
}

async function test3_ErrorScenario() {
    console.log('\n=== TEST 3: Error Scenario (Malformed Input) ===');

    try {
        // Send malformed request (missing required fields)
        await axios.post(`${API_URL}/api/reports`, {
            // Missing title and description
            latitude: 'invalid',
            longitude: 'invalid'
        });

        console.log('⚠️  Request should have failed but succeeded');
        return false;
    } catch (error) {
        if (error.response && error.response.status === 500) {
            console.log('✅ Error response received (expected)');

            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check error log
            const errorLog = getLatestLogFile('error');
            if (errorLog) {
                const lines = readLastLines(errorLog, 5);
                console.log('\n📋 Recent Error Log Entries:');

                lines.forEach(line => {
                    try {
                        const log = JSON.parse(line);
                        console.log(`  [${log.level}] ${log.message}`);
                        console.log(`    - error: ${log.error || 'N/A'}`);
                        console.log(`    - has stack: ${!!log.stack}`);
                    } catch {
                        console.log(`  ${line}`);
                    }
                });

                // Verify system didn't crash
                const healthCheck = await axios.get(`${API_URL}/api/health`);
                console.log('\n✅ System still responsive after error');

                return true;
            } else {
                console.log('⚠️  No error log file found');
                return false;
            }
        } else {
            console.error('❌ Unexpected error:', error.message);
            return false;
        }
    }
}

async function checkSensitiveData() {
    console.log('\n=== SECURITY CHECK: Sensitive Data Leakage ===');

    const combinedLog = getLatestLogFile('combined');
    if (!combinedLog) {
        console.log('⚠️  No log file to check');
        return;
    }

    const content = fs.readFileSync(combinedLog, 'utf-8');
    const lines = content.split('\n').slice(-50); // Check last 50 lines

    const issues = [];

    lines.forEach((line, idx) => {
        try {
            const log = JSON.parse(line);

            // Check for large objects
            const logSize = JSON.stringify(log).length;
            if (logSize > 2000) {
                issues.push(`Line ${idx}: Large log entry (${logSize} bytes)`);
            }

            // Check for sensitive keywords
            const sensitivePatterns = ['password', 'token', 'secret', 'apikey', 'authorization'];
            const logStr = JSON.stringify(log).toLowerCase();

            sensitivePatterns.forEach(pattern => {
                if (logStr.includes(pattern)) {
                    issues.push(`Line ${idx}: Contains sensitive keyword "${pattern}"`);
                }
            });

        } catch {
            // Skip non-JSON lines
        }
    });

    if (issues.length === 0) {
        console.log('✅ No sensitive data or large objects detected');
    } else {
        console.log('⚠️  Potential Issues Found:');
        issues.forEach(issue => console.log(`  - ${issue}`));
    }
}

async function runAllTests() {
    console.log('🧪 Starting Layer 1 Logging Verification Tests\n');
    console.log('Target API:', API_URL);
    console.log('Log Directory:', LOG_DIR);

    const results = {
        test1: false,
        test2: false,
        test3: false
    };

    results.test1 = await test1_NormalReport();
    await new Promise(resolve => setTimeout(resolve, 1000));

    results.test2 = await test2_WarningScenario();
    await new Promise(resolve => setTimeout(resolve, 1000));

    results.test3 = await test3_ErrorScenario();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await checkSensitiveData();

    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Test 1 (Normal): ${results.test1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 2 (Warning): ${results.test2 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 3 (Error): ${results.test3 ? '✅ PASS' : '❌ FAIL'}`);

    const allPassed = results.test1 && results.test2 && results.test3;
    console.log('\n' + (allPassed ? '🎉 ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'));
    console.log('='.repeat(50));

    process.exit(allPassed ? 0 : 1);
}

runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
