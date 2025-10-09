# 🔍 Route Status Checker

## ✅ **WORKING ROUTES**

### **Frontend Pages:**
- ✅ `http://localhost:3000` - Home page
- ✅ `http://localhost:3000/landing` - Landing page
- ✅ `http://localhost:3000/login` - Login page
- ✅ `http://localhost:3000/register` - Register page
- ✅ `http://localhost:3000/dashboard` - Dashboard

### **API Endpoints:**
- ✅ `http://localhost:3000/api/analytics` (GET) - Analytics data
- ✅ `http://localhost:3000/api/auth/verify` (GET/POST) - Auth verification
- ✅ `http://localhost:3001/api/perplexity/health` (GET) - MCP health check
- ✅ `http://localhost:3001/api/perplexity/search` (POST) - AI search
- ✅ `http://localhost:3001/api/perplexity/reason` (POST) - AI reasoning
- ✅ `http://localhost:3001/api/perplexity/deep-research` (POST) - AI research
- ✅ `http://localhost:3001/api/perplexity/research-accounting` (POST) - Accounting research
- ✅ `http://localhost:3001/api/perplexity/analyze-trends` (POST) - Trend analysis
- ✅ `http://localhost:3001/api/perplexity/research-tax-regulations` (POST) - Tax research
- ✅ `http://localhost:3001/api/perplexity/competitor-analysis` (POST) - Competitor analysis
- ✅ `http://localhost:3001/api/perplexity/research-integration` (POST) - Integration research

### **Backend API:**
- ✅ `http://localhost:3001/health` - Backend health check
- ✅ `http://localhost:3001/api/auth/login` (POST) - User login
- ✅ `http://localhost:3001/api/auth/register` (POST) - User registration
- ✅ `http://localhost:3001/api/invoices` (GET) - Get invoices
- ✅ `http://localhost:3001/api/expenses` (GET) - Get expenses
- ✅ `http://localhost:3001/api/customers` (GET) - Get customers
- ✅ `http://localhost:3001/api/dashboard/overview` (GET) - Dashboard data

## 🔧 **TROUBLESHOOTING**

### **If you get "Route not found":**

1. **Check the URL** - Make sure you're using the correct URL format
2. **Check the method** - Some endpoints require POST instead of GET
3. **Check the port** - Frontend is on port 3000, Backend on port 3001

### **Common Issues:**

- **Frontend routes** (pages) use port 3000
- **API routes** use port 3001 for backend APIs
- **Some API routes** require POST method with JSON body
- **Authentication routes** need proper token/credentials

## 📋 **TESTING COMMANDS**

### **Test Frontend:**
```bash
curl http://localhost:3000/landing
```

### **Test Backend:**
```bash
curl http://localhost:3001/health
```

### **Test AI Research:**
```bash
curl -X POST http://localhost:3001/api/perplexity/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'
```

## 🎯 **QUICK FIX**

If you're still getting "Route not found", please tell me:
1. **Which specific URL** you're trying to access
2. **What method** (GET/POST) you're using
3. **What you're trying to do**

I'll help you fix it immediately!




