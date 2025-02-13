import { useState } from 'react';
import Header from '../components/Header/Header';
import WeeklyCalendar from '../components/WeeklyCalendar/WeeklyCalendar';
import TimeSelector from '../components/TimeSelector/TimeSelector';
import '../styles/Reservation.styles.css';

interface ReservationPageProps {
  consultMethod: 'offline' | 'online';
}

export default function ReservationPage({ consultMethod }: ReservationPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const pageTitle = consultMethod === 'offline' 
    ? '대면 컨설팅 예약하기' 
    : '비대면 컨설팅 예약하기';

  // 예약된 시간들 (날짜별로 구성)
  const bookedTimesByDate: Record<string, string[]> = {
    '2025-02-15': ['13:00', '15:30', '16:00'],
    '2025-02-16': ['10:00', '11:00', '13:00', '14:00']
  };

  const formatSelectedDateTime = () => {
    if (!selectedDate || !selectedTime) return '';
    
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const day = days[selectedDate.getDay()];
    
    return `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 (${day}) ${selectedTime}`;
  };

  return (
    <div className="reservation-container">
      <Header title={pageTitle} />
      
      <WeeklyCalendar 
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        bookedTimesByDate={bookedTimesByDate}
      />
      
      <TimeSelector
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onTimeSelect={setSelectedTime}
        bookedTimes={selectedDate 
          ? bookedTimesByDate[`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`] || [] 
          : []
        }
      />

      {selectedDate && selectedTime && (
        <div className="selected-datetime">
          <img src="/icons/calendar.svg" alt="calendar" />
          {formatSelectedDateTime()}
        </div>
      )}

      <footer className="reservation-footer">
        <button 
          className={`payment-button ${!(selectedDate && selectedTime) ? 'disabled' : ''}`}
          disabled={!(selectedDate && selectedTime)}
        >
          20,000원 결제하기
        </button>
      </footer>
    </div>
  );
}
