function drawAssignments() {
    const agentInput = document.getElementById('agents').value.trim();
    const procedureInput = document.getElementById('procedures').value.trim();
    const resultsDiv = document.getElementById('results');
  
    if (!agentInput || !procedureInput) {
      alert('Preencha os dois campos antes de sortear.');
      return;
    }
  
    const agents = agentInput.split('\n').map(name => name.trim()).filter(Boolean);
    const rawProcedures = procedureInput.split('\n').map(p => p.trim()).filter(Boolean);
  
    let assignments = [];
  
    for (let line of rawProcedures) {
      const [type, qtyStr] = line.split('-').map(p => p.trim());
      const qty = parseInt(qtyStr);
      if (!type || isNaN(qty)) continue;
      for (let i = 1; i <= qty; i++) {
        assignments.push(`${i}\u00ba ${type}`);
      }
    }
  
    // Embaralhar procedimentos
    for (let i = assignments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
    }
  
    let agentMap = {};
    for (let i = 0; i < assignments.length; i++) {
      const agent = agents[i % agents.length];
      if (!agentMap[agent]) agentMap[agent] = [];
      agentMap[agent].push(assignments[i]);
    }
  
    let html = '<h2 class="text-xl font-bold mb-2">Resultado do Sorteio</h2>';
    html += '<div class="grid grid-cols-1 gap-4">';
    for (const [agent, tasks] of Object.entries(agentMap)) {
      html += `<div class="p-4 bg-gray-50 rounded-xl shadow">
        <h3 class="font-semibold text-lg mb-1">${agent}</h3>
        <ul class="list-disc list-inside text-gray-700">`;
      for (const t of tasks) {
        html += `<li>${t}</li>`;
      }
      html += '</ul></div>';
    }
    html += '</div>';
    resultsDiv.innerHTML = html;
  }
  