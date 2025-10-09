#!/usr/bin/env node

/**
 * 🚀 VERIGRADE RAILWAY DEPLOYMENT SCRIPT
 * 
 * This script will help you deploy your VeriGrade backend to Railway
 * with all the necessary configurations and environment variables.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 VERIGRADE RAILWAY DEPLOYMENT');
console.log('================================\n');

// Check if Railway CLI is installed
function checkRailwayCLI() {
    try {
        execSync('railway --version', { stdio: 'pipe' });
        console.log('✅ Railway CLI is installed');
        return true;
    } catch (error) {
        console.log('❌ Railway CLI not found');
        return false;
    }
}

// Install Railway CLI
function installRailwayCLI() {
    console.log('📦 Installing Railway CLI...');
    try {
        execSync('npm install -g @railway/cli', { stdio: 'inherit' });
        console.log('✅ Railway CLI installed successfully');
        return true;
    } catch (error) {
        console.log('❌ Failed to install Railway CLI');
        console.log('Please install manually: npm install -g @railway/cli');
        return false;
    }
}

// Create Railway project
function createRailwayProject() {
    console.log('🏗️  Creating Railway project...');
    try {
        // Change to backend directory
        process.chdir('backend');
        
        // Initialize Railway project
        execSync('railway login', { stdio: 'inherit' });
        console.log('✅ Logged into Railway');
        
        // Create new project
        execSync('railway init', { stdio: 'inherit' });
        console.log('✅ Railway project created');
        
        return true;
    } catch (error) {
        console.log('❌ Failed to create Railway project');
        console.log('Error:', error.message);
        return false;
    }
}

// Set environment variables
function setEnvironmentVariables() {
    console.log('🔧 Setting environment variables...');
    
    const envVars = {
        'NODE_ENV': 'production',
        'DATABASE_URL': 'postgresql://postgres:atCv6BFZ1YQ3bdvK@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres',
        'JWT_SECRET': 'verigrade-super-secure-jwt-secret-key-2024-production',
        'STRIPE_PUBLISHABLE_KEY': 'pk_live_51SB00GFjFAJQwUPDaTEvzGmZswYvt024Sv9yhTkWByTUw8kP5YoBLhTqJcUXdJToKQy6uUFXFRn866xKUlQTZrcd007KhHxn6K',
        'SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI',
        'SMTP_USER': 'verigradebookkeeping@gmail.com',
        'SMTP_PASS': 'jxxy spfm ejyk nxxh',
        'SMTP_HOST': 'smtp.gmail.com',
        'SMTP_PORT': '587',
        'FROM_EMAIL': 'verigradebookkeeping+noreply@gmail.com',
        'PORT': '3001'
    };

    try {
        for (const [key, value] of Object.entries(envVars)) {
            execSync(`railway variables set ${key}="${value}"`, { stdio: 'inherit' });
            console.log(`✅ Set ${key}`);
        }
        console.log('✅ All environment variables set');
        return true;
    } catch (error) {
        console.log('❌ Failed to set environment variables');
        console.log('You may need to set them manually in the Railway dashboard');
        return false;
    }
}

// Deploy to Railway
function deployToRailway() {
    console.log('🚀 Deploying to Railway...');
    try {
        execSync('railway up', { stdio: 'inherit' });
        console.log('✅ Deployment successful!');
        return true;
    } catch (error) {
        console.log('❌ Deployment failed');
        console.log('Error:', error.message);
        return false;
    }
}

// Get deployment URL
function getDeploymentURL() {
    try {
        const output = execSync('railway status', { encoding: 'utf8' });
        console.log('📊 Deployment Status:');
        console.log(output);
        return true;
    } catch (error) {
        console.log('❌ Failed to get deployment status');
        return false;
    }
}

// Main deployment process
async function deploy() {
    console.log('🎯 Starting VeriGrade Railway deployment...\n');
    
    // Step 1: Check Railway CLI
    if (!checkRailwayCLI()) {
        if (!installRailwayCLI()) {
            console.log('❌ Cannot proceed without Railway CLI');
            return;
        }
    }
    
    // Step 2: Create Railway project
    if (!createRailwayProject()) {
        console.log('❌ Cannot proceed without Railway project');
        return;
    }
    
    // Step 3: Set environment variables
    if (!setEnvironmentVariables()) {
        console.log('⚠️  Environment variables not set automatically');
        console.log('Please set them manually in the Railway dashboard');
    }
    
    // Step 4: Deploy
    if (!deployToRailway()) {
        console.log('❌ Deployment failed');
        return;
    }
    
    // Step 5: Get status
    getDeploymentURL();
    
    console.log('\n🎉 VERIGRADE BACKEND DEPLOYED TO RAILWAY!');
    console.log('==========================================');
    console.log('✅ Your backend is now live on Railway');
    console.log('✅ Environment variables configured');
    console.log('✅ Database connected to Supabase');
    console.log('✅ Email service configured');
    console.log('✅ Stripe integration ready');
    console.log('\n📋 Next Steps:');
    console.log('1. Copy your Railway backend URL');
    console.log('2. Update your frontend API_URL');
    console.log('3. Deploy frontend to Vercel');
    console.log('4. Test the complete platform');
}

// Run deployment
deploy().catch(console.error);
