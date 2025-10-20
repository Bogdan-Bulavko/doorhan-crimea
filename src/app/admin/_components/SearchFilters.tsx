'use client';
import { useState } from 'react';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, string>) => void;
  searchPlaceholder?: string;
  filterOptions?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
}

export default function SearchFilters({ 
  onSearch, 
  onFilter, 
  searchPlaceholder = 'Поиск...',
  filterOptions = []
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    onFilter({});
    onSearch('');
  };

  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        
        {filterOptions.map((filter) => (
          <div key={filter.key} className="min-w-48">
            <select
              value={filters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        
        <button
          onClick={clearFilters}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Очистить
        </button>
      </div>
    </div>
  );
}
