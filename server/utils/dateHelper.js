export const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

export const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
};

export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    result.setHours(0, 0, 0, 0);
    return result;
};

export const getDaysUntil = (futureDate) => {
    const today = getToday();
    const diffTime = futureDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
};