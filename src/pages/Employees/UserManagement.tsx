import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../../types/permissions';
import { apiClient } from '../../api/client';
import './UserManagement.scss';

interface User {
  _id: string;
  username: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

interface NewUserForm {
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

interface EditUserForm {
  _id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>({
    username: '',
    password: '',
    name: '',
    role: UserRole.MECHANIC
  });
  const [editUser, setEditUser] = useState<EditUserForm | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<User[]>('/users');
      setUsers(response);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiClient.post('/users', newUser);
      setShowCreateModal(false);
      setNewUser({
        username: '',
        password: '',
        name: '',
        role: UserRole.MECHANIC
      });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания пользователя');
    }
  };

  const handleOpenEditModal = (user: User) => {
    setEditUser({
      _id: user._id,
      username: user.username,
      password: '', // не показываем текущий пароль
      name: user.name,
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editUser) return;

    try {
      const updateData: any = {
        username: editUser.username,
        name: editUser.name,
        role: editUser.role
      };

      // Добавляем пароль только если он был введен
      if (editUser.password) {
        updateData.password = editUser.password;
      }

      await apiClient.patch(`/users/${editUser._id}`, updateData);
      setShowEditModal(false);
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка обновления пользователя');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await apiClient.patch(`/users/${userId}/toggle-status`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка изменения статуса');
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      await apiClient.patch(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка изменения роли');
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя "${username}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка удаления пользователя');
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      [UserRole.ADMIN]: t('users.roles.admin') || 'Администратор',
      [UserRole.CHIEF_MECHANIC]: t('users.roles.chief_mechanic') || 'Главный механик',
      [UserRole.ACCOUNTANT]: t('users.roles.accountant') || 'Бухгалтер',
      [UserRole.MECHANIC]: t('users.roles.mechanic') || 'Механик'
    };
    return labels[role];
  };

  if (loading) {
    return <div className="user-management-loading">{t('users.loading') || 'Загрузка...'}</div>;
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h1>{t('users.title') || 'Управление сотрудниками'}</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + {t('users.createUser') || 'Создать пользователя'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>{t('users.username') || 'Логин'}</th>
              <th>{t('users.name') || 'Имя'}</th>
              <th>{t('users.role') || 'Роль'}</th>
              <th>{t('users.status') || 'Статус'}</th>
              <th>{t('users.createdAt') || 'Дата создания'}</th>
              <th>{t('users.actions') || 'Действия'}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user._id, e.target.value as UserRole)}
                    className="role-select"
                  >
                    <option value={UserRole.ADMIN}>{t('users.roles.admin') || 'Администратор'}</option>
                    <option value={UserRole.CHIEF_MECHANIC}>{t('users.roles.chief_mechanic') || 'Главный механик'}</option>
                    <option value={UserRole.ACCOUNTANT}>{t('users.roles.accountant') || 'Бухгалтер'}</option>
                    <option value={UserRole.MECHANIC}>{t('users.roles.mechanic') || 'Механик'}</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? t('users.active') || 'Активен' : t('users.blocked') || 'Заблокирован'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
                <td className="actions-cell">
                  <button
                    className="btn-edit"
                    onClick={() => handleOpenEditModal(user)}
                    title={t('users.edit') || 'Редактировать'}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-toggle"
                    onClick={() => handleToggleStatus(user._id)}
                    title={user.isActive ? t('users.block') || 'Заблокировать' : t('users.unblock') || 'Разблокировать'}
                  >
                    {user.isActive ? '🔒' : '🔓'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteUser(user._id, user.username)}
                    title={t('users.delete') || 'Удалить'}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('users.createNewUser') || 'Создать нового пользователя'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="user-form">
              <div className="form-group">
                <label htmlFor="username">{t('users.username') || 'Логин'} *</label>
                <input
                  id="username"
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                  placeholder="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">{t('users.password') || 'Пароль'} *</label>
                <input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder={t('users.minChars') || 'Минимум 6 символов'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">{t('users.fullName') || 'Полное имя'} *</label>
                <input
                  id="name"
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  placeholder={t('users.fullNamePlaceholder') || 'Иван Иванов'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">{t('users.role') || 'Роль'} *</label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  required
                >
                  <option value={UserRole.MECHANIC}>{t('users.roles.mechanic') || 'Механик'}</option>
                  <option value={UserRole.ACCOUNTANT}>{t('users.roles.accountant') || 'Бухгалтер'}</option>
                  <option value={UserRole.CHIEF_MECHANIC}>{t('users.roles.chief_mechanic') || 'Главный механик'}</option>
                  <option value={UserRole.ADMIN}>{t('users.roles.admin') || 'Администратор'}</option>
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  {t('users.cancel') || 'Отмена'}
                </button>
                <button type="submit" className="btn-primary">
                  {t('users.create') || 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('users.editUser') || 'Редактировать пользователя'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="user-form">
              <div className="form-group">
                <label htmlFor="edit-username">{t('users.username') || 'Логин'} *</label>
                <input
                  id="edit-username"
                  type="text"
                  value={editUser.username}
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                  required
                  placeholder="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-password">{t('users.password') || 'Пароль'}</label>
                <input
                  id="edit-password"
                  type="password"
                  value={editUser.password}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  minLength={6}
                  placeholder={t('users.passwordOptional') || 'Оставьте пустым, чтобы не менять'}
                />
                <small>{t('users.passwordHint') || 'Введите новый пароль только если хотите его изменить'}</small>
              </div>

              <div className="form-group">
                <label htmlFor="edit-name">{t('users.fullName') || 'Полное имя'} *</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  required
                  placeholder={t('users.fullNamePlaceholder') || 'Иван Иванов'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-role">{t('users.role') || 'Роль'} *</label>
                <select
                  id="edit-role"
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value as UserRole })}
                  required
                >
                  <option value={UserRole.MECHANIC}>{t('users.roles.mechanic') || 'Механик'}</option>
                  <option value={UserRole.ACCOUNTANT}>{t('users.roles.accountant') || 'Бухгалтер'}</option>
                  <option value={UserRole.CHIEF_MECHANIC}>{t('users.roles.chief_mechanic') || 'Главный механик'}</option>
                  <option value={UserRole.ADMIN}>{t('users.roles.admin') || 'Администратор'}</option>
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  {t('users.cancel') || 'Отмена'}
                </button>
                <button type="submit" className="btn-primary">
                  {t('users.save') || 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
