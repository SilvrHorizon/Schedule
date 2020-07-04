from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

import json
import os


App = Flask(__name__)
App.config.from_object(Config)
db = SQLAlchemy(App)
#migrate = Migrate(app, db)
#login = LoginManager(App)

from app import routes, models
