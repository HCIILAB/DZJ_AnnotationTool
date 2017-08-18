from dataController.models import CompleteDatas, LoginDatas, MessageDatas
from django.db import transaction
import datetime

BUSY_FLAG = "-2"  # the flag that indicate the server busy before
FINISHED_FLAG = "-1"  # the flag that indicate data have been all labeled


# get the next photoPath


def getNextPhoto(email):
    # get the unassigned datas
    path = '-1'
    try:
        with transaction.atomic():
            record = MessageDatas.objects.select_for_update().filter(Status='00').first()
            if record:
                # get the first record, change the status and return the path
                # record = records[0]
                record.Status = '01'
                path = record.PhotoPath
                record.save()
            else:
                # all the data's status is '01' or '11'
                # return the finished signal
                path = '-1'
    except Exception as e:
        raise e
    return path


# update the database
# release the data that have been locked for 40 mins


def updateMessageData():
    # all the data's status is '01' or '11'
    time_offset_min = 40
    records = MessageDatas.objects.filter(Status='01')
    if records.count() == 0:
        # all the data's status are '11', data marking job has finished
        return '-1'
    # check each data, release the data that has been locked for
    # time_offset_min mins
    for record in records:
        if (datetime.datetime.now() -
                record.SubmitData) / 60 < time_offset_min:
            continue
        else:
            return record.PhotoPath
    # some data has been locked, not committed and the time_offset is smaller
    # than time_offset_min
    return '-2'

# get the complete situation of user


def getComplete(email):
    # result save the complete situation of the user
    # result[0] is Count, result[1] is RectCount
    result = [0, 0, -2, 0]
    record = CompleteDatas.objects.get(Email=email)
    if not record:
        return result
    result[0] = record.Count
    result[1] = record.RectCount
    result[2] = record.CurrentImg
    result[3] = record.CheckedCount
    return result


def getMessage(photoPath):
    # return the message data of photoPath
    message = ''
    record = MessageDatas.objects.get(PhotoPath=photoPath)
    if not record:
        return message
    message = record.Message
    return message


def getRectNumFromMessage(message):
    # count the number of rects in the message
    rectNum = 0
    labelStr = message.split("!")[0]
    labelList = labelStr.split(";")
    for col in labelList:
        rectNum += len(col.split(",")) / 4
    return rectNum


def distributePhoto(email):
    # distributePhoto to email and update the completedata
    # return the imagePath
    imagePath = BUSY_FLAG
    try:
        # if get new data, update the completedata
        imagePath = getNextPhoto(email)
        usrComplt = CompleteDatas.objects.get(Email=email)
        usrComplt.CurrentImg = imagePath
        usrComplt.save()
    except Exception as e:
        print e
        imagePath = BUSY_FLAG
    return imagePath


def getBookInfo(imagePath):
    # get the book info from the imagePath
    bookName = ''
    volume = ''
    page = ''
    record = MessageDatas.objects.get(PhotoPath=imagePath)
    if not record:
        return bookName, volume, page
    bookName = record.BookName
    volume = record.Volume
    page = record.Page
    return bookName, volume, page
