export const generateExpirationDate = () => {
  const today = new Date()
  const expiryYear = 5
  const expiryDate = new Date(today.getFullYear() + expiryYear, today.getMonth(), today.getDate())
  return expiryDate
}
