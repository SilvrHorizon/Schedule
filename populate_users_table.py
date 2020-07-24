from app.models import User, Class, Schedule
from app import db
import random
import uuid

users = []
for i in range(50):
    users.append(User(email=f'test{i}@test.com', public_id=str(uuid.uuid4()), first_name=f'test{i}', last_name='example{i}'))

[db.session.add(u) for u in users]
db.session.commit()

for user in users:
    schedule = Schedule(user=user, week_number=-1)
    for weekday in range(5):
        prevtime = 8 * 60 + 15
        for addcours in range(0, random.randint(0,5)):
            timediff = random.randint(5, 90)
            courselen = random.randint(40, 60 * 2)
            course = Class(weekday=weekday, begins=(prevtime + timediff), ends=(prevtime + timediff + courselen), schedule=schedule, course="TESTCOURSE")
            prevtime+= courselen + timediff
            db.session.add(course)
    db.session.add(schedule)
db.session.commit()