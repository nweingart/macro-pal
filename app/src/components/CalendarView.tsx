import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { toISODate } from '../utils/date';

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  markedDates: Set<string>;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Add padding for days before first of month
  for (let i = 0; i < firstDay.getDay(); i++) {
    const date = new Date(year, month, -firstDay.getDay() + i + 1);
    days.push(date);
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add padding for days after last of month
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

export function CalendarView({ selectedDate, onSelectDate, markedDates }: CalendarViewProps) {
  const { colors, radius, shadows } = useTheme();
  const [viewDate, setViewDate] = React.useState(new Date(selectedDate));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getDaysInMonth(year, month);
  const today = new Date();

  const goToPreviousMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === month;
  const isToday = (date: Date) => toISODate(date) === toISODate(today);
  const isSelected = (date: Date) => toISODate(date) === toISODate(selectedDate);
  const hasLog = (date: Date) => markedDates.has(toISODate(date));

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: radius.md }, shadows.small]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={[styles.navButtonText, { color: colors.primary }]}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={[styles.monthYear, { color: colors.text }]}>
          {MONTHS[month]} {year}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={[styles.navButtonText, { color: colors.primary }]}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {DAYS.map((day) => (
          <Text key={day} style={[styles.weekDay, { color: colors.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dayCell}
            onPress={() => onSelectDate(date)}
          >
            <View
              style={[
                styles.dayInner,
                isSelected(date) && [styles.selectedDay, { backgroundColor: colors.primary }],
                isToday(date) && !isSelected(date) && [styles.todayDay, { borderColor: colors.primary }],
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: colors.text },
                  !isCurrentMonth(date) && { color: colors.textLight },
                  isSelected(date) && { color: colors.white, fontWeight: '600' },
                ]}
              >
                {date.getDate()}
              </Text>
            </View>
            {hasLog(date) && isCurrentMonth(date) && (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isSelected(date) ? colors.primary : colors.primary },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  monthYear: {
    fontSize: 17,
    fontWeight: '600',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInner: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  todayDay: {
    borderWidth: 2,
  },
  selectedDay: {
    // backgroundColor applied inline
  },
  dayText: {
    fontSize: 14,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
