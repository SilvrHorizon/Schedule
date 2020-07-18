from ScheduleImageProcessor.course import Course
from customUtilities.schedulemanip import getBinaryRepresentation, getFreeTime
from customUtilities.time import format_minutes

from app.models import Class

courses = []

'''
course = Course("N/A", [8, 5], [8, 15])
courses.append(course)
'''

# course = Course("N/A", [8, 5], [8, 15])
# courses.append(course)

# print(bin(getBinaryRepresentation(courses)))

monday = Class.query.filter_by(schedule_id=1, weekday=0).all()



print(monday)

free_time = getFreeTime(~getBinaryRepresentation(monday))


for f in free_time:
    print("{} to {}".format(format_minutes(f[0]), format_minutes(f[1])))
