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

  if (!agentCount || agentCount < 2) {
    alert('Selecione ao menos dois escrivães.');
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

  const procedures = Array.from(procedureCheckboxes).map(cb => cb.value);
  if (procedures.length === 0) {
    alert('Selecione ao menos um procedimento.');
    return;
  }

  const agentMap = {};
  const ordemUso = {}; // Ex: { 'THESSA': { '1º': 1, '2º': 2 } }
  agents.forEach(agent => {
    agentMap[agent] = [];
    ordemUso[agent] = {};
  });

  const maxPorOrdem = Math.ceil(procedures.length / agents.length);

  for (const proc of procedures) {
    const ordens = agents.map((_, i) => `${i + 1}º`);
    const ordensSorteadas = [...ordens].sort(() => Math.random() - 0.5);
    const agentesSorteados = [...agents].sort(() => Math.random() - 0.5);
    const usados = new Set();

    for (const ordem of ordensSorteadas) {
      // Fase 1: tenta candidatos ideais
      let candidato = agentesSorteados.find(agent =>
        !usados.has(agent) &&
        !agentMap[agent].some(t => t.includes(proc)) &&
        (ordemUso[agent][ordem] || 0) < maxPorOrdem
      );

      // Fase 2: relaxa o limite de ordem
      if (!candidato) {
        candidato = agentesSorteados.find(agent =>
          !usados.has(agent) &&
          !agentMap[agent].some(t => t.includes(proc))
        );
      }

      // Fallback (não deveria ocorrer)
      if (!candidato) {
        candidato = agentesSorteados.find(agent => !usados.has(agent)) || agents[0];
      }

      agentMap[candidato].push(`${ordem} ${proc}`);
      ordemUso[candidato][ordem] = (ordemUso[candidato][ordem] || 0) + 1;
      usados.add(candidato);
    }
  }

  // ⏱ Correção final: reequilibra excesso de "1º", "2º", etc.
  balancearOrdens(agentMap, agents, agents.map((_, i) => `${i + 1}º`));

  // Renderização
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
    for (const t of tasks.sort()) {
      html += `<li>${t}</li>`;
    }
    html += '</ul></div>';
  }

  html += '</div>';
  resultsDiv.innerHTML = html;
}

// 🔄 Função de correção equilibrada de ordens (pós-processamento)
function balancearOrdens(agentMap, agentes, ordens) {
  const ordemPorAgente = {};
  agentes.forEach(a => ordemPorAgente[a] = {});

  for (const agente of agentes) {
    for (const tarefa of agentMap[agente]) {
      const ordem = tarefa.split(" ")[0];
      ordemPorAgente[agente][ordem] = (ordemPorAgente[agente][ordem] || 0) + 1;
    }
  }

  const maxPorOrdem = Math.ceil(Object.values(agentMap)[0].length / agentes.length);

  for (const ordem of ordens) {
    let agentesExcesso = agentes.filter(
      a => (ordemPorAgente[a][ordem] || 0) > maxPorOrdem
    );
    let agentesFaltando = agentes.filter(
      a => (ordemPorAgente[a][ordem] || 0) < maxPorOrdem
    );

    for (const agenteExcedente of agentesExcesso) {
      const tarefaExcedente = agentMap[agenteExcedente].find(t => t.startsWith(ordem));
      const tipo = tarefaExcedente.split(" ").slice(1).join(" ");

      for (const agenteDeficitario of agentesFaltando) {
        const tarefaSubstituivel = agentMap[agenteDeficitario].find(t => t.endsWith(tipo));
        if (!tarefaSubstituivel) continue;

        const ordemSub = tarefaSubstituivel.split(" ")[0];
        if (ordemSub === ordem) continue;

        // Troca
        agentMap[agenteExcedente] = agentMap[agenteExcedente].map(t =>
          t === tarefaExcedente ? tarefaSubstituivel : t
        );
        agentMap[agenteDeficitario] = agentMap[agenteDeficitario].map(t =>
          t === tarefaSubstituivel ? tarefaExcedente : t
        );

        ordemPorAgente[agenteExcedente][ordem]--;
        ordemPorAgente[agenteExcedente][ordemSub] = (ordemPorAgente[agenteExcedente][ordemSub] || 0) + 1;
        ordemPorAgente[agenteDeficitario][ordem]++;
        ordemPorAgente[agenteDeficitario][ordemSub]--;

        break;
      }
    }
  }
}