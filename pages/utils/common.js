export function get7DaysBefore(date){
    var date = date || new Date(),
        timestamp, newDate;
    if(!(date instanceof Date)){
        date = new Date(date.replace(/-/g, '/'));
    }
    timestamp = date.getTime();
    newDate = new Date(timestamp - 7 * 24 * 3600 * 1000);
    return [newDate.getFullYear(), formatNumber(newDate.getMonth() + 1), formatNumber(newDate.getDate())].join('-')
}

function formatNumber(n) {
    const number = Number(n)
    
    if (1<=number && number<=9) {
        return '0'+ String(number)
    } else {
        return String(number)
    }
}

export function isZBirthday(birthYear, year) {
    const isZBirthday = (Number(year) - Number(birthYear) + 1) % 10 === 0 ? true : false
    return isZBirthday
}