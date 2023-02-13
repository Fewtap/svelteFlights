from flask import *
import json
import makeroomsfile
import datetime

app = Flask(__name__)


# allow cross origin requests
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response


@app.route("/api/rooms", methods=["GET"])
def rooms():
    # convert the parameters to a date object from yyyy-mm-dd
    date = datetime.datetime.strptime(request.args.get("date"), "%Y-%m-%d").date()
    makeroomsfile.updatefiles(date)

    return "Rooms file updated"


if __name__ == "__main__":
    app.run(host="8025", debug=True)
