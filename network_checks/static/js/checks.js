const { renderFile } = require("ejs");

const token = localStorage.getItem("token");
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

    cell.colSpan = 5;
    cell.className = "text-center text-danger";
    cell.textContent = "No se pudieron cargar los chequeos.";

    row.appendChild(cell);
    tbody.appendChild(row);
  }
}

function renderizarChequeos(checks) {
  tbody.replaceChildren();

  if (checks.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.className = "text-center";
    cell.textContent = "No hay chequeos registrados.";

    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  checks.forEach((check) => {
    const row = document.createElement("tr");

    const values = [
      check.id,
      check.nombre_host,
      check.fecha_hora
        ? new Date(check.fecha_hora).toLocaleDateString("es-MX")
        : "-",
      check.estado,
      check.tiempo_respuesta_ms ?? "-",
    ];

    values.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = String(value ?? "-");
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });
}

cargarChequeos();
