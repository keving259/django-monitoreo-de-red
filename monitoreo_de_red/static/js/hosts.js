const token = localStorage.getItem("authToken");

if (!token) {
  window.location.href = "/login/";
} else {
  const tbody = document.querySelector('#tabla-hosts tbody');
  const modalElement = document.getElementById("modalEditar");
  const modalEdit = bootstrap.Modal.getOrCreateInstance(modalElement);

  const formEdit = document.getElementById('form-editar');
  const editId = document.getElementById('editar-id');
  const editNombre = document.getElementById('editar-nombre');
  const editHostname = document.getElementById('editar-hostname');
  const editIp = document.getElementById('editar-ip');
  const editPuerto = document.getElementById('editar-puerto');
  const editActivo = document.getElementById('editar-activo');
  const editError = document.getElementById('editar-error');
  const guardarBtn = document.getElementById('guardar-cambios');

  let hosts = [];
  let valoresOriginales = null;

  function headersJSON() {
    return {
      Authorization : `Token ${token}`,
      'Content-Type': 'application/json'
    };
  }

  function obtenerValoresFormulario() {
    return {
      nombre: editNombre.value.trim(),
      hostname: editHostname.value.trim(),
      ip_address: editIp.value.trim(),
      puerto: Number(editPuerto.value),
      estado: editActivo.value === 'True'
    };
  }

  function normalizarHost(host) {
    return {
      nombre: String(host.nombre ?? ""),
      hostname: String(host.hostname ?? ""),
      ip_address: String(host.ip_address ?? ""),
      puerto: Number(host.puerto),
      estado: host.estado === true || host.estado === "True"
    };
  }

  async function cargarHosts() {
    const response = await fetch('/hosts/', {
      headers: headersJSON()
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    hosts = await response.json();
    renderizarHosts();
  }

  function estadoBadge(estado) {
      const colors = {
        up: "bg-success",
        down: "bg-danger",
        timeout: "bg-warning text-dark",
      };

      const color = colors[estado] || "bg-secondary";
      const badge = document.createElement('span');

      badge.className = `badge ${color}`;
      badge.textContent = estado ?? "Sin chequeos";

      return badge
  
  
  }

  function renderizarHosts() {
    tbody.replaceChildren();

    hosts.forEach((host) => {
      const row = document.createElement('tr');
      row.dataset.id = host.id;

      const fecha = host.ultimo_chequeo?.fecha_hora
      ? new Date(host.ultimo_chequeo.fecha_hora).toLocaleDateString('es-MX') : 'Sin chequeos';

      const valores = [
        host.nombre,
        host.hostname,
        host.tipo_servicio,
        host.ip_address,
        host.puerto,
        host.intervalo_chequeo
      ];

      valores.forEach((valor) => {
        const td = document.createElement('td');
        td.textContent = valor ?? "";
        row.appendChild(td);
      });

      const tdEstado = document.createElement('td');
      tdEstado.appendChild(
        estadoBadge(host.ultimo_chequeo?.estado)
      );
      row.appendChild(tdEstado);

      const tdFecha = document.createElement('td');
      tdFecha.textContent = fecha;
      row.appendChild(tdFecha);

      const tdAcciones = document.createElement('td');

      const editarBtn = document.createElement("button");
      editarBtn.type = "button";
      editarBtn.className = 'btn btn-sm btn-outline-primary me-2';
      editarBtn.dataset.action = 'editar';
      editarBtn.dataset.id = host.id;
      editarBtn.textContent = "Editar";

      const eliminarBtn = document.createElement("button");
      eliminarBtn.type = "button";
      eliminarBtn.className = 'btn btn-sm btn-outline-danger';
      eliminarBtn.dataset.action = 'eliminar';
      eliminarBtn.dataset.id = host.id;
      eliminarBtn.textContent = "Eliminar";

      tdAcciones.append(editarBtn, eliminarBtn);
      row.appendChild(tdAcciones);
      tbody.appendChild(row);
    });
  }

  tbody.addEventListener('click', (e) => {
    const button = e.target.closest("button[data-action]");

    if (!button || !tbody.contains(button)) return;

    const { id, action } = button.dataset;

    if (action === 'editar') {
      const host = hosts.find(
        (h) => String(h.id) === String(id)
      );

      if (!host) {
        console.log("No se encontró el host:", id);
        return;
      }

      editId.value = host.id;
      editNombre.value = host.nombre ?? "";
      editHostname.value = host.hostname ?? "";
      editIp.value = host.ip_address ?? "";
      editPuerto.value = host.puerto ?? "";

      editActivo.value = host.activo === false || host.activo === "False" ? "False" : "True";

      valoresOriginales = normalizarHost(host);
      
      editError.textContent = '';
      guardarBtn.disabled = false;
      guardarBtn.textContent = "Guardar cambios";

      modalEdit.show();
    } else if (action === "eliminar") {
      console.log("Eliminar host:", id);
      // DELETE
    }
  });

  formEdit.addEventListener("submit", async (e) => {
    e.preventDefault();

    editError.textContent = '';

    if (!formEdit.reportValidity()) return;

    if (!valoresOriginales) {
      editError.textContent = "No se pudieron recuperar los datos originales";
      return;
    }

    const valoresActuales = obtenerValoresFormulario();
    const cambios = {};

    for (const campo of Object.keys(valoresActuales)){
      if (valoresActuales[campo] !== valoresOriginales[campo]) {
        cambios[campo] = valoresActuales[campo];
      }
    }

    if (Object.keys(cambios).length === 0) {
      modalEdit.hide();
      return;
    }

    const id = editId.value;

    guardarBtn.disabled = true;
    guardarBtn.textContent = "Guardando...";

    try {
      const response = await fetch(
        `/hosts/${encodeURIComponent(id)}/`,
        {
          method: "PATCH",
          headers: headersJSON(),
          body: JSON.stringify(cambios)
        }
      );

      if (!response.ok) {
        let message = `Error HTTP: ${response.status}`;

        try {
          const errorData = await response.json();

          if (errorData.detail) {
            message = errorData.detail
          } else {
            message = Object.entries(errorData)
              .map(([campo, error]) => 
              `${campo}: ${
                Array.isArray(error)
                ? error.join(', ')
                : typeof error === 'object'
                  ? JSON.stringify(error)
                  : error
              }`
            )
            .join(" | ");
          }
        } catch {

        }

        throw new Error(message);
      }
      const index = hosts.findIndex(
        (h) => String(h.id) === String(id)
      );

      if (index !== -1) {
        hosts[index] = {
          ...hosts[index],
          ...cambios
        };
      }

      renderizarHosts();
      modalEdit.hide();
      valoresOriginales = null;
    } catch (error) {
      console.error("Error al actualizar el host:", error);
      editError.textContent = 
      error.message || "No se pudieron guardar los cambios";
    } finally {
      guardarBtn.disabled = false;
      guardarBtn.textContent = "Guardar cambios";
    }
  });

  cargarHosts().catch((error) => {
    console.error("Error al cargar los hosts:", error);
  });
}
