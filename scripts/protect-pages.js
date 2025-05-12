const fs = require('fs');
const path = require('path');

const PROTECTED_PATHS = [
  'src/pages/dashboard',
  'src/pages/orders',
  'src/pages/products',
  'src/pages/users',
  'src/pages/marketplace',
  'src/pages/account-settings',
  'src/pages/customers',
  'src/pages/checkout'
];

const EXCLUDED_PATHS = [
  'src/pages/auth',
  'src/pages/401.tsx',
  'src/pages/404.tsx',
  'src/pages/500.tsx'
];

function shouldProtect(filePath) {
  // Vérifier si le fichier est dans un chemin exclu
  if (EXCLUDED_PATHS.some(excluded => filePath.includes(excluded))) {
    return false;
  }

  // Vérifier si le fichier est dans un chemin protégé
  return PROTECTED_PATHS.some(protected => filePath.includes(protected));
}

function protectFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier si le fichier est déjà protégé
  if (content.includes('withAuth')) {
    return;
  }

  // Ajouter l'import
  const importStatement = "import { withAuth } from '@/components/auth/withAuth';\n";
  
  // Trouver la dernière ligne d'export
  const exportMatch = content.match(/export default ([^;]+);/);
  if (!exportMatch) return;

  const componentName = exportMatch[1];
  const newContent = content
    .replace(/export default ([^;]+);/, `export default withAuth(${componentName});`)
    .replace(/^/, importStatement);

  fs.writeFileSync(filePath, newContent);
  console.log(`Protected: ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') && shouldProtect(filePath)) {
      protectFile(filePath);
    }
  });
}

// Démarrer la protection des pages
walkDir('src/pages'); 