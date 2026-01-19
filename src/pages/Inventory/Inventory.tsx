/**
 * Inventory Page - Smart Inventory Management Module
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, PackagePlus, PackageMinus, AlertTriangle } from 'lucide-react';
import { Button, Card, Modal } from '../../components/shared';
import { useInventory } from '../../hooks';
import type { InventoryItem } from '../../types';
import './Inventory.scss';

export const Inventory: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { items, loading, error, fetchInventory } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [operationType, setOperationType] = useState<'add' | 'subtract'>('add');
  const [operationQuantity, setOperationQuantity] = useState<number>(0);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const categories = ['all', 'Electrics', 'Mechanics', 'Hydraulics', 'Pneumatics', 'Consumables'];

  // Get localized name for item
  const getLocalizedName = (item: InventoryItem): string => {
    const currentLang = i18n.language as 'ru' | 'fi' | 'et' | 'en';
    return item.nameTranslations?.[currentLang] || item.name;
  };

  const filteredItems = items.filter((item) => {
    const localizedName = getLocalizedName(item);
    const matchesSearch = 
      localizedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const isLowStock = (item: InventoryItem) => item.quantity <= item.minQuantity;

  const handleOpenOperationModal = (item: InventoryItem, type: 'add' | 'subtract') => {
    setSelectedItem(item);
    setOperationType(type);
    setOperationQuantity(0);
    setIsOperationModalOpen(true);
  };

  const handleCloseOperationModal = () => {
    setIsOperationModalOpen(false);
    setSelectedItem(null);
    setOperationQuantity(0);
  };

  const handleOperationSubmit = () => {
    if (selectedItem && operationQuantity > 0) {
      // TODO: Implement API call to update inventory
      console.log(`${operationType === 'add' ? 'Adding' : 'Subtracting'} ${operationQuantity} to ${selectedItem.name}`);
      handleCloseOperationModal();
      fetchInventory();
    }
  };

  if (loading && items.length === 0) {
    return <div className="page-loading">{t('common.loading')}</div>;
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1 className="page-title">{t('inventory.title')}</h1>
        <Button variant="primary" icon={<Plus size={20} />}>
          {t('inventory.addNew')}
        </Button>
      </div>

      {error && <div className="page-error">{error}</div>}

      {/* Filters */}
      <Card className="inventory-filters">
        <div className="filter-group">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-select"
          >
            <option value="all">{t('inventory.allCategories')}</option>
            {categories.slice(1).map((cat) => (
              <option key={cat} value={cat}>
                {t(`inventory.category.${cat}`)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="inventory-table-card">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>{t('inventory.noData')}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>{t('inventory.table.sku')}</th>
                  <th>{t('inventory.table.name')}</th>
                  <th>{t('inventory.table.category')}</th>
                  <th>{t('inventory.table.quantity')}</th>
                  <th>{t('inventory.table.unit')}</th>
                  <th>{t('inventory.table.minQuantity')}</th>
                  <th>{t('inventory.table.price')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className={isLowStock(item) ? 'low-stock' : ''}>
                    <td className="sku-cell">{item.sku}</td>
                    <td className="name-cell">{getLocalizedName(item)}</td>
                    <td className="category-cell">
                      {t(`inventory.category.${item.category}`)}
                    </td>
                    <td className={`quantity-cell ${isLowStock(item) ? 'low-stock-value' : ''}`}>
                      <div className="quantity-wrapper">
                        {isLowStock(item) && (
                          <AlertTriangle size={16} className="warning-icon" />
                        )}
                        <span>{item.quantity}</span>
                      </div>
                    </td>
                    <td className="unit-cell">{item.unit}</td>
                    <td className="min-quantity-cell">{item.minQuantity}</td>
                    <td className="price-cell">
                      {item.unitPrice ? `$${item.unitPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn action-btn--add"
                          onClick={() => handleOpenOperationModal(item, 'add')}
                          title={t('inventory.operations.receive')}
                        >
                          <PackagePlus size={18} />
                        </button>
                        <button
                          className="action-btn action-btn--subtract"
                          onClick={() => handleOpenOperationModal(item, 'subtract')}
                          title={t('inventory.operations.issue')}
                        >
                          <PackageMinus size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Operation Modal */}
      <Modal
        isOpen={isOperationModalOpen}
        onClose={handleCloseOperationModal}
        title={operationType === 'add' ? t('inventory.operations.receive') : t('inventory.operations.issue')}
      >
        {selectedItem && (
          <div className="operation-modal">
            <div className="modal-item-info">
              <h3>{getLocalizedName(selectedItem)}</h3>
              <p className="item-sku">{t('inventory.table.sku')}: {selectedItem.sku}</p>
              <p className="item-current-stock">
                {t('inventory.operations.currentStock')}: <strong>{selectedItem.quantity} {selectedItem.unit}</strong>
              </p>
            </div>

            <div className="modal-form">
              <label htmlFor="operation-quantity">
                {operationType === 'add' 
                  ? t('inventory.operations.quantityToAdd')
                  : t('inventory.operations.quantityToSubtract')}
              </label>
              <input
                id="operation-quantity"
                type="number"
                min="0"
                value={operationQuantity}
                onChange={(e) => setOperationQuantity(Number(e.target.value))}
                className="quantity-input"
                placeholder="0"
              />
              
              <div className="modal-result">
                {t('inventory.operations.newQuantity')}: 
                <strong className={operationType === 'add' ? 'text-success' : 'text-warning'}>
                  {' '}
                  {operationType === 'add' 
                    ? selectedItem.quantity + operationQuantity 
                    : Math.max(0, selectedItem.quantity - operationQuantity)
                  } {selectedItem.unit}
                </strong>
              </div>
            </div>

            <div className="modal-actions">
              <Button variant="secondary" onClick={handleCloseOperationModal}>
                {t('common.cancel')}
              </Button>
              <Button 
                variant={operationType === 'add' ? 'success' : 'warning'}
                onClick={handleOperationSubmit}
                disabled={operationQuantity <= 0}
              >
                {t('common.save')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
