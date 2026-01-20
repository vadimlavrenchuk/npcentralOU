/**
 * Inventory Page - Smart Inventory Management Module
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, PackagePlus, PackageMinus, AlertTriangle, Trash2 } from 'lucide-react';
import { Button, Card, Modal } from '../../components/shared';
import { useInventory } from '../../hooks';
import type { InventoryItem } from '../../types';
import './Inventory.scss';

export const Inventory: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { items, loading, error, fetchInventory, adjustQuantity, createItem, deleteItem } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [operationType, setOperationType] = useState<'add' | 'subtract'>('add');
  const [operationQuantity, setOperationQuantity] = useState<number>(0);
  
  // Form state for new item
  const [newItem, setNewItem] = useState({
    sku: '',
    nameEn: '',
    nameEt: '',
    nameFi: '',
    nameRu: '',
    category: 'Electronics',
    quantity: 0,
    minQuantity: 0,
    unit: 'pcs',
    unitPrice: '',
    location: '',
    supplier: '',
  });

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const categories = ['all', 'Electrics', 'Mechanics', 'Hydraulics', 'Pneumatics', 'Consumables'];

  // Get localized name for item
  const getLocalizedName = (item: InventoryItem): string => {
    const currentLang = i18n.language as 'ru' | 'fi' | 'et' | 'en';
    return item.nameTranslations?.[currentLang] || item.name || '';
  };

  const filteredItems = (items || []).filter((item) => {
    if (!item || !item.sku) return false;
    
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

  const handleOperationSubmit = async () => {
    if (selectedItem && operationQuantity > 0) {
      const success = await adjustQuantity(
        selectedItem.id, 
        operationQuantity, 
        operationType
      );
      
      if (success) {
        handleCloseOperationModal();
        fetchInventory();
      }
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    const itemName = getLocalizedName(item);
    const confirmed = window.confirm(
      `${t('common.confirmDelete')}?\n\n${itemName} (${item.sku})`
    );
    
    if (confirmed) {
      const success = await deleteItem(item.id);
      if (success) {
        fetchInventory();
      } else {
        alert(error || 'Failed to delete item');
      }
    }
  };

  const handleAddItem = async () => {
    if (!newItem.sku || !newItem.nameEn) {
      alert('SKU and English name are required');
      return;
    }

    const itemData = {
      sku: newItem.sku.toUpperCase(),
      name: {
        en: newItem.nameEn,
        et: newItem.nameEt || newItem.nameEn,
        fi: newItem.nameFi || newItem.nameEn,
        ru: newItem.nameRu || newItem.nameEn,
      },
      category: newItem.category,
      quantity: Number(newItem.quantity),
      minQuantity: Number(newItem.minQuantity),
      unit: newItem.unit,
      unitPrice: parseFloat(newItem.unitPrice) || 0,
      location: newItem.location,
      supplier: newItem.supplier,
    };

    console.log('Sending item data:', itemData);
    console.log('API URL:', import.meta.env.VITE_API_URL);

    const created = await createItem(itemData);
    console.log('Created item response:', created);
    
    if (created) {
      setIsAddModalOpen(false);
      setNewItem({
        sku: '',
        nameEn: '',
        nameEt: '',
        nameFi: '',
        nameRu: '',
        category: 'Electronics',
        quantity: 0,
        minQuantity: 0,
        unit: 'pcs',
        unitPrice: '',
        location: '',
        supplier: '',
      });
      fetchInventory();
    } else {
      // Show error message
      alert(error || 'Failed to create item. Please check if SKU already exists.');
    }
  };

  if (loading && (items || []).length === 0) {
    return <div className="page-loading">{t('common.loading')}</div>;
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1 className="page-title">{t('inventory.title')}</h1>
        <Button 
          variant="primary" 
          icon={<Plus size={20} />}
          onClick={() => setIsAddModalOpen(true)}
        >
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
                      {item.unitPrice ? `€${item.unitPrice.toFixed(2)}` : '-'}
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
                        <button
                          className="action-btn action-btn--delete"
                          onClick={() => handleDeleteItem(item)}
                          title={t('common.delete')}
                        >
                          <Trash2 size={18} />
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

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('inventory.addItem')}
      >
        <div className="add-item-modal">
          <div className="modal-form">
            <div className="form-group">
              <label htmlFor="item-sku">{t('inventory.table.sku')} *</label>
              <input
                id="item-sku"
                type="text"
                value={newItem.sku}
                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value.toUpperCase() })}
                placeholder="ABC-12345"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="item-name-en">{t('inventory.form.nameEn')} *</label>
              <input
                id="item-name-en"
                type="text"
                value={newItem.nameEn}
                onChange={(e) => setNewItem({ ...newItem, nameEn: e.target.value })}
                placeholder="Product Name (English)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="item-name-et">{t('inventory.form.nameEt')}</label>
              <input
                id="item-name-et"
                type="text"
                value={newItem.nameEt}
                onChange={(e) => setNewItem({ ...newItem, nameEt: e.target.value })}
                placeholder="Toote Nimi (Eesti)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="item-name-fi">{t('inventory.form.nameFi')}</label>
              <input
                id="item-name-fi"
                type="text"
                value={newItem.nameFi}
                onChange={(e) => setNewItem({ ...newItem, nameFi: e.target.value })}
                placeholder="Tuotteen Nimi (Suomi)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="item-name-ru">{t('inventory.form.nameRu')}</label>
              <input
                id="item-name-ru"
                type="text"
                value={newItem.nameRu}
                onChange={(e) => setNewItem({ ...newItem, nameRu: e.target.value })}
                placeholder="Название товара (Русский)"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="item-category">{t('inventory.table.category')} *</label>
                <select
                  id="item-category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Tools">Tools</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="item-unit">{t('inventory.table.unit')} *</label>
                <select
                  id="item-unit"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  required
                >
                  <option value="">Select unit</option>
                  <option value="pcs">pcs (pieces)</option>
                  <option value="kg">kg (kilogram)</option>
                  <option value="l">l (liter)</option>
                  <option value="m">m (meter)</option>
                  <option value="box">box</option>
                  <option value="set">set</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="item-quantity">{t('inventory.table.quantity')} *</label>
                <input
                  id="item-quantity"
                  type="number"
                  min="0"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="item-min-quantity">{t('inventory.table.minQuantity')} *</label>
                <input
                  id="item-min-quantity"
                  type="number"
                  min="0"
                  value={newItem.minQuantity}
                  onChange={(e) => setNewItem({ ...newItem, minQuantity: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="item-price">{t('inventory.table.unitPrice')} (€)</label>
              <input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="item-location">{t('inventory.form.location')}</label>
              <input
                id="item-location"
                type="text"
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                placeholder="Warehouse A, Shelf 3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="item-supplier">{t('inventory.form.supplier')}</label>
              <input
                id="item-supplier"
                type="text"
                value={newItem.supplier}
                onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="primary"
              onClick={handleAddItem}
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
