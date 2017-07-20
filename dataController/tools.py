from dataController.models import CompleteDatas, LoginDatas, MessageDatas
import datetime

# get the next photoPath


def getNextPhoto(email):
    # get the unassigned datas
    records = MessageDatas.objects.filter(Status='00')
    if records.count():
        # get the first record, change the status and return the path
        record = records[0]
        record.Status = '01'
        record.save()
        return record.PhotoPath
    else:
        # all the data's status is '01' or '11'
        # return the finished signal
        path = '-1'
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
