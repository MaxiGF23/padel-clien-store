export const categories = [
  { id: 1, nombreCategoria: "Palas", descripcion: "Palas de padel" },
  { id: 2, nombreCategoria: "Pelotas", descripcion: "Pelotas oficiales" },
  { id: 3, nombreCategoria: "Ropa y Calzado", descripcion: "Indumentaria deportiva" },
  { id: 4, nombreCategoria: "Accesorios", descripcion: "Bolsos, grips y protectores" }
];

export const products = [
  { id: 1, nombreProducto: "Pala Bullpadel Hack 03", stock: 15, descripcion: "Pala de alto rendimiento con nucleo de goma EVA. Disenada para jugadores avanzados que buscan potencia y control.", precio: 32000, marca: "Bullpadel", tieneImagen: true, idCategoria: 1, nombreCategoria: "Palas", visual: "🏓", atributos: { material: "Carbono", nucleo: "Goma EVA", balance: "Medio-alto" } },
  { id: 2, nombreProducto: "Pala Head Alpha Pro", stock: 10, descripcion: "Pala redonda para jugadores intermedios.", precio: 18500, marca: "Head", tieneImagen: true, idCategoria: 1, nombreCategoria: "Palas", visual: "🎾", atributos: { material: "Fibra mixta", nucleo: "Foam", balance: "Medio" } },
  { id: 3, nombreProducto: "Pelota Dunlop Pro x3", stock: 50, descripcion: "Pack de 3 pelotas de competicion.", precio: 2800, marca: "Dunlop", tieneImagen: true, idCategoria: 2, nombreCategoria: "Pelotas", visual: "🟡", atributos: { formato: "Tubo x3", uso: "Competicion" } },
  { id: 4, nombreProducto: "Zapatillas Wilson Rush Pro", stock: 20, descripcion: "Zapatillas especiales para padel, suela omni.", precio: 45000, marca: "Wilson", tieneImagen: true, idCategoria: 3, nombreCategoria: "Ropa y Calzado", visual: "👟", atributos: { suela: "Omni", superficie: "Cesped sintetico" } },
  { id: 5, nombreProducto: "Bolso Adidas Padel", stock: 25, descripcion: "Bolso deportivo con compartimento para pala.", precio: 9500, marca: "Adidas", tieneImagen: true, idCategoria: 4, nombreCategoria: "Accesorios", visual: "🎒", atributos: { capacidad: "32 L", material: "Poliester" } },
  { id: 6, nombreProducto: "Pala Bullpadel Vertex", stock: 8, descripcion: "Pala de potencia con superficie rugosa.", precio: 38500, marca: "Bullpadel", tieneImagen: true, idCategoria: 1, nombreCategoria: "Palas", visual: "🏓", atributos: { material: "Carbono", balance: "Alto" } },
  { id: 7, nombreProducto: "Grip Head Pro", stock: 35, descripcion: "Grip adherente para entrenamientos intensos.", precio: 1200, marca: "Head", tieneImagen: true, idCategoria: 4, nombreCategoria: "Accesorios", visual: "🎯", atributos: { unidades: "1", tacto: "Seco" } },
  { id: 8, nombreProducto: "Remera Adidas Club", stock: 18, descripcion: "Remera liviana de secado rapido.", precio: 7800, marca: "Adidas", tieneImagen: true, idCategoria: 3, nombreCategoria: "Ropa y Calzado", visual: "👕", atributos: { tela: "Climalite", calce: "Regular" } }
];

export const currentUser = { id: 2, username: "messi", email: "messi@example.com", nombre: "Lionel", apellido: "Messi", telefono: "1199999999", rol: "USER", activo: true, createdAt: "2026-05-01T10:00:00" };

export const orders = [
  { id: 10023, idUsuario: 2, fechaPedido: "2026-05-14T12:10:00", estadoPedido: "EN_CAMINO", total: 39100, metodoEnvio: "ENVIO_DOMICILIO", detalles: [{ id: 1, idProducto: 1, nombreProducto: "Pala Bullpadel Hack 03", cantidad: 1, precioUnitario: 32000, subtotal: 32000 }, { id: 2, idProducto: 3, nombreProducto: "Pelota Dunlop Pro x3", cantidad: 2, precioUnitario: 2800, subtotal: 5600 }] },
  { id: 10018, idUsuario: 2, fechaPedido: "2026-05-09T16:20:00", estadoPedido: "ENTREGADO", total: 45000, metodoEnvio: "ENVIO_DOMICILIO", detalles: [{ id: 3, idProducto: 4, nombreProducto: "Zapatillas Wilson Rush Pro", cantidad: 1, precioUnitario: 45000, subtotal: 45000 }] },
  { id: 10008, idUsuario: 2, fechaPedido: "2026-04-21T11:45:00", estadoPedido: "ENTREGADO", total: 10700, metodoEnvio: "RETIRO_TIENDA", detalles: [{ id: 4, idProducto: 5, nombreProducto: "Bolso Adidas Padel", cantidad: 1, precioUnitario: 9500, subtotal: 9500 }, { id: 5, idProducto: 7, nombreProducto: "Grip Head Pro", cantidad: 1, precioUnitario: 1200, subtotal: 1200 }] },
  { id: 10002, idUsuario: 2, fechaPedido: "2026-04-02T09:15:00", estadoPedido: "CANCELADO", total: 18500, metodoEnvio: "ENVIO_EXPRES", detalles: [{ id: 6, idProducto: 2, nombreProducto: "Pala Head Alpha Pro", cantidad: 1, precioUnitario: 18500, subtotal: 18500 }] }
];
