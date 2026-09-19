// UBICACION: src/App.tsx
import { useEffect, useRef, useState } from 'react'
import type { ComponentProps, CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'
import type { SupportedLanguage } from './i18n'
import i18next from './i18n'
import { SLUGS, leerRuta, rutaDe, subsDe } from './rutas'

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
  'celestial-invader': { carpeta: '/comics/toletum/invasor-celeste', vinetas: 120, capitulos: [26, 64, 84, 120] }
}

// Secciones cuyas subrutas se listan en la columna izquierda. Las demas llegan
// a las suyas desde las zonas clicables de su escena
const CON_SUBMENU = ['comics']

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
  const ir = (paso: number) => setPagina((n) => Math.min(Math.max(n + paso, 0), ultima))
  const actual = paginas[pagina]
  const codigo = String(actual.vineta).padStart(3, '0')
  const texto = actual.tipo === 'vineta' ? t(`vinetas.${comic}.${codigo}`) : ''
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
    'group pointer-events-auto absolute inset-y-0 flex cursor-pointer items-end disabled:cursor-default disabled:opacity-0'
  const circuloFlecha =
    'flex items-center justify-center rounded-full border border-black bg-crema/50 text-deep shadow-lg transition-colors group-hover:bg-accent'
  const medidaCirculo = { width: '13.75cqw', height: '13.75cqw' }
  // Chevron dibujado, no el caracter < o >: asi queda centrado de verdad en el
  // circulo y su tamanio y grosor no dependen de la tipografia
  const chevron = (haciaDelante: boolean) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: '13cqw', height: '13cqw' }}
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
        disabled={pagina === 0}
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
    const mirar = () => setAPantalla(document.fullscreenElement === caja.current)
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
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') ir(-1)
            if (e.key === 'ArrowRight') ir(1)
          }}
          tabIndex={0}
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
                  {texto}
                </p>
              </div>
              {barra}
            </>
          )}

          {(actual.tipo === 'caratula' || actual.tipo === 'vineta') && flechasLaterales}
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

    const title = `${nombreActual} | ${t('hero.title')}`
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


