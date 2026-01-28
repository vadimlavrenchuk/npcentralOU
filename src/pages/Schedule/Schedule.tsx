import React, { useState, useEffect } from 'react';
import { Filter, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../hooks/usePermissions';
import { Button } from '../../components/shared/Button';
import { Modal } from '../../components/shared/Modal';
import './Schedule.scss';

enum ScheduleType {
  SHIFT = 'shift',
  VACATION = 'vacation',
  SICK_LEAVE = 'sick_leave'
}

interface User {
  _id: string;
  name: string;
  username: string;
  role: string;
}

interface ScheduleEntry {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  type: ScheduleType;
  startDate: string;
  endDate: string;
  shiftHours?: string;
  notes?: string;
}

interface FormData {
  userId: string;
  type: ScheduleType;
  startDate: string;
  endDate: string;
  shiftHours: string;
  notes: string;
}

const Schedule: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { can } = usePermissions();
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [formData, setFormData] = useState<FormData>({
    userId: '',
    type: ScheduleType.SHIFT,
    startDate: '',
    endDate: '',
    shiftHours: '09:00-18:00',
    notes: ''
  });

  const canEdit = can('canManageUsers');

  useEffect(() => {
    fetchSchedules();
    fetchUsers();
  }, [currentMonth]);

  useEffect(() => {
    if (roleFilter === 'all') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(u => u.role === roleFilter));
    }
  }, [users, roleFilter]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.startDate || !formData.endDate) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${apiUrl}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchSchedules();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleCellClick = (date: Date, userId: string) => {
    if (!canEdit) return;
    
    setSelectedDate(date);
    setSelectedUserId(userId);
    setFormData({
      userId: userId,
      type: ScheduleType.SHIFT,
      startDate: date.toISOString().split('T')[0],
      endDate: date.toISOString().split('T')[0],
      shiftHours: '09:00-18:00',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      type: ScheduleType.SHIFT,
      startDate: '',
      endDate: '',
      shiftHours: '09:00-18:00',
      notes: ''
    });
    setSelectedDate(null);
    setSelectedUserId('');
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    return days;
  };

  const getScheduleForUserAndDate = (userId: string, date: Date) => {
    return schedules.find(schedule => {
      if (schedule.userId._id !== userId) return false;
      const start = new Date(schedule.startDate);
      const end = new Date(schedule.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });
  };

  const getCellContent = (schedule: ScheduleEntry | undefined) => {
    if (!schedule) return null;
    
    switch (schedule.type) {
      case ScheduleType.SHIFT:
        return {
          className: 'schedule-cell--shift',
          text: schedule.shiftHours || '09:00-18:00'
        };
      case ScheduleType.VACATION:
        return {
          className: 'schedule-cell--vacation',
          text: 'О'
        };
      case ScheduleType.SICK_LEAVE:
        return {
          className: 'schedule-cell--sick',
          text: 'Б'
        };
      default:
        return null;
    }
  };

  // Парсинг временного интервала (например, "08:00-16:00" -> 8 часов)
  const parseShiftHours = (shiftTime: string): number => {
    if (!shiftTime) return 0;
    const match = shiftTime.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    
    const startHour = parseInt(match[1]);
    const startMin = parseInt(match[2]);
    const endHour = parseInt(match[3]);
    const endMin = parseInt(match[4]);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return (endMinutes - startMinutes) / 60;
  };

  // Государственные праздники Эстонии 2026
  const estonianHolidays2026 = [
    '2026-01-01', // New Year's Day
    '2026-02-24', // Independence Day
    '2026-04-17', // Good Friday
    '2026-04-19', // Easter Sunday
    '2026-05-01', // Spring Day
    '2026-05-28', // Pentecost
    '2026-06-23', // Victory Day
    '2026-06-24', // Midsummer Day
    '2026-08-20', // Restoration of Independence
    '2026-12-24', // Christmas Eve
    '2026-12-25', // Christmas Day
    '2026-12-26', // Boxing Day
  ];

  const isHoliday = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return estonianHolidays2026.includes(dateStr);
  };

  // Расчет часов для сотрудника за месяц
  const calculateUserHours = (userId: string) => {
    const days = getDaysInMonth();
    let totalHours = 0;
    let weekendHours = 0;
    let holidayHours = 0;

    days.forEach(date => {
      const schedule = getScheduleForUserAndDate(userId, date);
      if (schedule && schedule.type === ScheduleType.SHIFT) {
        const hours = parseShiftHours(schedule.shiftHours || '');
        if (hours > 0) {
          totalHours += hours;
          
          if (isWeekend(date)) {
            weekendHours += hours;
          }
          
          if (isHoliday(date)) {
            holidayHours += hours;
          }
        }
      }
    });

    // Норма рабочих часов в месяц (примерно 160 часов для 40-часовой недели)
    const workingDaysInMonth = days.filter(d => !isWeekend(d) && !isHoliday(d)).length;
    const standardHours = workingDaysInMonth * 8; // 8 часов в день
    const overtime = Math.max(0, totalHours - standardHours);

    return {
      totalHours: Math.max(0, totalHours).toFixed(1),
      overtime: Math.max(0, overtime).toFixed(1),
      weekendHours: Math.max(0, weekendHours).toFixed(1),
      holidayHours: Math.max(0, holidayHours).toFixed(1)
    };
  };

  // Экспорт в Excel (CSV формат)
  const exportToExcel = () => {
    const days = getDaysInMonth();
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Заголовок
    const headers = [
      t('schedule.employee') || 'Employee',
      ...days.map(d => d.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit' })),
      'Total Hours',
      'Overtime',
      'Weekend Hours',
      'Holiday Hours (x2)'
    ];
    csvContent += headers.join(',') + '\n';
    
    // Данные по сотрудникам
    filteredUsers.forEach(user => {
      const row = [user.name];
      
      days.forEach(date => {
        const schedule = getScheduleForUserAndDate(user._id, date);
        const content = getCellContent(schedule);
        row.push(content ? content.text : '');
      });
      
      const hours = calculateUserHours(user._id);
      row.push(hours.totalHours, hours.overtime, hours.weekendHours, hours.holidayHours);
      
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const monthName = currentMonth.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });
    link.setAttribute('download', `schedule_${monthName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const getWeekDayName = (date: Date) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[date.getDay()];
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const uniqueRoles = Array.from(new Set(users.map(u => u.role)));

  return (
    <div className="schedule-matrix">
      <div className="schedule-matrix__header">
        <h1 className="schedule-matrix__title">{t('schedule.title') || 'График смен'}</h1>
        
        <div className="schedule-matrix__controls">
          <div className="schedule-matrix__filter">
            <Filter size={16} />
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="schedule-matrix__filter-select"
            >
              <option value="all">{t('schedule.allRoles') || 'Все роли'}</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <Button variant="primary" onClick={exportToExcel} className="schedule-matrix__export-btn">
            <Download size={16} />
            {t('schedule.downloadReport') || 'Скачать отчет (Excel)'}
          </Button>
          
          <div className="schedule-matrix__month-nav">
            <Button variant="secondary" onClick={() => changeMonth(-1)}>
              ← {t('schedule.prev') || 'Пред.'}
            </Button>
            <span className="schedule-matrix__month-name">
              {currentMonth.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="secondary" onClick={() => changeMonth(1)}>
              {t('schedule.next') || 'След.'} →
            </Button>
          </div>
        </div>
      </div>

      <div className="schedule-matrix__table-wrapper">
        <table className="schedule-matrix__table">
          <thead>
            <tr>
              <th className="schedule-matrix__employee-header">{t('schedule.employee') || 'Сотрудник'}</th>
              {getDaysInMonth().map((date, index) => (
                <th 
                  key={index} 
                  className={`schedule-matrix__date-header ${isWeekend(date) ? 'weekend' : ''} ${isToday(date) ? 'today' : ''} ${isHoliday(date) ? 'holiday' : ''}`}
                >
                  <div className="schedule-matrix__date-cell">
                    <div className="schedule-matrix__weekday">{getWeekDayName(date)}</div>
                    <div className="schedule-matrix__day">{date.getDate()}</div>
                  </div>
                </th>
              ))}
              <th className="schedule-matrix__stats-header schedule-matrix__stats-header--total">
                {t('schedule.totalHours') || 'Total Hours'}
              </th>
              <th className="schedule-matrix__stats-header schedule-matrix__stats-header--overtime">
                {t('schedule.overtime') || 'Overtime'}
              </th>
              <th className="schedule-matrix__stats-header schedule-matrix__stats-header--weekend">
                {t('schedule.weekendHours') || 'Weekend Hours'}
              </th>
              <th className="schedule-matrix__stats-header schedule-matrix__stats-header--holiday">
                {t('schedule.holidayHours') || 'Holiday Hours (x2)'}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const userHours = calculateUserHours(user._id);
              return (
                <tr key={user._id}>
                  <td className="schedule-matrix__employee-cell">
                    <div className="schedule-matrix__employee-name">{user.name}</div>
                    <div className="schedule-matrix__employee-role">{user.role}</div>
                  </td>
                  {getDaysInMonth().map((date, index) => {
                    const schedule = getScheduleForUserAndDate(user._id, date);
                    const cellContent = getCellContent(schedule);
                    
                    return (
                      <td 
                        key={index}
                        className={`schedule-matrix__schedule-cell ${cellContent?.className || ''} ${isWeekend(date) ? 'weekend' : ''} ${isToday(date) ? 'today' : ''} ${isHoliday(date) ? 'holiday' : ''} ${canEdit ? 'clickable' : ''}`}
                        onClick={() => handleCellClick(date, user._id)}
                        title={canEdit ? 'Нажмите для назначения' : ''}
                      >
                        {cellContent && (
                          <div className="schedule-cell__content">
                            {cellContent.text}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="schedule-matrix__stats-cell schedule-matrix__stats-cell--total">
                    {userHours.totalHours}
                  </td>
                  <td className="schedule-matrix__stats-cell schedule-matrix__stats-cell--overtime">
                    {userHours.overtime}
                  </td>
                  <td className="schedule-matrix__stats-cell schedule-matrix__stats-cell--weekend">
                    {userHours.weekendHours}
                  </td>
                  <td className="schedule-matrix__stats-cell schedule-matrix__stats-cell--holiday">
                    {userHours.holidayHours}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={t('schedule.assignShift') || 'Назначить смену'}
      >
        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="form-group">
            <label>{t('schedule.entryType') || 'Тип записи'} *</label>
            <select
              name="type"
              value={formData.type}
              onChange={(e) => setFormData({ 
                ...formData, 
                type: e.target.value as ScheduleType,
                shiftHours: e.target.value === ScheduleType.SHIFT ? '09:00-18:00' : ''
              })}
              required
            >
              <option value={ScheduleType.SHIFT}>{t('schedule.type.shift') || 'Смена'}</option>
              <option value={ScheduleType.VACATION}>{t('schedule.type.vacation') || 'Отпуск'}</option>
              <option value={ScheduleType.SICK_LEAVE}>{t('schedule.type.sick_leave') || 'Больничный'}</option>
            </select>
          </div>

          {formData.type === ScheduleType.SHIFT && (
            <div className="form-group">
              <label>{t('schedule.shiftTime') || 'Время смены'}</label>
              <input
                type="text"
                name="shiftHours"
                value={formData.shiftHours}
                onChange={(e) => setFormData({ ...formData, shiftHours: e.target.value })}
                placeholder="09:00-18:00"
              />
            </div>
          )}

          <div className="form-group">
            <label>{t('schedule.startDate') || 'Дата начала'} *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('schedule.endDate') || 'Дата окончания'} *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('schedule.note') || 'Примечание'}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>
              {t('schedule.cancel') || 'Отмена'}
            </Button>
            <Button type="submit" variant="primary">
              {t('schedule.save') || 'Сохранить'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Schedule;
