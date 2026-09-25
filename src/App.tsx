// UBICACION: src/App.tsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type {
  ComponentProps,
  CSSProperties,
  MouseEvent as EventoRaton,
  PointerEvent as EventoPuntero
} from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'
import type { SupportedLanguage } from './i18n'
import i18next from './i18n'
import { SLUGS, leerRuta, rutaDe, subsDe } from './rutas'
import bocadillosJson from './bocadillos.json'

// Todas las subrutas muestran la misma pantalla de obras hasta que tengan
// contenido propio
const PORTADA: Record<SupportedLanguage, string> = {
  en: '/portada-construccion-en.webp',
  es: '/portada-construccion-es.webp'
}

function portadaDe(idioma: string) {
  return PORTADA[(PORTADA[idioma as SupportedLanguage] ? idioma : 'en') as SupportedLanguage]
}

// Paneles de las subrutas que se leen como carrusel. La imagen es null
// mientras el archivo no exista: asi no se piden recursos que dan 404
type Panel = { clave: string; imagen: string | null; correo?: boolean }

const PANELES: Record<string, Panel[]> = {
  'what-it-is': [
    { clave: 'p1', imagen: null },
    { clave: 'p2', imagen: null },
    { clave: 'p3', imagen: null }
  ],
  'the-name': [
    { clave: 'p1', imagen: null },
    { clave: 'p2', imagen: null },
    { clave: 'p3', imagen: null }
  ],
  'work-with-us': [
    { clave: 'p1', imagen: null },
    { clave: 'p2', imagen: null },
    { clave: 'p3', imagen: null, correo: true }
  ]
}

// Comics publicados, indexados por el slug ingles de su subruta. vinetas es el
// numero de vinetas ya publicadas: el lector no pide imagenes que aun no existen.
// capitulos es la ultima vineta de cada capitulo: con ella se sabe en que carpeta
// esta guardada cada imagen, capitulo-01, capitulo-02, y asi hasta capitulo-08
const COMICS: Record<string, { carpeta: string; vinetas: number; capitulos: number[] }> = {
  'celestial-invader': { carpeta: '/comics/toletum/invasor-celeste', vinetas: 120, capitulos: [24, 64, 84, 120] }
}

// Secciones cuyas subrutas se listan en la columna izquierda. Las demas llegan
// a las suyas desde las zonas clicables de su escena
const CON_SUBMENU = ['comics']

// Donde se recuerda que el aviso del teclado ya se enseño
const AVISO_TECLADO = 'tajopages.aviso-teclado'

// Aire entre el borde derecho de la imagen y lo que se apoya en ella
const SEPARACION = 5

const OG_LOCALES: Record<string, string> = {
  es: 'es_ES',
  en: 'en_US'
}

const DOMINIO = 'https://tajo.page'

// Unica direccion de contacto del proyecto: vive aqui y no en los diccionarios
// porque es la misma en los dos idiomas y la usa el enlace mailto
const CORREO = 'iamjosepunto@gmail.com'

// La direccion manda sobre el idioma guardado: entrar en /es/... deja la web
// en espanol. Se resuelve antes del primer render para que no haya parpadeo
const RUTA_INICIAL = leerRuta(window.location.pathname)
if (RUTA_INICIAL) void i18next.changeLanguage(RUTA_INICIAL.idioma)

function abreSubmenu(indice: number) {
  return CON_SUBMENU.includes(SLUGS.en[indice]) && subsDe(indice) !== null
}

const INTRO_VISTA = 'intro-vista'

// La presentacion solo tiene sentido al entrar por la puerta principal: si la
// direccion apunta a otra seccion o a una subruta, o si ya se vio en esta
// sesion, se entra directo al contenido
function tocaPresentacion() {
  if (RUTA_INICIAL && (RUTA_INICIAL.indice !== 0 || RUTA_INICIAL.sub !== null)) return false
  try {
    return sessionStorage.getItem(INTRO_VISTA) !== '1'
  } catch {
    return true
  }
}

// Una seccion con submenu nunca se queda vacia: si no viene subruta, se abre la primera
const SUB_INICIAL =
  RUTA_INICIAL === null
    ? null
    : abreSubmenu(RUTA_INICIAL.indice)
      ? (RUTA_INICIAL.sub ?? 0)
      : RUTA_INICIAL.sub

// Los dos menus comparten aspecto: se saca aqui para no repetir las clases
function claseBoton(activo: boolean) {
  return [
    'flex cursor-pointer items-center rounded-sm px-1.5 py-1 text-left font-mono text-[0.66rem] uppercase leading-tight tracking-[0.08em]',
    // Cada entrada conserva el alto de una fila de doce y el resto de la
    // columna queda vacio
    'flex-none basis-[calc(100%/12)]',
    'transition-colors sm:px-3 sm:py-2 sm:text-[1.05rem] sm:tracking-[0.14em]',
    'border-y border-y-crema border-l-[3px]',
    activo
      ? 'border-l-accent bg-logo text-crema'
      : 'border-l-transparent text-muted hover:border-l-line hover:text-crema'
  ].join(' ')
}

function setMeta(selector: string, content: string) {
  const tag = document.head.querySelector<HTMLMetaElement>(selector)
  if (tag) tag.content = content
}

// Escena de INTRODUCCION: todo dibujado en codigo salvo el logo, que se trae
// del archivo. Debajo del logo van los textos de la seccion, uno tras otro en
// la misma pagina
function EscenaIntroduccion({
  titulo,
  bloques
}: {
  titulo: string
  bloques: { titulo: string; texto: string }[]
}) {
  const ALTO = 213
  const HUECO = 36
  const LOGO_Y = 70
  const LOGO_LADO = 720
  // El primer bloque arranca un hueco por debajo de la base del logo
  const PRIMERA = LOGO_Y + LOGO_LADO + 44

  return (
    <svg
      viewBox="0 0 720 1606"
      role="group"
      aria-label={titulo}
      className="h-full w-full border border-crema"
    >
      <rect width="720" height="1606" fill="var(--color-fondo)" />

      <image x="0" y={LOGO_Y} width={LOGO_LADO} height={LOGO_LADO} href="/logo-tajopages.webp" />

      {bloques.map((bloque, i) => (
        <foreignObject
          key={bloque.titulo}
          x="70"
          y={PRIMERA + i * (ALTO + HUECO)}
          width="580"
          height={ALTO}
        >
          <div className="flex h-full w-full flex-col justify-center">
            <h2 className="font-mono text-[34px] uppercase leading-tight tracking-[2px] text-accent">
              {bloque.titulo}
            </h2>
            <p className="mt-3 text-[31px] leading-[1.5] text-ink/80">{bloque.texto}</p>
          </div>
        </foreignObject>
      ))}
    </svg>
  )
}

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

// Aro que gira mientras una imagen no ha terminado de cargar
function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
    >
      <span
        className="animate-spin rounded-full border-crema/25 border-t-crema"
        style={{ width: '20cqw', height: '20cqw', borderWidth: '2.2cqw' }}
      />
    </span>
  )
}

// Imagen con su spinner encima hasta que carga. La envoltura recibe las medidas
// que antes llevaba la imagen, para que el hueco sea exactamente el mismo
function ImagenConSpinner({
  caja,
  estiloCaja,
  ...resto
}: ComponentProps<'img'> & { caja: string; estiloCaja?: CSSProperties }) {
  const [lista, setLista] = useState(false)
  const marcar = () => setLista(true)
  return (
    <div className={`relative ${caja}`} style={estiloCaja}>
      <img {...resto} onLoad={marcar} onError={marcar} />
      {!lista && <Spinner />}
    </div>
  )
}

// Bocadillos y onomatopeyas dentro de las vinetas. Las imagenes siguen sin una
// sola letra: la web los dibuja encima con el texto de los JSON de idioma, asi
// valen para los dos idiomas. Las posiciones van en tanto por ciento de la imagen
// y se marcan en local con el editor, que se abre con ?bocadillos en la direccion
type Punto = [number, number]
// piensa: bocadillo de pensamiento, con circulitos hacia la cabeza en vez de cola
type Marca = { boca: Punto; globo: Punto; piensa?: boolean } | { sfx: Punto }
type Circulo = { cx: number; cy: number; r: number }
type TablaMarcas = Record<string, Record<string, Marca[]>>
type Elemento = { tipo: 'sfx' | 'globo'; texto: string }
// Hueco que ocupa cada elemento ya dibujado, en tanto por ciento de la vineta
type Caja = { x: number; y: number; w: number; h: number }
type Parte = 'globo' | 'boca' | 'sfx'
const MARCAS = bocadillosJson as unknown as TablaMarcas
// Alto de una vineta en las mismas unidades que su ancho, que vale 100
const ALTO_VINETA = (976 / 576) * 100
// Las onomatopeyas van al principio del texto, en mayusculas, y cada palabra
// acaba en exclamacion o en puntos suspensivos: ¡BOOOOM!, ¡PUM... PUM... PUM!
const ONOMATOPEYA = /^(?:¡?[A-ZÁÉÍÓÚÑÜ]{2,}(?:!|\.\.\.!?)\s*)+/
const CLAVE_EDITOR = 'tajopages.bocadillos.editor'
const CLAVE_MARCAS = 'tajopages.bocadillos.marcas'
// Contorno negro de las onomatopeyas, hecho con sombras para que funcione igual
// en todos los navegadores
const CONTORNO = [
  '-0.45cqw -0.45cqw 0 #111',
  '0.45cqw -0.45cqw 0 #111',
  '-0.45cqw 0.45cqw 0 #111',
  '0.45cqw 0.45cqw 0 #111',
  '0 -0.6cqw 0 #111',
  '0 0.6cqw 0 #111',
  '-0.6cqw 0 0 #111',
  '0.6cqw 0 0 #111',
  '0.9cqw 0.9cqw 0 rgba(0, 0, 0, 0.35)'
].join(', ')

// El editor solo existe en local y dura lo que la pestana: se abre con
// ?bocadillos, y la marca se guarda porque la web reescribe la direccion al cargar
const EDITOR_BOCADILLOS = (() => {
  const { hostname, search } = window.location
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') return false
  try {
    if (new URLSearchParams(search).has('bocadillos')) sessionStorage.setItem(CLAVE_EDITOR, '1')
    return sessionStorage.getItem(CLAVE_EDITOR) === '1'
  } catch {
    return false
  }
})()

// Separa el texto de una vineta en lo que va dentro, que son las onomatopeyas del
// principio y lo que dicen los personajes entre comillas, y la narracion, que es
// lo que sobra y sigue yendo debajo
function partesDe(texto: string, idioma: 'es' | 'en') {
  const sonido = texto.match(ONOMATOPEYA)
  const resto = sonido ? texto.slice(sonido[0].length) : texto
  const comillas = idioma === 'es' ? /«([^»]*)»/g : /“([^”]*)”/g
  const elementos: Elemento[] = sonido ? [{ tipo: 'sfx', texto: sonido[0].trim() }] : []
  for (const dicho of resto.matchAll(comillas)) elementos.push({ tipo: 'globo', texto: dicho[1].trim() })
  const narracion = resto.replace(comillas, ' ').replace(/\s+/g, ' ').trim()
  return { elementos, narracion }
}

// Cada elemento necesita su marca, en el mismo orden y del mismo tipo: si el
// texto cambia y ya no cuadran, la vineta vuelve a llevar todo su texto debajo
function marcaCuadra(elemento: Elemento | undefined, marca: Marca) {
  return !!elemento && (elemento.tipo === 'sfx') === 'sfx' in marca
}

function marcasCompletas(elementos: Elemento[], marcas: Marca[]) {
  return (
    elementos.length > 0 &&
    marcas.length === elementos.length &&
    marcas.every((marca, i) => marcaCuadra(elementos[i], marca))
  )
}

// Bocadillo de pensamiento: en vez de cola, tres circulitos cada vez mas pequenos
// que van del borde del bocadillo hacia la cabeza, repartidos por el camino
function circulosDe(globo: { cx: number; cy: number; rx: number; ry: number }, cabeza: Punto): Circulo[] {
  const mx = cabeza[0]
  const my = (cabeza[1] * ALTO_VINETA) / 100
  const dx = mx - globo.cx
  const dy = my - globo.cy
  const largo = Math.hypot(dx, dy)
  if (!largo || !globo.rx || !globo.ry) return []
  const borde = 1 / Math.hypot(dx / globo.rx, dy / globo.ry)
  if (borde >= 1) return []
  const ux = dx / largo
  const uy = dy / largo
  const ex = globo.cx + dx * borde
  const ey = globo.cy + dy * borde
  // Con un recorrido minimo, para que se vean los tres aunque el bocadillo este cerca
  const camino = Math.max(largo * (1 - borde) - 1.2, 11)
  const escala = Math.min(Math.max(camino / 12, 0.85), 1.25)
  const [r1, r2, r3] = [2.8 * escala, 1.9 * escala, 1.2 * escala]
  // Nunca se tocan entre si; si sobra camino, el del medio queda a mitad y el ultimo
  // llega hasta la cabeza
  const p1 = r1 + 0.9
  const p2 = p1 + r1 + r2 + 1
  const p3 = p2 + r2 + r3 + 1
  const final = Math.max(camino - r3, p3)
  const posiciones = [p1, p2 + (final - p3) / 2, final]
  return posiciones.map((p, i) => ({ cx: ex + ux * p, cy: ey + uy * p, r: [r1, r2, r3][i] }))
}

// Cuanto hay que mover un elemento para que no se salga de la vineta, en tanto
// por ciento, dejando un pequenio margen. Si no cabe, se centra
function encajar(inicio: number, largo: number, margen: number) {
  const r = (n: number) => Math.round(n * 100) / 100
  if (largo >= 100 - 2 * margen) return r(50 - (inicio + largo / 2))
  if (inicio < margen) return r(margen - inicio)
  if (inicio + largo > 100 - margen) return r(100 - margen - (inicio + largo))
  return 0
}

// Las onomatopeyas largas se encogen para no salirse de la vineta
function tamanoOnomatopeya(texto: string) {
  const mayor = Math.max(...texto.split(/\s+/).map((trozo) => trozo.length))
  return Math.min(12, 84 / (mayor * 0.68))
}

// Cola del bocadillo: un triangulo que sale del borde de la elipse y apunta a la
// boca, quedandose a un paso de ella. Tiene un largo minimo para que siempre se
// vea aunque el bocadillo este pegado a la cara. Su base se mete un poco dentro
// del bocadillo y, como el relleno se pinta encima del borde, la union no se nota
function colaDe(globo: { cx: number; cy: number; rx: number; ry: number }, boca: Punto) {
  const mx = boca[0]
  const my = (boca[1] * ALTO_VINETA) / 100
  const dx = mx - globo.cx
  const dy = my - globo.cy
  const largo = Math.hypot(dx, dy)
  if (!largo || !globo.rx || !globo.ry) return ''
  // Fraccion del camino hacia la boca en la que se cruza el borde de la elipse
  const borde = 1 / Math.hypot(dx / globo.rx, dy / globo.ry)
  // La boca queda dentro del bocadillo: no hay por donde sacar la cola
  if (borde >= 1) return ''
  const ux = dx / largo
  const uy = dy / largo
  const ex = globo.cx + dx * borde
  const ey = globo.cy + dy * borde
  const punta = Math.max(largo * (1 - borde) - 1.2, 4)
  const ancho = Math.min(Math.max(punta * 0.45, 3), 7)
  // Los dos puntos de la base van sobre la propia elipse, a ambos lados de por donde
  // sale la cola y metidos 1,2 unidades hacia dentro. Asi cada lado de la cola cruza
  // el borde una sola vez y la union queda limpia aunque la cola salga de lado; con
  // la base recta, uno de sus extremos se quedaba fuera y hacia un pico
  const angulo = Math.atan2((ey - globo.cy) / globo.ry, (ex - globo.cx) / globo.rx)
  const paso = ancho / 2 / Math.hypot(globo.rx * Math.sin(angulo), globo.ry * Math.cos(angulo))
  const base = (a: number) => {
    const px = globo.rx * Math.cos(a)
    const py = globo.ry * Math.sin(a)
    const k = 1 - 1.2 / Math.hypot(px, py)
    return [globo.cx + px * k, globo.cy + py * k]
  }
  const [b1x, b1y] = base(angulo - paso)
  const [b2x, b2y] = base(angulo + paso)
  const f = (n: number) => n.toFixed(2)
  return `${f(b1x)},${f(b1y)} ${f(ex + ux * punta)},${f(ey + uy * punta)} ${f(b2x)},${f(b2y)}`
}

// Lector de un comic: la portada ocupa toda la caja con un boton para empezar a
// leer, detras va el indice de capitulos, cada capitulo se abre con su caratula y
// cada vineta va de borde a borde sobre su texto. No es ciclico: desde la portada
// no se retrocede y la ultima vineta no avanza mas. VOLVER lleva al indice, y
// desde el indice a la portada
function LectorComic({ comic }: { comic: string }) {
  const { t, i18n } = useTranslation()
  // La pantalla completa es del navegador: el estado solo se enciende si la
  // concede de verdad, asi nunca deja la pagina a medias
  const caja = useRef<HTMLDivElement>(null)
  const [aPantalla, setAPantalla] = useState(false)
  // Que pagina ha terminado de cargar su imagen. Al cambiar de pagina el valor
  // deja de coincidir y vuelve a salir el spinner, sin efectos de por medio
  const [cargadaEn, setCargadaEn] = useState(-1)
  // Marcas de bocadillos: las del archivo, y en el editor, encima, las que se
  // van marcando, que se guardan en el navegador para no perderlas al recargar
  const [marcas, setMarcas] = useState<TablaMarcas>(() => {
    if (!EDITOR_BOCADILLOS) return MARCAS
    try {
      const guardadas = JSON.parse(localStorage.getItem(CLAVE_MARCAS) ?? '{}') as TablaMarcas
      const juntas: TablaMarcas = { ...MARCAS }
      for (const [c, tabla] of Object.entries(guardadas)) juntas[c] = { ...MARCAS[c], ...tabla }
      return juntas
    } catch {
      return MARCAS
    }
  })
  // En el editor, la boca marcada que espera el clic del bocadillo
  const [pendiente, setPendiente] = useState<{ codigo: string; punto: Punto } | null>(null)
  const [copiado, setCopiado] = useState(false)
  // Colas de los bocadillos, que dependen del tamanio real con que se pinta cada
  // uno: se miden despues de dibujarlos
  const capa = useRef<HTMLDivElement>(null)
  const nodos = useRef<(HTMLElement | null)[]>([])
  // Cada bocadillo u onomatopeya que se saldria de la vineta se mete hacia dentro:
  // el ajuste depende de su tamanio real, que cambia con el idioma
  const [dibujo, setDibujo] = useState<{
    colas: string[]
    circulos: Circulo[][]
    cajas: (Caja | null)[]
    ajustes: Punto[]
  }>({
    colas: [],
    circulos: [],
    cajas: [],
    ajustes: []
  })
  const { colas, circulos, cajas, ajustes } = dibujo
  // En el editor, lo que se esta arrastrando: un bocadillo, su boca o una onomatopeya
  const editor = useRef<HTMLDivElement>(null)
  const [arrastre, setArrastre] = useState<{ indice: number; parte: Parte; dx: number; dy: number } | null>(null)
  const [anchoCapa, setAnchoCapa] = useState(0)
  // Aviso de que se puede pasar pagina con el teclado: se queda en todas las
  // paginas hasta que se pulsa el boton
  const [aviso, setAviso] = useState(false)
  // En un movil no hay teclado que usar. Se vigila el ancho en vez de mirarlo una
  // sola vez, para que el cartel se retire tambien al estrechar la ventana
  const [conTeclado, setConTeclado] = useState(false)
  const datos = COMICS[comic]
  const idioma = i18n.resolvedLanguage === 'es' ? 'es' : 'en'
  const [pagina, setPagina] = useState(0)
  // La secuencia del lector: la portada, el indice, y luego cada capitulo con su
  // caratula por delante de sus vinetas. Todo lo demas se deduce de aqui
  const paginas: {
    tipo: 'portada' | 'indice' | 'caratula' | 'vineta'
    capitulo: number
    vineta: number
    enCapitulo: number
    delCapitulo: number
  }[] = [
    { tipo: 'portada', capitulo: 0, vineta: 0, enCapitulo: 0, delCapitulo: 0 },
    { tipo: 'indice', capitulo: 0, vineta: 0, enCapitulo: 0, delCapitulo: 0 }
  ]
  // En que pagina empieza cada capitulo, para que el indice pueda saltar a su caratula
  const inicioCapitulo: number[] = []
  let primera = 1
  datos.capitulos.forEach((fin, i) => {
    const ultimaDelCapitulo = Math.min(fin, datos.vinetas)
    const cuantas = ultimaDelCapitulo - primera + 1
    inicioCapitulo.push(paginas.length)
    paginas.push({ tipo: 'caratula', capitulo: i + 1, vineta: 0, enCapitulo: 0, delCapitulo: cuantas })
    for (let v = primera; v <= ultimaDelCapitulo; v++) {
      paginas.push({
        tipo: 'vineta',
        capitulo: i + 1,
        vineta: v,
        enCapitulo: v - primera + 1,
        delCapitulo: cuantas
      })
    }
    primera = fin + 1
  })
  const ultima = paginas.length - 1
  // La primera caratula: leyendo el comic las flechas no bajan de aqui, para
  // volver al indice o a la portada esta el boton VOLVER
  const PRIMERA_DEL_COMIC = 2
  const ir = (paso: number) =>
    setPagina((n) => {
      const destino = Math.min(Math.max(n + paso, 0), ultima)
      const enElComic = paginas[n].tipo === 'caratula' || paginas[n].tipo === 'vineta'
      return enElComic ? Math.max(destino, PRIMERA_DEL_COMIC) : destino
    })
  const actual = paginas[pagina]
  const codigo = String(actual.vineta).padStart(3, '0')
  const texto = actual.tipo === 'vineta' ? t(`vinetas.${comic}.${codigo}`) : ''
  // El texto de debajo no cambia hasta que la imagen de la pagina nueva ha
  // cargado: si no, se lee lo que viene mientras todavia gira el spinner
  const paginaDelTexto = cargadaEn >= 0 && cargadaEn < paginas.length ? paginas[cargadaEn] : actual
  const textoVisible =
    paginaDelTexto.tipo === 'vineta'
      ? t(`vinetas.${comic}.${String(paginaDelTexto.vineta).padStart(3, '0')}`)
      : ''
  // Lo que va dentro de la vineta que se esta viendo. Mientras sus marcas no esten
  // completas, todo su texto sigue debajo como siempre
  const partes =
    paginaDelTexto.tipo === 'vineta' ? partesDe(textoVisible, idioma) : { elementos: [], narracion: '' }
  const codigoVisible = String(paginaDelTexto.vineta).padStart(3, '0')
  const marcasVisibles = marcas[comic]?.[codigoVisible] ?? []
  const completas = marcasCompletas(partes.elementos, marcasVisibles)
  const textoDebajo = completas ? partes.narracion : textoVisible
  // Fuera del editor solo se dibujan las vinetas completas; en el editor, tambien
  // lo que se lleva marcado
  const marcasDibujadas =
    completas || EDITOR_BOCADILLOS
      ? marcasVisibles.slice(0, partes.elementos.length).map((m, i) => (marcaCuadra(partes.elementos[i], m) ? m : null))
      : []
  const hayCapa = actual.tipo === 'vineta' && paginaDelTexto.tipo === 'vineta'
  // Cada capitulo guarda su caratula y sus vinetas en su propia carpeta
  const capituloCod = String(actual.capitulo).padStart(2, '0')
  const carpetaCapitulo = `${datos.carpeta}/capitulo-${capituloCod}`
  const tituloCapitulo = t(`capitulos.${comic}.${actual.capitulo}`)
  // El contador lleva delante el capitulo, y cuenta dentro de el. El indice no
  // pertenece a ningun capitulo, asi que en su sitio lleva su propio rotulo
  const romano = ROMANOS[actual.capitulo - 1]
  const contador =
    actual.tipo === 'vineta'
      ? `${romano} · ${actual.enCapitulo}/${actual.delCapitulo}`
      : actual.tipo === 'indice'
        ? t('lector.indice')
        : romano

  // Flechas superpuestas en los laterales de la imagen, en caratulas y vinetas.
  // Cada una va en un circulo crema opaco para que se lea sobre cualquier fondo,
  // y se desvanece cuando no hay pagina a la que ir
  const ladoFlecha =
    // Sin anillo de foco: su zona ocupa todo el alto y el borde cruzaria la vineta
    'group pointer-events-auto absolute inset-y-0 flex cursor-pointer items-end outline-none disabled:cursor-default disabled:opacity-0'
  const circuloFlecha =
    'flex items-center justify-center rounded-full border border-black bg-crema/50 text-deep shadow-lg transition-colors group-hover:bg-accent group-focus-visible:bg-accent'
  const medidaCirculo = { width: '13.75cqw', height: '13.75cqw' }
  // Chevron dibujado, no el caracter < o >: asi queda centrado de verdad en el
  // circulo y su tamanio y grosor no dependen de la tipografia
  const chevron = (haciaDelante: boolean, medida = '13cqw') => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: medida, height: medida }}
    >
      <path d={haciaDelante ? 'M9 4.5 L16.5 12 L9 19.5' : 'M15 4.5 L7.5 12 L15 19.5'} />
    </svg>
  )
  // Van ancladas arriba y con el alto exacto de una vineta, 976/576 del ancho,
  // para quedar a la misma altura en las vinetas y en las caratulas, que se
  // centran en su hueco
  const flechasLaterales = (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-10"
      style={{ height: '169.44cqw' }}
    >
      <button
        type="button"
        onClick={() => ir(-1)}
        disabled={pagina <= PRIMERA_DEL_COMIC}
        aria-label={t('paneles.anterior')}
        className={`${ladoFlecha} left-0 justify-start`}
        style={{ width: '17%', paddingLeft: '2.5cqw', paddingBottom: '3cqw' }}
      >
        <span className={circuloFlecha} style={medidaCirculo}>
          {chevron(false)}
        </span>
      </button>
      <button
        type="button"
        onClick={() => ir(1)}
        disabled={pagina === ultima}
        aria-label={t('paneles.siguiente')}
        className={`${ladoFlecha} right-0 justify-end`}
        style={{ width: '17%', paddingRight: '2.5cqw', paddingBottom: '3cqw' }}
      >
        <span className={circuloFlecha} style={medidaCirculo}>
          {chevron(true)}
        </span>
      </button>
    </div>
  )

  useEffect(() => {
    const mirar = () => {
      const dentro = document.fullscreenElement === caja.current
      setAPantalla(dentro)
    }
    document.addEventListener('fullscreenchange', mirar)
    return () => document.removeEventListener('fullscreenchange', mirar)
  }, [])

  // Al volver a la portada se sale de la pantalla completa, venga de donde venga:
  // del boton VOLVER, de la flecha o del teclado
  useEffect(() => {
    if (pagina === 0 && document.fullscreenElement === caja.current) {
      void document.exitFullscreen()
    }
  }, [pagina])

  // Las flechas del teclado pasan pagina sin que el lector tenga el foco, pero
  // solo con el comic abierto: en la portada y en el indice no hacen nada
  const leyendo = actual.tipo === 'caratula' || actual.tipo === 'vineta'
  useEffect(() => {
    if (!leyendo) return
    const teclas = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      ir(e.key === 'ArrowLeft' ? -1 : 1)
    }
    window.addEventListener('keydown', teclas)
    return () => window.removeEventListener('keydown', teclas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leyendo, ultima])

  useEffect(() => {
    const consulta = window.matchMedia('(min-width: 640px)')
    const mirar = () => setConTeclado(consulta.matches)
    mirar()
    consulta.addEventListener('change', mirar)
    return () => consulta.removeEventListener('change', mirar)
  }, [])

  // Sale al abrir el comic y no se va solo: hay que pulsar el boton
  useEffect(() => {
    if (!leyendo || aviso || !conTeclado) return
    try {
      if (localStorage.getItem(AVISO_TECLADO)) return
    } catch {
      return
    }
    setAviso(true)
  }, [leyendo, aviso, conTeclado])

  // La marca se guarda al pulsar, no al ensenarlo: si no, bastaria con recargar
  // sin leerlo para perderlo para siempre
  const cerrarAviso = () => {
    setAviso(false)
    try {
      localStorage.setItem(AVISO_TECLADO, '1')
    } catch {
      // si el navegador no deja guardar, el aviso volvera a salir
    }
  }

  const alternarPantalla = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }
    void caja.current?.requestFullscreen?.().catch(() => undefined)
  }

  // Icono de pantalla completa: cuatro esquinas que se abren o se cierran
  const iconoPantalla = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: '6.5cqw', height: '6.5cqw' }}
    >
      {aPantalla ? (
        <>
          <path d="M9 4v5H4" />
          <path d="M15 4v5h5" />
          <path d="M9 20v-5H4" />
          <path d="M15 20v-5h5" />
        </>
      ) : (
        <>
          <path d="M4 9V4h5" />
          <path d="M20 9V4h-5" />
          <path d="M4 15v5h5" />
          <path d="M20 15v5h-5" />
        </>
      )}
    </svg>
  )

  // Si la vineta cambia de tamanio (ventana, pantalla completa) se vuelven a medir
  // los bocadillos
  useEffect(() => {
    const el = capa.current
    if (!hayCapa || !el) return
    const observador = new ResizeObserver(() => setAnchoCapa(el.getBoundingClientRect().width))
    observador.observe(el)
    return () => observador.disconnect()
  }, [hayCapa])

  const claveDibujo = JSON.stringify([codigoVisible, idioma, marcasDibujadas])
  useLayoutEffect(() => {
    const r = capa.current?.getBoundingClientRect()
    const nuevo: { colas: string[]; circulos: Circulo[][]; cajas: (Caja | null)[]; ajustes: Punto[] } = {
      colas: [],
      circulos: [],
      cajas: [],
      ajustes: []
    }
    if (r && r.width && r.height) {
      marcasDibujadas.forEach((m, i) => {
        const b = nodos.current[i]?.getBoundingClientRect()
        if (!m || !b) {
          nuevo.colas.push('')
          nuevo.circulos.push([])
          nuevo.cajas.push(null)
          nuevo.ajustes.push([0, 0])
          return
        }
        const caja: Caja = {
          x: ((b.left - r.left) / r.width) * 100,
          y: ((b.top - r.top) / r.height) * 100,
          w: (b.width / r.width) * 100,
          h: (b.height / r.height) * 100
        }
        nuevo.cajas.push(caja)
        // Se calcula desde donde caeria sin ajuste, asi el resultado no cambia de
        // una pasada a otra
        const previo = ajustes[i] ?? [0, 0]
        nuevo.ajustes.push([encajar(caja.x - previo[0], caja.w, 1.5), encajar(caja.y - previo[1], caja.h, 1)])
        // Para la cola y los circulitos, el alto va en las mismas unidades que el ancho
        const escala = 100 / r.width
        const elipse = {
          cx: (b.left + b.width / 2 - r.left) * escala,
          cy: (b.top + b.height / 2 - r.top) * escala,
          rx: (b.width / 2) * escala,
          ry: (b.height / 2) * escala
        }
        nuevo.colas.push('boca' in m && !m.piensa ? colaDe(elipse, m.boca) : '')
        nuevo.circulos.push('boca' in m && m.piensa ? circulosDe(elipse, m.boca) : [])
      })
    }
    setDibujo((viejo) => {
      // Diferencias de medicion minimas no cuentan: asi no se entra en un bucle
      const iguales = nuevo.ajustes.every(
        (a, i) =>
          Math.abs(a[0] - (viejo.ajustes[i]?.[0] ?? 0)) < 0.05 && Math.abs(a[1] - (viejo.ajustes[i]?.[1] ?? 0)) < 0.05
      )
      if (iguales && nuevo.ajustes.length === viejo.ajustes.length) nuevo.ajustes = viejo.ajustes
      return JSON.stringify(viejo) === JSON.stringify(nuevo) ? viejo : nuevo
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveDibujo, anchoCapa, JSON.stringify(ajustes)])

  // ---- Editor de bocadillos (solo en local) ----
  const guardarMarcas = (lista: Marca[]) => {
    const nuevas: TablaMarcas = { ...marcas, [comic]: { ...marcas[comic], [codigoVisible]: lista } }
    setMarcas(nuevas)
    try {
      localStorage.setItem(CLAVE_MARCAS, JSON.stringify(nuevas))
    } catch {
      // sin sitio en el navegador: las marcas duran hasta recargar
    }
  }
  const redondear = (n: number) => Math.round(Math.min(Math.max(n, 0), 100) * 10) / 10
  const lista = cargadaEn === pagina && paginaDelTexto.tipo === 'vineta'
  // Punto del raton en tanto por ciento de la vineta
  const puntoDe = (e: { clientX: number; clientY: number }): Punto | null => {
    const r = editor.current?.getBoundingClientRect()
    if (!r || !r.width || !r.height) return null
    return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100]
  }
  const clicEditor = (e: EventoRaton<HTMLDivElement>) => {
    if (!lista) return
    const crudo = puntoDe(e)
    if (!crudo) return
    const punto: Punto = [redondear(crudo[0]), redondear(crudo[1])]
    const hechas = marcasVisibles.slice(0, partes.elementos.length)
    const siguiente = partes.elementos[hechas.length]
    if (!siguiente) return
    if (siguiente.tipo === 'sfx') {
      guardarMarcas([...hechas, { sfx: punto }])
    } else if (!pendiente || pendiente.codigo !== codigoVisible) {
      setPendiente({ codigo: codigoVisible, punto })
    } else {
      guardarMarcas([...hechas, { boca: pendiente.punto, globo: punto }])
      setPendiente(null)
    }
  }
  // Todo lo marcado se puede arrastrar: el bocadillo, su boca y las onomatopeyas.
  // Se guarda la distancia entre el raton y el punto para que no pegue un salto
  const empezarArrastre = (e: EventoPuntero<HTMLElement>, indice: number, parte: Parte, punto: Punto) => {
    e.stopPropagation()
    const p = puntoDe(e)
    if (!lista || !p) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setArrastre({ indice, parte, dx: p[0] - punto[0], dy: p[1] - punto[1] })
  }
  const moverArrastre = (e: EventoPuntero<HTMLDivElement>) => {
    const p = puntoDe(e)
    if (!arrastre || !p) return
    const punto: Punto = [redondear(p[0] - arrastre.dx), redondear(p[1] - arrastre.dy)]
    const nuevas = marcasVisibles.slice()
    const m = nuevas[arrastre.indice]
    if (!m) return
    if ('sfx' in m) nuevas[arrastre.indice] = { sfx: punto }
    else if (arrastre.parte === 'boca') nuevas[arrastre.indice] = { ...m, boca: punto }
    else nuevas[arrastre.indice] = { ...m, globo: punto }
    guardarMarcas(nuevas)
  }
  const soltarArrastre = () => setArrastre(null)
  // Doble clic en un bocadillo: pasa de hablar a pensar y al reves
  const alternarPensamiento = (indice: number) => {
    const nuevas = marcasVisibles.slice()
    const m = nuevas[indice]
    if (!m || !('boca' in m)) return
    const { piensa, ...resto } = m
    nuevas[indice] = piensa ? resto : { ...resto, piensa: true }
    guardarMarcas(nuevas)
  }
  const rehacer = () => {
    if (!lista) return
    guardarMarcas([])
    setPendiente(null)
  }
  // Salta a la siguiente vineta que tenga algo sin marcar
  const pendienteDe = (n: number) => {
    const p = paginas[n]
    if (p.tipo !== 'vineta') return false
    const cod = String(p.vineta).padStart(3, '0')
    const { elementos } = partesDe(t(`vinetas.${comic}.${cod}`), idioma)
    return elementos.length > 0 && !marcasCompletas(elementos, marcas[comic]?.[cod] ?? [])
  }
  const siguientePendiente = () => {
    for (let paso = 1; paso <= ultima; paso++) {
      const n = (pagina + paso) % (ultima + 1)
      if (pendienteDe(n)) {
        setPendiente(null)
        setPagina(n)
        return
      }
    }
  }
  const copiarMarcas = () => {
    const ordenadas: TablaMarcas = {}
    for (const c of Object.keys(marcas).sort()) {
      ordenadas[c] = {}
      for (const cod of Object.keys(marcas[c]).sort()) {
        if (marcas[c][cod].length) ordenadas[c][cod] = marcas[c][cod]
      }
    }
    void navigator.clipboard?.writeText(JSON.stringify(ordenadas, null, 2)).then(() => {
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 1500)
    })
  }
  let rotuloEditor = ''
  if (EDITOR_BOCADILLOS && actual.tipo === 'vineta') {
    let total = 0
    let hechas = 0
    for (let v = 1; v <= datos.vinetas; v++) {
      const cod = String(v).padStart(3, '0')
      const { elementos } = partesDe(t(`vinetas.${comic}.${cod}`), idioma)
      if (!elementos.length) continue
      total++
      if (marcasCompletas(elementos, marcas[comic]?.[cod] ?? [])) hechas++
    }
    const cuenta = `${hechas}/${total}`
    const siguiente = partes.elementos[marcasVisibles.length]
    const cuadran = marcasVisibles.every((m, i) => marcaCuadra(partes.elementos[i], m))
    // Un bocadillo que tapa la boca se queda sin cola: hay que colocarlo mas lejos
    const tapaBoca = marcasDibujadas.some(
      (m, i) => !!m && 'boca' in m && colas[i] === '' && !(circulos[i]?.length ?? 0)
    )
    rotuloEditor = !lista
      ? 'Cargando...'
      : !partes.elementos.length
        ? `Sin bocadillos · ${cuenta}`
        : !cuadran
          ? `Las marcas no cuadran con el texto: pulsa Rehacer · ${cuenta}`
          : completas
            ? tapaBoca
              ? `Un bocadillo tapa la boca y se queda sin cola: Rehacer · ${cuenta}`
              : `Lista: arrastra para mover, doble clic en un bocadillo para que piense · ${cuenta}`
            : siguiente?.tipo === 'sfx'
              ? `Clic donde va «${siguiente.texto}» · ${cuenta}`
              : pendiente?.codigo === codigoVisible
                ? `Ahora clic en el CENTRO del bocadillo · ${cuenta}`
                : `Clic en la BOCA de quien dice «${siguiente?.texto ?? ''}» · ${cuenta}`
  }

  // Spinner mientras la imagen de la pagina no ha cargado
  const marcarCargada = () => setCargadaEn(pagina)
  const spinner = cargadaEn !== pagina && <Spinner />

  // La barra inferior es la misma en las caratulas y en las vinetas
  const barra = (
    <div
      className="flex items-center justify-between border-t border-line/60"
      style={{ padding: '3cqw 3cqw' }}
    >
      <button
        type="button"
        onClick={() => setPagina(actual.tipo === 'indice' ? 0 : 1)}
        className="cursor-pointer whitespace-nowrap font-mono uppercase text-enlace transition-colors hover:text-accent"
        style={{ fontSize: '6.5cqw', letterSpacing: '0.1em', lineHeight: 1 }}
      >
        {`<< ${t('subs.volver')}`}
      </button>

      {/* Ya sin flechas: la navegacion va en los laterales de la imagen */}
      <div className="flex items-center" style={{ gap: '4cqw' }}>
        <span
          className="whitespace-nowrap font-mono text-muted"
          style={{ fontSize: '4.8cqw', letterSpacing: '0.1em', lineHeight: 1 }}
        >
          {contador}
        </span>
        <button
          type="button"
          onClick={alternarPantalla}
          aria-label={t('lector.pantalla')}
          title={t('lector.pantalla')}
          className="flex cursor-pointer items-center text-enlace transition-colors hover:text-accent"
        >
          {iconoPantalla}
        </button>
      </div>
    </div>
  )

  return (
    <div ref={caja} className={aPantalla ? 'relative h-full w-full bg-fondo' : 'h-full w-full'}>
      {/* La capa de dentro lleva la proporcion: al elemento que entra en pantalla
          completa el navegador le impone el 100% y no se le puede ganar */}
      <div
        className={aPantalla ? 'absolute inset-y-0 left-1/2 -translate-x-1/2' : 'h-full w-full'}
        style={aPantalla ? { aspectRatio: '720 / 1606' } : undefined}
      >
        <div
          className="relative flex h-full w-full flex-col border border-crema bg-fondo"
          style={{ containerType: 'size' }}
        >
          {pagina === 0 ? (
            <>
              <img
                src={`${datos.carpeta}/portada-${idioma}.webp`}
                alt={t('comics.portada')}
                width={576}
                height={1280}
                className="h-full w-full object-cover"
                onLoad={marcarCargada}
                onError={marcarCargada}
              />
              {/* Centrado en la franja inferior de la portada, entre el numero y el sello */}
              <button
                type="button"
                onClick={() => ir(1)}
                className="absolute left-1/2 -translate-x-1/2 cursor-pointer whitespace-nowrap bg-deep font-mono uppercase text-crema shadow-lg transition-colors motion-safe:animate-pulse hover:animate-none hover:bg-accent hover:text-deep"
                style={{ bottom: '3.5cqw', padding: '3cqw 4.5cqw', fontSize: '5.5cqw', letterSpacing: '0.12em', lineHeight: 1, borderRadius: '1cqw' }}
              >
                {t('lector.leer')}
              </button>
            </>
          ) : actual.tipo === 'indice' ? (
            <>
              {/* El indice: los ocho capitulos con su romano y su titulo, cada uno
                  lleva directo a su caratula */}
              <div className="min-h-0 flex-1 overflow-y-auto" style={{ padding: '7cqw 6cqw' }}>
                <h2
                  className="text-center font-mono uppercase text-muted"
                  style={{ fontSize: '4.5cqw', letterSpacing: '0.3em', lineHeight: 1 }}
                >
                  {t('lector.indice')}
                </h2>
                <ul style={{ marginTop: '6cqw' }}>
                  {datos.capitulos.map((_, i) => (
                    <li key={ROMANOS[i]} className="border-b border-line/40">
                      <button
                        type="button"
                        onClick={() => setPagina(inicioCapitulo[i])}
                        className="flex w-full cursor-pointer items-baseline text-left text-enlace transition-colors hover:text-accent"
                        style={{ gap: '4cqw', padding: '3.5cqw 1cqw' }}
                      >
                        <span
                          className="shrink-0 text-right font-mono text-muted"
                          style={{ width: '10cqw', fontSize: '4.5cqw', letterSpacing: '0.1em', lineHeight: 1 }}
                        >
                          {ROMANOS[i]}
                        </span>
                        <span
                          className="uppercase"
                          style={{ fontSize: '6cqw', letterSpacing: '0.04em', lineHeight: 1.2 }}
                        >
                          {t(`capitulos.${comic}.${i + 1}`)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {barra}
            </>
          ) : actual.tipo === 'caratula' ? (
            <>
              {/* La caratula es un pergamino de 576x976 con el tercio de arriba
                  limpio: ahi es donde cae el rotulo del capitulo */}
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <div className="relative w-full">
                  <img
                    src={`${carpetaCapitulo}/caratula-${capituloCod}.webp`}
                    alt={tituloCapitulo}
                    width={576}
                    height={976}
                    className="aspect-[576/976] w-full object-cover"
                    onLoad={marcarCargada}
                    onError={marcarCargada}
                  />
                  <div
                    className="absolute inset-x-0 top-0 flex flex-col items-center justify-center text-center"
                    style={{ height: '33%', padding: '0 9cqw' }}
                  >
                    <span
                      className="font-mono uppercase text-deep/70"
                      style={{ fontSize: '5.6cqw', letterSpacing: '0.3em', lineHeight: 1 }}
                    >
                      {`${t('lector.capitulo')} ${romano}`}
                    </span>
                    <span
                      className="uppercase text-deep"
                      style={{ fontSize: '12.6cqw', letterSpacing: '0.05em', lineHeight: 1.15, marginTop: '4cqw' }}
                    >
                      {tituloCapitulo}
                    </span>
                  </div>
                </div>
              </div>

              {barra}
            </>
          ) : (
            <>
              {/* Las vinetas se dibujan a 576x976: ocupan todo el ancho, tocando los
                  bordes, y dejan debajo sitio para textos de hasta tres lineas */}
              <img
                src={`${carpetaCapitulo}/vineta-${capituloCod}-${codigo}.webp`}
                alt={texto}
                width={576}
                height={976}
                className="aspect-[576/976] w-full shrink-0 object-cover"
                onLoad={marcarCargada}
                onError={marcarCargada}
              />
              <div className="min-h-0 flex-1 overflow-y-auto" style={{ padding: '3cqw 5cqw' }}>
                <p className="text-ink/80" style={{ fontSize: '7.8cqw', lineHeight: 1.35 }}>
                  {textoDebajo}
                </p>
              </div>
              {barra}
            </>
          )}

          {(actual.tipo === 'caratula' || actual.tipo === 'vineta') && flechasLaterales}
          {/* Bocadillos y onomatopeyas, encima de la vineta y por debajo de las
              flechas. La cola va en dos capas: el trazo por debajo del bocadillo y
              el relleno por encima, que tapa el borde donde se unen */}
          {hayCapa && (
            <div
              ref={capa}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-[5]"
              style={{ height: `${ALTO_VINETA}cqw` }}
            >
              <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${ALTO_VINETA}`}>
                {colas.map(
                  (c, i) =>
                    c && (
                      <polygon key={i} points={c} fill="#fff" stroke="#111" strokeWidth={1.1} strokeLinejoin="round" />
                    )
                )}
              </svg>
              {partes.elementos.map((el, i) => {
                const m = marcasDibujadas[i]
                if (!m) return null
                if ('sfx' in m) {
                  return (
                    <div
                      key={i}
                      className="absolute"
                      style={{ left: `${m.sfx[0] + (ajustes[i]?.[0] ?? 0)}%`, top: `${m.sfx[1] + (ajustes[i]?.[1] ?? 0)}%` }}
                    >
                      <span
                        ref={(nodo) => {
                          nodos.current[i] = nodo
                        }}
                        className="block text-center font-extrabold uppercase"
                        style={{
                          width: 'max-content',
                          maxWidth: '84cqw',
                          transform: 'translate(-50%, -50%) rotate(-7deg)',
                          fontSize: `${tamanoOnomatopeya(el.texto)}cqw`,
                          lineHeight: 1,
                          letterSpacing: '0.02em',
                          color: '#ffc93c',
                          textShadow: CONTORNO
                        }}
                      >
                        {el.texto}
                      </span>
                    </div>
                  )
                }
                return (
                  <div
                    key={i}
                    className="absolute"
                    style={{ left: `${m.globo[0] + (ajustes[i]?.[0] ?? 0)}%`, top: `${m.globo[1] + (ajustes[i]?.[1] ?? 0)}%` }}
                  >
                    {/* El texto manda: la elipse se dibuja detras, un 44 % mas grande que
                        el bloque de texto en cada sentido. Es la elipse justa que pasa por
                        sus cuatro esquinas, asi ninguna linea toca el borde */}
                    <div
                      className="relative text-center font-semibold uppercase"
                      style={{
                        width: 'max-content',
                        maxWidth: '40cqw',
                        transform: 'translate(-50%, -50%)',
                        padding: '1.6cqw',
                        fontSize: '4.2cqw',
                        lineHeight: 1.2,
                        letterSpacing: '0.02em',
                        color: '#111',
                        textWrap: 'balance'
                      }}
                    >
                      <div
                        ref={(nodo) => {
                          nodos.current[i] = nodo
                        }}
                        className="absolute"
                        style={{
                          left: '-22%',
                          right: '-22%',
                          top: '-22%',
                          bottom: '-22%',
                          background: '#fff',
                          border: '0.55cqw solid #111',
                          borderRadius: '50%'
                        }}
                      />
                      <span className="relative">{el.texto}</span>
                    </div>
                  </div>
                )
              })}
              <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${ALTO_VINETA}`}>
                {colas.map((c, i) => c && <polygon key={i} points={c} fill="#fff" />)}
                {circulos.map((lista, i) =>
                  lista.map((c, j) => (
                    <circle key={`${i}-${j}`} cx={c.cx} cy={c.cy} r={c.r} fill="#fff" stroke="#111" strokeWidth={0.55} />
                  ))
                )}
              </svg>
            </div>
          )}

          {/* Editor de bocadillos: solo en local y con ?bocadillos. Tapa las flechas
              para que los clics no pasen pagina; se pasa con las flechas del teclado */}
          {EDITOR_BOCADILLOS && actual.tipo === 'vineta' && (
            <div
              ref={editor}
              className="absolute inset-x-0 top-0 z-20 cursor-crosshair"
              style={{ height: `${ALTO_VINETA}cqw`, touchAction: 'none' }}
              onClick={clicEditor}
              onPointerMove={moverArrastre}
              onPointerUp={soltarArrastre}
              onPointerCancel={soltarArrastre}
            >
              {/* Asas para arrastrar lo ya marcado. El bocadillo y la onomatopeya se
                  cogen por todo su hueco; la boca, por su punto rojo */}
              {marcasDibujadas.map((m, i) => {
                const caja = cajas[i]
                if (!m || !caja) return null
                const parar = (e: EventoRaton) => e.stopPropagation()
                const centro: Punto = 'sfx' in m ? m.sfx : m.globo
                return (
                  <div key={i}>
                    <div
                      className="absolute cursor-move outline-2 outline-transparent outline-dashed hover:outline-[#ffc93c]"
                      style={{
                        left: `${caja.x}%`,
                        top: `${caja.y}%`,
                        width: `${caja.w}%`,
                        height: `${caja.h}%`,
                        borderRadius: 'sfx' in m ? '0.5rem' : '50%',
                        touchAction: 'none'
                      }}
                      onPointerDown={(e) => empezarArrastre(e, i, 'sfx' in m ? 'sfx' : 'globo', centro)}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        alternarPensamiento(i)
                      }}
                      onClick={parar}
                    />
                    {'boca' in m && (
                      <span
                        className="absolute cursor-grab rounded-full border-2 border-white"
                        style={{
                          left: `${m.boca[0]}%`,
                          top: `${m.boca[1]}%`,
                          width: 14,
                          height: 14,
                          transform: 'translate(-50%, -50%)',
                          background: '#dc2626',
                          touchAction: 'none'
                        }}
                        onPointerDown={(e) => empezarArrastre(e, i, 'boca', m.boca)}
                        onClick={parar}
                      />
                    )}
                  </div>
                )
              })}
              {/* Las flechas de pantalla siguen funcionando: estas dos zonas invisibles
                  van justo encima de sus circulos, y el resto de la vineta queda para marcar */}
              {[false, true].map((adelante) =>
                (adelante ? pagina === ultima : pagina <= PRIMERA_DEL_COMIC) ? null : (
                  <button
                    key={String(adelante)}
                    type="button"
                    aria-label={t(adelante ? 'paneles.siguiente' : 'paneles.anterior')}
                    className="absolute cursor-pointer rounded-full"
                    style={{
                      bottom: '3cqw',
                      left: adelante ? undefined : '2.5cqw',
                      right: adelante ? '2.5cqw' : undefined,
                      width: '13.75cqw',
                      height: '13.75cqw'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setPendiente(null)
                      ir(adelante ? 1 : -1)
                    }}
                  />
                )
              )}
              <div
                className="absolute inset-x-0 top-0 flex flex-wrap items-center gap-1.5 bg-black/80 px-2 py-1 font-mono text-[11px] leading-tight text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="min-w-0 grow">{rotuloEditor}</span>
                <button type="button" onClick={rehacer} className="cursor-pointer rounded bg-white/20 px-2 py-0.5">
                  Rehacer
                </button>
                <button
                  type="button"
                  onClick={siguientePendiente}
                  className="cursor-pointer rounded bg-white/20 px-2 py-0.5"
                >
                  Siguiente pendiente
                </button>
                <button
                  type="button"
                  onClick={copiarMarcas}
                  className="cursor-pointer rounded px-2 py-0.5 text-black"
                  style={{ background: '#ffc93c' }}
                >
                  {copiado ? 'Copiado' : 'Copiar JSON'}
                </button>
              </div>
              {pendiente?.codigo === codigoVisible && (
                <span
                  className="absolute rounded-full border-2 border-white"
                  style={{
                    left: `${pendiente.punto[0]}%`,
                    top: `${pendiente.punto[1]}%`,
                    width: 12,
                    height: 12,
                    transform: 'translate(-50%, -50%)',
                    background: '#dc2626'
                  }}
                />
              )}
            </div>
          )}


          {aviso && conTeclado && leyendo && (
            <div className="absolute inset-x-0 z-30 flex justify-center" style={{ bottom: '17cqw' }}>
              {/* En dos lineas: el texto con sus teclas arriba y el boton debajo,
                  porque todo seguido no cabe en el ancho del lector */}
              <div
                className="flex flex-col items-center rounded-[3cqw] bg-deep/90 font-mono uppercase text-crema shadow-lg"
                style={{ padding: '3cqw 4cqw', gap: '2.6cqw', fontSize: '2.9cqw', letterSpacing: '0.08em', lineHeight: 1 }}
              >
                <span className="flex items-center" style={{ gap: '2.5cqw' }}>
                  {t('lector.teclado')}
                  {/* Las dos teclas que se pueden usar, dibujadas */}
                  <span className="flex items-center" style={{ gap: '1.2cqw' }}>
                    {[false, true].map((haciaDelante) => (
                      <span
                        key={String(haciaDelante)}
                        className="flex items-center justify-center rounded border border-crema/70"
                        style={{ width: '5.2cqw', height: '5.2cqw' }}
                      >
                        {chevron(haciaDelante, '3cqw')}
                      </span>
                    ))}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={cerrarAviso}
                  className="cursor-pointer whitespace-nowrap rounded-full bg-accent font-mono uppercase text-deep transition-colors motion-safe:animate-pulse hover:animate-none hover:bg-crema"
                  style={{ padding: '1.8cqw 4cqw', letterSpacing: '0.08em', lineHeight: 1 }}
                >
                  {t('lector.entendido')}
                </button>
              </div>
            </div>
          )}
          {actual.tipo !== 'indice' && spinner}
        </div>
      </div>
    </div>
  )
}

// Carrusel de una subruta: una imagen, su texto y navegacion ciclica. Las
// medidas van en cqw para que todo escale con el ancho de la caja
function Carrusel({
  ruta,
  paneles,
  alVolver
}: {
  ruta: string
  paneles: Panel[]
  alVolver: (() => void) | null
}) {
  const { t } = useTranslation()
  const [i, setI] = useState(0)
  const total = paneles.length
  const ir = (paso: number) => setI((n) => (n + paso + total) % total)
  const panel = paneles[i]
  const base = `paneles.${ruta}.${panel.clave}`

  return (
    <div
      className="relative flex h-full w-full flex-col border border-crema bg-fondo"
      style={{ containerType: 'size' }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') ir(-1)
        if (e.key === 'ArrowRight') ir(1)
      }}
      tabIndex={0}
    >
      <div style={{ padding: '5cqw 5cqw 0' }}>
        {panel.imagen ? (
          <ImagenConSpinner
            caja="aspect-square w-full"
            src={panel.imagen}
            alt={t(`${base}.titulo`)}
            width={900}
            height={900}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex aspect-square w-full items-center justify-center border border-dashed border-line text-muted"
            style={{ fontSize: '3.4cqw', letterSpacing: '0.1em' }}
          >
            {panel.clave.toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden" style={{ padding: '5cqw' }}>
        <h2
          className="font-mono uppercase text-accent"
          style={{ fontSize: '7cqw', letterSpacing: '0.08em', marginBottom: '2.5cqw' }}
        >
          {t(`${base}.titulo`)}
        </h2>
        <p className="text-ink/80" style={{ fontSize: '6cqw', lineHeight: 1.65 }}>
          {t(`${base}.texto`)}
        </p>
        {panel.correo && <BloqueCorreo />}
      </div>

      <div
        className="flex items-center justify-between border-t border-line/60"
        style={{ padding: '3cqw 5cqw' }}
      >
        {alVolver && (
          <button
            type="button"
            onClick={alVolver}
            className="cursor-pointer font-mono uppercase text-enlace transition-colors hover:text-accent"
            style={{ fontSize: '6cqw', letterSpacing: '0.1em', lineHeight: 1 }}
          >
            {`<< ${t('subs.volver')}`}
          </button>
        )}

        <div className="ml-auto flex items-center" style={{ gap: '5.2cqw' }}>
          <button
            type="button"
            onClick={() => ir(-1)}
            aria-label={t('paneles.anterior')}
            className="cursor-pointer font-mono text-enlace transition-colors hover:text-accent"
            style={{ fontSize: '9cqw', lineHeight: 1 }}
          >
            &lt;
          </button>

          <div className="flex" style={{ gap: '3.3cqw' }}>
            {paneles.map((p, n) => (
              <button
                key={p.clave}
                type="button"
                onClick={() => setI(n)}
                aria-label={`${n + 1}`}
                aria-current={n === i ? 'true' : undefined}
                className={[
                  'cursor-pointer rounded-full transition-colors',
                  n === i ? 'bg-accent' : 'bg-line hover:bg-crema/60'
                ].join(' ')}
                style={{ width: '3.6cqw', height: '3.6cqw' }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => ir(1)}
            aria-label={t('paneles.siguiente')}
            className="cursor-pointer font-mono text-enlace transition-colors hover:text-accent"
            style={{ fontSize: '9cqw', lineHeight: 1 }}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  )
}

// Direccion de contacto con boton de copiar. La usan la pantalla de contacto y
// el panel que explica donde se envia la propuesta de colaboracion
function BloqueCorreo() {
  const { t } = useTranslation()
  const [copiado, setCopiado] = useState(false)

  const copiar = () => {
    if (!navigator.clipboard) return
    void navigator.clipboard.writeText(CORREO).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="flex flex-wrap items-center" style={{ gap: '4cqw', marginTop: '6cqw' }}>
      <a
        href={`mailto:${CORREO}`}
        className="break-all font-mono text-crema underline decoration-accent/70 underline-offset-4 transition-colors hover:text-accent"
        style={{ fontSize: '5cqw', letterSpacing: '0.04em' }}
      >
        {CORREO}
      </a>
      <button
        type="button"
        onClick={copiar}
        className="cursor-pointer border border-accent bg-accent font-mono uppercase text-deep transition-colors hover:border-crema hover:bg-crema"
        style={{ fontSize: '4cqw', letterSpacing: '0.1em', padding: '1.5cqw 3cqw' }}
      >
        {copiado ? t('contacto.copiado') : t('contacto.copiar')}
      </button>
    </div>
  )
}

// Pantalla de la seccion de contacto: texto y la direccion como enlace
function PantallaContacto() {
  const { t } = useTranslation()

  return (
    <div
      className="flex h-full w-full flex-col overflow-y-auto border border-crema bg-fondo"
      style={{ containerType: 'size' }}
    >
      <ImagenConSpinner
        caja="w-full shrink-0"
        estiloCaja={{ height: '31cqh', marginTop: '5cqw' }}
        src="/contacto.webp"
        alt={t('contacto.titulo')}
        width={900}
        height={900}
        className="h-full w-full object-cover"
      />
      <div style={{ padding: '6cqw' }}>
        <h2
          className="font-mono uppercase text-accent"
          style={{ fontSize: '7cqw', letterSpacing: '0.08em', marginBottom: '4cqw' }}
        >
          {t('contacto.titulo')}
        </h2>
        <p className="text-ink/80" style={{ fontSize: '6cqw', lineHeight: 1.65 }}>
          {t('contacto.texto')}
        </p>
        <BloqueCorreo />
      </div>
    </div>
  )
}

export default function App() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? 'en'
  const [intro, setIntro] = useState<'dentro' | 'saliendo' | 'fuera'>(() =>
    tocaPresentacion() ? 'dentro' : 'fuera'
  )
  const [seccion, setSeccion] = useState(RUTA_INICIAL?.indice ?? 0)
  const [subActiva, setSubActiva] = useState<number | null>(SUB_INICIAL)
  // El submenu se abre al entrar en la seccion y tambien al llegar por una ruta anidada
  const [enSubmenu, setEnSubmenu] = useState(
    RUTA_INICIAL ? abreSubmenu(RUTA_INICIAL.indice) : false
  )
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const menu = useRef<HTMLElement>(null)
  const [borde, setBorde] = useState({ izq: 0, der: 0, ancho: 0, arriba: 0 })
  const [esEscritorio, setEsEscritorio] = useState(false)
  const zonaImagen = useRef<HTMLDivElement>(null)
  const pie = useRef<HTMLElement>(null)
  const logoIntro = useRef<HTMLImageElement>(null)
  const logoCabecera = useRef<HTMLImageElement>(null)
  const sloganIntro = useRef<HTMLParagraphElement>(null)
  const sloganCabecera = useRef<HTMLParagraphElement>(null)
  const [viaje, setViaje] = useState<string | undefined>(undefined)
  const [viajeSlogan, setViajeSlogan] = useState<string | undefined>(undefined)

  // La presentacion entra, se mantiene el tiempo de leer el eslogan, y se corta
  // sola o con cualquier clic o tecla
  useEffect(() => {
    if (intro !== 'dentro') return
    try {
      sessionStorage.setItem(INTRO_VISTA, '1')
    } catch {
      // Sin sessionStorage la presentacion sale en cada carga, que era lo de antes
    }

    const saltar = () => setIntro((actual) => (actual === 'dentro' ? 'saliendo' : actual))
    const aSalir = setTimeout(saltar, 8000)
    const sucesos = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
    sucesos.forEach((suceso) => window.addEventListener(suceso, saltar, { passive: true }))

    return () => {
      clearTimeout(aSalir)
      sucesos.forEach((suceso) => window.removeEventListener(suceso, saltar))
    }
  }, [intro])

  // El vuelo del logo dura 900ms: al terminar se retira la presentacion entera
  useEffect(() => {
    if (intro !== 'saliendo') return
    const aFuera = setTimeout(() => setIntro('fuera'), 1100)
    return () => clearTimeout(aFuera)
  }, [intro])

  // El destino se mide en pantalla, asi encaja con la cabecera en cualquier tamano
  useEffect(() => {
    if (intro !== 'saliendo') return
    const recorrido = (a?: DOMRect, b?: DOMRect) =>
      a && b ? `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.width / a.width})` : undefined

    setViaje(recorrido(logoIntro.current?.getBoundingClientRect(), logoCabecera.current?.getBoundingClientRect()))
    setViajeSlogan(
      recorrido(sloganIntro.current?.getBoundingClientRect(), sloganCabecera.current?.getBoundingClientRect())
    )
  }, [intro])

  // Si el navegador no admite pantalla completa sobre el contenedor (Safari en iPhone),
  // se expande por CSS y el resultado visual es el mismo
  const alternarPantallaCompleta = () => {
    const zona = zonaImagen.current
    if (!zona) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }
    if (typeof zona.requestFullscreen === 'function') {
      zona.requestFullscreen().catch(() => setPantallaCompleta((v) => !v))
      return
    }
    setPantallaCompleta((v) => !v)
  }

  // En escritorio todo se agrupa en un escenario del ancho de menu mas imagen
  useEffect(() => {
    const consulta = window.matchMedia('(min-width: 640px)')
    const mirar = () => setEsEscritorio(consulta.matches)
    mirar()
    consulta.addEventListener('change', mirar)
    return () => consulta.removeEventListener('change', mirar)
  }, [])

  // Los bordes del grupo salen de la imagen, que no se mueve de su sitio
  useEffect(() => {
    const n = menu.current
    const z = zonaImagen.current
    if (!n || !z) return
    const medir = () => {
      const r = z.getBoundingClientRect()
      setBorde({
        izq: Math.round(r.left - n.offsetWidth),
        der: Math.round(r.right),
        ancho: n.offsetWidth,
        // El alto libre que queda por encima de la caja: en movil es lo que ocupa el logo
        arriba: Math.round(r.top)
      })
    }
    const observador = new ResizeObserver(medir)
    observador.observe(z)
    observador.observe(n)
    medir()
    window.addEventListener('resize', medir)
    return () => {
      observador.disconnect()
      window.removeEventListener('resize', medir)
    }
  }, [])

  useEffect(() => {
    const alCambiar = () => setPantallaCompleta(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', alCambiar)
    return () => document.removeEventListener('fullscreenchange', alCambiar)
  }, [])

  const mostrar = (indice: number, sub: number | null = null) => {
    setSeccion(indice)
    setSubActiva(sub)
  }

  // Pulsar en el menu anade una entrada al historial: el boton atras funciona
  const elegirSeccion = (indice: number) => {
    // Las secciones con submenu abren ya su primera subruta, para no dejar el hueco vacio
    const sub = abreSubmenu(indice) ? 0 : null
    mostrar(indice, sub)
    setEnSubmenu(abreSubmenu(indice))
    window.history.pushState(null, '', rutaDe(language, indice, sub))
  }

  const elegirSub = (sub: number) => {
    mostrar(seccion, sub)
    window.history.pushState(null, '', rutaDe(language, seccion, sub))
  }

  // Las subrutas a las que solo se llega desde la escena no tienen entrada en el
  // menu izquierdo: el boton del carrusel es su unica salida de vuelta
  const volverAEscena = () => {
    mostrar(seccion, null)
    window.history.pushState(null, '', rutaDe(language, seccion, null))
  }

  // VOLVER cierra el submenu y baja al primer punto de la lista: la seccion con
  // submenu es solo un enlace, no debe quedarse marcada ni dejar el hueco vacio
  const salirDelSubmenu = () => {
    setEnSubmenu(false)
    mostrar(0)
    window.history.pushState(null, '', rutaDe(language, 0))
  }

  // Atras y adelante del navegador
  useEffect(() => {
    const alNavegar = () => {
      const ruta = leerRuta(window.location.pathname)
      if (!ruta) return
      mostrar(ruta.indice, abreSubmenu(ruta.indice) ? (ruta.sub ?? 0) : ruta.sub)
      setEnSubmenu(abreSubmenu(ruta.indice))
      if (ruta.idioma !== language) void i18n.changeLanguage(ruta.idioma)
    }
    window.addEventListener('popstate', alNavegar)
    return () => window.removeEventListener('popstate', alNavegar)
  })

  const tabla = subsDe(seccion)
  const lang = (language === 'es' ? 'es' : 'en') as SupportedLanguage
  // Sin subruta elegida: las secciones con escena la muestran, las de submenu no
  // tienen nada propio que ensenar
  const conEscena = subActiva === null && tabla !== null && !abreSubmenu(seccion)
  const sinMedia = subActiva === null && tabla !== null && abreSubmenu(seccion)

  const rutaSub = subActiva !== null && tabla ? tabla.en[subActiva] : null
  // Contacto tampoco tiene subrutas: es una sola pantalla
  const enContacto = SLUGS.en[seccion] === 'contact' && subActiva === null

  const nombreActual =
    subActiva === null || !tabla
      ? t(`secciones.v${seccion}`)
      : t(`subs.${tabla.en[subActiva]}`)

  // Entradas del submenu de la seccion activa, con VOLVER delante
  const menuSubs = tabla
    ? [
        { clave: 'subs.volver', sub: null as number | null },
        ...tabla.en.map((slug, i) => ({ clave: `subs.${slug}`, sub: i as number | null }))
      ]
    : []

  // El idioma y la seccion activa deben reflejarse en el documento y en la
  // direccion. Tambien cubre la entrada por la raiz, que no tiene camino valido
  useEffect(() => {
    const camino = rutaDe(language, seccion, subActiva)
    if (window.location.pathname !== camino) {
      window.history.replaceState(null, '', camino)
    }

    // La portada lleva el titulo de la marca, el mismo que trae el HTML de
    // partida: asi la pestana no cambia al arrancar
    const title =
      seccion === 0 && subActiva === null ? t('meta.title') : `${nombreActual} | ${t('hero.title')}`
    const description = t('meta.description')
    const url = `${DOMINIO}${camino}`

    document.documentElement.lang = language
    document.title = title
    setMeta('meta[name="description"]', description)
    setMeta('meta[property="og:title"]', title)
    setMeta('meta[property="og:description"]', description)
    setMeta('meta[property="og:url"]', url)
    setMeta('meta[property="og:locale"]', OG_LOCALES[language] ?? 'en_US')

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) canonical.href = url
  }, [language, seccion, subActiva, nombreActual, t])

  return (
    <div className="relative min-h-dvh overflow-hidden">

      <div aria-hidden="true" className="field pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="halo pointer-events-none absolute inset-0" />


      <nav
        ref={menu}
        aria-label="Secciones"
        // En movil arranca justo debajo del logo, que crece con la pantalla
        style={
          esEscritorio && !pantallaCompleta
            ? { left: borde.izq }
            : borde.arriba > 66
              ? { top: borde.arriba }
              : undefined
        }
        className={[
          'absolute bottom-[44px] left-0 top-[66px] z-10 flex w-[70px] flex-col sm:bottom-[60px] sm:top-[329px] sm:w-[279px] sm:pl-3 sm:pr-1',
          pantallaCompleta ? 'hidden' : ''
        ].join(' ')}
      >
        {enSubmenu
          ? menuSubs.map((entrada, i) => {
              const activo = entrada.sub !== null && entrada.sub === subActiva
              return (
                <button
                  key={entrada.clave}
                  type="button"
                  onClick={() => (entrada.sub === null ? salirDelSubmenu() : elegirSub(entrada.sub))}
                  aria-current={activo ? 'true' : undefined}
                  className={claseBoton(activo)}
                >
                  <span className={i === 0 ? undefined : 'min-w-0 hyphens-auto break-words'}>
                    {entrada.sub === null ? `<< ${t(entrada.clave)}` : t(entrada.clave)}
                  </span>
                </button>
              )
            })
          : SLUGS.en.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => elegirSeccion(i)}
                aria-current={i === seccion ? 'true' : undefined}
                className={claseBoton(i === seccion)}
              >
                <span className="min-w-0 hyphens-auto break-words">
                  {abreSubmenu(i) ? `${t(`secciones.v${i}`)} >>` : t(`secciones.v${i}`)}
                </span>
              </button>
            ))}
      </nav>

      <div
        ref={zonaImagen}
        className={
          pantallaCompleta
            ? 'fixed inset-0 z-40 bg-fondo'
            : 'absolute bottom-[48px] left-[70px] right-0 top-[58px] m-auto aspect-[720/1606] h-[min(calc(100dvh-106px),calc((100vw-70px)*2.2306))] sm:bottom-0 sm:left-[220px] sm:top-0 sm:mx-auto sm:my-0 sm:h-dvh'
        }
      >
        {conEscena && tabla && (
          <EscenaIntroduccion
            titulo={t(`secciones.v${seccion}`)}
            bloques={(PANELES[tabla.en[0]] ?? []).map((panel) => ({
              titulo: t(`paneles.${tabla.en[0]}.${panel.clave}.titulo`),
              texto: t(`paneles.${tabla.en[0]}.${panel.clave}.texto`)
            }))}
          />
        )}

        {!conEscena && !sinMedia && enContacto && (
          <PantallaContacto />
        )}

        {!conEscena && !sinMedia && rutaSub && COMICS[rutaSub] && (
          <LectorComic key={rutaSub} comic={rutaSub} />
        )}

        {!conEscena && !sinMedia && rutaSub && PANELES[rutaSub] && (
          <Carrusel
            key={rutaSub}
            ruta={rutaSub}
            paneles={PANELES[rutaSub]}
            alVolver={abreSubmenu(seccion) ? null : volverAEscena}
          />
        )}

        {!conEscena && !sinMedia && !enContacto && !(rutaSub && (PANELES[rutaSub] || COMICS[rutaSub])) && (
          <ImagenConSpinner
            caja="h-full w-full"
            src={portadaDe(lang)}
            alt={nombreActual}
            width={720}
            height={1606}
            onDoubleClick={alternarPantallaCompleta}
            className="h-full w-full border border-crema object-contain"
          />
        )}
      </div>

      <img
        ref={logoCabecera}
        style={
          esEscritorio && !pantallaCompleta
            ? { left: borde.izq }
            : borde.arriba > 0
              ? { width: borde.arriba, height: borde.arriba }
              : undefined
        }
        src="/logo-tajopages.webp"
        alt={t('hero.title')}
        width={800}
        height={800}
        className={[
          'absolute left-0 top-0 z-10 w-[68px] sm:ml-[14px] sm:w-[263px]',
          intro === 'fuera' ? 'opacity-100' : 'opacity-0'
        ].join(' ')}
      />

      <p
        ref={sloganCabecera}
        style={esEscritorio && !pantallaCompleta ? { left: borde.izq } : undefined}
        className={[
          // Va en dos lineas en los dos tamanios. En movil, centrado en la misma
          // altura que el selector de idioma, que tiene su centro en 35px
          'absolute left-[72px] right-[110px] top-[35px] z-10 -translate-y-1/2 text-center font-mono text-[1.05rem] uppercase leading-tight tracking-[0.06em] text-crema',
          // En escritorio va en una linea y centrado en el hueco entre el logo, que
          // acaba en 263, y el menu, que empieza en 329: 66px de hueco para 22 de texto
          'sm:left-0 sm:ml-[14px] sm:right-auto sm:top-[285px] sm:w-[263px] sm:translate-y-0 sm:text-[1.09rem] sm:tracking-[0em]',
          intro === 'fuera' ? 'opacity-100' : 'opacity-0'
        ].join(' ')}
      >
        {/* El bloque va centrado en su hueco y las dos lineas alineadas entre si */}
        <span className="inline-block text-left">
          {t('hero.slogan').split(' ')[0]}
          {/* En escritorio el salto se oculta y queda el espacio, en una sola linea */}
          <br className="sm:hidden" />{' '}
          {t('hero.slogan').split(' ').slice(1).join(' ')}
        </span>
      </p>

      {intro !== 'fuera' && (
        <>
          <div
            aria-hidden="true"
            className={[
              'fixed inset-0 z-40 bg-fondo transition-opacity duration-[900ms]',
              intro === 'saliendo' ? 'opacity-0' : 'opacity-100'
            ].join(' ')}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-0 px-6"
          >
            <img
              ref={logoIntro}
              src="/logo-tajopages.webp"
              alt=""
              width={800}
              height={800}
              style={intro === 'saliendo' ? { transform: viaje } : undefined}
              className={[
                'w-full max-w-none sm:w-[480px]',
                intro === 'dentro'
                  ? 'intro-logo origin-center'
                  : 'origin-top-left transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]'
              ].join(' ')}
            />
            <p
              ref={sloganIntro}
              style={intro === 'saliendo' ? { transform: viajeSlogan } : undefined}
              className={[
                'mt-6 origin-top-left whitespace-pre-line text-center font-mono text-base uppercase leading-relaxed tracking-[0.2em] text-crema sm:text-2xl',
                intro === 'dentro'
                  ? 'intro-slogan'
                  : 'transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]'
              ].join(' ')}
            >
              {t('hero.slogan')}
            </p>
          </div>
        </>
      )}

      <header style={esEscritorio && !pantallaCompleta ? { left: borde.der } : undefined} className="absolute right-1 top-[21px] z-20 sm:right-auto sm:top-4">
        <LanguageSwitcher />
      </header>

      <footer
        ref={pie}
        style={
          esEscritorio && !pantallaCompleta
            ? { left: borde.der + SEPARACION, maxWidth: borde.ancho }
            : undefined
        } className="absolute bottom-1 left-[70px] right-0 z-20 flex flex-col items-center gap-y-0.5 font-mono text-[0.7rem] tracking-[0.1em] text-muted/70 sm:bottom-2 sm:left-2 sm:right-auto sm:items-start sm:text-left sm:text-xs">
        <span className="order-2 flex items-center whitespace-nowrap">
          {`©${new Date().getFullYear()}`}
          <span className="ml-1.5 text-[0.6rem] sm:text-xs">{t('footer.rights')}</span></span><span className="order-1 flex items-center gap-1.5 whitespace-nowrap">By<a href="https://iamjosepunto.github.io" target="_blank" rel="noopener noreferrer" className="text-crema/80 transition-colors hover:text-crema">IamJosePunto.GitHub.io</a>
        </span>
      </footer>
    </div>
  )
}


