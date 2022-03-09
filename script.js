const URL = 'https://api.mercadolibre.com';

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

async function updateCartTotalPrice(totalPrice, op){
  const cartTotalPrice = document.querySelector('.total-price');

  if(cartTotalPrice.textContent.toString() === ""){
    cartTotalPrice.innerText = totalPrice;
  }
  else{
    let newPrice = parseFloat(cartTotalPrice.innerText);
    if(op === '+')
      newPrice += await parseFloat(totalPrice);
    else
      newPrice -= await parseFloat(totalPrice);

    cartTotalPrice.innerText = newPrice ;
  }

  return cartTotalPrice;
}

// 2. Adicione o produto ao carrinho de compras
async function addItemsCart(sku) {
  const item = await (await fetch(`${URL}/items/${sku}`)).json();
  const { title, price } = item;
  const itemData = {
    sku,
    name: title,
    salePrice: price,
  };

  if(!localStorage.getItem(itemData.sku)){
    document.querySelector('.cart__items').appendChild(createCartItemElement(itemData));

    updateCartTotalPrice(price, '+');
  }

  localStorage.setItem(itemData.sku, JSON.stringify(itemData));
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  
  const addCartButton = createCustomElement('button', 'item__add', 'Adicionar ao carrinho!');
  addCartButton.addEventListener('click', () => {
    addItemsCart(sku);
  });
  section.appendChild(addCartButton);

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

// 3. Remova o item do carrinho de compras ao clicar nele
function cartItemClickListener(event, sku, salePrice) {
  event.target.remove();

  localStorage.removeItem(sku);

  updateCartTotalPrice(salePrice, '-');
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', (event) => 
    cartItemClickListener(event, sku, salePrice));
  return li;
}

//5. Some o valor total dos itens do carrinho de compras
function createCartTotalPrice(){
  const labelTotalPrice = document.createElement('span');
  labelTotalPrice.className = 'label-total-price';
  labelTotalPrice.innerText = 'Subtotal: R$ '

  const cart = document.querySelector('.cart');
  cart.insertBefore(labelTotalPrice, cart.childNodes[2]);

  const cartTotalPrice = document.createElement('span');
	cartTotalPrice.className = 'total-price';

  return cartTotalPrice;
}

//4. Carregue o carrinho de compras através do LocalStorage ao iniciar a página
function allItemsStorage() {
  let totalPrice = 0

  for(var i=0; i<localStorage.length; i++) {
    const key = localStorage.key(i);
    const pull = (JSON.parse(localStorage.getItem(key)));
    
    totalPrice += pull.salePrice;
    const itemData = {
      sku: pull.sku,
      name: pull.name,
      salePrice: pull.salePrice,
    };
    document.querySelector('.cart__items').appendChild(createCartItemElement(itemData));
  }

  updateCartTotalPrice(totalPrice);
}

//1. Crie uma listagem de produtos
async function getItems(query) {
  const itemsJson = await (await fetch(`${URL}/sites/MLB/search?q=${query}`)).json();
  const itemsResults = itemsJson.results;

  itemsResults.forEach(({ id, title, thumbnail }) => {
    const itemData = {
      sku: id,
      name: title,
      image: thumbnail,
    };
    document.querySelector('.items')
    .appendChild(createProductItemElement(itemData));
  });

  const cart = document.querySelector('.cart');
  cart.insertBefore(createCartTotalPrice(), cart.childNodes[3] );

  allItemsStorage();
}

window.onload = () => { 
  getItems('computador');

  //6. Crie um botão para limpar carrinho de compras
  const cleanCart = document.querySelector('.empty-cart');

  cleanCart.addEventListener('click', () => {
    const cartTotalPrice = document.querySelector('.total-price');
    cartTotalPrice.innerText = "0.00";
    
    document.querySelectorAll('.cart__item').forEach((item) => item.remove());
    
    localStorage.clear()
  });
};
