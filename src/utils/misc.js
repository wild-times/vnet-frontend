// add 0 to numbers below ten: 9 -> 09, 12 -> 12, assumes all numbers are positive
export const zeroPen = (num) => num < 10? `0${num.toString()}`: num.toString();
