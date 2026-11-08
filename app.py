import os
from functools import wraps
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from models import db, Work, User, Subscriber
from config import Config

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('is_admin'):
            flash('Debes iniciar sesión para acceder al panel de administración.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(os.path.join(app.root_path, 'instance'), exist_ok=True)
    db.init_app(app)

    @app.route('/')
    def index():
        works = Work.query.order_by(Work.created_at.desc()).all()
        return render_template('index.html', works=[w.to_dict() for w in works])

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if session.get('is_admin'):
            return redirect(url_for('admin_dashboard'))

        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')

            user = User.query.filter_by(username=username).first()
            if user and user.check_password(password):
                session['is_admin'] = True
                session['username'] = user.username
                flash('Sesión iniciada correctamente.', 'success')
                return redirect(url_for('admin_dashboard'))
            else:
                flash('Usuario o contraseña incorrectos.', 'error')

        return render_template('login.html')

    @app.route('/logout')
    def logout():
        session.clear()
        flash('Has cerrado sesión.', 'info')
        return redirect(url_for('index'))

    @app.route('/admin')
    @admin_required
    def admin_dashboard():
        works = Work.query.order_by(Work.created_at.desc()).all()
        subscribers = Subscriber.query.order_by(Subscriber.created_at.desc()).all()
        return render_template('admin_dashboard.html', works=works, subscribers=subscribers)

    @app.route('/admin/create', methods=['GET', 'POST'])
    @admin_required
    def create_work():
        if request.method == 'POST':
            title = request.form.get('title')
            work_type = request.form.get('type')
            subtitle = request.form.get('subtitle')
            content = request.form.get('content')
            excerpt = request.form.get('excerpt') or content[:150] + '...'
            featured = 'featured' in request.form

            labels = {
                'poema': 'Poesía',
                'cuento': 'Cuentos Cortos',
                'reflexion': 'Reflexiones'
            }
            category_label = labels.get(work_type, 'General')
            words = len(content.split())
            read_time = f"{max(1, round(words / 150))} min"

            new_work = Work(
                title=title,
                type=work_type,
                category_label=category_label,
                subtitle=subtitle,
                excerpt=excerpt,
                content=content,
                read_time=read_time,
                featured=featured
            )
            db.session.add(new_work)
            db.session.commit()
            flash('Obra publicada exitosamente.', 'success')
            return redirect(url_for('admin_dashboard'))

        return render_template('editor.html', work=None)

    @app.route('/admin/edit/<int:work_id>', methods=['GET', 'POST'])
    @admin_required
    def edit_work(work_id):
        work = Work.query.get_or_404(work_id)

        if request.method == 'POST':
            work.title = request.form.get('title')
            work.type = request.form.get('type')
            work.subtitle = request.form.get('subtitle')
            work.content = request.form.get('content')
            work.excerpt = request.form.get('excerpt') or work.content[:150] + '...'
            work.featured = 'featured' in request.form

            labels = {
                'poema': 'Poesía',
                'cuento': 'Cuentos Cortos',
                'reflexion': 'Reflexiones'
            }
            work.category_label = labels.get(work.type, 'General')
            words = len(work.content.split())
            work.read_time = f"{max(1, round(words / 150))} min"

            db.session.commit()
            flash('Obra actualizada correctamente.', 'success')
            return redirect(url_for('admin_dashboard'))

        return render_template('editor.html', work=work)

    @app.route('/admin/delete/<int:work_id>', methods=['POST'])
    @admin_required
    def delete_work(work_id):
        work = Work.query.get_or_404(work_id)
        db.session.delete(work)
        db.session.commit()
        flash('Obra eliminada exitosamente.', 'success')
        return redirect(url_for('admin_dashboard'))

    @app.route('/api/works')
    def api_works():
        works = Work.query.order_by(Work.created_at.desc()).all()
        return jsonify([w.to_dict() for w in works])

    @app.route('/api/works/<int:work_id>/like', methods=['POST'])
    def like_work(work_id):
        work = Work.query.get_or_404(work_id)
        work.likes += 1
        db.session.commit()
        return jsonify({'success': True, 'likes': work.likes})

    @app.route('/api/subscribe', methods=['POST'])
    def subscribe():
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()

        if not email or '@' not in email:
            return jsonify({'success': False, 'message': 'Correo inválido'}), 400

        existing = Subscriber.query.filter_by(email=email).first()
        if not existing:
            new_sub = Subscriber(email=email)
            db.session.add(new_sub)
            db.session.commit()

        return jsonify({'success': True})

    return app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)