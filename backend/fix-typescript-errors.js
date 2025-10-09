const fs = require('fs');
const path = require('path');

// List of files to fix
const files = [
  'src/controllers/invoiceController.ts',
  'src/controllers/expenseController.ts',
  'src/controllers/customerController.ts',
  'src/controllers/dashboardController.ts',
  'src/controllers/fileController.ts',
  'src/controllers/reportController.ts',
  'src/routes/invoiceRoutes.ts',
  'src/routes/expenseRoutes.ts',
  'src/routes/customerRoutes.ts',
  'src/routes/dashboardRoutes.ts',
  'src/routes/fileRoutes.ts',
  'src/routes/reportRoutes.ts'
];

// Fix each file
files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace AuthenticatedRequest import
    content = content.replace(
      /import { AuthenticatedRequest } from ['"]\.\.\/middleware\/auth['"];?/g,
      "import { AuthenticatedRequest } from '../types/auth';"
    );
    
    // Fix function signatures
    content = content.replace(
      /export const \w+ = async \(req: Request & \{ user: AuthenticatedUser \}, res: Response\) => \{/g,
      (match) => match.replace('Request & { user: AuthenticatedUser }', 'AuthenticatedRequest')
    );
    
    // Fix metadata assignments
    content = content.replace(
      /metadata: notes \? \{ notes \} : null/g,
      'metadata: notes ? { notes } : undefined'
    );
    
    content = content.replace(
      /address: address \? \{[\s\S]*?\} : null/g,
      'address: address ? {\n          street: address,\n          city,\n          state,\n          zipCode,\n          country,\n        } : undefined'
    );
    
    // Fix return statements in catch blocks
    content = content.replace(
      /} catch \(error\) \{\s*logger\.error\([^;]*\);\s*res\.status\(500\)\.json\(\{\s*success: false,\s*message: [^}]*\},\s*\);\s*\}/g,
      '} catch (error) {\n    logger.error(\'Error:\', error);\n    res.status(500).json({\n      success: false,\n      message: \'Internal server error\',\n    });\n  }'
    );
    
    // Fix arithmetic operations with Decimal types
    content = content.replace(
      /const totalRevenue = revenue\._sum\.totalAmount \|\| 0;/g,
      'const totalRevenue = Number(revenue._sum.totalAmount) || 0;'
    );
    
    content = content.replace(
      /const totalExpenses = expenses\._sum\.amount \|\| 0;/g,
      'const totalExpenses = Number(expenses._sum.amount) || 0;'
    );
    
    content = content.replace(
      /const profit = \(totalRevenue\._sum\.totalAmount \|\| 0\) - \(totalExpenses\._sum\.amount \|\| 0\);/g,
      'const profit = (Number(totalRevenue._sum.totalAmount) || 0) - (Number(totalExpenses._sum.amount) || 0);'
    );
    
    content = content.replace(
      /const profitMargin = revenue\._sum\.totalAmount > 0 \? \(profit \/ revenue\._sum\.totalAmount\) \* 100 : 0;/g,
      'const profitMargin = Number(revenue._sum.totalAmount) > 0 ? (profit / Number(revenue._sum.totalAmount)) * 100 : 0;'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  }
});

console.log('TypeScript errors fixed!');