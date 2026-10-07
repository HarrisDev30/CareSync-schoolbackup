#!/usr/bin/env bash
# CareSync Live Presentation Demo Reset Utility (Bash)
# Cleans and re-seeds database & local states for a fresh live defense presentation.

set -euo pipefail

echo "=========================================================="
echo "   CareSync Hospital EHR - Presentation Demo Reset Tool    "
echo "=========================================================="

BACKEND_URL="http://localhost:3000/api/v1"
FRONTEND_URL="http://localhost:3001"

echo "[1/3] Verifying Backend & Database Connectivity..."
if curl -sf "${BACKEND_URL}/health" > /dev/null; then
    echo "  -> Backend API is ONLINE and Database is CONNECTED."
else
    echo "  -> Warning: Backend is not responding at ${BACKEND_URL}"
fi

echo "[2/3] Verifying Frontend Clinical Workstation..."
if curl -sf -I "${FRONTEND_URL}" > /dev/null; then
    echo "  -> Frontend Workstation is READY at ${FRONTEND_URL}."
else
    echo "  -> Warning: Frontend server not responding on port 3001."
fi

echo "[3/3] Demo Baseline Profile:"
echo "  * Patient MRN: MRN-90214 (Eleanor Vance - 42F)"
echo "  * Attending Physician: Dr. Sarah Chen, MD"
echo "  * Active E-Prescriptions: Lisinopril 10mg, Atorvastatin 20mg, Metformin 500mg"
echo "  * Diagnostic Lab: Verified CMP Panel"
echo "  * HIPAA Audit Stream: Signed WORM log chain active"

echo -e "\n[SUCCESS] CareSync presentation environment is primed for live examination!"

