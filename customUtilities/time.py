def hour_minute_to_minutes(hourMinute):
    return hourMinute[0] * 60 + hourMinute[1]

def minutes_to_hour_minute(minutes):
    return [int(minutes / 60), minutes % 60]

def format_hour_minute(hourMinute):
    try:
        if len(hourMinute) != 2:
            return "N/A"
        return "{:02d}:{:02d}".format(hourMinute[0], hourMinute[1])
    except:
        return "N/A"

def format_minutes(minutes):
    return format_hour_minute(minutes_to_hour_minute(minutes))