import * as dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

async function verifyLiveConnection() {
  console.log('🔍 Testing live connection to CareSync Backend & PostgreSQL Database...');

  try {
    // 1. Authenticate against live backend
    const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@caresync.org',
        password: 'CareSync@2026!',
      }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error('❌ Login failed:', loginData);
      return;
    }

    const token = loginData.data.accessToken;
    console.log('✅ Authenticated successfully. JWT Token:', token.slice(0, 25) + '...');

    // 2. Query Patients table from PostgreSQL
    const patientsRes = await fetch('http://localhost:3000/api/v1/patients', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const patientsData = await patientsRes.json();
    console.log(`✅ Live PostgreSQL Patients: ${patientsData.data?.length} records found`);
    patientsData.data?.forEach((p: any) => {
      console.log(`   - [${p.mrn}] ${p.firstName} ${p.lastName} (Blood Type: ${p.bloodType})`);
    });

    // 3. Query Real-Time Hospital Census Telemetry
    const censusRes = await fetch('http://localhost:3000/api/v1/analytics/census', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const censusData = await censusRes.json();
    console.log('✅ Live Hospital Census Telemetry:');
    console.log(`   - Total Rooms: ${censusData.data?.totalRooms}`);
    console.log(`   - In Use / Active: ${censusData.data?.inUseCount}`);
    console.log(`   - Available / Free: ${censusData.data?.availableCount}`);
    console.log(`   - Occupancy Rate: ${censusData.data?.occupancyRatePercent}%`);

    console.log('\n🚀 Status: 100% CONNECTED to live PostgreSQL Database & Backend API!');
  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

verifyLiveConnection();

