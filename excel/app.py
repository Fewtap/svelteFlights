from flask import *
import json
import makeroomsfile

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
    makeroomsfile.updatefiles()
    return "Rooms updated"


if __name__ == "__main__":
    app.run(host="8025", debug=True)
