export function getWeekStart(date: Date): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - result.getDay()); // Start of week (Sunday)
    result.setHours(0, 0, 0, 0);
    return result;
}

export function getWeekEnd(date: Date): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - result.getDay() + 6); // End of week (Saturday)
    result.setHours(23, 59, 59, 999);
    return result;
}
