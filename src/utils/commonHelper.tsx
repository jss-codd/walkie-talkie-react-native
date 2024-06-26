const maskInput = (input: string, show: number = 4) => {
    const last4Digits = input.slice(-Math.abs(show));
    return last4Digits.padStart(input.length, "*");
}

export { maskInput };