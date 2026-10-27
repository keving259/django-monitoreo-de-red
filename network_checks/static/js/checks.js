const token = localStorage.getItem("authToken");
const tbody = document.querySelector("#tabla-checks tbody");

async function cargarChequeos() {
  if (!token) {
    window.location.href = "/login/";
    return;
  }

  try {
    const response = await fetch("/checks/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    const checks = Array.isArray(data) ? data : (data.results ?? []);

    renderizarChequeos(checks);
  } catch (error) {
    console.error("Error al cargar los chequeos:", error);

    tbody.replaceChildren();

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 4;
    cell.className = "text-center text-danger";
    cell.textContent = "No se pudieron cargar los chequeos.";

    row.appendChild(cell);
    tbody.appendChild(row);
  }
}

function estadoBadge(estado) {
  const colors = {
    up: "bg-success",
    down: "bg-danger",
  };

  return colors[estado] ?? "bg-secondary";
}

function renderizarChequeos(checks) {
  tbody.replaceChildren();

  if (checks.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 4;
    cell.className = "text-center";
    cell.textContent = "No hay chequeos registrados.";

    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  checks.forEach((check) => {
    const row = document.createElement("tr");

    const nombreCell = document.createElement("td");
    nombreCell.textContent = String(check.nombre_host ?? "-");
    row.appendChild(nombreCell);

    const fechaCell = document.createElement("td");
    fechaCell.textContent = check.fecha_hora
      ? new Date(check.fecha_hora).toLocaleDateString("es-MX")
      : "-";

    row.appendChild(fechaCell);

    const estadoCell = document.createElement("td");
    const badge = document.createElement("span");

    badge.className = `badge ${estadoBadge(check.estado)}`;
    badge.textContent = String(check.estado ?? '-');

    estadoCell.appendChild(badge);
    row.appendChild(estadoCell);

    const tiempoCell = document.createElement("td");
    tiempoCell.textContent = String(check.tiempo_respuesta_ms ?? "-");

    row.appendChild(tiempoCell);

    tbody.appendChild(row);
  });
}

cargarChequeos();
