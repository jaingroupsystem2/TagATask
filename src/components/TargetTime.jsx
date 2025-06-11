import React, { useState, useRef, useEffect } from 'react';
import DateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import './tasklist.css';
import AccessAlarmOutlinedIcon from '@mui/icons-material/AccessAlarmOutlined';
import moment from 'moment';

function TargetTime({ dateTime, onDatetimeChange }) {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [hovering, setHovering] = useState(false);
    const dateTimePickerRef = useRef(null);

    const handleIconClick = () => {
        setIsPickerOpen(prev => !prev);
    };

    const handleClear = () => {
        onDatetimeChange(null);
        setIsPickerOpen(false);
    };

    const handleMouseEnter = () => setHovering(true);
    const handleMouseLeave = () => setHovering(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dateTimePickerRef.current && !dateTimePickerRef.current.contains(event.target)) {
                setIsPickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDateChange = (newDateTime) => {
        if (moment.isMoment(newDateTime)) {
            const formatted = newDateTime.format("DD-MM-YYYY HH:mm:ss"); // ✅ format for backend
            onDatetimeChange(formatted); // send this string to backend
        } else {
            onDatetimeChange(null);
        }
        setIsPickerOpen(false);
    };

    const getMomentValue = () => {
        if (!dateTime) return null;
        if (moment.isMoment(dateTime)) return dateTime;
        return moment(dateTime, "DD-MM-YYYY HH:mm:ss"); // ✅ safely parse string to moment
    };

    // Function to calculate delay if the dateTime is in the past
    const getDelayInDays = () => {
        if (!dateTime) return null;
        const targetMoment = getMomentValue();
        const now = moment();
        
        // If the dateTime is in the past, calculate the delay in days
        if (targetMoment.isBefore(now, 'day')) {
            const daysDiff = now.diff(targetMoment, 'days');
            return daysDiff;
        }
        return null;
    };

    const delayInDays = getDelayInDays();

    return (
        <div className="input-with-datetime">
            <div 
                className="clock-icon-wrapper" 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
            >
                <AccessAlarmOutlinedIcon
                    className={`clock-icon ${dateTime ? 'black-icon' : 'grey-icon'}`}
                    onClick={handleIconClick}
                    style={{ fontSize: 30 }}
                />
                {hovering && dateTime && (
                    <span className="hovered-datetime">{dateTime}</span>
                )}
            </div>
            {isPickerOpen && (
                <div ref={dateTimePickerRef} className="datetime-picker-wrapper">
                    <DateTime
                        value={getMomentValue()}
                        onChange={handleDateChange}
                        input={false}
                        closeOnSelect={false}
                    />
                    <button className="clear-button" onClick={handleClear}>Clear</button>
                </div>
            )}
            {/* Display delay if the date is in the past */}
            {delayInDays !== null && delayInDays > 0 && (
                <div className="delay-message">
                    {delayInDays} {delayInDays === 1 ? 'day' : 'days'} delay
                </div>
            )}
        </div>
    );
}

export default TargetTime;
