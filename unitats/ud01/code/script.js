const valorElement = document.querySelector('#valor');
const botoElement = document.querySelector('#incrementar');

let valor = 0;

botoElement.addEventListener('click', () => {
  valor++;
  valorElement.textContent = valor;
  console.log('Valor actual:', valor);
});