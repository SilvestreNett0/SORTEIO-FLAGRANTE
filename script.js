function generateAgentInputs() {
  const container = document.getElementById('agentInputs');
  container.innerHTML = '';
  const count = parseInt(document.getElementById('agentCount').value);
  if (!count || count < 1) return;

  for (let i = 1; i <= count; i++) {
    const div = document.createElement('div');
    div.className = "w-full";
    div.innerHTML = `
      <label class="block text-blue-700 font-medium">✍️ Escriv\u00e3 Nº ${i}</label>
      <input type="text" class="w-full border rounded-lg p-3 text-lg" id="agent-${i}" placeholder="Digite o nome da escriv\u00e3 ${i}" />
    `;
    container.appendChild(div);
  }

  const clearBtn = document.createElement('button');
  clearBtn.textContent = '🧹 Limpar Tudo';
  clearBtn.className = 'mt-4 px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 w-full sm:w-auto';
  clearBtn.onclick = () => {
    document.getElementById('agentCount').value = '';
    container.innerHTML = '';
    document.getElementById('results').innerHTML = '';
    document.querySelectorAll('.procedure-checkbox').forEach(cb => cb.checked = false);
  };
  container.appendChild(clearBtn);
}

function drawAssignments() {
  const agentCount = parseInt(document.getElementById('agentCount').value);
  const resultsDiv = document.getElementById('results');
  const procedureCheckboxes = document.querySelectorAll('.procedure-checkbox:checked');

  if (!agentCount || agentCount < 1) {
    alert('Selecione a quantidade de escrivães.');
    return;
  }

  let agents = [];
  for (let i = 1; i <= agentCount; i++) {
    const name = document.getElementById(`agent-${i}`).value.trim();
    if (!name) {
      alert(`Preencha o nome da Escrivã Nº ${i}`);
      return;
    }
    agents.push(name);
  }

  const duplicates = agents.filter((item, index) => agents.indexOf(item) !== index);
  if (duplicates.length > 0) {
    alert(`Os seguintes nomes estão duplicados: ${[...new Set(duplicates)].join(', ')}`);
    return;
  }

  if (procedureCheckboxes.length === 0) {
    alert('Selecione ao menos um procedimento.');
    return;
  }

  let agentMap = {};
  agents.forEach(agent => agentMap[agent] = []);

  for (let checkbox of procedureCheckboxes) {
    const type = checkbox.value;
    let tasks = [];
    for (let i = 1; i <= agentCount; i++) {
      tasks.push(`${i}\u00ba ${type}`);
    }

    let shuffledAgents = [...agents];
    for (let i = shuffledAgents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledAgents[i], shuffledAgents[j]] = [shuffledAgents[j], shuffledAgents[i]];
    }

    for (let i = 0; i < tasks.length; i++) {
      agentMap[shuffledAgents[i]].push(tasks[i]);
    }
  }

  let html = `
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-blue-500">Resultado do Sorteio</h2>
    </div>
    <div class="flex flex-col items-center gap-6 w-full px-4">
  `;

  for (const [agent, tasks] of Object.entries(agentMap)) {
    html += `
      <div class="p-4 rounded-xl shadow-md border w-full max-w-md" style="background-color: var(--result-bg); border-color: var(--border);">
        <h3 class="font-semibold text-lg text-blue-400 mb-2 text-center uppercase">${agent}</h3>
        <ul class="list-disc list-inside text-gray-200">
    `;
    for (const t of tasks) {
      html += `<li>${t}</li>`;
    }
    html += '</ul></div>';
  }

  html += '</div>';
  resultsDiv.innerHTML = html;
}
