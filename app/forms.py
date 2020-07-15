from flask_wtf import FlaskForm
from wtforms import StringField

class UserSearchForm(FlaskForm):
    email = StringField("EMAIL")
    first_name = StringField("FIRST NAME")
    last_name = StringField("LASTNAME")