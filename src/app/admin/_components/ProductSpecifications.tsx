'use client';
import { useState } from 'react';

interface Specification {
  id?: number;
  name: string;
  value: string;
}

interface ProductSpecificationsProps {
  specifications: Specification[];
  onChange: (specifications: Specification[]) => void;
}

export default function ProductSpecifications({ 
  specifications, 
  onChange 
}: ProductSpecificationsProps) {
  const [newSpec, setNewSpec] = useState({ name: '', value: '' });

  const addSpecification = () => {
    if (newSpec.name.trim() && newSpec.value.trim()) {
      onChange([...specifications, { ...newSpec }]);
      setNewSpec({ name: '', value: '' });
    }
  };

  const updateSpecification = (index: number, field: 'name' | 'value', value: string) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeSpecification = (index: number) => {
    const updated = specifications.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Характеристики товара</h3>
      
      {specifications.map((spec, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Название характеристики"
            value={spec.name}
            onChange={(e) => updateSpecification(index, 'name', e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Значение"
            value={spec.value}
            onChange={(e) => updateSpecification(index, 'value', e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button
            onClick={() => removeSpecification(index)}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      ))}
      
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Название характеристики"
          value={newSpec.name}
          onChange={(e) => setNewSpec(prev => ({ ...prev, name: e.target.value }))}
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <input
          type="text"
          placeholder="Значение"
          value={newSpec.value}
          onChange={(e) => setNewSpec(prev => ({ ...prev, value: e.target.value }))}
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
          onClick={addSpecification}
          className="px-4 py-2 bg-[#00205B] text-white rounded-lg hover:bg-blue-700"
        >
          Добавить
        </button>
      </div>
    </div>
  );
}
