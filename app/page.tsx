'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ShoppingBag, X, Trash2, CheckCircle2, Filter } from 'lucide-react'

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen_url: string
}

interface ItemCarrito extends Producto {
  cantidad: number
}

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [cargando, setCargando] = useState(true)
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [compraExitosa, setCompraExitosa] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [categoriaSel, setCategoriaSel] = useState<string>('Todas')

  useEffect(() => {
    async function obtenerProductos() {
      const { data, error } = await supabase.from('productos').select('*')
      if (error) {
        console.error('Error al cargar productos:', error)
      } else if (data) {
        setProductos(data)
      }
      setCargando(false)
    }
    obtenerProductos()
  }, [])

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id)
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
    setCarritoAbierto(true)
  }

  const eliminarDelCarrito = (id: number) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id))
  }

  const cambiarCantidad = (id: number, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nuevaCantidad = item.cantidad + delta
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item
          }
          return item
        })
        .filter((item) => item.cantidad > 0)
    )
  }

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0)

  // Guardar pedido real en Supabase
  const procesarPedido = async () => {
    if (carrito.length === 0) return
    setProcesando(true)

    const { error } = await supabase.from('pedidos').insert([
      {
        contenido: carrito,
        total: total
      }
    ])

    setProcesando(false)

    if (error) {
      alert('Error al procesar la compra. Inténtalo de nuevo.')
    } else {
      setCompraExitosa(true)
      setCarrito([])
      setTimeout(() => {
        setCompraExitosa(false)
        setCarritoAbierto(false)
      }, 3500)
    }
  }

  const productosFiltrados = categoriaSel === 'Todas' 
    ? productos 
    : productos.filter(p => p.categoria.toLowerCase() === categoriaSel.toLowerCase())

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="text-2xl font-extrabold tracking-widest bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            VELORA
          </a>

          <button
            onClick={() => setCarritoAbierto(true)}
            className="relative p-2.5 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-full transition duration-200 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative py-20 px-6 text-center border-b border-slate-900 overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
            Edición Limitada 2026
          </span>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-white">
            Diseño Minimalista. <br />
            <span className="font-serif italic text-amber-300">Calidad Excepcional.</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-light">
            Piezas exclusivas creadas para elevar tu estilo diario. Explora nuestra nueva colección de accesorios y tecnología.
          </p>
        </div>
      </section>

      {/* CATÁLOGO DE PRODUCTOS CON FILTROS */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <h2 className="text-xl font-medium tracking-wide text-slate-200">
            Colección de Productos
          </h2>

          {/* FILTROS POR CATEGORÍA */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            {['Todas', 'Accesorios', 'Tecnología'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSel(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  categoriaSel === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-900/50 animate-pulse rounded-2xl border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="group bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col transition duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                  />
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider text-slate-300 font-medium">
                    {producto.categoria}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div>
                    <h3 className="font-medium text-lg text-white group-hover:text-amber-300 transition">
                      {producto.nombre}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2 font-light">
                      {producto.descripcion}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-xl font-bold text-amber-400">
                      {Number(producto.precio).toFixed(2)} €
                    </span>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition duration-200 cursor-pointer"
                    >
                      Añadir al Carrito
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CARRITO SLIDE-OVER */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setCarritoAbierto(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col justify-between shadow-2xl">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h2 className="font-semibold text-lg">Tu Carrito</h2>
                </div>
                <button
                  onClick={() => setCarritoAbierto(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                {compraExitosa ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                    <h3 className="text-xl font-bold text-white">¡Pedido Registrado!</h3>
                    <p className="text-slate-400 text-xs max-w-xs">
                      Tu pedido se ha guardado correctamente en la base de datos de Velora.
                    </p>
                  </div>
                ) : carrito.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                    <ShoppingBag className="w-12 h-12 text-slate-700" />
                    <p className="text-slate-400 text-sm">Tu carrito está vacío</p>
                  </div>
                ) : (
                  carrito.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl items-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imagen_url}
                        alt={item.nombre}
                        className="w-16 h-16 object-cover rounded-lg bg-slate-900"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{item.nombre}</h4>
                        <p className="text-xs text-amber-400 font-bold mt-0.5">
                          {Number(item.precio).toFixed(2)} €
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => cambiarCantidad(item.id, -1)}
                            className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs hover:bg-slate-700 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-semibold w-4 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => cambiarCantidad(item.id, 1)}
                            className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs hover:bg-slate-700 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {!compraExitosa && carrito.length > 0 && (
                <div className="p-6 border-t border-slate-800 bg-slate-950/50 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Total a pagar</span>
                    <span className="text-2xl font-extrabold text-amber-400">
                      {total.toFixed(2)} €
                    </span>
                  </div>
                  <button
                    onClick={procesarPedido}
                    disabled={procesando}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-500/10 uppercase tracking-wider text-xs cursor-pointer disabled:opacity-50"
                  >
                    {procesando ? 'Procesando...' : 'Finalizar Compra'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}