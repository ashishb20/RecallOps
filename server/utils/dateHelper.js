//  Helper function for date calculator

export const getToday = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return today;
};

export const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0,0,0,0);
    return tomorrow;
}

export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    result.setHours(0,0,0,0);
    return result;
}

//  Check if two dates are the same day 
export const isSameDay = (date1, date2) => {
    return (
        date1.getFullYear() == date2.getFullYear() && 
        date1.getMonth() === date2.getMonth() && 
        date1.getDate() === date2.getDate()
    );
};

//  check if date is today 
export const isToday = (date) => {
    return isSameDay(date, getToday());
};

// check if a date is in the past 
export const isPast = (date) => {
    const today = getToday();
    return date < today ;
};
// check if date is in future 
export const isFuture = (date) => {
    const today = getToday();
    return date > today ;
};

// Get date range for today's reviews
export const getTodayRange = () => {
    const start = getToday();
    const end = getTomorrow() ;
    return { start , end };
};

// calculate next review date based on current stage
/* Stage 0 (New)         -> Review in 1 day  -> stage 1
   stage 1 (Day 1 done ) -> Review in 4 days -> stage 2
   Stage 2 (Day 4 done)  -> Review in 7 day  -> stage 3
   stage 3 (Completed ) -> No more reviews
*/
export const calculateNextReviewDate = (currentStage) => {
    const today = getToday();
    switch (currentStage) {
        case 0 :
            return addDays(today, 1);
        case 1 :
            return addDays(today, 4);
        case 2:
            return addDays(today, 7);
        case 3:
            return null;
        default:
            return addDays(today, 1);
    }
};

// Get number of days until x date 
export const getDaysUntil = (futureDate) => {
    const today = getToday();
    const diffTime = futureDate - today;
    const diffDays = Math.ceil(diffTime / ( 1000*60*60*24));
    return diffDays;
};

// Format date for display 
// Example "Jan 30, 2026"

export const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
};

// Stage label for display
export const getStageLabel = (stage) => {
    const labels = {
        0: 'New',
        1: 'Review in 1 days',
        2: 'Review in 4 days',
        3: 'Completed'
    };
    return labels[stage] || 'Unknown';
};