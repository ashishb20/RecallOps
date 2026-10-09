import { useState, useEffect, useRef } from "react";

// Pomodoro style timer
const Timer = ({ onTimerComplete }) => {
    const [time, setTime] = useState(25 * 60);
    const [totalTime, setTotalTime] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [customMinutes, setCustomMinutes] = useState('');
    const intervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isRunning || time <= 0) return;
        intervalRef.current = setInterval(() => {
            setTime((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    setIsRunning(false);
                    if (onTimerComplete) onTimerComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [isRunning, onTimerComplete]);

    // Format time display 
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleCustomMinutes = (e) => {
        const value = e.target.value;

        if (value === '' || /^\d+$/.test(value)) {
            setCustomMinutes(value);
        }
    };

    const setPresetTime = (minutes) => {
        const seconds = minutes * 60;
        setTime(seconds);
        setTotalTime(seconds);
        setIsRunning(false);
    };

    const applyCustomTime = () => {
        const minutes = parseInt(customMinutes, 10);
        // Strict validation: 1-180 minutes only
        if (Number.isFinite(minutes) && minutes >= 1 && minutes <= 180) {
            const seconds = minutes * 60;
            setTime(seconds);
            setTotalTime(seconds);
            setIsRunning(false);
            setCustomMinutes('');
        } else {
            // Invalid input : clear it
            setCustomMinutes('');
        }
    };
    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTime(25 * 60);
        setTotalTime(25 * 60);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-teal-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                    <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Focus Timer
                </h3>
                {time === 0 && (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        complete
                    </span>
                )}
            </div>
            {/* Timer Display */}

            <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-800 mb-2 font-mono">
                    {formatTime(time)}
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-1000 ease-in-out"
                        style={{ width: `${((totalTime - time) / totalTime) * 100}%` }}
                    >
                    </div>
                </div>
            </div>
            {/* Controls */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={toggleTimer}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${isRunning
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
                        }`}
                    disabled={time === 0}
                >
                    {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={resetTimer}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700 transition-all duration-200"
                >
                    Reset
                </button>
            </div>
            {/* Present Time */}

            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Quick Presets:</p>
                <div className="flex gap-2 flex-wrap">
                    {[5, 10, 15, 25, 45].map((mins) => (
                        <button
                            key={mins}
                            onClick={() => setPresetTime(mins)}
                            className="px-3 py-1 text-sm bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-all duration-200 border border-teal-200"
                            disabled={isRunning}
                        >
                            {mins}
                        </button>
                    ))}
                </div>
            </div>
            {/* Custom time input  */}
            <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Custom Time (1-180 min):</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={customMinutes}
                        onChange={handleCustomMinutes}
                        onKeyUp={(e) => {
                            if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        placeholder="Minutes"
                        maxLength="3"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        disabled={isRunning}
                    />
                    <button
                        onClick={applyCustomTime}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-all duration-200"
                        disabled={isRunning || !customMinutes}
                    >
                        Set
                    </button>
                </div>
            </div>

        </div>
    )
}

export default Timer;