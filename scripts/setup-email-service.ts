#!/usr/bin/env tsx

/**
 * Email Service Setup Script
 * 
 * This script helps you configure the Resend email service for OTP delivery.
 * Run this script to check your current configuration and get setup instructions.
 */

import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

interface EmailConfig {
  resendApiKey: string | undefined;
  resendFromEmail: string | undefined;
  isConfigured: boolean;
  issues: string[];
}

function checkEmailConfiguration(): EmailConfig {
  const issues: string[] = [];
  
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;
  
  if (!resendApiKey) {
    issues.push('RESEND_API_KEY is not set');
  } else if (!resendApiKey.startsWith('re_')) {
    issues.push('RESEND_API_KEY appears to be invalid (should start with "re_")');
  }
  
  if (!resendFromEmail) {
    issues.push('RESEND_FROM_EMAIL is not set');
  } else if (!resendFromEmail.includes('@')) {
    issues.push('RESEND_FROM_EMAIL appears to be invalid (should be a valid email)');
  }
  
  return {
    resendApiKey,
    resendFromEmail,
    isConfigured: issues.length === 0,
    issues
  };
}

function generateEnvTemplate(): string {
  return `# Email Service Configuration
# Get your API key from: https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here

# Use a verified domain email (e.g., noreply@yourdomain.com)
# Add your domain in Resend dashboard: https://resend.com/domains
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Optional: Admin email for notifications
ADMIN_EMAIL=admin@yourdomain.com`;
}

function main() {
  console.log('🔍 Checking Email Service Configuration...\n');
  
  const config = checkEmailConfiguration();
  
  if (config.isConfigured) {
    console.log('✅ Email service is properly configured!');
    console.log(`   API Key: ${config.resendApiKey?.substring(0, 10)}...`);
    console.log(`   From Email: ${config.resendFromEmail}`);
    console.log('\n🎉 Users should now receive OTP emails successfully.');
    return;
  }
  
  console.log('❌ Email service is not properly configured.\n');
  
  console.log('Issues found:');
  config.issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
  
  console.log('\n📋 Setup Instructions:');
  console.log('1. Go to https://resend.com and create an account');
  console.log('2. Generate an API key from https://resend.com/api-keys');
  console.log('3. Add your domain at https://resend.com/domains');
  console.log('4. Update your .env.local file with the following:');
  
  console.log('\n' + '='.repeat(60));
  console.log(generateEnvTemplate());
  console.log('='.repeat(60));
  
  // Check if .env.local exists
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    console.log('\n📝 Your .env.local file exists. Add the above variables to it.');
  } else {
    console.log('\n📝 Create a .env.local file in your project root with the above content.');
  }
  
  console.log('\n🔄 After updating .env.local, restart your development server.');
  console.log('   npm run dev  # or pnpm dev');
  
  console.log('\n🧪 Test the configuration by trying to sign in with an email.');
}

if (require.main === module) {
  main();
}

export { checkEmailConfiguration };
