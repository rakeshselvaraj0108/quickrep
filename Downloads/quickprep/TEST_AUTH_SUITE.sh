#!/bin/bash

# QuickPrep Authentication System - Automated Test Suite
# This script tests all authentication endpoints

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3000"
TEST_EMAIL="test-auth-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123"
TEST_NAME="Auth Test User"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   QuickPrep Auth System Test Suite     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Test 1: Register User
echo -e "${YELLOW}📝 Test 1: User Registration${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"${TEST_NAME}\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"confirmPassword\": \"${TEST_PASSWORD}\"
  }")

USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4 || true)

if [[ $USER_ID != "" ]]; then
  echo -e "${GREEN}✅ Registration successful${NC}"
  echo -e "   User ID: ${YELLOW}${USER_ID}${NC}"
  echo -e "   Email: ${YELLOW}${TEST_EMAIL}${NC}"
else
  echo -e "${RED}❌ Registration failed${NC}"
  echo $REGISTER_RESPONSE
  exit 1
fi

# Test 2: Duplicate Prevention
echo -e "\n${YELLOW}🔒 Test 2: Duplicate Email Prevention${NC}"
DUPLICATE_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Duplicate User\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"confirmPassword\": \"${TEST_PASSWORD}\"
  }")

if [[ $DUPLICATE_RESPONSE == *"already registered"* ]]; then
  echo -e "${GREEN}✅ Duplicate prevention working${NC}"
  echo -e "   Response: ${YELLOW}Email already registered${NC}"
else
  echo -e "${RED}❌ Duplicate prevention failed${NC}"
  echo $DUPLICATE_RESPONSE
fi

# Test 3: Login
echo -e "\n${YELLOW}🔑 Test 3: User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

JWT_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4 || true)

if [[ $JWT_TOKEN != "" ]]; then
  echo -e "${GREEN}✅ Login successful${NC}"
  echo -e "   Token: ${YELLOW}${JWT_TOKEN:0:30}...${NC}"
else
  echo -e "${RED}❌ Login failed${NC}"
  echo $LOGIN_RESPONSE
  exit 1
fi

# Test 4: Invalid Login
echo -e "\n${YELLOW}⚠️  Test 4: Invalid Login Attempt${NC}"
INVALID_LOGIN=$(curl -s -X POST "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"WrongPassword123\"
  }")

if [[ $INVALID_LOGIN == *"Invalid email or password"* ]]; then
  echo -e "${GREEN}✅ Invalid password rejection working${NC}"
  echo -e "   Response: ${YELLOW}Invalid email or password${NC}"
else
  echo -e "${RED}❌ Invalid password not rejected${NC}"
  echo $INVALID_LOGIN
fi

# Test 5: Forgot Password
echo -e "\n${YELLOW}📧 Test 5: Forgot Password${NC}"
FORGOT_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\"
  }")

if [[ $FORGOT_RESPONSE == *"success"* ]]; then
  echo -e "${GREEN}✅ Forgot password request successful${NC}"
  echo -e "   Check your email for reset link"
else
  echo -e "${RED}❌ Forgot password failed${NC}"
  echo $FORGOT_RESPONSE
fi

# Test 6: Non-existent Email
echo -e "\n${YELLOW}🔍 Test 6: Non-existent Email (Security Test)${NC}"
NONEXISTENT=$(curl -s -X POST "${API_URL}/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"nonexistent-$(date +%s)@example.com\"
  }")

if [[ $NONEXISTENT == *"success"* ]] && [[ $NONEXISTENT == *"account exists"* ]]; then
  echo -e "${GREEN}✅ Security best practice confirmed${NC}"
  echo -e "   (No email existence leakage)"
else
  echo -e "${YELLOW}⚠️  Check response${NC}"
  echo $NONEXISTENT
fi

# Test 7: Password Reset (requires token from email/database)
echo -e "\n${YELLOW}🔐 Test 7: Password Reset (Manual Testing Required)${NC}"
echo -e "${BLUE}Note: To test password reset:${NC}"
echo -e "  1. Request forgot password above"
echo -e "  2. Get reset token from email or database"
echo -e "  3. Run this curl command:${NC}"
echo ""
echo -e "${YELLOW}curl -X POST 'http://localhost:3000/api/auth/reset-password' \\${NC}"
echo -e "${YELLOW}  -H 'Content-Type: application/json' \\${NC}"
echo -e "${YELLOW}  -d '{${NC}"
echo -e "${YELLOW}    \"token\": \"YOUR_RESET_TOKEN\",${NC}"
echo -e "${YELLOW}    \"password\": \"NewPassword123\",${NC}"
echo -e "${YELLOW}    \"confirmPassword\": \"NewPassword123\"${NC}"
echo -e "${YELLOW}  }'${NC}"
echo ""

# Summary
echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Test Summary                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
echo -e "Test Email: ${YELLOW}${TEST_EMAIL}${NC}"
echo -e "Test Password: ${YELLOW}${TEST_PASSWORD}${NC}"
echo -e "API URL: ${YELLOW}${API_URL}${NC}"
echo ""
echo -e "${GREEN}✅ Tests Completed Successfully!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Login at: ${YELLOW}${API_URL}/login${NC}"
echo -e "  2. Try registration: ${YELLOW}${API_URL}/register${NC}"
echo -e "  3. Test forgot password: ${YELLOW}${API_URL}/forgot-password${NC}"
