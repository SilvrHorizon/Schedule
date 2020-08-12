from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect

import json
import os

from customUtilities.strings import capitalize_words

App = Flask(__name__)
App.config.from_object(Config)
db = SQLAlchemy(App)
migrate = Migrate(App, db)
login = LoginManager(App)
csrf = CSRFProtect(App)

App.jinja_env.globals.update(capitalize_words=capitalize_words)

from app import routes, models
