// script.js (reemplazar todo el archivo con esto)
document.addEventListener("DOMContentLoaded", () => {
    console.log("script.js cargado ✅");

    // ---------------------------
    // Estado: carrito (localStorage)
    // ---------------------------
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    function guardarCarrito() {
        localStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarBadge();
    }

    // ---------------------------
    // Helper: parsear precio desde texto tipo "$ 45.000"
    // ---------------------------
    function parsePrecio(text) {
        if (typeof text === "number") return text;
        if (!text) return 0;
        // quitar todo lo que no sea dígito
        const digits = String(text).replace(/[^\d]/g, "");
        return digits ? Number(digits) : 0;
    }

    // ---------------------------
    // Badge (número) en el icono carrito
    // ---------------------------
    function actualizarBadge() {
        const carritoBtn = document.getElementById("carritoBtn") || document.querySelector(".carrito");
        if (!carritoBtn) return;
        let badge = carritoBtn.querySelector(".cart-badge");
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "cart-badge";
            carritoBtn.appendChild(badge);
            // estilo mínimo para que se vea (si no lo tienes en CSS)
            const s = document.createElement("style");
            s.id = "cart-badge-style";
            s.textContent = `
            .cart-badge {
            display: inline-block;
            min-width: 18px;
            height: 18px;
            padding: 0 5px;
            font-size: 12px;
            line-height: 18px;
            text-align: center;
            border-radius: 999px;
            background: #d87ca0;
            color: white;
            position: relative;
            top: -10px;
            left: -8px;
            }
        `;
            if (!document.getElementById("cart-badge-style")) document.head.appendChild(s);
        }
        badge.textContent = carrito.length;
        badge.style.display = carrito.length > 0 ? "inline-block" : "none";
    }

    // ---------------------------
    // Renderizar carrito dentro del modal
    // ---------------------------
    // Asegúrate: en tu HTML el modal tiene id="carritoModal" y dentro .cart-items y .total
    function renderCarrito() {
        // buscar modal (si no existe, se creó más abajo)
        const carritoModalEl = document.getElementById("carritoModal");
        if (!carritoModalEl) {
            console.warn("renderCarrito: modal no encontrado (id=carritoModal)");
            return;
        }
        const contenedor = carritoModalEl.querySelector(".cart-items");
        const totalTexto = carritoModalEl.querySelector(".total");

        if (!contenedor) {
            console.warn("renderCarrito: .cart-items no encontrado dentro del modal");
            return;
        }

        contenedor.innerHTML = "";

        if (carrito.length === 0) {
            contenedor.innerHTML = `
            <div class="carrito-vacio" style="text-align:center;padding:30px;font-size:1.05rem;color:#777;">
            <h3 style="margin-bottom:8px;">El carrito está vacío ✨</h3>
            <p>Agrega productos hermosa 💕</p>
            </div>
        `;
            if (totalTexto) totalTexto.textContent = "Total a pagar: $0";
            return;
        }

        let total = 0;
        carrito.forEach((item, index) => {
            const precio = Number(item.precio) || parsePrecio(item.precio);
            total += precio;

            const div = document.createElement("div");
            div.className = "cart-item";
            div.dataset.index = index;
            div.innerHTML = `
            <img src="${item.imagen || ''}" alt="${item.nombre || ''}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;margin-right:12px;">
            <div class="cart-info" style="flex:1;text-align:left;">
            <h4 style="margin:0 0 6px;font-size:1rem;">${item.nombre || 'Producto'}</h4>
            <p style="margin:0;color:#666;font-size:0.9rem;">${item.descripcion || ''}</p>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
            <div class="cart-price" style="font-weight:bold;">$ ${precio.toLocaleString()}</div>
            <button class="remove-item" data-index="${index}" style="background:transparent;border:none;color:#d87ca0;cursor:pointer;font-size:0.95rem;">Eliminar</button>
            </div>
        `;
            contenedor.appendChild(div);
        });

        if (totalTexto) totalTexto.textContent = `Total a pagar: $${total.toLocaleString()}`;
    }

    // ---------------------------
    // Agregar producto al carrito (y guardar)
    // ---------------------------
    function agregarAlCarrito(producto) {
        // Producto esperado: { nombre, descripcion, precio (number), imagen }
        // normalizar precio a number
        producto.precio = Number(producto.precio) || parsePrecio(producto.precio);
        carrito.push(producto);
        guardarCarrito();
        renderCarrito();
    }

    

    // ---------------------------
    // Cargar productos (te aprovechas del endpoint)
    // ---------------------------
    async function cargarProductos(categoria) {
        try {
            const res = await fetch("http://localhost:3000/productos", { cache: "no-store" });
            const productos = await res.json();

            const contenedor = document.querySelector(".products");
            if (!contenedor) {
                console.warn("No hay contenedor .products en esta página.");
                return;
            }
            contenedor.innerHTML = "";

            const filtrados = productos.filter(p => {
                if (!p.categoria) return false;
                const categorias = p.categoria.split(",").map(c => c.trim().toLowerCase());
                return categorias.includes(categoria.toLowerCase());
            });

            filtrados.forEach(p => {
                const card = document.createElement("div");
                card.classList.add("card");
                // guarda id si existe
                if (p.id) card.dataset.id = p.id;

                card.innerHTML = `
            <div class="image">
                <img src="${p.imagen}" alt="${p.nombre}">
            </div>
            <div class="info">
                <h2>${p.nombre}</h2>
                <p>${p.descripcion}</p>
                <div class="footer" style="display:flex;justify-content:space-between;align-items:center;">
                <i class="fa-regular fa-heart add-to-cart" style="cursor:pointer;font-size:1.1rem;"></i>
                <span class="price">$ ${Number(p.precio).toLocaleString()}</span>
                </div>
            </div>
            `;
                contenedor.appendChild(card);
            });

            // NOTA: no necesitamos añadir listeners aquí porque usamos delegación de eventos más abajo

        } catch (err) {
            console.error("❌ Error cargando productos:", err);
        }
    }

    // ---------------------------
    // Detectar página y cargar productos
    // ---------------------------
    const ruta = window.location.pathname;
    if (ruta.includes("labios.html")) cargarProductos("labios");
    else if (ruta.includes("ojos.html")) cargarProductos("ojos");
    else if (ruta.includes("rostro.html")) cargarProductos("rostro");
    else if (ruta.includes("accesorios-de-maquillaje.html")) cargarProductos("accesorios de maquillaje");
    else if (ruta.includes("accesorios-de-cabello.html")) cargarProductos("accesorios de cabello");

    // ---------------------------
    // Modal carrito: abrir/cerrar y creación si hace falta
    // ---------------------------
    let carritoModal = document.getElementById("carritoModal");
    let cerrarModal = document.getElementById("cerrarModal");

    if (!carritoModal) {
        // si por algún motivo falta el modal en la página, lo creamos
        carritoModal = document.createElement("div");
        carritoModal.id = "carritoModal";
        carritoModal.className = "modal-overlay";
        carritoModal.innerHTML = `
        <div class="modal-carrito">
            <span class="cerrar" id="cerrarModal">&times;</span>
            <h2>✨ Carrito de Compras ✨</h2>
            <div class="cart-items"></div>
            <div class="cart-footer" style="margin-top:18px;">
            <p class="total">Total a pagar: $000</p>
            <button class="pay-btn">pagar</button>
            </div>
        </div>
    `;
        document.body.appendChild(carritoModal);
        cerrarModal = document.getElementById("cerrarModal");
    }

    // aseguramos estilo mínimo para que la clase .open muestre el modal si el CSS lo oculta
    if (!document.getElementById("modal-open-style")) {
        const style = document.createElement("style");
        style.id = "modal-open-style";
        style.textContent = `
        .modal-overlay { display: none; }
        .modal-overlay.open { display:flex !important; align-items:center; justify-content:center; z-index:9999; }
    `;
        document.head.appendChild(style);
    }

    function openModal() {
        carritoModal.classList.add("open");
        carritoModal.style.display = "flex";
        document.body.style.overflow = "hidden";
        renderCarrito();
    }
    function closeModal() {
        carritoModal.classList.remove("open");
        carritoModal.style.display = "none";
        document.body.style.overflow = "";
    }

    // enganche con el/los botones del header
    const cartButtons = Array.from(document.querySelectorAll("#carritoBtn, .carrito, [data-carrito-btn]"));
    if (cartButtons.length) cartButtons.forEach(b => b.addEventListener("click", (e) => { e.preventDefault(); openModal(); }));
    if (cerrarModal) cerrarModal.addEventListener("click", closeModal);
    carritoModal.addEventListener("click", (e) => { if (e.target === carritoModal) closeModal(); });
    document.addEventListener("keydown", (e) => { if ((e.key === "Escape" || e.key === "Esc") && carritoModal.classList.contains("open")) closeModal(); });

    // ---------------------------
    // Delegación de eventos: ❤️ agregar y eliminar desde modal
    // ---------------------------
    document.addEventListener("click", (e) => {
        // 1) Click en corazón dentro de una card (añadir producto)
        const heart = e.target.closest(".add-to-cart, .fa-heart");
        if (heart) {
            const card = heart.closest(".card");
            if (!card) return;

            const nombre = card.querySelector("h2")?.textContent?.trim() || "Producto";
            const descripcion = card.querySelector("p")?.textContent?.trim() || "";
            const precioText = card.querySelector(".price")?.textContent || "";
            const precio = parsePrecio(precioText);
            const imagen = card.querySelector("img")?.src || "";

            agregarAlCarrito({ nombre, descripcion, precio, imagen });
            // rellena el corazón (FontAwesome: regular -> solid)
            heart.classList.remove("fa-regular");
            heart.classList.add("fa-solid");
            return;
        }

        // 2) Click en "Eliminar" dentro del modal
        const rem = e.target.closest(".remove-item");
        if (rem) {
            const idx = Number(rem.dataset.index);
            if (!Number.isNaN(idx)) {
                carrito.splice(idx, 1);
                guardarCarrito();
                renderCarrito();
            }
            return;
        }
    });

    // Inicializar UI
    actualizarBadge();
    renderCarrito();

    console.log("Inicialización completada. Carrito con", carrito.length, "productos");

    // ---------------------------
    // Modo oscuro (seguro)
    // ---------------------------
    const modoBtn = document.querySelector("#modoBtn, .modo-btn"); // busca por id o clase
    if (modoBtn) {
        const icon = modoBtn.querySelector("i");

        // Aplica preferencia guardada
        if (localStorage.getItem("modo") === "oscuro") {
            document.body.classList.add("dark");
            if (icon) {
                icon.classList.remove("fa-moon", "fa-regular");
                icon.classList.add("fa-sun", "fa-solid");
            }
        }

        modoBtn.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("dark");
            if (icon) {
                if (isDark) {
                    icon.classList.remove("fa-moon", "fa-regular");
                    icon.classList.add("fa-sun", "fa-solid");
                } else {
                    icon.classList.remove("fa-sun", "fa-solid");
                    icon.classList.add("fa-moon", "fa-regular");
                }
            }
            localStorage.setItem("modo", isDark ? "oscuro" : "claro");
        });
    } else {
        console.log("No se encontró botón de modo oscuro en esta página (modoBtn).");
    }

});

// ---------------------------
// Buscador de productos
// ---------------------------
const buscadorInput = document.querySelector(".buscador input");
if (buscadorInput) {
    buscadorInput.addEventListener("input", async (e) => {
        const query = e.target.value.toLowerCase().trim();

        try {
            const res = await fetch("http://localhost:3000/productos", { cache: "no-store" });
            const productos = await res.json();

            const contenedor = document.querySelector(".resultados-busqueda") || document.querySelector(".products");
            contenedor.innerHTML = "";

            const filtrados = productos.filter(p => {
                const nombre = p.nombre?.toLowerCase() || "";
                const descripcion = p.descripcion?.toLowerCase() || "";
                return (
                    nombre.includes(query) ||
                    descripcion.includes(query) ||
                    p.categoria?.toLowerCase().includes(query)
                );
            });

            if (filtrados.length === 0) {
                contenedor.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#777;">No se encontraron productos 😢</p>`;
                return;
            }

            filtrados.forEach(p => {
                const card = document.createElement("div");
                card.classList.add("card");
                if (p.id) card.dataset.id = p.id;

                card.innerHTML = `
                    <div class="image">
                        <img src="${p.imagen}" alt="${p.nombre}">
                    </div>
                    <div class="info">
                        <h2>${p.nombre}</h2>
                        <p>${p.descripcion}</p>
                        <div class="footer" style="display:flex;justify-content:space-between;align-items:center;">
                            <i class="fa-regular fa-heart add-to-cart" style="cursor:pointer;font-size:1.1rem;"></i>
                            <span class="price">$ ${Number(p.precio).toLocaleString()}</span>
                        </div>
                    </div>
                `;
                contenedor.appendChild(card);
            });

        } catch (err) {
            console.error("❌ Error en buscador:", err);
        }
    });
}

