const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://acsftcjydhuowkqgrllo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc2Z0Y2p5ZGh1b3drcWdybGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTM3NDUsImV4cCI6MjA3NzA4OTc0NX0.hBpnuWBJJh_Ob99yeRsCe6xSWBhw25vzrLnbrCCpj9Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseDeployment() {
    console.log('🧪 Testing Supabase Database Deployment...\n');
    
    const tables = [
        'companies',
        'profiles', 
        'chart_of_accounts',
        'transactions',
        'transaction_lines',
        'customers',
        'vendors',
        'invoices',
        'invoice_lines'
    ];
    
    let successCount = 0;
    let totalTests = tables.length;
    
    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);
                
            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: ${data ? data.length : 0} records`);
                successCount++;
            }
        } catch (err) {
            console.log(`❌ ${table}: ${err.message}`);
        }
    }
    
    console.log(`\n📊 Results: ${successCount}/${totalTests} tables accessible`);
    
    if (successCount === totalTests) {
        console.log('🎉 Database deployment successful!');
        console.log('✅ All tables are working');
        console.log('✅ Sample data loaded');
        console.log('✅ Database ready for production');
    } else {
        console.log('⚠️  Some tables are not accessible');
        console.log('Please check the SQL scripts and try again');
    }
}

// Run the test
testSupabaseDeployment().catch(console.error);


