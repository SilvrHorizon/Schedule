# Flask related imports
from flask import render_template, request, url_for, redirect, abort, flash, jsonify
from flask_login import LoginManager, current_user, login_required, login_user, logout_user

# For Google oAuth
from oauthlib.oauth2 import WebApplicationClient
import requests

#UUID
import uuid

# For image processing
import numpy as np
import cv2
from PIL import Image

# General
import json

from config import Config, get_google_provider_config
from app import db, csrf
from app.models import User, Schedule, Class, DayBinaryRepresentation
from app import App
from ScheduleImageProcessor import findCourses
from customUtilities.time import hour_minute_to_minutes, format_minutes, current_week
from customUtilities.schedulemanip import getBinaryRepresentation, getFreeTime, extract_breaks, extract_free_time, extract_begins, extract_ends
from customUtilities.math import common_spans
from app.forms import FollowUserForm

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
@csrf.exempt
def uploadSchedule():
    if request.method == 'POST':
        if request.files['image']:
            
            # Get courses
            img = Image.open(request.files['image'].stream).convert('RGB')
            opencvimg = np.array(img)
            courses = findCourses(cv2.cvtColor(opencvimg, cv2.COLOR_BGR2GRAY), debug=True)
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

    return render_template('login.html', google_auth_url=request_uri)

@App.route('/signup')
def signup():
    authorization_endpoint = get_google_provider_config()["authorization_endpoint"]
    request_uri = oauthClient.prepare_request_uri(authorization_endpoint, redirect_uri=request.base_url + "/callback", scope=["openid", "email", "profile"])

    return redirect(request_uri)

@login_required
@App.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))

@App.route('/test')
def test():
    login_user(User.query.get(1))
    return url_for('index')

@App.route('/index')
@App.route('/')
def index():
    print('reached index')
    if current_user.is_authenticated:
        
        
        #TODO handle cases where there is no standard schedule uploaded
        preloaded_schedules = {}
        followed_users = {}
        following = current_user.following.all()
        my_classes = current_user.schedules.filter_by(week_number=-1).first().classes.filter_by(weekday=0).all()
        my_breaks = extract_free_time(my_classes)
        
        print(my_breaks)
        for follow in following:
            followed = follow.followed

            if(follow.priority_level >= 2):
                #TODO handle cases where there is no standard schedule uploaded
                followed_schedule = followed.schedules.filter_by(week_number=-1).first()
                followed_classses = followed_schedule.classes.filter_by(weekday=0).all()
                
                print(extract_free_time(followed_classses))
                preloaded_schedules[followed.public_id] = {"times": common_spans(extract_free_time(followed_classses), my_breaks), 
                "first_name": followed.first_name, "last_name": followed.last_name, "begins": extract_begins(followed_classses),"ends": extract_ends(followed_classses)}
                
            followed_users[followed.public_id] = {"level": follow.priority_level, "first_name": followed.first_name, "last_name": followed.last_name}
            

        return render_template('index.html', preloaded_schedules = preloaded_schedules, followed_users=followed_users)
    
    return 'YOU ARE NOT LOGGED IN'
    


@App.route('/signup/callback')
def signup_callback():
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
        email = userinfo_response.json()["email"]

        u = User.query.filter_by(email=email).first()

        print("User: ", u)
        if u is not None:
            flash("Det finns redan ett konto anknytet till denna mail, var god och logga in.")
            return redirect(url_for('login'))

        google_id = userinfo_response.json()["sub"]
        first_name = userinfo_response.json()["given_name"].lower()
        last_name = userinfo_response.json()["family_name"].lower()

        print(email)
        u = User(google_id=google_id, first_name=first_name, last_name=last_name, email=email, public_id=str(uuid.uuid4()))

        db.session.add(u)
        db.session.commit()

        u = User.query.filter_by(google_id=google_id).first()
        login_user(u)

    return redirect(url_for('index')) 

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


    google_id = userinfo_response.json()["sub"]
    user = User.query.filter_by(google_id=google_id).first()

    if user is not None:
        login_user(user, True)
        return redirect(url_for('index'))
    else:
        flash('Det finns inget konto knytet till denna mail, var god och skapa ett.')
        redirect(url_for('signup'))

@login_required
@App.route('/my-schedule', methods=['GET'])
def my_schedule():
    if not current_user.is_authenticated:
        return "Du är inte inloggad, inget personligt schema kan visas"

    week_number = request.args.get("week_number")
    if week_number:
        week_number = int(week_number)
    else:
        week_number = -1

    schedule = Schedule.query.filter_by(user_id=current_user.id, week_number=week_number).first()
    
    #Fall back on the standard schedule if there is no specific schedule for that week
    if not schedule:
        schedule = Schedule.query.filter_by(user_id=current_user.id, week_number=-1).first()
    
    if not schedule:
        abort(404, "Du har inget standard schema inlagt")

    print(schedule.classes.all())
    return render_template('my-schedule.html', classes=schedule.classes.all())


@App.route('/user/<user_public_id>')
def user(user_public_id):
    user = User.query.filter_by(public_id=user_public_id).first()
    if user is None:
        return abort(404)

    common_times = None
    user_schedule = user.get_schedule(current_week())
    if current_user.is_authenticated:
        common_times = []
        
        my_schedule = current_user.get_schedule(current_week())
        for i in range(0,5):
            user_classes = user_schedule.classes.filter_by(weekday=i).all()
            common_times.append({
                "begins": extract_begins(user_classes),
                "ends": extract_ends(user_classes),
                "times": common_spans(extract_free_time(my_schedule.classes.filter_by(weekday=i).all()), extract_free_time(user_classes))
            })

    return render_template('user.html', user=user, current_week=current_week(), user_schedule=user_schedule, common_times=common_times)

@App.route('/search-for-user')
@App.route('/search-for-user/page/<int:page>')
def user_search(page=1):
    # TODO perform validation
    if len(request.args) > 0:
        email = request.args.get("email")
        first_name = request.args.get("first_name")
        last_name = request.args.get("last_name")
        query = User.query
        
        print('Firstname', request.args.get('first_name'))
        if email:
            query = query.filter_by(email=email.lower()) 
        if first_name:
            query = query.filter(User.first_name.contains(first_name.lower()))
        if last_name:
            query = query.filter(User.last_name.contains(last_name.lower()))
        
        paged = query.paginate(page, 1, False)
        users = paged.items                                                           
        
        follows = {}
        if current_user.is_authenticated:
            for u in users:
                follows[u.id] = current_user.following.filter_by(followed = u).first()

                if follows[u.id] is not None: 
                    follows[u.id] = follows[u.id].priority_level
                else:
                    follows[u.id] = 0
        
        search = '?first_name=' + request.args['first_name'] + '&last_name=' + request.args['last_name'] + '&email=' + request.args['email']

        return render_template('search-for-user.html', results=users, follows=follows, pages=paged.iter_pages(), search_query=search, selected_page=page)
        
    return render_template('search-for-user.html')

@login_required
@App.route('/api/get-common-times', methods=["POST"])
def get_common_times():
    print(request)
    public_id = request.form["user_public_id"]
    week =  request.form["week"]
    day = request.form.get("day")
    # if day = -1 return entire week

    followed = User.query.filter_by(public_id=public_id).first()

    if followed is None:
        return jsonify({"status": "User not found"})

    followed_schedule = followed.get_schedule(week)
    my_schedule = current_user.get_schedule(week)


    

    times = None 
    begins = None
    ends = None

    if day is not None:
        followed_courses = followed_schedule.classes.filter_by(weekday=day).all()
        my_courses = my_schedule.classes.filter_by(weekday=day).all()

        followed_breaks = extract_free_time(followed_courses)
        my_breaks = extract_free_time(my_courses)

        times = common_spans(my_breaks, followed_breaks)
        begins = extract_begins(followed_courses)
        ends = extract_ends(followed_courses)
    else:
        times = []
        begins = []
        ends = []

        for i in range(5):
            followed_courses = followed_schedule.classes.filter_by(weekday=i).all()
            my_courses = my_schedule.classes.filter_by(weekday=i).all()

            followed_breaks = extract_free_time(followed_courses)
            my_breaks = extract_free_time(my_courses)

            times.append(common_spans(my_breaks, followed_breaks))
            begins.append(extract_begins(followed_courses))
            ends.append(extract_ends(followed_courses))
   
    result = {
        'times': times,
        'first_name': followed.first_name, 
        'last_name': followed.last_name,
        'begins': begins,
        'ends': ends
    } 

    return jsonify({"status": "success", "result": result})
    
@App.route('/api/follow-user', methods=["POST"])
def follow_user():
    user_public_id = request.form["user_public_id"]
    priority_level = int(request.form["priority_level"])
    
    user = User.query.filter_by(public_id=user_public_id).first()
    if user is None:
        return jsonify({'status': 'No such user'})

    if priority_level <= 0:
        current_user.unfollow(user)
        db.session.commit()
        return jsonify({'status': 'success'})
        
    
    if priority_level > 4:
        priority_level = 4

    current_user.follow(user, priority_level)
    db.session.commit()

    print(f'User: {user}')

    print(f'User: {user_public_id}, prioritylevel: {priority_level}')
    return jsonify({'status': 'success'})