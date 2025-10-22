'use client';

import { useMemo } from 'react';

interface SimpleMarkdownRendererProps {
  content: string;
  className?: string;
}

export default function SimpleMarkdownRenderer({ content, className = '' }: SimpleMarkdownRendererProps) {
  // Функция для форматирования текста
  const formatText = (text: string) => {
    if (!text) return <span></span>;
    
    // Обработка жирного текста **текст** (сначала, чтобы не конфликтовать с курсивом)
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    
    // Обработка курсива *текст* (только если не внутри жирного)
    formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic">$1</em>');
    
    // Обработка кода `код`
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 border">$1</code>');
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const processedContent = useMemo(() => {
    if (!content?.trim()) {
      return (
        <div className="text-gray-400 italic">
          Описание не добавлено
        </div>
      );
    }

    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Проверяем на таблицу
      if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
        const tableLines = [];
        let j = i;
        
        // Собираем все строки таблицы
        while (j < lines.length && lines[j].includes('|')) {
          tableLines.push(lines[j]);
          j++;
        }
        
        if (tableLines.length >= 2) {
          const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h);
          const data = tableLines.slice(2).map(line => 
            line.split('|').map(cell => cell.trim()).filter(cell => cell)
          );
          
          elements.push(
            <div key={`table-${i}`} className="overflow-x-auto mb-6">
              <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {headers.map((header, index) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                          {formatText(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        
        i = j;
        continue;
      }
      
      // Заголовки с SEO оптимизацией
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-xl font-semibold text-gray-800 mb-3 mt-5">
            {formatText(line.substring(4))}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        // Ограничиваем количество H2 для SEO
        const h2Count = elements.filter(el => el.type === 'h2').length;
        if (h2Count < 5) {
          elements.push(
            <h2 key={i} className="text-2xl font-bold text-gray-800 mb-4 mt-6 border-b border-gray-200 pb-2">
              {formatText(line.substring(3))}
            </h2>
          );
        } else {
          // Преобразуем лишние H2 в H3
          elements.push(
            <h3 key={i} className="text-xl font-semibold text-gray-800 mb-3 mt-5">
              {formatText(line.substring(3))}
            </h3>
          );
        }
      } else if (line.startsWith('# ')) {
        // Проверяем, есть ли уже H1
        const h1Count = elements.filter(el => el.type === 'h1').length;
        if (h1Count === 0) {
          elements.push(
            <h1 key={i} className="text-3xl font-bold text-gray-900 mb-6 mt-8 border-b-2 border-blue-200 pb-3">
              {formatText(line.substring(2))}
            </h1>
          );
        } else {
          // Преобразуем лишние H1 в H2
          elements.push(
            <h2 key={i} className="text-2xl font-bold text-gray-800 mb-4 mt-6 border-b border-gray-200 pb-2">
              {formatText(line.substring(2))}
            </h2>
          );
        }
      }
      // Пустые строки
      else if (!line) {
        elements.push(<br key={i} />);
      }
      // Параграфы
      else if (line && !line.startsWith('|')) {
        // Обработка списков
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const listItems = [];
          let k = i;
          while (k < lines.length && (lines[k].startsWith('- ') || lines[k].startsWith('* '))) {
            listItems.push(lines[k].substring(2));
            k++;
          }
          
          elements.push(
            <ul key={i} className="list-disc list-inside mb-6 space-y-2 ml-6">
              {listItems.map((item, index) => (
                <li key={index} className="mb-2 text-gray-700 leading-relaxed">
                  {formatText(item)}
                </li>
              ))}
            </ul>
          );
          
          i = k - 1;
        } else {
          // Обычный параграф
          elements.push(
            <p key={i} className="mb-4 text-gray-700 leading-relaxed">
              {formatText(line)}
            </p>
          );
        }
      }
      
      i++;
    }

    return (
      <div className={`prose prose-lg max-w-none ${className}`}>
        {elements}
      </div>
    );
  }, [content, className]);

  return processedContent;
}
