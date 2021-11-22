function loadRate() { // extracted
  return localStorage.getItem('Rate') || '฿';
}

function convertTHBToUSD(thb) { // extracted
  return thb / 30;
}


export const feature = { // added
  rate: loadRate(),

  setRate: function (currency) { // extracted
    this.rate = currency;
    this.saveRate();
  },

  exchangeFormatted: function (productPrice) { // updated
    if (this.rate == '฿') {
      return productPrice.toLocaleString('en-US') + '฿';
    } else if (this.rate == '$') {
      const usdString = convertTHBToUSD(productPrice).toFixed(2);
      return '$' + parseFloat(usdString).toLocaleString('en-US');
    }
  },

  saveRate: function () { // extracted
    localStorage.setItem('Rate', this.rate);
  },
}