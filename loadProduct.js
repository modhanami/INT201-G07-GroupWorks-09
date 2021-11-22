//#region import
import { products } from "./products.js";
import { feature } from "./feature.js"
import { cart } from "./cart.js";
import { ProductUtil } from "./utils.js";
//#endregion

//#region global variables
const root = document.querySelector("#items");
const searchBtn = document.querySelector("#btn");
const toggleSearchBtn = document.querySelector("#search");
const searchPanel = document.querySelector("#input");
const cartItemCount = document.querySelector("#cart-item-count");
const currencyRateBtn = document.querySelector("#currency-rate");
const currencyIcon = document.querySelector("#rate");
const clearBtn = document.querySelector('#cart-clear-icon');
const cartItemContainer = document.querySelector("#cart-item-container");
const cartIcon = document.querySelector("#cart-icon");

const close = document.querySelector(".close")
const modal = document.getElementById("myModal")

let isSearching = false;
//#endregion

//#region init
renderProducts(products, root);
cart.mount(cartItemContainer);
currencyIcon.textContent = feature.rate === '฿' ? '$' : '฿';
cartItemCount.textContent = cart.getItemCount(); // updated
//#endregion

//#region event listeners
cartIcon.addEventListener('click', () => {
  modal.style.display = 'block';
});

close.addEventListener('click', () => {
  modal.style.display = "none";
});

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});


currencyRateBtn.addEventListener('click', () => { // updated
  switchRate();
  updateProductElementPriceRateAll(root);
  cart.updateItemElementPriceRateAll();
});

function switchRate() { // extracted
  if (feature.rate == '$') {
    feature.setRate('฿');
    currencyIcon.textContent = '$';
  } else if (feature.rate == '฿') {
    feature.setRate('$');
    currencyIcon.textContent = '฿';
  }
}

function updateProductElementPriceRateAll(root) { // added
  root.childNodes.forEach(child => {
    const productId = child.getAttribute('data-id');
    const product = ProductUtil.findById(productId);
    const priceElement = child.querySelector('#productPrice');
    priceElement.textContent = formatPrice(product.productPrice);
  });
}

function formatPrice(price) { // extracted
  return `ราคา : ${feature.exchangeFormatted(price)}`;
}


toggleSearchBtn.addEventListener('click', () => {
  if (isSearching) {
    searchPanel.setAttribute('class', 'd-none');
  }
  else {
    searchPanel.setAttribute('class', ' ');
  }
  isSearching = !isSearching;
});


searchBtn.addEventListener('click', () => { // updated
  const input = document.querySelector("#input_txt").value;
  const filteredProducts = ProductUtil.findManyByName(input);
  const filteredIds = filteredProducts.map((product) => product.productId);

  filterProductElementsByIds(filteredIds, root);
});

function filterProductElementsByIds(productIds, root) { // added
  root.childNodes.forEach(child => {
    const productId = child.getAttribute('data-id');
    if (productIds.includes(productId)) {
      child.setAttribute("style", "display:block");
    } else {
      child.setAttribute("style", "display:none");
    }
  });
}


clearBtn.addEventListener('click', () => { // updated
  if (confirm('Clear all items in the cart?')) {
    cart.clear();
    cartItemCount.textContent = cart.getItemCount();
  }
});
//#endregion

//#region rendering
function renderProducts(products, root) { // updated
  root.innerHTML = '';

  products.forEach(product => {
    const productElement = createProductElement(product);
    root.append(productElement);
  });
}

function createProductElement(product) { // extracted
  const itemContainer = document.createElement("div");
  itemContainer.setAttribute("class", "card mb-4 col-12 col-sm-6 col-md-4 col-lg-3 shadow-sm border-0");
  itemContainer.setAttribute("data-id", product.productId); // added

  const image = document.createElement("img");
  image.setAttribute("class", "card-img-top px-4");
  image.src = product.img;

  const body = document.createElement("div");
  body.setAttribute("class", "card-body");

  const title = document.createElement("h5");
  title.setAttribute("class", "card-title");
  title.textContent = product.productName;

  const id = document.createElement("p");
  id.setAttribute("class", "card-subtitle text-muted");
  id.textContent = `Product ID : ${product.productId}`;

  const details = document.createElement("p");
  details.setAttribute("class", "card-text mt-2");
  details.textContent = product.productDesc;

  const br = document.createElement("br");

  const stock = document.createElement("span");
  stock.setAttribute("class", "text-muted");
  stock.textContent = `Stock : ${product.stock}`;

  const price = document.createElement("p");
  price.setAttribute("class", "card-text fw-bold");
  price.setAttribute("id", 'productPrice'); // added
  price.textContent = formatPrice(product.productPrice);

  const addToCartBtn = document.createElement("button");
  addToCartBtn.setAttribute('class', "btn btn-primary btn-add w-100");
  addToCartBtn.innerHTML = "Add to cart";

  addToCartBtn.addEventListener("click", function () { // updated
    const productId = product.productId;
    cart.addItem(productId, 1);
    cartItemCount.textContent = cart.getItemCount();
    alert(`${product.productName} added!`);
  });

  details.append(br);
  details.append(stock);
  body.append(title, id, details, price, addToCartBtn);
  itemContainer.append(image, body);

  return itemContainer;
}
//#endregion