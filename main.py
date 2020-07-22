from app import App
from customUtilities.time import format_minutes

if __name__ == '__main__':
    App.jinja_env.auto_reload = True
    App.jinja_env.globals.update(format_minutes=format_minutes)
    App.config["TEMPLATES_AUTO_RELOAD"] = True

    App.run('127.0.0.1', 443, debug=True, ssl_context="adhoc")