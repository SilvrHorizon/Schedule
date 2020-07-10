from flask_login import UserMixin

from app import login
from app import db

from customUtilities.time import format_minutes


followers = db.Table('followers', db.Column('follower_id', db.Integer, db.ForeignKey('user.id')), db.Column('followed_id', db.Integer, db.ForeignKey('user.id')))

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(32), index=True)
    first_name = db.Column(db.String(64), index=True)
    last_name = db.Column(db.String(64), index=True)
    email = db.Column(db.String(64), index=True, unique=True)

    follows = db.relationship('User', secondary=followers, primaryjoin=(followers.c.follower_id == id), secondaryjoin=(followers.c.followed_id == id), backref=db.backref('followers', lazy='dynamic'), lazy='dynamic')

    schedules = db.relationship('Schedule', backref="user", lazy='dynamic')

    def follow(self, user):
        if not self.is_following(user):
            self.follows.append(user)

    def unfollow(self, user):
        if self.is_following(user):
            self.follows.remove(user)
    
    def is_following(self, user):
        return self.follows.filter(followers.c.followed_id == user.id).count() > 0 

    def __repr__(self):
        return '<User {}>'.format(self.email)


class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    week_number = db.Column(db.SmallInteger, index=True)
    classes = db.relationship('Class', backref="schedule", lazy='dynamic')

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    days_binary_representations = db.relationship('DayBinaryRepresentation', backref='schedule', lazy='dynamic')

    def __repr__(self):
        return "<Schedule {}>".format(self.week_number)

class DayBinaryRepresentation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    weekday = db.Column(db.Integer)

    # A 0 represents free time and a 1 represents lessons
    value = db.Column(db.LargeBinary(length=128))
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id'))

class Class(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course = db.Column(db.String(16))
    weekday = db.Column(db.SmallInteger, index=True)
    begins = db.Column(db.Integer, index=True)
    ends = db.Column(db.Integer, index=True)

    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id'))

    def __repr__(self):
        return "<Class [course:{}, weekday:{} begins:{}, ends:{}]>".format(self.course, self.weekday, format_minutes(self.begins), format_minutes(self.ends))

@login.user_loader
def user_loader(id):
    return User.query.get(int(id))