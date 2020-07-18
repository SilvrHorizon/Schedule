class Course(object):
    courseName = ""

    def __init__(self, courseName="N/A", begins=0, ends=0, weekday=-1):
        self.courseName = courseName

        self.begins = begins
        self.ends = ends
        self.weekday = weekday

    def __repr__(self):
        return "Course<Type:{}, Day:{}, Begins:{:02d}:{:02d}, Ends:{:02d}:{:02d}>".format(self.courseName, self.weekday, self.begins[0], self.begins[1], self.ends[0], self.ends[1])