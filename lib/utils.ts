export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '€0.00'; // Or return an empty string or placeholder
  }

  const formatter = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return '-'; // Return a placeholder if date is null or undefined
  }
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
    }
    
    // Format as '7 Maart'
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      // Optionally add year: year: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return 'Ongeldige datum'; // Return error placeholder
  }
} 