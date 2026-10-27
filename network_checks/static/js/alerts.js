const token = localStorage.getItem("authToken");
const tbody = document.querySelector("#tabla-alerts tbody");

async function cargarAlertas() {
  if (!token) {
    window.location.href = "/login/";
    return;
  }
  try {
    const response = await fetch("/alerts/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    const alerts = Array.isArray(data) ? data : (data.results ?? []);

    renderizarAlertas(alerts);
  } catch (error) {
    console.error("Error al cargar las alertas:", error);

    tbody.replaceChildren();

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.className = "text-center text-danger";
    cell.textContent = "No se pudieron cargar las alertas.";

    row.appendChild(cell);
    tbody.append(row);
  }
}

function estadoBadge(estado) {
    const colors = {
      critical: "bg-danger",
      warning: "bg-warning text-dark",
  };

  return colors[estado] ?? 'bg-secondary';
};

function resueltaBadge(resuelta) {
  const colors = {
    true: 'bg-success',
    false: 'bg-danger',
  };

  return colors[resuelta] ?? 'bg-secondary';
}

function renderizarAlertas(alerts) {
  tbody.replaceChildren();

  if (alerts.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.className = "text-center";
    cell.textContent = "No hay alertas registradas.";

    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  alerts.forEach((alert) => {
    const row = document.createElement("tr");

    const values = [
      alert.fecha_creacion
        ? new Date(alert.fecha_creacion).toLocaleDateString("es-MX")
        : "-",
      alert.mensaje,
    ];

    const fechaCell = document.createElement('td');
    fechaCell.textContent = values[0];
    row.appendChild(fechaCell);

    const nivelCell = document.createElement('td');
    const badge = document.createElement('span');

    badge.className = `badge ${estadoBadge(alert.nivel)}`;
    badge.textContent = alert.nivel ?? '-';

    const resueltaCell = document.createElement('td');
    const resueltaBadgeElement = document.createElement('span');

    resueltaBadgeElement.className = `badge ${resueltaBadge(alert.resuelta)}`;

    resueltaBadgeElement.textContent = alert.resuelta
      ? "Resuelta"
      : "Pendiente";


    nivelCell.appendChild(badge);
    row.appendChild(nivelCell);

    resueltaCell.appendChild(resueltaBadgeElement);
    row.appendChild(resueltaCell);

    values.slice(1).forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = String(value ?? "-");
      row.appendChild(cell);
    })

    tbody.appendChild(row);
  });
}

cargarAlertas();
