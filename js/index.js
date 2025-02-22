class Carrito {
    constructor() {
        this.productos = JSON.parse(localStorage.getItem('carrito')) || [];
        this.actualizarCarrito();
    }

    agregarProducto(producto) {
        const productoExistente = this.productos.find(p => p.id === producto.id);
        
        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            this.productos.push({...producto, cantidad: 1});
        }
        
        this.guardarCarrito();
        this.actualizarCarrito();
    }

    eliminarProducto(id) {
        const index = this.productos.findIndex(p => p.id === id);
        if (index !== -1) {
            if (this.productos[index].cantidad > 1) {
                this.productos[index].cantidad--;
            } else {
                this.productos.splice(index, 1);
            }
        }
        this.guardarCarrito();
        this.actualizarCarrito();
    }

    vaciarCarrito() {
        this.productos = [];
        this.guardarCarrito();
        this.actualizarCarrito();
    }

    calcularTotal() {
        return this.productos.reduce((total, producto) => 
            total + (producto.precio * producto.cantidad), 0);
    }

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.productos));
    }

    actualizarCarrito() {
        const listaCarrito = document.getElementById('lista-carrito');
        const totalCarrito = document.getElementById('total-carrito');
        
        if (listaCarrito && totalCarrito) {
            listaCarrito.innerHTML = '';
            
            this.productos.forEach(producto => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="producto-info">
                        <span>${producto.nombre}</span>
                        <span class="producto-precio">${(producto.precio * producto.cantidad).toFixed(2)}€</span>
                        <span class="cantidad">x${producto.cantidad}</span>
                    </div>
                    <button class="boton-eliminar-producto" onclick="carrito.eliminarProducto(${producto.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                `;
                listaCarrito.appendChild(li);
            });

            totalCarrito.textContent = this.calcularTotal().toFixed(2);
        }
    }
}

const carrito = new Carrito();

function agregarAlCarrito(id) {
    const producto = document.querySelector(`.producto[data-id="${id}"]`);
    
    if (producto) {
        const productoData = {
            id: parseInt(id),
            nombre: producto.dataset.nombre,
            precio: parseFloat(producto.dataset.precio)
        };
        
        carrito.agregarProducto(productoData);
        Swal.fire("Producto Agregado Correctamente");
    } else {
        console.error('Producto no encontrado');
    }
}

function vaciarCarrito() {
    carrito.vaciarCarrito();
}

function comprar() {
    if (carrito.productos.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    alert(`Compra realizada por €${carrito.calcularTotal().toFixed(2)}`);
    carrito.vaciarCarrito();
}

function toggleMiniCarrito() {
    const miniCarrito = document.getElementById('mini-carrito');
    if (miniCarrito) {
        miniCarrito.classList.toggle('visible');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    let productos = [];
    
    try {
        // Cargar los productos desde el JSON
        const response = await fetch('../productos.json');
        productos = await response.json();
        
        // Generar la galería de productos dinámicamente
        const gallery = document.getElementById('productos-gallery');
        gallery.innerHTML = productos.map(producto => `
            <div class="gallery-item" data-marca="${producto.marca.toLowerCase()}" data-precio="${producto.precio}">
                <a href="../pages/producto${producto.id}.html">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                </a>
                <div class="overlay">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.modelo}</p>
                    <p class="precio">${producto.precio}€</p>
                </div>
            </div>
        `).join('');

        // Obtener elementos del DOM para los filtros
        const filtroMarca = document.getElementById('filtro-marca');
        const filtroPrecio = document.getElementById('filtro-precio');

        // Generar opciones de marca dinámicamente
        const marcas = [...new Set(productos.map(p => p.marca.toLowerCase()))];
        filtroMarca.innerHTML = `
            <option value="todos">Todas las marcas</option>
            ${marcas.map(marca => `
                <option value="${marca}">${marca.toUpperCase()}</option>
            `).join('')}
        `;

        // Función de filtrado
        function filtrarProductos() {
            const marcaSeleccionada = filtroMarca.value;
            const precioSeleccionado = filtroPrecio.value;
            const items = document.querySelectorAll('.gallery-item');

            items.forEach(item => {
                const marca = item.getAttribute('data-marca');
                const precio = parseFloat(item.getAttribute('data-precio'));

                // Comprobar filtro de marca
                const pasaFiltroMarca = marcaSeleccionada === 'todos' || marca === marcaSeleccionada;

                // Comprobar filtro de precio
                let pasaFiltroPrecio = true;
                if (precioSeleccionado !== 'todos') {
                    if (precioSeleccionado === '1200+') {
                        pasaFiltroPrecio = precio >= 1200;
                    } else {
                        const [min, max] = precioSeleccionado.split('-').map(Number);
                        pasaFiltroPrecio = precio >= min && precio <= (max || Infinity);
                    }
                }

                // Mostrar u ocultar producto
                if (pasaFiltroMarca && pasaFiltroPrecio) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        // Agregar event listeners
        if (filtroMarca && filtroPrecio) {
            filtroMarca.addEventListener('change', filtrarProductos);
            filtroPrecio.addEventListener('change', filtrarProductos);
            
            // Ejecutar filtro inicial
            filtrarProductos();
        }

    } catch (error) {
        console.error('Error al cargar los productos:', error);
        document.getElementById('productos-gallery').innerHTML = '<p>Error al cargar los productos</p>';
    }
});


