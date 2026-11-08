# Habitaciones huérfanas — Con Sistema de Autenticación Admin

Aplicación web literaria con backend Flask + SQLAlchemy y autenticación para administración (crear, editar, borrar).

## Funcionalidades de Autenticación
- **Vista Pública (`/`)**: Los visitantes pueden leer, filtrar, buscar, dar me gusta y escuchar música ambiental.
- **Inicio de Sesión (`/login`)**: Autenticación segura con contraseña encriptada mediante `werkzeug.security`.
- **Panel de Administración (`/admin`)**: Vista protegida con tabla completa de obras, contador de me gusta y accesos rápidos para **Editar** y **Eliminar**.
- **Creación y Edición (`/admin/create`, `/admin/edit/<id>`)**: Formulario completo para publicar o editar cuentos, poemas y reflexiones.
- **Cierre de Sesión (`/logout`)**: Finalización de sesión de administrador.

## Credenciales por Defecto (Creadas por `init_db.py`)
- **Usuario:** `admin`
- **Contraseña:** `admin123`

*(Puedes modificar las credenciales en `init_db.py` antes de inicializar o cambiar la hash en la BD).*

## Ejecución Local

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
python app.py
```
Accede a `http://127.0.0.1:5000`

## Despliegue en PythonAnywhere

1. Subir cambios a GitHub:
   ```bash
   git add .
   git commit -m "Add auth system and admin panel"
   git push origin main
   ```

2. En la consola Bash de PythonAnywhere:
   ```bash
   cd susurros-de-papel
   git pull
   source venv/bin/activate
   pip install -r requirements.txt
   python init_db.py
   ```

3. Recargar la Web App en el panel de PythonAnywhere.
