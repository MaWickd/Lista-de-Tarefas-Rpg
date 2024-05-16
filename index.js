const texto = document.querySelector('input');
const btnInsert = document.querySelector('.divInsert button');
const btnDeleteAll = document.querySelector('.header button');
const ul = document.querySelector('ul');
const progressBar = document.querySelector('.progress-bar');
const nivelElement = document.getElementById('nivel');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
var menuItem = document.querySelectorALL('.item-menu')

function selectionLink(){
  menuItem.forEach((item)=>
  item.classList.remove('ativo')
  )
  this.classList.add('ativo')
}

menuItem.forEach((item)=>
  item.addEventListener('click', select)
)

let itensDB = [];
let xp = 0;
let level = parseInt(localStorage.getItem('level')) || 1; // Carrega o nível salvo no armazenamento local ou define como 1 se não houver nenhum

const XP_TO_LEVEL_UP = 100;
const MAX_LEVEL = 10; // Define o nível máximo
const TASK_TIMEOUT = 24 * 60 * 60 * 1000; // Tempo limite de 24 horas em milissegundos

const xpPerDifficulty = {
  '1': 10, // Fácil
  '2': 20, // Médio
  '3': 30  // Difícil
};

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

btnDeleteAll.onclick = () => {
  itensDB = [];
  updateDB();
}

texto.addEventListener('keypress', e => {
  if (e.key == 'Enter' && texto.value != '') {
    setItemDB();
  }
})

btnInsert.onclick = () => {
  if (texto.value != '') {
    setItemDB();
  }
}

function setItemDB() {
  if (itensDB.length >= 20) {
    alert('Limite máximo de 20 itens atingido!');
    return;
  }

  let resultadoDificuldade = prompt('Digite a dificuldade (1 = fácil, 2 = médio, 3 = difícil)');
  
  // Se o usuário não inserir nada ou inserir um valor inválido, consideramos como "fácil"
  if (!resultadoDificuldade || !['1', '2', '3'].includes(resultadoDificuldade)) {
    resultadoDificuldade = '1'; // Considera como fácil (código 1)
  }

  let backgroundColor;

  switch (resultadoDificuldade) {
    case '1':
      backgroundColor = 'lightgreen';
      break;
    case '2':
      backgroundColor = 'lightyellow';
      break;
    case '3':
      backgroundColor = 'lightcoral';
      break;
    default:
      backgroundColor = 'lightgreen'; // Se o valor especificado não for válido, considera como fácil (1)
      break;
  }

  const creationTimestamp = Date.now(); // Armazena o timestamp de criação da tarefa

  // Obter o prazo da tarefa em horas e minutos
  const deadlineHours = parseInt(prompt('Digite o prazo da tarefa em horas:')) || 0;
  const deadlineMinutes = parseInt(prompt('Digite o prazo da tarefa em minutos:')) || 0;
  const deadlineTimestamp = creationTimestamp + (deadlineHours * 60 * 60 * 1000) + (deadlineMinutes * 60 * 1000);

  itensDB.push({ 'item': texto.value, 'status': '', 'backgroundColor': backgroundColor, 'difficulty': resultadoDificuldade, 'creationTimestamp': creationTimestamp, 'deadlineTimestamp': deadlineTimestamp });
  updateDB();

  // Chamamos a função startCountdown para iniciar o temporizador
  startCountdown(itensDB[itensDB.length - 1], itensDB.length - 1);
}

function startCountdown(item, index) {
  const countdownElement = document.getElementById(`countdown-${index}`);
  const deadlineTimestamp = item.deadlineTimestamp;
  const intervalId = setInterval(() => {
    const now = Date.now();
    const remainingTime = deadlineTimestamp - now;
    if (remainingTime > 0) {
      const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      countdownElement.textContent = `Tempo restante: ${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`;
    } else {
      clearInterval(intervalId);
      countdownElement.textContent = 'Tempo esgotado!';
      checkTaskTimeout(item); // Verifica se o tempo da tarefa esgotou
    }
  }, 1000);
}

function updateDB() {
  localStorage.setItem('todolist', JSON.stringify(itensDB));
  localStorage.setItem('level', level); // Salva o nível no armazenamento local
  localStorage.setItem('xp', xp); // Salva o XP no armazenamento local
  loadItens();
}

function loadItens() {
  ul.innerHTML = "";
  itensDB = JSON.parse(localStorage.getItem('todolist')) || [];
  itensDB.forEach((item, i) => {
    insertItemTela(item.item, item.status, i);
    if (item.status !== 'checked') {
      startCountdown(item, i); // Inicia o contador regressivo apenas para tarefas não concluídas
    }
  });
}

// Função para carregar os itens do armazenamento local e atualizar a interface
function loadItemsAndUpdateUI() {
  loadItems();
  updateProgressBar();
  updateLevel(); // Adicionamos essa função para garantir que o nível seja atualizado ao carregar a página
}

// Função para atualizar o nível com base no XP acumulado
function updateLevel() {
  level = Math.floor(xp / XP_TO_LEVEL_UP) + 1; // Calcula o nível com base no XP
  if (level > MAX_LEVEL) {
    level = MAX_LEVEL; // Garante que o nível não ultrapasse o nível máximo definido
  }
  nivelElement.textContent = level; // Atualiza o número do nível na interface
}

function insertItemTela(text, status, i) {
  const li = document.createElement('li');
  const backgroundColor = itensDB[i].backgroundColor ? itensDB[i].backgroundColor : '';

  li.innerHTML = `
    <div class="divLi" style="background-color: ${backgroundColor}">
      <input type="checkbox" ${status} data-i=${i} onchange="done(this, ${i});" />
      <span data-si=${i}>${text}</span>
      <button onclick="removeItem(${i})" data-i=${i}><i class='bx bx-trash'></i></button>
      <div class="countdown" id="countdown-${i}"></div>
    </div>
  `;

  ul.appendChild(li);

  if (status) {
    document.querySelector(`[data-si="${i}"]`).classList.add('line-through');
  } else {
    document.querySelector(`[data-si="${i}"]`).classList.remove('line-through');
  }

  texto.value = '';
}

function done(chk, i) {
  if (chk.checked) {
    itensDB[i].status = 'checked'; 
    const difficultyXP = xpPerDifficulty[itensDB[i].difficulty]; // Obtém o XP da dificuldade da tarefa concluída
    xp += difficultyXP;
    if (xp >= XP_TO_LEVEL_UP) {
      level++;
      xp = 0;
      nivelElement.textContent = level; // Atualiza o número do nível
      alert(`Parabéns! Você subiu para o nível ${level}!`);
    }
    updateProgressBar();
    updateLevel(); // Atualiza o nível após modificar o XP
  } else {
    itensDB[i].status = ''; 
    updateProgressBar(); // Atualiza a barra de progresso mesmo se a tarefa for desmarcada
  }

  updateDB();
}

function removeItem(i) {
  itensDB.splice(i, 1);
  updateDB();
}

function checkTaskTimeout(item) {
  const now = Date.now();
  const creationTimestamp = item.creationTimestamp;
  if (now - creationTimestamp >= TASK_TIMEOUT && item.status !== 'checked') {
    // Se o tempo limite for excedido e a tarefa não estiver concluída
    const difficultyXP = xpPerDifficulty[item.difficulty]; // Obtém o XP da dificuldade da tarefa
    xp -= difficultyXP; // Reduz o XP
    if (xp < 0) {
      xp = 0; // Garante que o XP não seja negativo
    }
    if (level > 1) {
      level--; // Reduzir o nível se não estiver no nível 1
    }
    nivelElement.textContent = level; // Atualiza o número do nível na interface
    updateProgressBar(); // Atualiza a barra de progresso
    alert(`Você não concluiu a tarefa "${item.item}" a tempo! Seu XP foi reduzido e você desceu para o nível ${level}.`);
  }
}

function updateProgressBar() {
  const percentage = (xp / XP_TO_LEVEL_UP) * 100;
  progressBar.style.width = `${percentage}%`;
}

loadItens();
updateProgressBar();
