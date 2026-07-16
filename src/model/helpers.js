// вспомогательные функции
let counter = 1;

export function genId(prefix = 'obj') {
  return `${prefix}-${counter++}`;
}

export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// имена для китов
const WHALE_NAMES = [
  'Пухляш', 'Кекс', 'Зефирка', 'Китуся', 'Морковка',
  'Булка', 'Сырник', 'Плюшка', 'Сплюшка', 'Волнуша',
  'Тыковка', 'Баклажан', 'Кабачок', 'Огурец', 'Помидор'
];

export function randomWhaleName() {
  return randomChoice(WHALE_NAMES);
}