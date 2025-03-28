const TugrikFormatter = (amount) => {
    if (amount === null || amount === undefined) return "-";
  
    const formattedAmount = new Intl.NumberFormat("mn-MN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount);
  
    return `${formattedAmount}`;
  };
  
  export default TugrikFormatter;
  