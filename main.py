from app import App
from config import Config
from customUtilities.time import format_minutes


if __name__ == '__main__':
    App.jinja_env.auto_reload = True
    App.jinja_env.globals.update(format_minutes=format_minutes)
    App.config["TEMPLATES_AUTO_RELOAD"] = True

    App.run(Config.RUN_IP, Config.RUN_PORT, debug=True, ssl_context="adhoc")
