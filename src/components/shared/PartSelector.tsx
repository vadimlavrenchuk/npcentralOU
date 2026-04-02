/**
 * PartSelector Component - выбор запчастей для заказа
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useInventory } from '../../hooks';
import type { PartUsage, InventoryItem } from '../../types';
import { Input, Button } from './';
import './PartSelector.scss';

interface PartSelectorProps {
  selectedParts: PartUsage[];
  onChange: (parts: PartUsage[]) => void;
}

export const PartSelector: React.FC<PartSelectorProps> = ({ selectedParts, onChange }) => {
  const { t } = useTranslation();
  const { items: inventory, fetchInventory } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Load inventory once on mount
  useEffect(() => {
    fetchInventory();
  }, []); // Empty dependency array - load only once

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setSearchTerm(item.name);
    setShowDropdown(false);
  };

  const handleAddPart = () => {
    if (!selectedItem || quantity < 1) return;

    // Проверяем, не добавлена ли уже эта запчасть
    const existingPart = selectedParts.find((p) => p.inventoryId === selectedItem.id);
    
    if (existingPart) {
      // Обновляем количество
      onChange(
        selectedParts.map((p) =>
          p.inventoryId === selectedItem.id
            ? { ...p, quantity: p.quantity + quantity }
            : p
        )
      );
    } else {
      // Добавляем новую запчасть
      onChange([
        ...selectedParts,
        {
          inventoryId: selectedItem.id,
          quantity,
          name: selectedItem.name,
        },
      ]);
    }

    // Сбрасываем форму
    setSelectedItem(null);
    setSearchTerm('');
    setQuantity(1);
  };

  const handleRemovePart = (inventoryId: string) => {
    onChange(selectedParts.filter((p) => p.inventoryId !== inventoryId));
  };

  const handleQuantityChange = (inventoryId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    onChange(
      selectedParts.map((p) =>
        p.inventoryId === inventoryId ? { ...p, quantity: newQuantity } : p
      )
    );
  };

  const getInventoryStock = (inventoryId: string): number => {
    const item = inventory.find((i) => i.id === inventoryId);
    return item?.quantity || 0;
  };

  const isStockSufficient = (part: PartUsage): boolean => {
    const stock = getInventoryStock(part.inventoryId);
    return stock >= part.quantity;
  };

  return (
    <div className="part-selector">
      <h4 className="part-selector__title">
        {t('workOrders.parts.title') || 'Required Parts'}
      </h4>

      {/* Форма добавления запчасти */}
      <div className="part-selector__add-form">
        <div className="part-selector__search">
          <div className="part-selector__search-input">
            <Search size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={t('workOrders.parts.search') || 'Search parts...'}
              className="form-input"
            />
          </div>

          {/* Выпадающий список */}
          {showDropdown && searchTerm && filteredInventory.length > 0 && (
            <div className="part-selector__dropdown">
              {filteredInventory.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="part-selector__dropdown-item"
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="part-selector__dropdown-item-main">
                    <span className="part-selector__dropdown-item-name">{item.name}</span>
                    <span className="part-selector__dropdown-item-sku">{item.sku}</span>
                  </div>
                  <div className="part-selector__dropdown-item-stock">
                    <span className={item.quantity > item.minQuantity ? 'stock-ok' : 'stock-low'}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="part-selector__quantity">
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
            placeholder={t('workOrders.parts.quantity') || 'Qty'}
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          icon={<Plus size={18} />}
          onClick={handleAddPart}
          disabled={!selectedItem || quantity < 1}
        >
          {t('workOrders.parts.add') || 'Add'}
        </Button>
      </div>

      {/* Список выбранных запчастей */}
      {selectedParts.length > 0 && (
        <div className="part-selector__selected">
          <table className="part-selector__table">
            <thead>
              <tr>
                <th>{t('workOrders.parts.partName') || 'Part'}</th>
                <th>{t('workOrders.parts.quantity') || 'Quantity'}</th>
                <th>{t('workOrders.parts.inStock') || 'In Stock'}</th>
                <th>{t('common.actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {selectedParts.map((part) => {
                const sufficient = isStockSufficient(part);
                const stock = getInventoryStock(part.inventoryId);
                
                return (
                  <tr key={part.inventoryId} className={!sufficient ? 'insufficient-stock' : ''}>
                    <td>{part.name}</td>
                    <td>
                      <Input
                        type="number"
                        value={part.quantity}
                        onChange={(e) => handleQuantityChange(part.inventoryId, Number(e.target.value))}
                        min={1}
                        className="part-selector__quantity-input"
                      />
                    </td>
                    <td>
                      <span className={sufficient ? 'stock-sufficient' : 'stock-insufficient'}>
                        {stock}
                        {!sufficient && (
                          <AlertCircle size={16} className="stock-warning-icon" />
                        )}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="action-button action-button--delete"
                        onClick={() => handleRemovePart(part.inventoryId)}
                        title={t('common.delete') || 'Delete'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Предупреждение о нехватке запчастей */}
          {selectedParts.some((p) => !isStockSufficient(p)) && (
            <div className="part-selector__warning">
              <AlertCircle size={18} />
              <span>
                {t('workOrders.parts.insufficientStock') ||
                  'Some parts have insufficient stock. Order will be created with "Awaiting Parts" status.'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
