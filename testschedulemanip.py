from ScheduleImageProcessor.course import Course
from customUtilities.schedulemanip import getBinaryRepresentation, getFreeTime
from customUtilities.time import format_minutes
from customUtilities.schedulemanip import extract_breaks

from app.models import Class, Schedule


courses = []

'''
course = Course("N/A", [8, 5], [8, 15])
courses.append(course)
'''

# course = Course("N/A", [8, 5], [8, 15])
# courses.append(course)

# print(bin(getBinaryRepresentation(courses)))

'''
monday = Class.query.filter_by(schedule_id=1, weekday=0).all()



print(monday)

free_time = getFreeTime(~getBinaryRepresentation(monday))


for f in free_time:
    print("{} to {}".format(format_minutes(f[0]), format_minutes(f[1])))
'''

s = Schedule.query.filter_by(user_id = 1, week_number=-1).first()

print(s.classes.filter_by(weekday=0).all())
print(extract_breaks(s, 0))