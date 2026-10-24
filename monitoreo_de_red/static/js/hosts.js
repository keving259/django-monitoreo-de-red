const token = localStorage.getItem("authToken");

if (!token) {
  window.location.href = "/login/";
} else {
  const tbody = document.querySelector("#tabla-hosts tbody");

  const modalElement = document.getElementById("modalEditar");
  const modalEdit = bootstrap.Modal.getOrCreateInstance(modalElement);

  const formEdit = document.getElementById("form-editar");
  const editId = document.getElementById("editar-id");
  const editNombre = document.getElementById("editar-nombre");
  const editHostname = document.getElementById("editar-hostname");
  const editIp = document.getElementById("editar-ip");
  const editPuerto = document.getElementById("editar-puerto");
  const editActivo = document.getElementById("editar-activo");
  const editError = document.getElementById("editar-error");
  const guardarBtn = document.getElementById("guardar-cambios");

  const modalCreateElement = document.getElementById("modalCrear");
  const modalCreate = bootstrap.Modal.getOrCreateInstance(modalCreateElement);

  const btnCreateHost = document.getElementById("btn-crear-host");
  const formCreate = document.getElementById("form-crear");

  const step1 = document.getElementById("crear-step-1");
  const step2 = document.getElementById("crear-step-2");
  const stepText = document.getElementById("crear-paso-texto");
  const progress = document.getElementById("crear-progreso");

  const btnAnterior = document.getElementById("crear-anterior");
  const btnSiguiente = document.getElementById("crear-siguiente");
  const btnCrearGuardar = document.getElementById("crear-guardar");
  const crearError = document.getElementById("crear-error");

  const crearNombre = document.getElementById("crear-nombre");
  const crearHostname = document.getElementById("crear-hostname");
  const crearIp = document.getElementById("crear-ip");
  const crearPuerto = document.getElementById("crear-puerto");
  const crearTipo = document.getElementById("crear-tipo");
  const crearHoras = document.getElementById("crear-horas");
  const crearMinutos = document.getElementById("crear-minutos");
  const crearSegundos = document.getElementById("crear-segundos");
  const crearActivo = document.getElementById("crear-activo");

  let hosts = [];
  let valoresOriginales = null;
  let pasoActual = 1;

  function headersJSON() {
    return {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    };
  }

  function formatError(errorData, status) {
    if (errorData && errorData.detail) {
      return typeof errorData.detail === "string"
        ? errorData.detail
        : JSON.stringify(errorData.detail);
    }

    if (
      errorData &&
      typeof errorData === "object" &&
      !Array.isArray(errorData)
    ) {
      const messages = Object.entries(errorData).map(([field, errors]) => {
        const detail = Array.isArray(errors)
          ? errors
              .map((error) =>
                typeof error === "object"
                  ? JSON.stringify(error)
                  : String(error),
              )
              .join(", ")
          : typeof errors === "object" && errors !== null
            ? JSON.stringify(errors)
            : String(errors);
        return `${field}: ${detail}`;
      });

      if (messages.length > 0) {
        return messages.join(" | ");
      }
    }
    return `Error HTTP: ${status}`;
  }

  function obtenerIntervaloSegundos() {
    const horas = Number(crearHoras.value);
    const minutos = Number(crearMinutos.value);
    const segundos = Number(crearSegundos.value);

    return horas * 3600 + minutos * 60 + segundos
  }

  function validarIntervalo() {
    const fields = [crearHoras, crearMinutos, crearSegundos];

    for (const field of fields) {
      const value = Number(field.value);

      if (
        field.value.trim() === "" ||
        !Number.isInteger(value) ||
        value < 0 ||
        !field.checkValidity()
      ) {
        field.reportValidity();
        return false;
      }
    }

    if (obtenerIntervaloSegundos() <= 0) {
      crearError.textContent = "El intervalo de chequeo debe ser mayor que cero.";
      crearMinutos.focus();
      return false;
    }
    return true;
  }

  function formatearIntervalo(totalSegundos) {
    const total = Number(totalSegundos);

    if (!Number.isInteger(total) || total < 0) {
      return '-';
    }

    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const segundos = total % 60;

    return [
      String(horas).padStart(2, "0"),
      String(minutos).padStart(2, '0'),
      String(segundos).padStart(2, "0")
    ].join(":")
  }


  async function errorMessageResponse(response) {
    try {
      const errorData = await response.json();
      return formatError(errorData, response.status);
    } catch {
      return `Error HTTP: ${response.status}`;
    }
  }

  function obtenerValoresFormulario() {
    return {
      nombre: editNombre.value.trim(),
      hostname: editHostname.value.trim(),
      ip_address: editIp.value.trim(),
      puerto: Number(editPuerto.value),
      estado: editActivo.value === "True",
    };
  }

  function normalizarHost(host) {
    return {
      nombre: String(host.nombre ?? ""),
      hostname: String(host.hostname ?? ""),
      ip_address: String(host.ip_address ?? ""),
      puerto: Number(host.puerto),
      activo: host.activo === true || host.activo === "True",
    };
  }

  async function cargarHosts() {
    const response = await fetch("/hosts/", {
      headers: headersJSON(),
    });

    if (!response.ok) {
      throw new Error(await errorMessageResponse(response));
    }

    const data = await response.json();

    hosts = Array.isArray(data) ? data : (data.results ?? []);

    renderizarHosts();
  }

  async function eliminarHost(id, button) {
    const confirm = window.confirm(
      "¿Estás seguro de que deseas eliminar este host? Esta acción no se puede deshacer.",
    );

    if (!confirm) return;

    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Eliminando...";

    try {
      const response = await fetch(
        `/hosts/${encodeURIComponent(id)}/`, {
        method: "DELETE",
        headers: headersJSON(),
      }
    );

      if (!response.ok) {
        throw new Error(await errorMessageResponse(response));
      }
        hosts = hosts.filter(
          (host) => String(host.id) !== String(id)
        );

        renderizarHosts();
        
      } catch (error) {
      console.log("Error al eliminar el host:", error);

      alert("No se pudo eliminar el host.");

      button.disabled = false;
      button.textContent = originalText;
    }
  }

  function estadoBadge(estado) {
    const colors = {
      up: "bg-success",
      down: "bg-danger",
      timeout: "bg-warning text-dark",
    };

    const badge = document.createElement("span");

    badge.className = `badge ${
      colors[estado] || "bg-secondary"
    }`;

    badge.textContent = estado ?? "Sin chequeos";

    return badge;
  }

  function renderizarHosts() {
    tbody.replaceChildren();

    hosts.forEach((host) => {
      const row = document.createElement("tr");
      row.dataset.id = host.id;

      const fecha = host.ultimo_chequeo?.fecha_hora
        ? new Date(
          host.ultimo_chequeo.fecha_hora
        ).toLocaleDateString("es-MX")
        : "Sin chequeos";

      const valores = [
        host.nombre,
        host.hostname,
        host.tipo_servicio,
        host.ip_address,
        host.puerto,
        formatearIntervalo(host.intervalo_chequeo),
      ];

      valores.forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor ?? "";
        row.appendChild(td);
      });

      const tdEstado = document.createElement("td");


      tdEstado.appendChild(
        estadoBadge(host.ultimo_chequeo?.estado)
      );

      row.appendChild(tdEstado);

      const tdFecha = document.createElement("td");
      tdFecha.textContent = fecha;
      row.appendChild(tdFecha);

      const tdAcciones = document.createElement("td");

      const editarBtn = document.createElement("button");
      editarBtn.type = "button";
      editarBtn.className = "btn btn-sm btn-outline-primary me-2";
      editarBtn.dataset.action = "editar";
      editarBtn.dataset.id = host.id;
      editarBtn.textContent = "Editar";

      const eliminarBtn = document.createElement("button");
      eliminarBtn.type = "button";
      eliminarBtn.className = "btn btn-sm btn-outline-danger";
      eliminarBtn.dataset.action = "eliminar";
      eliminarBtn.dataset.id = host.id;
      eliminarBtn.textContent = "Eliminar";

      tdAcciones.append(editarBtn, eliminarBtn);
      row.appendChild(tdAcciones);
      tbody.appendChild(row);
    });
  }

  tbody.addEventListener("click", async (e) => {
    const button = e.target.closest("button[data-action]");

    if (!button || !tbody.contains(button)) return;

    const { id, action } = button.dataset;

    if (action === "editar") {
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

      editActivo.value = host.activo === false ||
        host.activo === "False" 
          ? "False" 
          : "True";

      valoresOriginales = normalizarHost(host);

      editError.textContent = "";
      guardarBtn.disabled = false;
      guardarBtn.textContent = "Guardar cambios";

      modalEdit.show();
    } else if (action === "eliminar") {
      await eliminarHost(id, button);
    }
  });

  formEdit.addEventListener("submit", async (e) => {
    e.preventDefault();

    editError.textContent = "";

    if (!formEdit.reportValidity()) return;

    if (!valoresOriginales) {
      editError.textContent = "No se pudieron recuperar los datos originales";
      return;
    }

    const valoresActuales = obtenerValoresFormulario();
    const cambios = {};

    for (const field of Object.keys(valoresActuales)) {
      if (valoresActuales[field] !== valoresOriginales[field]) {
        cambios[field] = valoresActuales[field];
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
          body: JSON.stringify(cambios),
        }
      );

      if (!response.ok) {
        throw new Error (await errorMessageResponse(response));
      } 
        
        const updatedHost = await response.json();

        const index = hosts.findIndex(
          (host) => String(host.id) === String(id)
        );

        if (index !== -1) {
          hosts[index] = updatedHost;
        }

        renderizarHosts();

        valoresOriginales = null;
        modalEdit.hide();

      } catch (error) {
      console.error("Error al actualizar el host:", error);
      editError.textContent = "No se pudieron guardar los cambios";
    } finally {
      guardarBtn.disabled = false;
      guardarBtn.textContent = "Guardar cambios";
    }
  });

  cargarHosts().catch((error) => {
    console.error("Error al cargar los hosts:", error);
  });

  function cambiarPaso(step) {
    pasoActual = step;

    step1.classList.toggle("d-none", step !==1);
    step2.classList.toggle("d-none", step !== 2);

    btnAnterior.classList.toggle("d-none", step !== 2);
    btnSiguiente.classList.toggle("d-none", step !== 1);
    btnCrearGuardar.classList.toggle("d-none", step !== 2);

    stepText.textContent = step === 1
      ? "Paso 1 de 2: Conexión"
      : "Paso 2 de 2: Configuración";

    const porcentaje = step === 1 ? "50" : "100";

    progress.style.width = `${porcentaje}%`;
    progress.setAttribute('aria-valuenow', porcentaje);

    crearError.textContent = "";
  }

  function validarPaso(step) {
    const fields = step.querySelectorAll("input, select, textarea");

    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  }

  step1.addEventListener('keydown', (e) => {
    if (e.key !== "Enter") return;

    if (e.target.tagName === "TEXTAREA") return;

    e.preventDefault();

    if (!validarPaso(step1)) return;

    cambiarPaso(2);
  })

  btnCreateHost.addEventListener("click", () => {
    formCreate.reset();

    cambiarPaso(1);

    crearError.textContent = "";
    btnCrearGuardar.disabled = false;
    btnCrearGuardar.textContent = "Crear host";
    btnAnterior.disabled = false;
    btnSiguiente.disabled = false;

    modalCreate.show();
  });

  btnSiguiente.addEventListener("click", () => {
    if (!validarPaso(step1)) return;

    cambiarPaso(2);
  });

  btnAnterior.addEventListener("click", () => {
    cambiarPaso(1);
  });

  modalCreateElement.addEventListener(
    "hidden.bs.modal",
    () => {
      formCreate.reset();

      cambiarPaso(1);

      crearError.textContent = '';
      btnCrearGuardar.disabled = false;
      btnCrearGuardar.textContent = "Crear host";
      btnAnterior.disabled = false;
      btnSiguiente.disabled = false;
    }
  );

  formCreate.addEventListener("submit", async (e) => {
    e.preventDefault();

    crearError.textContent = "";

    if (pasoActual === 1) {
      if (validarPaso(step1)) {
        cambiarPaso(2);
      }
      return;
    }

    if (!validarPaso(step2)) {
      cambiarPaso(2);
      validarPaso(step2);
      return;
    }

    if (!validarIntervalo()) return;

    const newHost = {
      nombre: crearNombre.value.trim(),
      hostname: crearHostname.value.trim(),
      ip_address: crearIp.value.trim(),
      puerto: Number(crearPuerto.value),
      tipo_servicio: crearTipo.value,
      intervalo_chequeo: obtenerIntervaloSegundos(),
      activo: crearActivo.value === 'true'
    };

    btnCrearGuardar.disabled = true;
    btnAnterior.disabled = true;
    btnSiguiente.disabled = true;

    btnCrearGuardar.textContent = "Creando...";

    try {
      const response = await fetch("/hosts/", {
        method: "POST",
        headers: headersJSON(),
        body: JSON.stringify(newHost)
      });

      if (!response.ok) {
        throw new Error(await errorMessageResponse(response));
      }

      const createdHost = await response.json();

      hosts = hosts.filter(
        (host) => String(host.id) !== String(createdHost.id)
      );

      hosts.push(createdHost);

      renderizarHosts();

      modalCreate.hide();
    } catch (error) {
      console.error("Error al crear el host:", error);

      crearError.textContent = "No se puede crear el host.";
    } finally {
      btnCrearGuardar.disabled = false;
      btnAnterior.disabled = false;
      btnSiguiente.disabled = false;

      btnCrearGuardar.textContent = "Crear host";
    }
  });

  cargarHosts().catch((error) => {
    console.error("Error al cargar los hosts:", error);
  });
}
