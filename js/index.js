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
        alert('Producto agregado al carrito');
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
