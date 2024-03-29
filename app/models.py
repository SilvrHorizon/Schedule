from flask_login import UserMixin

from app import login
from app import db

from customUtilities.time import format_minutes


#followers = db.Table('followers', db.Column('level', db.Integer), db.Column('follower_id', db.Integer, db.ForeignKey('user.id')), db.Column('followed_id', db.Integer, db.ForeignKey('user.id')))
class Follow(db.Model):
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)

    priority_level = db.Column(db.SmallInteger)

    #follower = db.relationship('User', backref='following', primaryjoin(), lazy='dynamic')
    #followed = db.relationship('User', backref='followers', foreign_keys=[followed_id], lazy='dynamic')
    
    #
    #followed = db.relationship('User', backref='followers')

    def __repr(self):
        return f'{follower} follows {followed} with {priority_level}'


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), index=True, unique=True)
    google_id = db.Column(db.String(32), index=True, unique=True)
    first_name = db.Column(db.String(64), index=True)
    last_name = db.Column(db.String(64), index=True)
    email = db.Column(db.String(64), index=True, unique=True)

    followers = db.relationship('Follow', primaryjoin=(Follow.followed_id == id), backref='followed', lazy='dynamic')
    following = db.relationship('Follow', primaryjoin=(Follow.follower_id == id), backref='follower', lazy='dynamic')

    #follows = db.relationship('Follow', )
    '''
    follows = db.relationship('User', secondary=Follow, primaryjoin=(Follow.follower_id == id), 
        secondaryjoin=(Follow.followed_id == id), 
        backref=db.backref('tetetet', lazy='dynamic'), 
        lazy='dynamic')
    '''

    schedules = db.relationship('Schedule', backref="user", lazy='dynamic')

    def get_schedule(self, week_number):
        schedule = self.schedules.filter_by(week_number=week_number).first()
        if schedule is None: 
            schedule = self.schedules.filter_by(week_number=-1).first()
        return schedule
    
    def follow(self, user, level):
        rel = Follow.query.filter_by(follower_id=self.id, followed_id=user.id)
        if rel.count() > 0:
            rel.first().priority_level = level
        else:
            association = Follow(followed_id=user.id, priority_level=level)
            self.following.append(association)

        if not self.is_following(user):
            self.follows.append(user)

    def unfollow(self, user):
        Follow.query.filter_by(follower_id=self.id, followed_id=user.id).delete()
        if self.is_following(user):
            self.follows.remove(user)
        
    
    def is_following(self, user):
        return self.following.filter(Follow.followed_id == user.id).count() > 0 
    

    def __repr__(self):
        return '<User {}>'.format(self.email)


class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    week_number = db.Column(db.SmallInteger, index=True)
    classes = db.relationship('Class', backref="schedule", lazy='dynamic')

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    days_binary_representations = db.relationship('DayBinaryRepresentation', backref='schedule', lazy='dynamic')

    def get_weekday(self, weekday):
        return self.classes.filter_by(weekday=weekday).order_by(Class.begins).all()

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