const texto = document.querySelector('input');
const btnInsert = document.querySelector('.divInsert button');
const btnDeleteAll = document.querySelector('.header button');
const centralUl = document.getElementById('teste');
const progressBar = document.querySelector('.progress-bar');
const nivelElement = document.getElementById('nivel');

let itensDB = [];
let xp = 0;
let level = parseInt(localStorage.getItem('level')) || 1;

const XP_TO_LEVEL_UP = 100;
const MAX_LEVEL = 10;
const TASK_TIMEOUT = 24 * 60 * 60 * 1000;

const xpPerDifficulty = {
  '1': 10,
  '2': 20,
  '3': 30
};

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
  
  if (!resultadoDificuldade || !['1', '2', '3'].includes(resultadoDificuldade)) {
    resultadoDificuldade = '1';
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
      backgroundColor = 'lightgreen';
      break;
  }

  const creationTimestamp = Date.now();

  const deadlineHours = parseInt(prompt('Digite o prazo da tarefa em horas:')) || 0;
  const deadlineMinutes = parseInt(prompt('Digite o prazo da tarefa em minutos:')) || 0;
  const deadlineTimestamp = creationTimestamp + (deadlineHours * 60 * 60 * 1000) + (deadlineMinutes * 60 * 1000);

  itensDB.push({ 'item': texto.value, 'status': '', 'backgroundColor': backgroundColor, 'difficulty': resultadoDificuldade, 'creationTimestamp': creationTimestamp, 'deadlineTimestamp': deadlineTimestamp });
  updateDB();

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
      checkTaskTimeout(item);
    }
  }, 1000);
}

function updateDB() {
  localStorage.setItem('todolist', JSON.stringify(itensDB));
  localStorage.setItem('level', level);
  loadItens();
}

function loadItens() {
  centralUl.innerHTML = "";
  itensDB = JSON.parse(localStorage.getItem('todolist')) || [];
  itensDB.forEach((item, i) => {
    insertItemTela(item, i);
    if (item.status !== 'checked') {
      startCountdown(item, i);
    }
  });
}

function insertItemTela(item, index) {
  const li = document.createElement('li');
  const backgroundColor = item.backgroundColor || '';

  li.innerHTML = `
    <div class="divLi" style="background-color: ${backgroundColor}">
      <input type="checkbox" ${item.status} onchange="done(this, ${index});" />
      <span>${item.item}</span>
      <button onclick="removeItem(${index})"><i class='bx bx-trash'></i></button>
      <div class="countdown" id="countdown-${index}"></div>
    </div>
  `;

  centralUl.appendChild(li);
  texto.value = '';
}

function done(chk, i) {
  if (chk.checked) {
    itensDB[i].status = 'checked'; 
    const difficultyXP = xpPerDifficulty[itensDB[i].difficulty];
    xp += difficultyXP;
    if (xp >= XP_TO_LEVEL_UP) {
      level++;
      xp = 0;
      nivelElement.textContent = level;
      alert(`Parabéns! Você subiu para o nível ${level}!`);
    }
    updateProgressBar();
  } else {
    itensDB[i].status = ''; 
    updateProgressBar();
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
    const difficultyXP = xpPerDifficulty[item.difficulty];
    xp -= difficultyXP;
    if (xp < 0) {
      xp = 0;
    }
    if (level > 1) {
      level--;
    }
    nivelElement.textContent = level;
    updateProgressBar();
    alert(`Você não concluiu a tarefa "${item.item}" a tempo! Seu XP foi reduzido e você desceu para o nível ${level}.`);
  }
}

function updateProgressBar() {
  const percentage = (xp / XP_TO_LEVEL_UP) * 100;
  progressBar.style.width = `${percentage}%`;
}

loadItens();
updateProgressBar();
