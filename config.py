import os
import requests
import json

basedir = os.path.abspath(os.path.dirname(__file__))

with open('secrets.json') as secrets_file:
	secrets = json.load(secrets_file)


class Config(object):
    print(secrets.get('GOOGLE_CLIENT_ID'))
    print(secrets.get('GOOGLE_CLIENT_SECRET'))
    SECRET_KEY = secrets.get('SECRET_KEY') #"temporary-key"

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    GOOGLE_CLIENT_ID = secrets.get('GOOGLE_CLIENT_ID') #'722253020409-i32read70dcf0qtnf5m9dp9to0qfdf48.apps.googleusercontent.com'#os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = secrets.get('GOOGLE_CLIENT_SECRET') #'Eb8o5kePE5txISUG0LZeOrNP'#os.environ.get('GOOGLE_CLIENT_SECRET')
    GOOGLE_DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration'



def get_google_provider_config():
    return requests.get(Config.GOOGLE_DISCOVERY_URL).json()
