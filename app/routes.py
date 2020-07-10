# Flask related imports
from flask import render_template, request, url_for, redirect, abort
from flask_login import LoginManager, current_user, login_required, login_user, logout_user

# For Google oAuth
from oauthlib.oauth2 import WebApplicationClient
import requests

# For image processing
import numpy as np
import cv2
from PIL import Image

# General
import json

from config import Config, get_google_provider_config
from app import db
from app.models import User, Schedule, Class, DayBinaryRepresentation
from app import App
from ScheduleImageProcessor import findCourses
from customUtilities.time import hour_minute_to_minutes, format_minutes
from customUtilities.schedulemanip import getBinaryRepresentation

# oAuth2 client setup
oauthClient = WebApplicationClient(Config.GOOGLE_CLIENT_ID)

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Move to a better place
def sortFunction(e):
    try:
        return 60 * 24 * e.weekday + e.begins
    except:
        return 100000

@login_required
@App.route('/upload-schedule', methods=['GET', 'POST'])
def uploadSchedule():

    if request.method == 'POST':
        if request.files['image']:
            
            # Get courses
            img = Image.open(request.files['image'].stream).convert('RGB')
            opencvimg = np.array(img)
            courses = findCourses(cv2.cvtColor(opencvimg, cv2.COLOR_BGR2GRAY), debug=False)
            courses.sort(key=sortFunction)

            schedule = None

            storedSchedule = Schedule.query.filter_by(user=current_user, week_number=-1).first()
            if storedSchedule is not None:
                Class.query.filter_by(schedule=storedSchedule).delete()
                db.session.commit()
                schedule = storedSchedule
            else:
                schedule = Schedule(week_number=-1, user=current_user)
                db.session.add(schedule)
            
            course_by_day = [[], [], [], [], []]

            for course in courses:
                compiled = Class(begins=course.begins, ends=course.ends, course=course.courseName, weekday=course.weekday, schedule=schedule)
                course_by_day[course.weekday].append(course)
                db.session.add(compiled)

            for i in range(len(course_by_day)):
                rep = getBinaryRepresentation(course_by_day[i]).to_bytes(128, "big")
                print("i:", i)
                print(rep)
                db.session.add(DayBinaryRepresentation(schedule=schedule, value=rep, weekday=i))

            db.session.commit()

            builder = '<h1>Schemat</h1>'
            days = {0: "Måndag", 1: "Tisdag", 2: "Onsdag", 3: "Torsdag", 4: "Fredag"}
            for course in courses:
                builder += '<p>'
                try:
                    builder += '{} på {} kl: {} till {}'.format(course.courseName, days[course.weekday], format_minutes(course.begins), format_minutes(course.ends))
                except:
                    builder += 'En kurs fick innehåller inte nog med data för att visas'
                builder += '</p>'
            return builder + "<p>{}</p>".format(getBinaryRepresentation(courses))
        else:
            return 'Did not get image'


    return render_template('upload-schedule.html')

@App.route('/login')
def login():
    authorization_endpoint = get_google_provider_config()["authorization_endpoint"]

    request_uri = oauthClient.prepare_request_uri(authorization_endpoint, redirect_uri=request.base_url + "/callback", scope=["openid", "email", "profile"])

    return redirect(request_uri)


@App.route('/')
def index():
    if current_user.is_authenticated:
        return "logged in as {}".format(current_user.email)
    else:
        return "Index"


@App.route('/login/callback')
def login_callback():
    code = request.args.get("code")

    google_config = get_google_provider_config()
    token_endpoint = google_config["token_endpoint"]

    token_url, headers, body = oauthClient.prepare_token_request(token_endpoint, authorization_response=request.url, redirect_url=request.base_url, code=code)

    token_response = requests.post(token_url, headers=headers, data=body, auth=(Config.GOOGLE_CLIENT_ID, Config.GOOGLE_CLIENT_SECRET))

    oauthClient.parse_request_body_response(json.dumps(token_response.json()))

    userinfo_endpoint = google_config["userinfo_endpoint"]
    uri, headers, body = oauthClient.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)


    if userinfo_response.json().get("email_verified"):
        google_id = userinfo_response.json()["sub"]
        print(google_id)
        user = User.query.filter_by(google_id=google_id).first()

        if user is not None:
            login_user(user, True)
        else:
            u = User(first_name=userinfo_response.json()["given_name"], last_name=userinfo_response.json()["family_name"], email=userinfo_response.json()["email"], google_id=userinfo_response.json()["sub"])
            db.session.add(u)
            db.session.commit()
            login_user(u, True)
    else:
        return "Email not verified!"

    return redirect(url_for('index'))

@login_required
@App.route('/my-schedule', methods=['GET'])
def show_schedule():
    week_number = request.args.get("week_number")
    if week_number:
        week_number = int(week_number)

        schedule = Schedule.query.filter_by(user=current_user, week_number=week_number).first()
        if not schedule:
            schedule = Schedule.query.filter_by(user=current_user, week_number=week_number).first()
        if not schedule:
            abort(404, "Du har inget standard schema inlagt")

        bin = getBinaryRepresentation(Class.query.filter_by(schedule=schedule, weekday=0).all())
        return bin

    return render_template('my-schedule.html')
