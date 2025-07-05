// Fonction utilitaire pour exporter des données en CSV
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('Aucune donnée à exporter');
    return;
  }

  // Obtenir les en-têtes (clés du premier objet)
  const headers = Object.keys(data[0]);
  
  // Créer la ligne d'en-tête
  const headerRow = headers.map(header => `"${header}"`).join(',');
  
  // Créer les lignes de données
  const dataRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Échapper les guillemets et entourer de guillemets si nécessaire
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value !== null && value !== undefined ? value : '';
    }).join(',')
  );
  
  // Combiner en-tête et données
  const csvContent = [headerRow, ...dataRows].join('\n');
  
  // Créer le blob et télécharger
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}; 