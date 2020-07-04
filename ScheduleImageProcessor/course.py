class Course(object):
    courseName = ""

    def __init__(self, courseName, courseStart, courseEnd, weekDay = -1):
        self.courseName = courseName

        self.begins = courseStart
        self.ends = courseEnd 
        self.weekDay = weekDay
    
    def __repr__(self):
        return "Course<Type:{}, Day:{}, Begins:{:02d}:{:02d}, Ends:{:02d}:{:02d}>".format(self.courseName, self.weekDay, self.begins[0],self.begins[1], self.ends[0],self.ends[1])


