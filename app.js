const STORAGE_KEYS = {
  tickets: "samira-monitor:tickets",
  criteria: "samira-monitor:criteria",
  lastUpload: "samira-monitor:last-upload",
};

const DEFAULT_CRITERIA = {
  slaTargetHours: 24,
  satisfactionTarget: 85,
  backlogLimit: 12,
  fcrTarget: 70,
  criticalKeywords: ["cancelamento", "fraude", "reclamacao"],
};

const STATUS_COLORS = ["#1e88e5", "#ff5751", "#18a058", "#f5a524", "#7c3aed", "#0f766e"];

const FIELD_ALIASES = {
  id: ["ticket", "id", "protocolo", "numero", "numero_ticket"],
  openedAt: ["data_abertura", "abertura", "criado_em", "created_at", "data", "dt_abertura"],
  closedAt: ["data_fechamento", "fechamento", "resolvido_em", "closed_at", "dt_fechamento"],
  agent: ["atendente", "agente", "responsavel", "operador", "analista"],
  channel: ["canal", "origem", "source"],
  status: ["status", "situacao", "estado"],
  priority: ["prioridade", "priority", "criticidade"],
  category: ["categoria", "assunto", "tipo", "motivo"],
  customer: ["cliente", "customer", "solicitante", "conta"],
  satisfaction: ["satisfacao", "satisfacao_percentual", "csat", "nota_satisfacao"],
  slaHours: ["sla_horas", "sla", "tempo_sla", "sla_hours"],
  handleTimeHours: ["tempo_atendimento_horas", "tempo_atendimento", "handle_time", "tma"],
  firstResponseHours: ["primeira_resposta_horas", "primeira_resposta", "first_response_hours"],
  fcr: ["fcr", "primeiro_contato", "resolucao_primeiro_contato", "first_contact_resolution"],
  description: ["descricao", "descrição", "observacao", "observacao", "mensagem", "comentario"],
};

let tickets = [];
let filteredTickets = [];
let criteria = loadCriteria();
let currentReportRows = [];
let currentReportName = "Tickets por atendente";

const elements = {
  pageTitle: document.getElementById("pageTitle"),
  navItems: [...document.querySelectorAll(".nav-item")],
  views: [...document.querySelectorAll(".view")],
  sidebarTicketCount: document.getElementById("sidebarTicketCount"),
  sidebarRange: document.getElementById("sidebarRange"),
  kpiGrid: document.getElementById("kpiGrid"),
  ticketsTrendChart: document.getElementById("ticketsTrendChart"),
  statusDonut: document.getElementById("statusDonut"),
  statusLegend: document.getElementById("statusLegend"),
  agentRanking: document.getElementById("agentRanking"),
  qualityAlerts: document.getElementById("qualityAlerts"),
  ticketsTableBody: document.getElementById("ticketsTableBody"),
  uploadSummary: document.getElementById("uploadSummary"),
  uploadMessage: document.getElementById("uploadMessage"),
  criteriaImpact: document.getElementById("criteriaImpact"),
  reportResults: document.getElementById("reportResults"),
  reportTitle: document.getElementById("reportTitle"),
};

const filterInputs = {
  start: document.getElementById("filterStart"),
  end: document.getElementById("filterEnd"),
  agent: document.getElementById("filterAgent"),
  channel: document.getElementById("filterChannel"),
  status: document.getElementById("filterStatus"),
  priority: document.getElementById("filterPriority"),
  search: document.getElementById("filterSearch"),
};

const routes = {
  dashboard: "Dashboard Executivo",
  upload: "Upload de Dados",
  analysis: "Análise Detalhada",
  criteria: "Configurações de Critérios",
  reports: "Relatórios Customizados",
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  tickets = loadTickets();
  if (!tickets.length) {
    tickets = getSampleTickets();
  }

  bindEvents();
  hydrateCriteriaForm();
  populateFilterOptions();
  applyFilters();
  renderUploadSummary();
  generateReport();
}

function bindEvents() {
  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => navigate(item.dataset.route));
  });

  Object.values(filterInputs).forEach((input) => {
    input.addEventListener("input", applyFilters);
    input.addEventListener("change", applyFilters);
  });

  document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);
  document.getElementById("fileInput").addEventListener("change", handleFileUpload);
  document.getElementById("loadSampleBtn").addEventListener("click", loadSampleTickets);
  document.getElementById("replaceWithSampleBtn").addEventListener("click", loadSampleTickets);
  document.getElementById("downloadTemplateBtn").addEventListener("click", downloadTemplate);
  document.getElementById("exportFilteredBtn").addEventListener("click", () => exportTickets(filteredTickets, "tickets-filtrados.csv"));
  document.getElementById("exportTableBtn").addEventListener("click", () => exportTickets(filteredTickets, "analise-detalhada.csv"));
  document.getElementById("criteriaForm").addEventListener("submit", saveCriteria);
  document.getElementById("reportForm").addEventListener("submit", (event) => {
    event.preventDefault();
    generateReport();
  });
  document.getElementById("exportReportCsvBtn").addEventListener("click", exportReportCsv);
  document.getElementById("exportReportJsonBtn").addEventListener("click", exportReportJson);
}

function navigate(route) {
  elements.navItems.forEach((item) => item.classList.toggle("active", item.dataset.route === route));
  elements.views.forEach((view) => view.classList.toggle("active", view.dataset.view === route));
  elements.pageTitle.textContent = routes[route] || routes.dashboard;
}

function loadTickets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.tickets)) || [];
  } catch {
    return [];
  }
}

function persistTickets() {
  localStorage.setItem(STORAGE_KEYS.tickets, JSON.stringify(tickets));
}

function loadCriteria() {
  try {
    return {
      ...DEFAULT_CRITERIA,
      ...(JSON.parse(localStorage.getItem(STORAGE_KEYS.criteria)) || {}),
    };
  } catch {
    return { ...DEFAULT_CRITERIA };
  }
}

function persistCriteria() {
  localStorage.setItem(STORAGE_KEYS.criteria, JSON.stringify(criteria));
}

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function normalizeRow(row, index) {
  const normalized = {};
  Object.entries(row).forEach(([key, value]) => {
    normalized[normalizeKey(key)] = value;
  });

  const pick = (field) => {
    const aliases = FIELD_ALIASES[field] || [];
    for (const alias of aliases) {
      const key = normalizeKey(alias);
      if (normalized[key] !== undefined && normalized[key] !== "") {
        return normalized[key];
      }
    }
    return "";
  };

  const openedAt = parseDate(pick("openedAt")) || new Date().toISOString().slice(0, 10);
  const closedAt = parseDate(pick("closedAt"));
  const slaHours = parseNumber(pick("slaHours")) || diffHours(openedAt, closedAt) || 0;
  const handleTimeHours = parseNumber(pick("handleTimeHours")) || slaHours;
  const satisfaction = parseNumber(pick("satisfaction"));

  return {
    id: String(pick("id") || `TCK-${String(index + 1).padStart(4, "0")}`),
    openedAt,
    closedAt,
    agent: String(pick("agent") || "Sem atendente"),
    channel: String(pick("channel") || "Não informado"),
    status: String(pick("status") || "Aberto"),
    priority: String(pick("priority") || "Média"),
    category: String(pick("category") || "Geral"),
    customer: String(pick("customer") || "Cliente não informado"),
    satisfaction: Number.isFinite(satisfaction) ? satisfaction : null,
    slaHours,
    handleTimeHours,
    firstResponseHours: parseNumber(pick("firstResponseHours")) || 0,
    fcr: parseBoolean(pick("fcr")),
    description: String(pick("description") || ""),
  };
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return NaN;
  if (typeof value === "number") return value;
  const parsed = Number(String(value).replace("%", "").replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  const normalized = normalizeKey(value);
  return ["sim", "s", "yes", "y", "true", "1", "resolvido"].includes(normalized);
}

function parseDate(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number" && window.XLSX?.SSF) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
    }
  }

  const raw = String(value).trim();
  const brMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return "";
}

function diffHours(start, end) {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return diff > 0 ? Math.round((diff / 36e5) * 10) / 10 : 0;
}

function populateFilterOptions() {
  const currentValues = Object.fromEntries(
    Object.entries(filterInputs).map(([key, input]) => [key, input.value])
  );

  setOptions(filterInputs.agent, unique(tickets.map((ticket) => ticket.agent)), "Todos");
  setOptions(filterInputs.channel, unique(tickets.map((ticket) => ticket.channel)), "Todos");
  setOptions(filterInputs.status, unique(tickets.map((ticket) => ticket.status)), "Todos");
  setOptions(filterInputs.priority, unique(tickets.map((ticket) => ticket.priority)), "Todas");

  Object.entries(currentValues).forEach(([key, value]) => {
    if (filterInputs[key]) filterInputs[key].value = value;
  });
}

function setOptions(select, values, label) {
  select.innerHTML = `<option value="">${label}</option>${values
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join("")}`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
}

function clearFilters() {
  Object.values(filterInputs).forEach((input) => {
    input.value = "";
  });
  applyFilters();
}

function applyFilters() {
  const filters = {
    start: filterInputs.start.value,
    end: filterInputs.end.value,
    agent: filterInputs.agent.value,
    channel: filterInputs.channel.value,
    status: filterInputs.status.value,
    priority: filterInputs.priority.value,
    search: normalizeKey(filterInputs.search.value),
  };

  filteredTickets = tickets.filter((ticket) => {
    const searchable = normalizeKey(
      [ticket.id, ticket.customer, ticket.agent, ticket.category, ticket.description, ticket.channel, ticket.status].join(" ")
    );
    return (
      (!filters.start || ticket.openedAt >= filters.start) &&
      (!filters.end || ticket.openedAt <= filters.end) &&
      (!filters.agent || ticket.agent === filters.agent) &&
      (!filters.channel || ticket.channel === filters.channel) &&
      (!filters.status || ticket.status === filters.status) &&
      (!filters.priority || ticket.priority === filters.priority) &&
      (!filters.search || searchable.includes(filters.search))
    );
  });

  renderAll();
}

function renderAll() {
  renderSidebar();
  renderKpis();
  renderTrendChart();
  renderStatusChart();
  renderAgentRanking();
  renderQualityAlerts();
  renderTicketsTable();
  renderCriteriaImpact();
  generateReport(false);
}

function renderSidebar() {
  elements.sidebarTicketCount.textContent = `${filteredTickets.length} tickets`;
  const dates = filteredTickets.map((ticket) => ticket.openedAt).sort();
  elements.sidebarRange.textContent = dates.length
    ? `${formatDate(dates[0])} a ${formatDate(dates[dates.length - 1])}`
    : "Sem período carregado";
}

function renderKpis() {
  const summary = getSummary(filteredTickets);
  const cards = [
    {
      label: "Tickets analisados",
      value: formatInteger(summary.total),
      detail: `${summary.open} abertos no filtro`,
    },
    {
      label: "Resolvidos",
      value: `${formatPercent(summary.resolutionRate)}`,
      detail: `${summary.resolved} tickets concluídos`,
    },
    {
      label: "SLA cumprido",
      value: `${formatPercent(summary.slaRate)}`,
      detail: `Meta atual: ${criteria.slaTargetHours}h`,
    },
    {
      label: "Tempo médio",
      value: `${formatDecimal(summary.avgHandleTime)}h`,
      detail: "Atendimento médio por ticket",
    },
  ];

  elements.kpiGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="kpi-card">
          <span class="eyebrow">${card.label}</span>
          <strong>${card.value}</strong>
          <small>${card.detail}</small>
        </article>
      `
    )
    .join("");
}

function renderTrendChart() {
  const groups = groupBy(filteredTickets, (ticket) => ticket.openedAt.slice(0, 7));
  const rows = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-8);
  const max = Math.max(1, ...rows.map(([, items]) => items.length));

  elements.ticketsTrendChart.innerHTML = rows.length
    ? rows
        .map(([month, items]) => {
          const percent = Math.max(5, (items.length / max) * 100);
          return `
            <div class="bar-row">
              <span class="bar-label">${formatMonth(month)}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${percent}%"></div></div>
              <strong>${items.length}</strong>
            </div>
          `;
        })
        .join("")
    : emptyState("Sem tickets para exibir a tendência.");
}

function renderStatusChart() {
  const groups = [...groupBy(filteredTickets, (ticket) => ticket.status).entries()].sort(
    ([a], [b]) => a.localeCompare(b, "pt-BR")
  );
  const total = Math.max(1, filteredTickets.length);
  let start = 0;
  const gradient = groups
    .map(([status, items], index) => {
      const percent = (items.length / total) * 100;
      const color = STATUS_COLORS[index % STATUS_COLORS.length];
      const segment = `${color} ${start}% ${start + percent}%`;
      start += percent;
      return segment;
    })
    .join(", ");

  elements.statusDonut.style.background = groups.length
    ? `conic-gradient(${gradient})`
    : "conic-gradient(#e7edf5 0 100%)";
  elements.statusLegend.innerHTML = groups.length
    ? groups
        .map(([status, items], index) => {
          const color = STATUS_COLORS[index % STATUS_COLORS.length];
          return `
            <div class="legend-item">
              <div class="legend-left">
                <span class="legend-dot" style="background:${color}"></span>
                <strong>${escapeHtml(status)}</strong>
              </div>
              <span class="badge">${formatPercent((items.length / total) * 100)}</span>
            </div>
          `;
        })
        .join("")
    : emptyState("Sem status no filtro atual.");
}

function renderAgentRanking() {
  const rows = [...groupBy(filteredTickets, (ticket) => ticket.agent).entries()]
    .map(([agent, items]) => ({
      agent,
      count: items.length,
      avgSatisfaction: average(items.map((ticket) => ticket.satisfaction).filter(Number.isFinite)),
      slaRate: rate(items.filter(isSlaMet).length, items.length),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  elements.agentRanking.innerHTML = rows.length
    ? rows
        .map(
          (row) => `
            <div class="ranking-item">
              <div class="ranking-left">
                <span class="ranking-avatar">${escapeHtml(initials(row.agent))}</span>
                <div>
                  <strong>${escapeHtml(row.agent)}</strong>
                  <div class="ranking-meta">${row.count} tickets · SLA ${formatPercent(row.slaRate)}</div>
                </div>
              </div>
              <span class="badge success">${formatDecimal(row.avgSatisfaction)}%</span>
            </div>
          `
        )
        .join("")
    : emptyState("Sem atendentes no filtro atual.");
}

function renderQualityAlerts() {
  const summary = getSummary(filteredTickets);
  const criticalHits = filteredTickets.filter(hasCriticalKeyword).length;
  const alerts = [
    {
      title: "Backlog aberto",
      value: `${summary.open} tickets`,
      detail: `Limite configurado: ${criteria.backlogLimit}`,
      level: summary.open > criteria.backlogLimit ? "danger" : "success",
    },
    {
      title: "Satisfação média",
      value: `${formatPercent(summary.avgSatisfaction)}`,
      detail: `Meta configurada: ${criteria.satisfactionTarget}%`,
      level: summary.avgSatisfaction < criteria.satisfactionTarget ? "warning" : "success",
    },
    {
      title: "Cumprimento de SLA",
      value: `${formatPercent(summary.slaRate)}`,
      detail: `Alvo por ticket: ${criteria.slaTargetHours}h`,
      level: summary.slaRate < 85 ? "warning" : "success",
    },
    {
      title: "Palavras críticas",
      value: `${criticalHits} ocorrências`,
      detail: criteria.criticalKeywords.join(", "),
      level: criticalHits ? "danger" : "success",
    },
  ];

  elements.qualityAlerts.innerHTML = alerts
    .map(
      (alert) => `
        <div class="alert-card">
          <div>
            <strong>${alert.title}</strong>
            <small>${escapeHtml(alert.detail)}</small>
          </div>
          <span class="badge ${alert.level}">${escapeHtml(alert.value)}</span>
        </div>
      `
    )
    .join("");
}

function renderTicketsTable() {
  const rows = filteredTickets.slice(0, 250);
  elements.ticketsTableBody.innerHTML = rows.length
    ? rows
        .map(
          (ticket) => `
            <tr>
              <td><strong>${escapeHtml(ticket.id)}</strong></td>
              <td>${formatDate(ticket.openedAt)}</td>
              <td>${escapeHtml(ticket.customer)}</td>
              <td>${escapeHtml(ticket.agent)}</td>
              <td>${escapeHtml(ticket.status)}</td>
              <td>${escapeHtml(ticket.priority)}</td>
              <td>${escapeHtml(ticket.channel)}</td>
              <td><span class="badge ${isSlaMet(ticket) ? "success" : "danger"}">${isSlaMet(ticket) ? "OK" : "Fora"}</span></td>
              <td>${ticket.satisfaction === null ? "-" : `${formatDecimal(ticket.satisfaction)}%`}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="9">${emptyState("Nenhum ticket encontrado com os filtros atuais.")}</td></tr>`;
}

function renderUploadSummary() {
  const mappedFields = Object.keys(FIELD_ALIASES).length;
  const lastUpload = localStorage.getItem(STORAGE_KEYS.lastUpload) || "Nenhuma";
  elements.uploadSummary.innerHTML = `
    <div>
      <span>Total carregado</span>
      <strong>${formatInteger(tickets.length)}</strong>
    </div>
    <div>
      <span>Campos mapeados</span>
      <strong>${mappedFields}</strong>
    </div>
    <div>
      <span>Última carga</span>
      <strong>${escapeHtml(lastUpload)}</strong>
    </div>
  `;
}

function renderCriteriaImpact() {
  const summary = getSummary(filteredTickets);
  const criticalHits = filteredTickets.filter(hasCriticalKeyword).length;
  const items = [
    ["Tickets fora do SLA", filteredTickets.filter((ticket) => !isSlaMet(ticket)).length],
    ["Satisfação média vs. meta", `${formatPercent(summary.avgSatisfaction)} / ${criteria.satisfactionTarget}%`],
    ["Backlog aberto", `${summary.open} / ${criteria.backlogLimit}`],
    ["Resolução no primeiro contato", `${formatPercent(summary.fcrRate)} / ${criteria.fcrTarget}%`],
    ["Tickets com palavras críticas", criticalHits],
  ];

  elements.criteriaImpact.innerHTML = items
    .map(
      ([label, value]) => `
        <div class="criteria-item">
          <strong>${escapeHtml(label)}</strong>
          <span class="badge">${escapeHtml(value)}</span>
        </div>
      `
    )
    .join("");
}

function hydrateCriteriaForm() {
  document.getElementById("criteriaSla").value = criteria.slaTargetHours;
  document.getElementById("criteriaSatisfaction").value = criteria.satisfactionTarget;
  document.getElementById("criteriaBacklog").value = criteria.backlogLimit;
  document.getElementById("criteriaFcr").value = criteria.fcrTarget;
  document.getElementById("criteriaKeywords").value = criteria.criticalKeywords.join(", ");
}

function saveCriteria(event) {
  event.preventDefault();
  criteria = {
    slaTargetHours: Number(document.getElementById("criteriaSla").value) || DEFAULT_CRITERIA.slaTargetHours,
    satisfactionTarget:
      Number(document.getElementById("criteriaSatisfaction").value) || DEFAULT_CRITERIA.satisfactionTarget,
    backlogLimit: Number(document.getElementById("criteriaBacklog").value) || DEFAULT_CRITERIA.backlogLimit,
    fcrTarget: Number(document.getElementById("criteriaFcr").value) || DEFAULT_CRITERIA.fcrTarget,
    criticalKeywords: document
      .getElementById("criteriaKeywords")
      .value.split(",")
      .map((keyword) => normalizeKey(keyword))
      .filter(Boolean),
  };
  persistCriteria();
  applyFilters();
  showUploadMessage("Critérios salvos e indicadores recalculados.", "success");
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const rows = await readSpreadsheet(file);
    const normalizedTickets = rows.map(normalizeRow).filter((ticket) => ticket.id);
    if (!normalizedTickets.length) {
      throw new Error("Nenhum ticket válido foi encontrado.");
    }

    tickets = normalizedTickets;
    persistTickets();
    localStorage.setItem(STORAGE_KEYS.lastUpload, `${file.name} · ${new Date().toLocaleString("pt-BR")}`);
    populateFilterOptions();
    clearFilters();
    renderUploadSummary();
    showUploadMessage(`${normalizedTickets.length} tickets carregados de ${file.name}.`, "success");
  } catch (error) {
    showUploadMessage(`Não foi possível processar o arquivo: ${error.message}`, "error");
  } finally {
    event.target.value = "";
  }
}

function readSpreadsheet(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (extension === "csv") {
    return file.text().then(parseCsv);
  }

  return file.arrayBuffer().then((buffer) => {
    if (!window.XLSX) {
      throw new Error("Leitor de Excel não carregado. Verifique sua conexão e tente novamente.");
    }
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
  });
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if ((char === "," || char === ";") && !insideQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);

  const [headers = [], ...dataRows] = rows;
  return dataRows.map((dataRow) =>
    Object.fromEntries(headers.map((header, index) => [header, dataRow[index] ?? ""]))
  );
}

function loadSampleTickets() {
  tickets = getSampleTickets();
  persistTickets();
  localStorage.setItem(STORAGE_KEYS.lastUpload, `Dados de exemplo · ${new Date().toLocaleString("pt-BR")}`);
  populateFilterOptions();
  clearFilters();
  renderUploadSummary();
  showUploadMessage("Dados de exemplo carregados para demonstração.", "success");
}

function downloadTemplate() {
  const headers = [
    "ticket",
    "data_abertura",
    "data_fechamento",
    "atendente",
    "canal",
    "status",
    "prioridade",
    "categoria",
    "cliente",
    "satisfacao",
    "sla_horas",
    "tempo_atendimento_horas",
    "primeira_resposta_horas",
    "fcr",
    "descricao",
  ];
  const rows = [
    headers,
    [
      "TCK-0001",
      "2026-05-01",
      "2026-05-02",
      "Ana Lima",
      "Chat",
      "Resolvido",
      "Alta",
      "Financeiro",
      "Cliente A",
      "92",
      "18",
      "1.5",
      "0.4",
      "sim",
      "Solicitação resolvida no primeiro contato",
    ],
  ];
  downloadFile(toCsv(rows), "modelo-tickets.csv", "text/csv;charset=utf-8");
}

function exportTickets(rows, filename) {
  const headers = [
    "ticket",
    "data_abertura",
    "data_fechamento",
    "atendente",
    "canal",
    "status",
    "prioridade",
    "categoria",
    "cliente",
    "satisfacao",
    "sla_horas",
    "tempo_atendimento_horas",
    "primeira_resposta_horas",
    "fcr",
    "descricao",
  ];
  const data = rows.map((ticket) => [
    ticket.id,
    ticket.openedAt,
    ticket.closedAt,
    ticket.agent,
    ticket.channel,
    ticket.status,
    ticket.priority,
    ticket.category,
    ticket.customer,
    ticket.satisfaction ?? "",
    ticket.slaHours,
    ticket.handleTimeHours,
    ticket.firstResponseHours,
    ticket.fcr ? "sim" : "nao",
    ticket.description,
  ]);
  downloadFile(toCsv([headers, ...data]), filename, "text/csv;charset=utf-8");
}

function generateReport(preventTitleRefresh = true) {
  const dimension = document.getElementById("reportDimension").value;
  const metric = document.getElementById("reportMetric").value;
  const labels = {
    agent: "atendente",
    channel: "canal",
    status: "status",
    priority: "prioridade",
    category: "categoria",
  };
  const titles = {
    count: "Volume de tickets",
    sla: "Cumprimento de SLA",
    satisfaction: "Satisfação média",
    handleTime: "Tempo médio de atendimento",
  };
  const field = {
    agent: "agent",
    channel: "channel",
    status: "status",
    priority: "priority",
    category: "category",
  }[dimension];

  currentReportName = `${titles[metric]} por ${labels[dimension]}`;
  currentReportRows = [...groupBy(filteredTickets, (ticket) => ticket[field]).entries()]
    .map(([name, items]) => buildReportRow(name, items, metric))
    .sort((a, b) => b.rawValue - a.rawValue);

  if (preventTitleRefresh) {
    elements.reportTitle.textContent = currentReportName;
  }

  elements.reportResults.innerHTML = currentReportRows.length
    ? currentReportRows
        .map(
          (row) => `
            <div class="report-item">
              <div class="report-left">
                <span class="legend-dot"></span>
                <div>
                  <strong>${escapeHtml(row.name)}</strong>
                  <div class="report-meta">${row.count} tickets analisados</div>
                </div>
              </div>
              <span class="badge">${escapeHtml(row.value)}</span>
            </div>
          `
        )
        .join("")
    : emptyState("Sem dados para o relatório atual.");
}

function buildReportRow(name, items, metric) {
  const summary = getSummary(items);
  const metrics = {
    count: { raw: items.length, value: formatInteger(items.length) },
    sla: { raw: summary.slaRate, value: formatPercent(summary.slaRate) },
    satisfaction: { raw: summary.avgSatisfaction, value: `${formatDecimal(summary.avgSatisfaction)}%` },
    handleTime: { raw: summary.avgHandleTime, value: `${formatDecimal(summary.avgHandleTime)}h` },
  };
  return {
    name,
    count: items.length,
    rawValue: metrics[metric].raw,
    value: metrics[metric].value,
  };
}

function exportReportCsv() {
  const rows = [["grupo", "tickets", "valor"], ...currentReportRows.map((row) => [row.name, row.count, row.value])];
  downloadFile(toCsv(rows), "relatorio-customizado.csv", "text/csv;charset=utf-8");
}

function exportReportJson() {
  downloadFile(JSON.stringify({ title: currentReportName, rows: currentReportRows }, null, 2), "relatorio-customizado.json", "application/json");
}

function getSummary(rows) {
  const resolved = rows.filter(isResolved).length;
  const open = rows.length - resolved;
  const satisfactionValues = rows.map((ticket) => ticket.satisfaction).filter(Number.isFinite);
  const fcrCount = rows.filter((ticket) => ticket.fcr).length;
  const slaMet = rows.filter(isSlaMet).length;

  return {
    total: rows.length,
    resolved,
    open,
    resolutionRate: rate(resolved, rows.length),
    slaRate: rate(slaMet, rows.length),
    avgHandleTime: average(rows.map((ticket) => ticket.handleTimeHours).filter(Number.isFinite)),
    avgSatisfaction: average(satisfactionValues),
    fcrRate: rate(fcrCount, rows.length),
  };
}

function isResolved(ticket) {
  return /(resolvido|fechado|concluido|concluído|finalizado)/i.test(ticket.status);
}

function isSlaMet(ticket) {
  return Number(ticket.slaHours) <= Number(criteria.slaTargetHours);
}

function hasCriticalKeyword(ticket) {
  const text = normalizeKey(`${ticket.description} ${ticket.category} ${ticket.status}`);
  return criteria.criticalKeywords.some((keyword) => keyword && text.includes(keyword));
}

function groupBy(rows, getKey) {
  return rows.reduce((groups, row) => {
    const key = getKey(row) || "Não informado";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
    return groups;
  }, new Map());
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function rate(part, total) {
  return total ? (part / total) * 100 : 0;
}

function toCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell ?? "");
          return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(";")
    )
    .join("\n");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showUploadMessage(message, level = "info") {
  elements.uploadMessage.textContent = message;
  elements.uploadMessage.style.borderColor =
    level === "error" ? "rgba(217, 45, 32, 0.35)" : level === "success" ? "rgba(24, 160, 88, 0.35)" : "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatInteger(value) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value || 0);
}

function formatDecimal(value) {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value || 0);
}

function formatPercent(value) {
  return `${formatDecimal(value)}%`;
}

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatMonth(value) {
  const [year, month] = value.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
}

function initials(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function emptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function getSampleTickets() {
  return [
    {
      id: "TCK-1001",
      openedAt: "2026-01-08",
      closedAt: "2026-01-09",
      agent: "Ana Lima",
      channel: "Chat",
      status: "Resolvido",
      priority: "Alta",
      category: "Financeiro",
      customer: "Solar Mix",
      satisfaction: 94,
      slaHours: 18,
      handleTimeHours: 2.4,
      firstResponseHours: 0.3,
      fcr: true,
      description: "Dúvida sobre cobrança recorrente resolvida no primeiro contato.",
    },
    {
      id: "TCK-1002",
      openedAt: "2026-01-15",
      closedAt: "",
      agent: "Bruno Costa",
      channel: "E-mail",
      status: "Aberto",
      priority: "Crítica",
      category: "Segurança",
      customer: "Nova Pay",
      satisfaction: null,
      slaHours: 31,
      handleTimeHours: 4.1,
      firstResponseHours: 3.2,
      fcr: false,
      description: "Suspeita de fraude em acesso administrativo.",
    },
    {
      id: "TCK-1003",
      openedAt: "2026-02-03",
      closedAt: "2026-02-04",
      agent: "Carla Souza",
      channel: "Telefone",
      status: "Resolvido",
      priority: "Média",
      category: "Técnico",
      customer: "Clínica Norte",
      satisfaction: 88,
      slaHours: 22,
      handleTimeHours: 3.7,
      firstResponseHours: 0.6,
      fcr: true,
      description: "Instabilidade no módulo de agenda.",
    },
    {
      id: "TCK-1004",
      openedAt: "2026-02-21",
      closedAt: "2026-02-24",
      agent: "Diego Ramos",
      channel: "Portal",
      status: "Resolvido",
      priority: "Baixa",
      category: "Cadastro",
      customer: "Viva Foods",
      satisfaction: 82,
      slaHours: 54,
      handleTimeHours: 1.8,
      firstResponseHours: 5.4,
      fcr: false,
      description: "Alteração cadastral pendente de validação.",
    },
    {
      id: "TCK-1005",
      openedAt: "2026-03-01",
      closedAt: "2026-03-01",
      agent: "Ana Lima",
      channel: "Chat",
      status: "Resolvido",
      priority: "Média",
      category: "Produto",
      customer: "Atlas Hub",
      satisfaction: 97,
      slaHours: 7,
      handleTimeHours: 1.1,
      firstResponseHours: 0.1,
      fcr: true,
      description: "Orientação sobre recurso de automação.",
    },
    {
      id: "TCK-1006",
      openedAt: "2026-03-07",
      closedAt: "",
      agent: "Bruno Costa",
      channel: "WhatsApp",
      status: "Em andamento",
      priority: "Alta",
      category: "Financeiro",
      customer: "Mundo Pet",
      satisfaction: null,
      slaHours: 29,
      handleTimeHours: 5.8,
      firstResponseHours: 1.4,
      fcr: false,
      description: "Reclamação sobre divergência de mensalidade.",
    },
    {
      id: "TCK-1007",
      openedAt: "2026-03-19",
      closedAt: "2026-03-20",
      agent: "Eva Martins",
      channel: "Portal",
      status: "Resolvido",
      priority: "Alta",
      category: "Técnico",
      customer: "Blue Labs",
      satisfaction: 91,
      slaHours: 20,
      handleTimeHours: 2.9,
      firstResponseHours: 0.8,
      fcr: true,
      description: "Erro intermitente em integração de API.",
    },
    {
      id: "TCK-1008",
      openedAt: "2026-04-02",
      closedAt: "",
      agent: "Carla Souza",
      channel: "E-mail",
      status: "Pendente",
      priority: "Crítica",
      category: "Contrato",
      customer: "Studio Max",
      satisfaction: 61,
      slaHours: 76,
      handleTimeHours: 6.5,
      firstResponseHours: 8.2,
      fcr: false,
      description: "Cliente sinalizou cancelamento por atraso na resposta.",
    },
    {
      id: "TCK-1009",
      openedAt: "2026-04-13",
      closedAt: "2026-04-13",
      agent: "Eva Martins",
      channel: "Chat",
      status: "Resolvido",
      priority: "Baixa",
      category: "Produto",
      customer: "Casa Urbana",
      satisfaction: 95,
      slaHours: 4,
      handleTimeHours: 0.9,
      firstResponseHours: 0.2,
      fcr: true,
      description: "Pergunta sobre permissões de usuário.",
    },
    {
      id: "TCK-1010",
      openedAt: "2026-04-28",
      closedAt: "2026-04-30",
      agent: "Diego Ramos",
      channel: "Telefone",
      status: "Resolvido",
      priority: "Média",
      category: "Financeiro",
      customer: "Health One",
      satisfaction: 84,
      slaHours: 42,
      handleTimeHours: 3.5,
      firstResponseHours: 2.1,
      fcr: false,
      description: "Negociação de boleto vencido.",
    },
    {
      id: "TCK-1011",
      openedAt: "2026-05-03",
      closedAt: "2026-05-04",
      agent: "Ana Lima",
      channel: "WhatsApp",
      status: "Resolvido",
      priority: "Alta",
      category: "Técnico",
      customer: "Prime Log",
      satisfaction: 90,
      slaHours: 16,
      handleTimeHours: 2.6,
      firstResponseHours: 0.5,
      fcr: true,
      description: "Falha em relatório operacional.",
    },
    {
      id: "TCK-1012",
      openedAt: "2026-05-06",
      closedAt: "",
      agent: "Bruno Costa",
      channel: "Portal",
      status: "Aberto",
      priority: "Média",
      category: "Cadastro",
      customer: "Rede Alfa",
      satisfaction: null,
      slaHours: 12,
      handleTimeHours: 1.4,
      firstResponseHours: 0.9,
      fcr: false,
      description: "Atualização de dados fiscais.",
    },
    {
      id: "TCK-1013",
      openedAt: "2026-05-09",
      closedAt: "",
      agent: "Carla Souza",
      channel: "E-mail",
      status: "Em andamento",
      priority: "Alta",
      category: "Segurança",
      customer: "Fintech Sul",
      satisfaction: null,
      slaHours: 26,
      handleTimeHours: 7.2,
      firstResponseHours: 4.6,
      fcr: false,
      description: "Investigação de fraude em transação suspeita.",
    },
    {
      id: "TCK-1014",
      openedAt: "2026-05-12",
      closedAt: "2026-05-12",
      agent: "Eva Martins",
      channel: "Chat",
      status: "Resolvido",
      priority: "Baixa",
      category: "Produto",
      customer: "Floratta",
      satisfaction: 99,
      slaHours: 3,
      handleTimeHours: 0.7,
      firstResponseHours: 0.1,
      fcr: true,
      description: "Configuração de campo personalizado.",
    },
    {
      id: "TCK-1015",
      openedAt: "2026-05-16",
      closedAt: "",
      agent: "Diego Ramos",
      channel: "Telefone",
      status: "Pendente",
      priority: "Crítica",
      category: "Contrato",
      customer: "Auto Prime",
      satisfaction: 58,
      slaHours: 67,
      handleTimeHours: 8.3,
      firstResponseHours: 7.8,
      fcr: false,
      description: "Reclamação formal com ameaça de cancelamento.",
    },
  ];
}
