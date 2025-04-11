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

  procedureCheckboxes.forEach(checkbox => {
    const type = checkbox.value;

    // Cria uma cópia dos agentes e embaralha
    const shuffled = [...agents].sort(() => Math.random() - 0.5);

    const metade = Math.floor(shuffled.length / 2);
    const resto = shuffled.length % 2;

    // Primeiros agentes recebem "1º", os demais "2º"
    const primeiros = shuffled.slice(0, metade + resto);
    const segundos = shuffled.slice(metade + resto);

    primeiros.forEach(agent => {
      agentMap[agent].push(`1º ${type}`);
    });
    segundos.forEach(agent => {
      agentMap[agent].push(`2º ${type}`);
    });
  });

  // Construção do HTML
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
    tasks.forEach(t => html += `<li>${t}</li>`);
    html += `</ul></div>`;
  }

  html += '</div>';
  resultsDiv.innerHTML = html;
}
