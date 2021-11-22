import { feature } from "./feature.js";
import { CookieUtil, ProductUtil } from "./utils.js";

function loadCart() { // extracted
  return JSON.parse(CookieUtil.get('ItemInCart')) || [];
}

const classPrefix = 'cart-item-';

const classes = {
  id: `${classPrefix}id`,
  name: `${classPrefix}name`,
  desc: `${classPrefix}desc`,
  quantity: `${classPrefix}quantity`,
  price: `${classPrefix}price`,
  subtotal: `${classPrefix}subtotal`,
  img: `${classPrefix}img`,
};

const ids = {
  totalPriceContainer: 'cart-total-price',
  totalPrice: `total-price`,
};

function createCartItemElement(product, quantity) { // added
  const element = document.createElement('tr');
  element.setAttribute('data-id', product.productId);
  element.setAttribute('class', 'cart-item');
  element.innerHTML = `
    <td class="${classes.id}">${product.productId}</td>
    <td class="${classes.img}"><img src="${product.img}" alt="${product.name}"/></td>
    <td class="${classes.name}">${product.productName}</td>
    <td class="${classes.desc}">${product.productDesc}</td>
    <td class="${classes.quantity}">${quantity}</td>
    <td class="${classes.price}">${feature.exchangeFormatted(product.productPrice)}</td>
    <td class="${classes.subtotal}">${feature.exchangeFormatted(product.productPrice * quantity)}</td>`;

  return element;
}

function extractElementsFromCartItemElement(element) { // added
  return {
    idElement: element.querySelector(`.${classes.id}`),
    nameElement: element.querySelector(`.${classes.name}`),
    descElement: element.querySelector(`.${classes.desc}`),
    quantityElement: element.querySelector(`.${classes.quantity}`),
    priceElement: element.querySelector(`.${classes.price}`),
    subtotalElement: element.querySelector(`.${classes.subtotal}`),
    imgElement: element.querySelector(`.${classes.img}`),
  };
}


export const cart = { // added
  items: loadCart(),

  getItemCount: function () { // updated
    return this.items.reduce((accumulator, cartItem) => accumulator + cartItem.quantity, 0);
  },

  addItem: function (productId, quantity) { // extracted
    const existingItem = this.items.find(cartItem => cartItem.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ productId, quantity });
    }
    this.save();

    if (!this.isMounted) {
      return;
    }

    const actualQuantity = existingItem ? existingItem.quantity : quantity;
    if (existingItem) {
      this.updateItemElement(productId, actualQuantity);
    } else {
      this.createItemElement(productId, actualQuantity);
    }

    this.createOrUpdateTotalPriceElement();
  },

  clear: function () { // updated
    this.items.length = 0;
    this.save();
    if (this.isMounted) {
      this.root.innerHTML = '';
      this.createOrUpdateTotalPriceElement();
    }
  },

  save: function () { // extracted
    CookieUtil.set('ItemInCart', JSON.stringify(cart.items), Date(9000));
  },

  getTotalPrice: function () { // added
    return this.items.reduce((accumulator, cartItem) => {
      const product = ProductUtil.findById(cartItem.productId);
      return accumulator + (product.productPrice * cartItem.quantity);
    }, 0);
  },

  //#region ViewCart related
  mount: function (root) { // added
    this.root = root;
    this.isMounted = true;
    this.render();
  },

  render: function () { // added
    this.root.innerHTML = '';
    this.createOrUpdateTotalPriceElement();
    this.items.forEach((cartItem) => {
      this.createItemElement(cartItem.productId, cartItem.quantity);
    });
    this.createOrUpdateTotalPriceElement();
  },

  createItemElement: function (productId, quantity) { // added
    const found = ProductUtil.findById(productId);
    const itemElement = createCartItemElement(found, quantity);
    const totalPriceElement = this.root.querySelector(`#${ids.totalPriceContainer}`);

    this.root.insertBefore(itemElement, totalPriceElement); // insert new element before total price
  },

  updateItemElement: function (productId, quantity) { // added
    const element = this.root.querySelector(`tr[data-id="${productId}"]`);
    const found = ProductUtil.findById(productId);

    const { quantityElement, subtotalElement } = extractElementsFromCartItemElement(element);
    quantityElement.textContent = quantity;
    subtotalElement.textContent = feature.exchangeFormatted(found.productPrice * quantity);
  },

  updateItemElementPriceRateAll: function () { // added
    const elements = this.root.querySelectorAll('tr[data-id]');

    elements.forEach((element) => {
      const productId = element.getAttribute('data-id');
      const found = ProductUtil.findById(productId);
      const price = found.productPrice;

      const { priceElement, subtotalElement, quantityElement } = extractElementsFromCartItemElement(element);
      const quantity = Number(quantityElement.textContent);
      const subtotal = price * quantity;
      priceElement.textContent = feature.exchangeFormatted(price);
      subtotalElement.textContent = feature.exchangeFormatted(subtotal);
    });

    this.createOrUpdateTotalPriceElement();
  },

  createOrUpdateTotalPriceElement: function () { // added
    const existing = this.root.querySelector(`#${ids.totalPriceContainer} #${ids.totalPrice}`);

    if (existing) {
      existing.textContent = feature.exchangeFormatted(this.getTotalPrice());
    } else {
      const totalPriceElement = document.createElement('tr');
      totalPriceElement.setAttribute('id', `${ids.totalPriceContainer}`);
      totalPriceElement.innerHTML = `
        <td colspan="6">Total Price:</td>
        <td id="${ids.totalPrice}" class="fw-bold">${feature.exchangeFormatted(this.getTotalPrice())}</td>`;
      this.root.append(totalPriceElement);
    }
  }
  //#endregion
}