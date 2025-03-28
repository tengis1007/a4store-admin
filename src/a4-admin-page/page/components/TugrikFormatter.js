const TugrikFormatter = ({ amount }) => {
    const formattedAmount = new Intl.NumberFormat("mn-MN", {
      style: "decimal", // Use "decimal" to avoid default currency formatting
      minimumFractionDigits: 0, // No decimals
    }).format(amount);
  
    return {formattedAmount};
  };
  
  export default TugrikFormatter;
  