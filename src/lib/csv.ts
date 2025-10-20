export function convertToCSV(data: Record<string, unknown>[], headers: string[]): string {
  if (data.length === 0) return '';
  
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

export function parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"');
      }
      row[header] = value;
    });
    return row;
  });
  
  return { headers, rows };
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function uploadCSV(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const result = parseCSV(csvText);
        resolve(result);
      } catch {
        reject(new Error('Ошибка парсинга CSV файла'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };
    
    reader.readAsText(file, 'utf-8');
  });
}
