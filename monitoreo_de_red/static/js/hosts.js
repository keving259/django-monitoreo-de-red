const token = localStorage.getItem("authToken");

if (!token) {
  window.location.href = "/login/";
}

fetch("/hosts/", {
  headers: {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    } return response.json();
  })
  .then((data) => {
    const tbody = document.querySelector("#tabla-hosts tbody");

    function estadoBadge(estado) {
      const colors = {
        up: "bg-success",
        down: "bg-danger",
        timeout: "bg-warning text-dark",
      };
      const color = colors[estado] || "bg-secondary";
      return `<span class="badge ${color}">${estado ?? "Sin chequeos"}</span>`;
    }

    tbody.innerHTML = "";

    data.forEach((host) => {
      const row = document.createElement("tr");

      const fecha = host.ultimo_chequeo?.fecha_hora
        ? new Date(host.ultimo_chequeo.fecha_hora).toLocaleDateString("es-MX")
        : "Sin chequeos";

      row.innerHTML = `
            <td>${host.nombre}</td>
            <td>${host.hostname}</td>
            <td>${host.tipo_servicio}</td>
            <td>${host.ip_address}</td>
            <td>${host.puerto}</td>
            <td>${host.intervalo_chequeo}</td>
            <td>${estadoBadge(host.ultimo_chequeo?.estado)}</td>
            <td>${fecha}</td>
        `;

      tbody.appendChild(row);
    });
  })
  .catch((error) => {
    console.log("Error al cargar los hosts:", error);
  });
