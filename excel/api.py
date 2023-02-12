from flask import *
import json
import makeroomsfile

app = Flask(__name__)


@app.route("/api/rooms", methods=["GET"])
def rooms():
    makeroomsfile.updatefiles()
    return "Rooms updated"


app.run(host="8025", debug=True)
