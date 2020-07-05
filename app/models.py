from app import db
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(32), index=True)
    username = db.Column(db.String(64), index=True)
    email = db.Column(db.String(64), index=True, unique=True)

    #followers = db.Table('followers', db.Column('follower_id', db.Integer, db.Foreign_key('user.id')), db.Column('followed_id', db.Integer, db.Foreign_key('user.id')))
    #follows = db.relationship('User', secondary=followers, primary_join=(followers.c.follower_id == id), secondary_join=(followers.c.followed_id == id), backref=db.backref('followers', lazy='dynamic'), lazy='dynamic')


    def __repr__(self):
        return '<User {}>'.format(self.email)
    

