import React, { useState, useEffect } from 'react';

const HistoryCalendarWidget = () => {
    const [history, setHistory] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('http://localhost:8000/history');
                if (!res.ok) throw new Error("Backend error");
                const data = await res.json();
                setHistory(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Failed to fetch history", e);
                setHistory([]);
            }
        };
        fetchHistory();
    }, []);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = [];
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        // Fill empty days at start
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 border border-transparent rounded-lg"></div>);
        }

        // Fill actual days
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isStudied = history.includes(dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            days.push(
                <div
                    key={day}
                    className={`h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all relative ${isStudied
                            ? 'bg-yellow-400 text-gray-900 shadow-sm z-10'
                            : 'text-gray-400 hover:bg-gray-50'
                        } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
                >
                    {day}
                    {isStudied && <span className="absolute bottom-1 w-1 h-1 bg-gray-900 rounded-full"></span>}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="card-premium p-4 md:p-6 bg-white w-full">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-gray-800">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h4>
                <div className="flex gap-1">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-400 text-xs">←</button>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-400 text-xs">→</button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Streak</span>
                    <span className="text-xl font-black text-gray-900">{history.length} <span className="text-xs text-gray-400 font-medium">days</span></span>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-50 text-xl flex items-center justify-center">🔥</div>
            </div>
        </div>
    );
};

export default HistoryCalendarWidget;
