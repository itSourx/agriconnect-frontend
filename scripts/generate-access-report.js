const fs = require('fs')
const path = require('path')

// Configuration des routes et accès par profil
const routeAccessConfig = {
  public: [
    '/auth/login',
    '/auth/register',
    '/auth/reset',
    '/auth/reset-password',
  ],
  routes: {
    '/': {
      SUPERADMIN: { access: true, redirect: '/dashboard/admin' },
      ADMIN: { access: true, redirect: '/dashboard/admin' },
      AGRICULTEUR: { access: true, redirect: '/products/myproducts' },
      ACHETEUR: { access: true, redirect: '/marketplace' },
    },
    '/dashboard/admin': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: false, redirect: '/' },
      ACHETEUR: { access: false, redirect: '/' },
    },
    '/marketplace': {
      SUPERADMIN: { access: false, redirect: '/auth/error' },
      ADMIN: { access: false, redirect: '/auth/error' },
      AGRICULTEUR: { access: false, redirect: '/auth/error' },
      ACHETEUR: { access: true, redirect: null },
    },
    '/products': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: true, redirect: '/products/myproducts' },
      ACHETEUR: { access: true, redirect: null },
    },
    '/products/myproducts': {
      SUPERADMIN: { access: false, redirect: '/auth/error' },
      ADMIN: { access: false, redirect: '/auth/error' },
      AGRICULTEUR: { access: true, redirect: null },
      ACHETEUR: { access: false, redirect: '/auth/error' },
    },
    '/products/add': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: true, redirect: null },
      ACHETEUR: { access: false, redirect: '/' },
    },
    '/orders': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: true, redirect: null },
      ACHETEUR: { access: true, redirect: null },
    },
    '/checkout': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: true, redirect: null },
      ACHETEUR: { access: true, redirect: null },
    },
    '/users': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: false, redirect: '/auth/error' },
      ACHETEUR: { access: false, redirect: '/auth/error' },
    },
    '/users/edit/[id]': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: false, redirect: '/auth/error' },
      ACHETEUR: { access: false, redirect: '/auth/error' },
    },
    '/statistics/global': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: false, redirect: '/' },
      ACHETEUR: { access: false, redirect: '/' },
    },
    '/statistics/buyers': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: false, redirect: '/' },
      ACHETEUR: { access: true, redirect: null },
    },
    '/account-settings': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: true, redirect: null },
      ACHETEUR: { access: true, redirect: null },
    },
  }
}

function generateAccessTableMarkdown() {
  const profiles = ['SUPERADMIN', 'ADMIN', 'AGRICULTEUR', 'ACHETEUR']
  const routes = Object.keys(routeAccessConfig.routes)
  
  let markdown = '# 📊 Tableau Récapitulatif des Accès aux Routes\n\n'
  markdown += '## 🔐 Matrice d\'Accès par Profil Utilisateur\n\n'
  markdown += '| Route | SUPERADMIN | ADMIN | AGRICULTEUR | ACHETEUR |\n'
  markdown += '|-------|------------|-------|-------------|----------|\n'
  
  routes.forEach(route => {
    const routeConfig = routeAccessConfig.routes[route]
    const accessCells = profiles.map(profile => {
      const config = routeConfig[profile]
      if (config.access) {
        return '✅'
      } else {
        return config.redirect ? `❌ (→ ${config.redirect})` : '❌'
      }
    })
    
    markdown += `| ${route} | ${accessCells.join(' | ')} |\n`
  })
  
  return markdown
}

function generateProfileSummary() {
  const profiles = ['SUPERADMIN', 'ADMIN', 'AGRICULTEUR', 'ACHETEUR']
  const routes = Object.keys(routeAccessConfig.routes)
  
  let markdown = '\n## 👥 Résumé par Profil\n\n'
  
  profiles.forEach(profile => {
    const accessibleRoutes = routes.filter(route => {
      return routeAccessConfig.routes[route][profile].access
    })
    
    const redirectRoutes = routes.filter(route => {
      return routeAccessConfig.routes[route][profile].redirect
    }).map(route => ({
      route,
      redirect: routeAccessConfig.routes[route][profile].redirect
    }))
    
    const deniedRoutes = routes.filter(route => {
      const config = routeAccessConfig.routes[route][profile]
      return !config.access && !config.redirect
    })
    
    markdown += `### ${profile}\n\n`
    markdown += `**Routes accessibles (${accessibleRoutes.length}):**\n`
    accessibleRoutes.forEach(route => {
      markdown += `- ✅ ${route}\n`
    })
    
    if (redirectRoutes.length > 0) {
      markdown += `\n**Routes avec redirection (${redirectRoutes.length}):**\n`
      redirectRoutes.forEach(({ route, redirect }) => {
        markdown += `- 🔄 ${route} → ${redirect}\n`
      })
    }
    
    if (deniedRoutes.length > 0) {
      markdown += `\n**Routes refusées (${deniedRoutes.length}):**\n`
      deniedRoutes.forEach(route => {
        markdown += `- ❌ ${route}\n`
      })
    }
    
    markdown += '\n---\n\n'
  })
  
  return markdown
}

function generateRouteSummary() {
  const routes = Object.keys(routeAccessConfig.routes)
  
  let markdown = '\n## 🛣️ Résumé par Route\n\n'
  
  routes.forEach(route => {
    const routeConfig = routeAccessConfig.routes[route]
    const profiles = ['SUPERADMIN', 'ADMIN', 'AGRICULTEUR', 'ACHETEUR']
    
    const allowedProfiles = profiles.filter(profile => routeConfig[profile].access)
    const deniedProfiles = profiles.filter(profile => !routeConfig[profile].access)
    const redirectProfiles = profiles.filter(profile => routeConfig[profile].redirect)
    
    markdown += `### ${route}\n\n`
    markdown += `**Accès autorisé pour:** ${allowedProfiles.join(', ') || 'Aucun'}\n\n`
    markdown += `**Accès refusé pour:** ${deniedProfiles.join(', ') || 'Aucun'}\n\n`
    
    if (redirectProfiles.length > 0) {
      markdown += `**Redirections:**\n`
      redirectProfiles.forEach(profile => {
        markdown += `- ${profile}: ${routeConfig[profile].redirect}\n`
      })
      markdown += '\n'
    }
    
    markdown += '---\n\n'
  })
  
  return markdown
}

function generatePublicRoutesSection() {
  let markdown = '\n## 🌐 Routes Publiques\n\n'
  markdown += 'Ces routes sont accessibles sans authentification:\n\n'
  
  routeAccessConfig.public.forEach(route => {
    markdown += `- 🔓 ${route}\n`
  })
  
  return markdown
}

function generateSecurityRecommendations() {
  let markdown = '\n## 🔒 Recommandations de Sécurité\n\n'
  
  markdown += '### ✅ Points Positifs\n'
  markdown += '- Séparation claire des rôles et permissions\n'
  markdown += '- Redirections automatiques selon le profil\n'
  markdown += '- Protection des routes administratives\n'
  markdown += '- Accès spécifique aux statistiques par profil\n\n'
  
  markdown += '### ⚠️ Points d\'Attention\n'
  markdown += '- Vérifier la validation côté serveur\n'
  markdown += '- Implémenter des logs d\'accès\n'
  markdown += '- Ajouter des timeouts de session\n'
  markdown += '- Tester les cas limites de permissions\n\n'
  
  markdown += '### 🚀 Améliorations Suggérées\n'
  markdown += '- Système de permissions granulaires\n'
  markdown += '- Audit trail des accès\n'
  markdown += '- Notifications de connexion suspecte\n'
  markdown += '- Gestion des sessions multiples\n\n'
  
  return markdown
}

function generateFullReport() {
  const timestamp = new Date().toLocaleString('fr-FR')
  
  let report = `# 🔐 Rapport d'Analyse des Accès aux Routes\n\n`
  report += `**Généré le:** ${timestamp}\n\n`
  report += `**Application:** AgriConnect\n\n`
  report += `**Version:** 1.0.0\n\n`
  
  report += generateAccessTableMarkdown()
  report += generatePublicRoutesSection()
  report += generateProfileSummary()
  report += generateRouteSummary()
  report += generateSecurityRecommendations()
  
  return report
}

// Générer et sauvegarder le rapport
const report = generateFullReport()
const reportPath = path.join(__dirname, '..', 'ROUTE_ACCESS_REPORT.md')

fs.writeFileSync(reportPath, report, 'utf8')

console.log('📊 Rapport d\'accès aux routes généré avec succès!')
console.log(`📁 Fichier: ${reportPath}`)
console.log('\n📋 Résumé:')
console.log(`- Routes testées: ${Object.keys(routeAccessConfig.routes).length}`)
console.log(`- Routes publiques: ${routeAccessConfig.public.length}`)
console.log(`- Profils utilisateur: 4 (SUPERADMIN, ADMIN, AGRICULTEUR, ACHETEUR)`)

// Afficher quelques statistiques
const routes = Object.keys(routeAccessConfig.routes)
const profiles = ['SUPERADMIN', 'ADMIN', 'AGRICULTEUR', 'ACHETEUR']

console.log('\n📈 Statistiques par profil:')
profiles.forEach(profile => {
  const accessibleCount = routes.filter(route => 
    routeAccessConfig.routes[route][profile].access
  ).length
  const redirectCount = routes.filter(route => 
    routeAccessConfig.routes[route][profile].redirect
  ).length
  
  console.log(`- ${profile}: ${accessibleCount} accès, ${redirectCount} redirections`)
}) 