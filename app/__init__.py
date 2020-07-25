from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect

import json
import os


App = Flask(__name__)
App.config.from_object(Config)
db = SQLAlchemy(App)
migrate = Migrate(App, db)
login = LoginManager(App)
csrf = CSRFProtect(App)

from app import routes, models
