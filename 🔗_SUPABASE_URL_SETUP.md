# 🔗 SUPABASE URL SETUP - QUICK!

## **🎯 YOUR SUPABASE PROJECT URL:**
`https://krdwxeeaxldgnhymukyb.supabase.co`

## **📋 NEXT STEPS:**

### **1. Get Your Database Password**
1. Go to your Supabase project: **https://krdwxeeaxldgnhymukyb.supabase.co**
2. Click **"Settings"** (gear icon in sidebar)
3. Click **"Database"**
4. Scroll down to **"Connection string"**
5. Click **"URI"** tab
6. **Copy the complete connection string**

### **2. Update Your Environment File**
Replace the DATABASE_URL in `backend/.env` with your complete connection string.

**Your connection string should look like:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres
```

### **3. Quick Update Command**
Once you have your complete connection string, run:
```bash
# Replace YOUR_COMPLETE_CONNECTION_STRING with your actual connection string
sed -i '' 's|DATABASE_URL="postgresql://verigrade_user:CHANGE_THIS_PASSWORD@localhost:5432/verigrade_db"|DATABASE_URL="YOUR_COMPLETE_CONNECTION_STRING"|' backend/.env
```

### **4. Test the Connection**
```bash
cd backend
npx prisma db push
npx prisma generate
```

---

## **🎯 WHAT YOU NEED:**

1. **Go to**: https://krdwxeeaxldgnhymukyb.supabase.co
2. **Settings** → **Database** → **Connection string** → **URI**
3. **Copy the complete URL** (includes your password)
4. **Update backend/.env** with the complete URL
5. **Run Prisma commands** to set up your database

---

## **✅ SUCCESS:**
You'll know it's working when:
- ✅ You can copy the complete connection string
- ✅ `npx prisma db push` runs successfully
- ✅ Your tables appear in Supabase dashboard

**Get that connection string and we'll be ready to go!** 🚀
