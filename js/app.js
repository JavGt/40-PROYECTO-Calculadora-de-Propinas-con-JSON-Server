let cliente = {
	mesa: "",
	hora: "",
	pedido: [],
};

const categorias = {
	1: "Comida",
	2: "Bebidas",
	3: "Postres",
};

const btnGuardarCliente = document.querySelector("#guardar-cliente");

// Eventos
btnGuardarCliente.addEventListener("click", guardarCliente);

function guardarCliente(e) {
	const mesa = document.querySelector("#mesa").value;
	const hora = document.querySelector("#hora").value;

	// Revisar si hay campos vacios
	const camposVacios = [mesa, hora].some((campo) => campo == "");

	if (camposVacios) {
		// Verificar si ya hay una alerta
		const alertaExistente = document.querySelector(".alerta-modal");
		if (!alertaExistente) {
			const alerta = document.createElement("DIV");
			alerta.classList.add(
				"invalid-feedback",
				"d-block",
				"text-center",
				"alerta-modal"
			);
			alerta.textContent = "Todos los campos son obligatorios";

			document.querySelector(".modal-body form").appendChild(alerta);

			// Borrar la alerta despues de 3s
			setTimeout(() => {
				alerta.remove();
			}, 3000);
		}
		return;
	}

	// Asignar datos del formulario a cliente
	cliente = {
		...cliente,
		mesa,
		hora,
	};

	// ocultar modal
	const modalFormulario = document.querySelector("#formulario");
	const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
	modalBootstrap.hide();

	// Mostrar las secciones
	mostrarSecciones();

	// Obtener platillos de la api de JSON Server
	obtenerPlatillos();
}

function obtenerPlatillos() {
	const url = "http://localhost:4000/platillos";

	fetch(url)
		.then((respuesta) => respuesta.json())
		.then((resultado) => mostrarPlatillos(resultado))
		.catch((error) => console.log(error));
}

function mostrarSecciones() {
	const seccionesOcultas = document.querySelectorAll(".d-none");

	seccionesOcultas.forEach((seccion) => seccion.classList.remove("d-none"));
}

function mostrarPlatillos(platillos) {
	const contenido = document.querySelector("#platillos .contenido");

	platillos.forEach((platillo) => {
		// const { id, nombre, precio, categoria } = platillo;

		const row = document.createElement("DIV");
		row.classList.add("row", "py-3", "border-top");

		const nombre = document.createElement("DIV");
		nombre.classList.add("col-md-4");
		nombre.textContent = platillo.nombre;

		const precio = document.createElement("DIV");
		precio.classList.add("col-md-3", "fw-bold");
		precio.textContent = `$${platillo.precio}`;

		const categoria = document.createElement("DIV");
		categoria.classList.add("col-md-3");
		categoria.textContent = categorias[platillo.categoria];

		// Agregar el input para saber que fue lo que pidio esta persona
		const inputCantidad = document.createElement("INPUT");
		inputCantidad.type = "number";
		inputCantidad.min = 0;
		inputCantidad.id = `producto-${platillo.id}`;
		inputCantidad.classList.add("form-control");
		inputCantidad.value = 0;

		// funcion que detecta la cantidad y el platillo que se esta agregando
		inputCantidad.onchange = () => {
			const cantidad = parseInt(inputCantidad.value);
			agregarPlatillo({ ...platillo, cantidad });
		};

		const agregar = document.createElement("DIV");
		agregar.classList.add("col-md-2");
		agregar.appendChild(inputCantidad);

		// Agregar los nodos o hijos
		row.appendChild(nombre);
		row.appendChild(precio);
		row.appendChild(categoria);
		row.appendChild(agregar);
		contenido.appendChild(row);
	});
}

function agregarPlatillo(producto) {
	// Extraer el pedido actual
	let { pedido } = cliente;

	const { cantidad } = producto;
	// Revisar que la cantidad sea mayor a 0

	if (cantidad > 0) {
		// Comprueba si el elemento ya existe en el array
		if (pedido.some((articulo) => articulo.id === producto.id)) {
			// El articulo ya existe, se debe actualizar la cantidad
			const pedidoActulizado = pedido.map((articulo) => {
				if (articulo.id === producto.id) {
					articulo.cantidad = producto.cantidad;
				}
				return articulo;
			});

			// Se asigna el nuevo array a cliente
			cliente.pedido = [...pedidoActulizado];
		} else {
			// El articulo no existe, se agrega al array
			cliente.pedido = [...pedido, producto];
		}
	} else {
		// eliminar elementos cuando la cantidad es 0
		const resultado = pedido.filter((articulo) => articulo.id !== producto.id);
		cliente.pedido = [...resultado];
	}

	// limpiar el codigo html previo
	limpiarHTML();

	if (cliente.pedido.length) {
		// Mostrar el resumen
		actualizarResumen();
	} else {
		mensajePedidoVacio();
	}
}

function limpiarHTML() {
	const contenido = document.querySelector("#resumen .contenido");

	while (contenido.firstChild) {
		contenido.removeChild(contenido.firstChild);
	}
}

function actualizarResumen() {
	const contenido = document.querySelector("#resumen .contenido");

	const resumen = document.createElement("DIV");
	resumen.classList.add("col-md-6", "card", "py-2", "px-3", "shadow");

	// scripting para mesa
	const mesa = document.createElement("P");
	mesa.textContent = `Mesa: `;
	mesa.classList.add("fw-bold");

	const mesaSpan = document.createElement("SPAN");
	mesaSpan.textContent = cliente.mesa;
	mesaSpan.classList.add("fw-normal");

	// Scripting para hora
	const hora = document.createElement("P");
	hora.textContent = `Hora: `;
	hora.classList.add("fw-bold");

	const horaSpan = document.createElement("SPAN");
	horaSpan.textContent = cliente.hora;
	horaSpan.classList.add("fw-normal");

	// Titulo de la seccion
	const heading = document.createElement("h3");
	heading.textContent = "Platillos consumidos";
	heading.classList.add("my-4", "text-center");

	// Iterar sobre el array de los pedidos e ir consumiendo
	const grupo = document.createElement("UL");
	grupo.classList.add("list-group");

	const { pedido } = cliente;

	pedido.forEach((articulo) => {
		const { nombre, cantidad, precio, id } = articulo;

		const lista = document.createElement("LI");
		lista.classList.add("list-group-item");

		const nombreEl = document.createElement("H4");
		nombreEl.classList.add("my-4");
		nombreEl.textContent = nombre;

		// Cantidad del articulo
		const cantidadEl = document.createElement("p");
		cantidadEl.classList.add("fw-bold");
		cantidadEl.textContent = "Cantidad: ";

		const cantidadValor = document.createElement("SPAN");
		cantidadValor.classList.add("fw-normal");
		cantidadValor.textContent = cantidad;

		// precio del articulo
		const precioEl = document.createElement("p");
		precioEl.classList.add("fw-bold");
		precioEl.textContent = "Precio: $";

		const precioValor = document.createElement("SPAN");
		precioValor.classList.add("fw-normal");
		precioValor.textContent = precio;

		// sub total del articulo
		const subtotalEl = document.createElement("p");
		subtotalEl.classList.add("fw-bold");
		subtotalEl.textContent = "Subtotal: ";

		const subtotalValor = document.createElement("SPAN");
		subtotalValor.classList.add("fw-normal");
		subtotalValor.textContent = calcularSubTotal(precio, cantidad);

		// boton para eliminar
		const btnEliminar = document.createElement("BUTTON");
		btnEliminar.classList.add("btn", "btn-danger");
		btnEliminar.textContent = "Eliminar Articulo";

		// Funcion para eliminar del pedido
		btnEliminar.onclick = function () {
			eliminarProducto(id);
		};

		// Agregar valores a sus contenedores
		cantidadEl.appendChild(cantidadValor);
		precioEl.appendChild(precioValor);
		subtotalEl.appendChild(subtotalValor);

		// Agregar elementos al LI
		lista.appendChild(nombreEl);
		lista.appendChild(cantidadEl);
		lista.appendChild(precioEl);
		lista.appendChild(subtotalEl);
		lista.appendChild(btnEliminar);

		// Agregar lista al grupo principal
		grupo.appendChild(lista);
	});

	// Insertar en el html
	mesa.appendChild(mesaSpan);
	hora.appendChild(horaSpan);

	resumen.appendChild(heading);
	resumen.appendChild(mesa);
	resumen.appendChild(hora);
	resumen.appendChild(grupo);

	contenido.appendChild(resumen);

	// Mostrar formulario de propinas
	formularioPropinas();
}

function calcularSubTotal(precio, cantidad) {
	return `$ ${precio * cantidad}`;
}

function eliminarProducto(id) {
	const { pedido } = cliente;

	const resultado = pedido.filter((articulo) => articulo.id !== id);
	cliente.pedido = [...resultado];

	// limpiar el codigo html previo
	limpiarHTML();

	if (cliente.pedido.length) {
		// Mostrar el resumen
		actualizarResumen();
	} else {
		mensajePedidoVacio();
	}

	// El producto se elimino por lo tanto regresamos la cantidad
	const productoEliminado = `#producto-${id}`;
	const inputEliminado = document.querySelector(productoEliminado);
	inputEliminado.value = 0;
}

function mensajePedidoVacio() {
	const contenido = document.querySelector("#resumen .contenido");

	const texto = document.createElement("P");
	texto.classList.add("text-center");
	texto.textContent = "Añade los elementos del pedido";

	contenido.appendChild(texto);
}

function formularioPropinas() {
	const contenido = document.querySelector("#resumen .contenido");

	const formulario = document.createElement("div");
	formulario.classList.add("col-md-6", "formulario");

	const divFormulario = document.createElement("div");
	divFormulario.classList.add("card", "py-2", "shadow", "px-3");

	const heading = document.createElement("H3");
	heading.classList.add("my-4", "text-center");
	heading.textContent = "Propina";

	// Radio button 10%
	const radio10 = document.createElement("INPUT");
	radio10.type = "radio";
	radio10.name = "propina";
	radio10.value = "10";
	radio10.classList.add("form-check-input");
	radio10.onclick = calcularPropina;

	const radio10Label = document.createElement("label");
	radio10Label.textContent = "10%";
	radio10Label.classList.add("form-check-label");

	const radio10Div = document.createElement("DIV");
	radio10Div.classList.add("form-check");

	radio10Div.appendChild(radio10);
	radio10Div.appendChild(radio10Label);

	// Radio button 25%
	const radio25 = document.createElement("INPUT");
	radio25.type = "radio";
	radio25.name = "propina";
	radio25.value = "25";
	radio25.classList.add("form-check-input");
	radio25.onclick = calcularPropina;

	const radio25Label = document.createElement("label");
	radio25Label.textContent = "25%";
	radio25Label.classList.add("form-check-label");

	const radio25Div = document.createElement("DIV");
	radio25Div.classList.add("form-check");

	radio10Div.appendChild(radio10);
	radio10Div.appendChild(radio10Label);

	radio25Div.appendChild(radio25);
	radio25Div.appendChild(radio25Label);

	// Radio button 50%
	const radio50 = document.createElement("INPUT");
	radio50.type = "radio";
	radio50.name = "propina";
	radio50.value = "50";
	radio50.classList.add("form-check-input");
	radio50.onclick = calcularPropina;

	const radio50Label = document.createElement("label");
	radio50Label.textContent = "50%";
	radio50Label.classList.add("form-check-label");

	const radio50Div = document.createElement("DIV");
	radio50Div.classList.add("form-check");

	radio10Div.appendChild(radio10);
	radio10Div.appendChild(radio10Label);

	radio25Div.appendChild(radio25);
	radio25Div.appendChild(radio25Label);

	radio50Div.appendChild(radio50);
	radio50Div.appendChild(radio50Label);

	// Agregar al div principal
	divFormulario.appendChild(heading);
	divFormulario.appendChild(radio10Div);
	divFormulario.appendChild(radio25Div);
	divFormulario.appendChild(radio50Div);

	// Agregar al formulario
	formulario.appendChild(divFormulario);

	contenido.appendChild(formulario);
}

function calcularPropina() {
	const { pedido } = cliente;
	let subTotal = 0;

	// Calcular el sub total a pagar
	pedido.forEach((articulo) => {
		subTotal += articulo.cantidad * articulo.precio;
	});

	// Seleccionar el radio button con la propina del cliente
	const propinaSeleccionada = document.querySelector(
		'[name="propina"]:checked'
	).value;

	// Calcular la propina
	const propina = (subTotal * parseInt(propinaSeleccionada)) / 100;

	// calcular el total a pagar
	const total = subTotal + propina;

	mostrarTotalHTML(subTotal, total, propina);
}

function mostrarTotalHTML(subTotal, total, propina) {
	const divTotales = document.createElement("DIV");
	divTotales.classList.add("total-pagar", "my-5");

	// Sub total
	const subTotalParrafo = document.createElement("P");
	subTotalParrafo.classList.add("fs-3", "fw-bold", "mt-2");
	subTotalParrafo.textContent = "Subtotal consumo: $";

	const subTotalSpan = document.createElement("SPAN");
	subTotalSpan.classList.add("fw-normal");
	subTotalSpan.textContent = subTotal;

	subTotalParrafo.appendChild(subTotalSpan);

	// Propina
	const propinaParrafo = document.createElement("P");
	propinaParrafo.classList.add("fs-3", "fw-bold", "mt-2");
	propinaParrafo.textContent = "Propina: $";

	const propinaSpan = document.createElement("SPAN");
	propinaSpan.classList.add("fw-normal");
	propinaSpan.textContent = propina;

	// total
	const totalParrafo = document.createElement("P");
	totalParrafo.classList.add("fs-3", "fw-bold", "mt-2");
	totalParrafo.textContent = "Total: $";

	const totalSpan = document.createElement("SPAN");
	totalSpan.classList.add("fw-normal");
	totalSpan.textContent = total;

	// limpiar el html anterior
	const totalPagarDiv = document.querySelector(".total-pagar");
	if (totalPagarDiv) {
		totalPagarDiv.remove();
	}

	// Agregar el html
	subTotalParrafo.appendChild(subTotalSpan);
	propinaParrafo.appendChild(propinaSpan);
	totalParrafo.appendChild(totalSpan);

	divTotales.appendChild(subTotalParrafo);
	divTotales.appendChild(propinaParrafo);
	divTotales.appendChild(totalParrafo);

	const formulario = document.querySelector(".formulario > div");
	formulario.appendChild(divTotales);
}
