from flask import render_template, request
import numpy as np
import cv2

from app import App
from ScheduleImageProcessor import findCourses

from PIL import Image
from io import BytesIO




ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def sortFunction(e):
    try:
        return 3600 * e.weekDay + e.begins[0] * 60 + e.begins[1]
    except:
        return 10000

@App.route('/upload-schedule', methods=['GET', 'POST'])
def uploadSchedule():
    if request.method == 'POST':
        if request.files['image']:
            img = Image.open(request.files['image'].stream).convert('RGB')
            opencvimg = np.array(img)
            courses = findCourses(cv2.cvtColor(opencvimg, cv2.COLOR_BGR2GRAY), debug=False)
            print("Found a total of {} courses".format(len(courses)))

            courses.sort(key=sortFunction)
            print(courses)

            builder = '<h1>Schemat</h1>'
            days = {0: "Måndag", 1: "Tisdag", 2: "Onsdag", 3: "Torsdag", 4: "Fredag"}
            for course in courses:
                builder += '<p>'
                try:
                    builder += '{} på {} kl: {:02d}:{:02d} till {:02d}:{:02d}'.format(course.courseName, days[course.weekDay], course.begins[0], course.begins[1], course.ends[0], course.ends[1])
                except:
                    builder += 'En kurs fick innehåller inte nog med data för att visas'
                builder += '</p>'
            return builder
        else:
            return 'Did not get image'
 

    return render_template('upload-schedule.html')

@App.route('/login')
def login():
    pass