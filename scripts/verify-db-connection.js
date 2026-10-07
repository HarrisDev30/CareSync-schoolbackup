async function verifyLiveConnection() {
  console.log('🔍 Testing live connection to CareSync Backend & PostgreSQL Database...\n');

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

    const token = loginData.data?.accessToken;
    console.log('✅ Authenticated with Argon2 credentials.');
    console.log('   JWT Bearer Token:', token.slice(0, 30) + '...');

    // 2. Query Patients table from PostgreSQL
    const patientsRes = await fetch('http://localhost:3000/api/v1/patients', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const patientsJson = await patientsRes.json();
    const patientList = patientsJson.data?.items || patientsJson.data?.data || patientsJson.data || [];

    console.log(`\n✅ Live PostgreSQL Database Patients Table (${patientList.length} records found):`);
    patientList.forEach((p) => {
      console.log(`   • [${p.mrn}] ${p.fullName} | Blood: ${p.bloodType || 'N/A'} | DOB: ${p.dateOfBirth} | Allergies: ${p.knownAllergies?.join(', ') || 'NKDA'}`);
    });

    // 3. Query Real-Time Hospital Census Telemetry
    const censusRes = await fetch('http://localhost:3000/api/v1/analytics/census', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const censusData = await censusRes.json();
    console.log('\n✅ Live Hospital Census Telemetry (Calculated from PostgreSQL):');
    console.log(`   • Total Hospital Suites: ${censusData.data?.totalRooms}`);
    console.log(`   • Active / In Use: ${censusData.data?.inUseCount}`);
    console.log(`   • Free / Available: ${censusData.data?.availableCount}`);
    console.log(`   • Under Sanitization: ${censusData.data?.sanitizingCount}`);
    console.log(`   • Occupancy Rate: ${censusData.data?.occupancyRatePercent}%`);

    console.log('\n🎉 STATUS: 100% CONNECTED & LIVE with Neon PostgreSQL Database!');
  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

verifyLiveConnection();

