from flask_wtf import FlaskForm
from wtforms import StringField

class FollowUserForm(FlaskForm):
    public_id = StringField("Public-id")
    priority_level = ("FIRST NAME")
    last_name = StringField("LASTNAME")