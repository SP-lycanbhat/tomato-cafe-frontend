export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
};

export const formatDate = (dateString) => {
    if (!dateString) return '-';
    let dateStr = dateString;
    // If it's a string from MongoDB/FastAPI and has no timezone, append Z for UTC
    if (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) {
        dateStr += 'Z';
    }
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
    });
};

export const formatTime = (dateString) => {
    if (!dateString) return '-';
    let dateStr = dateString;
    if (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) {
        dateStr += 'Z';
    }
    return new Date(dateStr).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    });
};

export const getColorForStatus = (status) => {
    const colors = {
        draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        cancelled: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        locked: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
};
