const maskInput = (input: string, show: number = 4) => {
    const last4Digits = input.slice(-Math.abs(show));
    return last4Digits.padStart(input.length, "*");
}

const inputSubStr = (input: string, show: number = 12) => {
    const res = input.slice(0, show);
    return res + (input.length > res.length ? '...' : '');
}

export { maskInput, inputSubStr };