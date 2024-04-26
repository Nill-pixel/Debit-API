export const generateVisaCreditCardNumber = (): string => {
  const prefix: string = '4'; // VISA credit card prefix
  const length: number = 16; // VISA credit card number length

  let creditCardNumber: string = prefix;

  for (let i: number = 0; i < length - 1; i++) {
    creditCardNumber += Math.floor(Math.random() * 10);
  }

  return creditCardNumber;
}