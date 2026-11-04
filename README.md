# Módulo de autenticación (Login)

Proyecto final, Ingeniería del Software. Primer módulo: registro, inicio de sesión, sesión protegida, roles y bitácora de accesos.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | HTML, CSS y JavaScript (carpeta `public/`) |
| Backend | Netlify Functions, Node.js (carpeta `netlify/functions/`) |
| Base de datos | PostgreSQL en Neon |
| Seguridad | Contraseñas con bcrypt, sesión con JWT en cookie HttpOnly |

## Funcionalidades (requerimientos implementados)

| ID | Requerimiento | Tipo |
|---|---|---|
| RF-01 | Registrar usuario con nombre, correo y contraseña | Funcional |
| RF-02 | Iniciar sesión con correo y contraseña | Funcional |
| RF-03 | Cerrar sesión | Funcional |
| RF-04 | Proteger el panel: sin sesión redirige al login | Funcional |
| RF-05 | Roles: el primer usuario registrado es **admin** y los demás son **usuario** | Funcional |
| RF-06 | El admin ve la lista de usuarios y la bitácora de accesos | Funcional |
| RF-07 | Bloquear la cuenta 15 minutos tras 5 intentos fallidos | Funcional |
| RNF-01 | Contraseña de mínimo 8 caracteres, con mayúscula, minúscula y número | Seguridad |
| RNF-02 | Contraseñas almacenadas solo como hash bcrypt | Seguridad |
| RNF-03 | La sesión expira a las 2 horas | Seguridad |
| RNF-04 | Mensaje genérico si el correo no existe (no revela qué cuentas hay) | Seguridad |
| RNF-05 | Interfaz usable en celular (responsive) | Usabilidad |

## Estructura

```
public/               Pantallas: index (login), registro, panel
netlify/functions/    API: registro, login, logout, sesion, usuarios
lib/                  Lógica compartida: validacion, bloqueo, db, http
sql/schema.sql        Esquema de la base de datos (para el diagrama E-R)
tests/                Pruebas unitarias (caja blanca)
```

## Cómo publicarlo en Netlify

### 1. Subir el código a GitHub
1. Crea un repositorio nuevo en github.com (puede ser privado).
2. Usa **"uploading an existing file"** y arrastra el contenido de esta carpeta, **sin** `node_modules`.

### 2. Crear el sitio en Netlify
1. En Netlify: **Add new project → Import an existing project → GitHub** y elige el repositorio.
2. Netlify lee la configuración de `netlify.toml`, así que no hay que cambiar nada. Dale **Deploy**.

### 3. Conectar la base de datos
**Opción A (más fácil):** dentro del sitio, ve a **Extensions**, busca **Neon** e instálala. Netlify crea la base de datos y la variable `NETLIFY_DATABASE_URL` automáticamente.

**Opción B:** crea una cuenta gratuita en neon.tech, crea un proyecto y copia el *connection string*, que empieza con `postgresql://`. Luego guárdalo en Netlify como variable `DATABASE_URL`, siguiendo el paso 4.

Las tablas se crean solas la primera vez que alguien se registra.

### 4. Variables de entorno
En **Project configuration → Environment variables** agrega:

| Variable | Valor |
|---|---|
| `JWT_SECRET` | Texto aleatorio de 32 caracteres o más, por ejemplo uno generado en https://generate-secret.vercel.app/48 |
| `DATABASE_URL` | Solo si usaste la opción B |

Después ve a **Deploys → Trigger deploy** para que tome las variables.

### 5. Probar
1. Abre la URL del sitio y crea la primera cuenta. Esa será la de **administrador**.
2. Crea una segunda cuenta e intenta entrar 5 veces con una contraseña incorrecta para ver el bloqueo.
3. Entra como administrador y revisa la bitácora.

## Pruebas unitarias

```bash
npm install
npm test
```

Hay 12 pruebas sobre las reglas de validación y de bloqueo, con casos positivos y negativos.
