from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Work(db.Model):
    __tablename__ = 'works'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # poema, cuento, reflexion
    category_label = db.Column(db.String(50), nullable=False)
    subtitle = db.Column(db.String(200), nullable=True)
    excerpt = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    read_time = db.Column(db.String(20), default='3 min')
    likes = db.Column(db.Integer, default=0)
    featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'type': self.type,
            'categoryLabel': self.category_label,
            'subtitle': self.subtitle or '',
            'excerpt': self.excerpt,
            'content': self.content,
            'readTime': self.read_time,
            'likes': self.likes,
            'featured': self.featured,
            'date': self.created_at.strftime('%d de %B, %Y')
        }
