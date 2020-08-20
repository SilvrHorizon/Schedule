import os
import requests
import json

basedir = os.path.abspath(os.path.dirname(__file__))

with open('secrets.json') as secrets_file:
	secrets = json.load(secrets_file)

with open('os_specific_config.json') as os_file:
    os_specific = json.load(os_file)


class Config(object):
    SECRET_KEY = secrets.get('SECRET_KEY')

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    GOOGLE_CLIENT_ID = secrets.get('GOOGLE_CLIENT_ID') 
    GOOGLE_CLIENT_SECRET = secrets.get('GOOGLE_CLIENT_SECRET')
    GOOGLE_DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration'

    TESSERACT_PATH = os_specific.get('TESSERACT_PATH')

    RUN_IP = os_specific.get('RUN_IP')
    RUN_PORT = os_specific.get('RUN_PORT')



def get_google_provider_config():
    return requests.get(Config.GOOGLE_DISCOVERY_URL).json()
