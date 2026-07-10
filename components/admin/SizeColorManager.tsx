'use client';

import { Plus, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import type { ProductColor } from '@/lib/types';

interface SizeColorManagerProps {
  sizes: string[];
  colors: ProductColor[];
  onSizesChange: (sizes: string[]) => void;
  onColorsChange: (colors: ProductColor[]) => void;
}

export default function SizeColorManager({
  sizes,
  colors,
  onSizesChange,
  onColorsChange,
}: SizeColorManagerProps) {
  const [newSize, setNewSize] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#FFFFFF');

  // Ensure colors is always an array
  const colorArray = Array.isArray(colors) ? colors : [];
  const sizeArray = Array.isArray(sizes) ? sizes : [];

  const handleAddSize = () => {
    if (newSize.trim() && !sizeArray.includes(newSize.trim())) {
      onSizesChange([...sizeArray, newSize.trim().toUpperCase()]);
      setNewSize('');
    }
  };

  const handleRemoveSize = (size: string) => {
    onSizesChange(sizeArray.filter((s) => s !== size));
  };

  const handleAddColor = () => {
    if (newColorName.trim() && newColorHex) {
      const newColor: ProductColor = {
        name: newColorName.trim(),
        hex: newColorHex,
      };
      onColorsChange([...colorArray, newColor]);
      setNewColorName('');
      setNewColorHex('#FFFFFF');
    }
  };

  const handleRemoveColor = (index: number) => {
    onColorsChange(colorArray.filter((_, i) => i !== index));
  };

  const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const commonColors = [
    { name: 'سفید', hex: '#FFFFFF' },
    { name: 'مشکی', hex: '#000000' },
    { name: 'قرمز', hex: '#FF0000' },
    { name: 'آبی', hex: '#0000FF' },
    { name: 'سبز', hex: '#00FF00' },
    { name: 'زرد', hex: '#FFFF00' },
    { name: 'خاکستری', hex: '#808080' },
    { name: 'صورتی', hex: '#FFC0CB' },
  ];

  return (
    <div className="space-y-6">
      {/* Sizes Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">سایز‌ها</h3>

        {/* Quick Add Common Sizes */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">سایز‌های معمول:</p>
          <div className="flex flex-wrap gap-2">
            {commonSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  if (!sizeArray.includes(size)) {
                    onSizesChange([...sizeArray, size]);
                  }
                }}
                disabled={sizeArray.includes(size)}
                className={`px-3 py-1 rounded text-sm font-semibold transition ${
                  sizeArray.includes(size)
                    ? 'bg-blue-200 text-blue-800 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Add Custom Size */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            placeholder="سایز جدید (مثال: L+)"
            onKeyPress={(e) => e.key === 'Enter' && handleAddSize()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddSize}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <Plus size={18} />
            افزودن
          </button>
        </div>

        {/* Display Added Sizes */}
        <div className="flex flex-wrap gap-2">
          {sizeArray.length === 0 ? (
            <p className="text-gray-500 text-sm">هنوز سایزی اضافه نشده</p>
          ) : (
            sizeArray.map((size) => (
              <div
                key={size}
                className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg flex items-center gap-2"
              >
                <span>{size}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSize(size)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border-t pt-6" />

      {/* Colors Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">رنگ‌ها</h3>

        {/* Quick Add Common Colors */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">رنگ‌های معمول:</p>
          <div className="flex flex-wrap gap-2">
            {commonColors.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => {
                  if (!colorArray.find((c) => c.hex === color.hex)) {
                    onColorsChange([...colorArray, color]);
                  }
                }}
                disabled={colorArray.find((c) => c.hex === color.hex) !== undefined}
                className="group relative"
              >
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 transition"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
                {colorArray.find((c) => c.hex === color.hex) && (
                  <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Add Custom Color */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            placeholder="نام رنگ (مثال: آبی روشن)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-12 h-10 rounded-lg cursor-pointer border border-gray-300"
            />
            <button
              type="button"
              onClick={handleAddColor}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Plus size={18} />
              افزودن
            </button>
          </div>
        </div>

        {/* Display Added Colors */}
        <div className="flex flex-wrap gap-3">
          {colorArray.length === 0 ? (
            <p className="text-gray-500 text-sm">هنوز رنگی اضافه نشده</p>
          ) : (
            colorArray.map((color, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                />
                <span className="text-gray-700 font-semibold min-w-20">{color.name}</span>
                <span className="text-gray-500 text-sm font-mono">{color.hex}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveColor(index)}
                  className="text-red-600 hover:text-red-800 ml-auto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
