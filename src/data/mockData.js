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

export const currentUser = { id: 1, username: "admin", email: "admin@example.com", nombre: "Admin", apellido: "User", telefono: "1100000000", rol: "ADMIN", activo: true, createdAt: "2026-01-01T10:00:00" };

export const users = [
  currentUser,
  { id: 2, username: "messi", email: "messi@example.com", nombre: "Lionel", apellido: "Messi", telefono: "1199999999", rol: "USER", activo: true, createdAt: "2026-05-01T10:00:00" },
  { id: 3, username: "juan", email: "juan@example.com", nombre: "Juan", apellido: "Garcia", telefono: "1123456789", rol: "USER", activo: true, createdAt: "2026-03-15T10:00:00" },
  { id: 4, username: "maria", email: "maria@example.com", nombre: "Maria", apellido: "Lopez", telefono: "1123456790", rol: "USER", activo: true, createdAt: "2026-02-22T10:00:00" },
  { id: 5, username: "carlos", email: "carlos@example.com", nombre: "Carlos", apellido: "Martinez", telefono: "1123456791", rol: "USER", activo: true, createdAt: "2026-01-10T10:00:00" }
];

export const coupons = [
  { id: 1, codigo: "PADEL2026", descuento: 15, tipoDescuento: "PORCENTAJE", activo: true, fechaVencimiento: "2026-12-31", usosMaximos: 50, usosActuales: 23 },
  { id: 2, codigo: "VERANO50", descuento: 5000, tipoDescuento: "MONTO_FIJO", activo: true, fechaVencimiento: "2026-06-30", usosMaximos: 100, usosActuales: 8 },
  { id: 3, codigo: "PROMO20", descuento: 20, tipoDescuento: "PORCENTAJE", activo: true, fechaVencimiento: "2026-05-15", usosMaximos: 30, usosActuales: 0 },
  { id: 4, codigo: "NOVIEMBRE10", descuento: 1000, tipoDescuento: "MONTO_FIJO", activo: true, fechaVencimiento: "2026-11-15", usosMaximos: 25, usosActuales: 15 }
];

export const orders = [
  { id: 10023, idUsuario: 3, idDireccion: 1, fechaPedido: new Date().toISOString(), estadoPedido: "CONFIRMADO", total: 39100, metodoEnvio: "ENVIO_DOMICILIO", observaciones: "", codigoCupon: "PADEL2026", descuentoAplicado: 6900, detalles: [{ id: 1, idProducto: 1, nombreProducto: "Pala Bullpadel Hack 03", cantidad: 1, precioUnitario: 32000, subtotal: 32000 }, { id: 2, idProducto: 3, nombreProducto: "Pelota Dunlop Pro x3", cantidad: 2, precioUnitario: 2800, subtotal: 5600 }] },
  { id: 10018, idUsuario: 4, idDireccion: 2, fechaPedido: "2026-05-27T16:20:00", estadoPedido: "ENVIADO", total: 45000, metodoEnvio: "ENVIO_DOMICILIO", observaciones: "", codigoCupon: null, descuentoAplicado: 0, detalles: [{ id: 3, idProducto: 4, nombreProducto: "Zapatillas Wilson Rush Pro", cantidad: 1, precioUnitario: 45000, subtotal: 45000 }] },
  { id: 10008, idUsuario: 5, idDireccion: 3, fechaPedido: "2026-05-27T11:45:00", estadoPedido: "CONFIRMADO", total: 10700, metodoEnvio: "RETIRO_TIENDA", observaciones: "", codigoCupon: null, descuentoAplicado: 0, detalles: [{ id: 4, idProducto: 5, nombreProducto: "Bolso Adidas Padel", cantidad: 1, precioUnitario: 9500, subtotal: 9500 }, { id: 5, idProducto: 7, nombreProducto: "Grip Head Pro", cantidad: 1, precioUnitario: 1200, subtotal: 1200 }] },
  { id: 10002, idUsuario: 3, idDireccion: 4, fechaPedido: "2026-05-26T09:15:00", estadoPedido: "PENDIENTE", total: 18500, metodoEnvio: "ENVIO_EXPRES", observaciones: "", codigoCupon: null, descuentoAplicado: 0, detalles: [{ id: 6, idProducto: 2, nombreProducto: "Pala Head Alpha Pro", cantidad: 1, precioUnitario: 18500, subtotal: 18500 }] }
];
