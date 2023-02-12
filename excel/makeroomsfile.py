import json
import os
from time import sleep
import openpyxl
from openpyxl import Workbook
import datetime
from pocketbase import PocketBase
from pocketbase.client import FileUpload
import requests
from pocketbase.models import Record


# make a global variable for the old rooms


def updatefiles():
    client = PocketBase("http://176.58.101.163:8080")
    fileexists: bool = False
    currentdaystring = datetime.datetime.now().strftime("%Y-%m-%d")
    # get tomorrows date
    tomorrow = datetime.date.today() + datetime.timedelta(days=1)
    # convert the date to a iso string

    tomorrowstring = tomorrow.isoformat()

    result: list[Record] = client.records.get_full_list(
        "sheet", query_params={"filter": f'date ~ "{tomorrowstring}"'}
    )

    if len(result) > 0:
        fileexists = True
        print("File already exists")

    rutecolumn = 1
    buscolumn = 2
    roomcolumn = 3
    amountcolumn = 5

    # get absolute path to the file
    path = os.path.abspath("transfer.xlsx")
    print(path)

    wb = openpyxl.open(path, read_only=False)

    def getflights(collection: str, date: datetime.date):
        # convert the date to a YYYY-MM-DD string
        datestring = date.strftime("%Y-%m-%d")
        url = f'http://176.58.101.163:8080/api/collections/{collection}/records?filter=(planned~"{datestring}")'
        response = requests.get(url)
        data = response.json()
        return data

    def getrooms(hash: str):
        url = f'http://176.58.101.163:8080/api/collections/rooms/records?filter=(flighthash~"{hash}")'
        response = requests.get(url)
        data = response.json()
        return data["items"]

    departureswithrooms = []
    for flight in getflights(
        "departures", datetime.date.today() + datetime.timedelta(days=1)
    )["items"]:
        hasrooms = flight["hasrooms"]

        if hasrooms == True:
            print("Adding flight: " + flight["rute"] + " to list")
            departureswithrooms.append(flight)

    arrivalswithrooms = []
    for flight in getflights(
        "arrivals", datetime.date.today() + datetime.timedelta(days=1)
    )["items"]:
        hasrooms = flight["hasrooms"]

        if hasrooms == True:
            print("Adding flight: " + flight["rute"] + " to list")
            arrivalswithrooms.append(flight)

    # sort the lists by the planned key
    departureswithrooms = sorted(departureswithrooms, key=lambda x: x["planned"])
    arrivalswithrooms = sorted(arrivalswithrooms, key=lambda x: x["planned"])

    # create the excel file
    sheet = wb.active

    # add the headers
    sheet.cell(row=1, column=rutecolumn).value = "Rute"
    sheet.cell(row=1, column=buscolumn).value = "Bus"
    sheet.cell(row=1, column=roomcolumn).value = "Room"

    row = 5
    for i in range(len(departureswithrooms)):
        totalpeople = 0
        rooms = getrooms(departureswithrooms[i]["flighthash"])
        for room in rooms:
            totalpeople += room["amount"]
        departuretimestring = departureswithrooms[i]["planned"]
        departuretime = datetime.datetime.fromisoformat(
            departuretimestring[:-1] + "+00:00"
        )
        busdeparturetime = departuretime - datetime.timedelta(minutes=90)
        busdeparturetimestring = busdeparturetime.strftime("%H:%M")
        flight = departureswithrooms[i]
        sheet.cell(row=row, column=rutecolumn).value = flight["rute"]
        sheet.cell(row=row, column=buscolumn).value = busdeparturetimestring
        roomstring = ""
        for room in rooms:
            roomstring += room["roomnumber"] + ";"
        sheet.cell(row=row, column=roomcolumn).value = roomstring
        sheet.cell(row=row, column=amountcolumn).value = totalpeople

        row += 1

    row = 21
    for i in range(len(arrivalswithrooms)):
        totalpeople = 0
        rooms = getrooms(departureswithrooms[i]["flighthash"])
        for room in rooms:
            totalpeople += room["amount"]
        departuretimestring = departureswithrooms[i]["planned"]
        departuretime = datetime.datetime.fromisoformat(
            departuretimestring[:-1] + "+00:00"
        )
        # convert the time to local time

        timestring = departuretime.strftime("%H:%M")
        flight = departureswithrooms[i]
        sheet.cell(row=row, column=rutecolumn).value = flight["rute"]
        sheet.cell(row=row, column=buscolumn).value = timestring
        roomstring = ""
        for room in rooms:
            roomstring += room["roomnumber"] + ";"
        sheet.cell(row=row, column=roomcolumn).value = roomstring
        sheet.cell(row=row, column=amountcolumn).value = totalpeople

        row += 1

    wb.save(r"transfer.xlsx")

    # store the file in in a variable
    if fileexists:
        client.records.update(
            "sheet",
            result[0].id,
            {
                "excelfile": FileUpload(
                    (
                        tomorrowstring,
                        open(path, "rb"),
                    )
                )
            },
        )
        print("File updated")
    else:
        client.records.create(
            "sheet",
            {
                "date": tomorrowstring,
                "excelfile": FileUpload(
                    (
                        tomorrowstring,
                        open(path, "rb"),
                    )
                ),
            },
        )

        print("File created")
