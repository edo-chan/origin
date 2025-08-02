#!/usr/bin/env node

/**
 * Simple test script to verify auth endpoints are working
 * Run with: node test_auth_endpoints.js
 */

const API_BASE_URL = 'http://localhost:8080';

async function testEndpoint(method, endpoint, data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`\n🔍 Testing ${method} ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': `test-${Date.now()}`,
      },
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log(`   ✅ Success:`, JSON.stringify(responseData, null, 2));
      return { success: true, data: responseData };
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText}`);
      return { success: false, error: errorText, status: response.status };
    }
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing Google OAuth Auth Endpoints\n');
  console.log(`API Base URL: ${API_BASE_URL}`);
  
  // Test 1: Initiate OAuth (this should work now)
  const initiateResult = await testEndpoint('POST', '/api/auth/oauth/google/initiate', {
    redirectUri: 'http://localhost:3000/auth/callback',
    deviceName: 'Test Device - Chrome'
  });
  
  // Test 2: Test validation endpoint (should fail without token)
  await testEndpoint('POST', '/api/auth/validate', {
    accessToken: 'test-invalid-token'
  });
  
  // Test 3: Test profile endpoint (should fail without auth)
  await testEndpoint('GET', '/api/auth/profile');
  
  // Summary
  console.log('\n📋 Test Summary:');
  if (initiateResult.success) {
    console.log('✅ OAuth initiation endpoint is working correctly');
    console.log('✅ The "fail to fetch" error should now be resolved');
  } else {
    console.log('❌ OAuth initiation still failing - check backend/envoy setup');
  }
  
  console.log('\n💡 Next steps:');
  console.log('   1. If OAuth initiation works, the "fail to fetch" error is fixed');
  console.log('   2. Test the full Google Sign-In flow in the browser');
  console.log('   3. Check backend logs for any other issues');
}

// Only run if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };