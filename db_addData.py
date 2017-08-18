# -*- coding:utf-8 -*-
'''
'''
import MySQLdb
import os
from bboxAndLabel import fromTxtToMessageForm as transform

db_conf = { 
	"user":"root",
	"password":"jingroup#420",
	"db_name":"dazangjingdata",
	}

data_conf = {
	"data_path":"/home/kelvin/work/project/DaZangJingMarkTool/dataController/static/data/",
	}

db = MySQLdb.connect("localhost",db_conf["user"],db_conf["password"],db_conf["db_name"], charset='utf8mb4')
cursor = db.cursor()

################ insert data into table
#ins_cmd = """
#	INSERT INTO dataController_messagedatas(
#	PhotoPath, Email, Message, Language, Scene, RectCount, Quality, Status, IsChecked) 
#	VALUES ( '%s', '', '', '', '', 0, '', '%s', false);
#	"""
ins_cmd = """
	INSERT INTO dataController_messagedatas(
	PhotoPath, Email, Message, RectCount, Status, IsChecked, BookName, Volume, Page) 
	VALUES ( '%s', '', '%s', 0, '00', false, '%s', '%s', '%s');
	"""

subDir = "/label_bbox_closed_beta"
bboxFile = data_conf["data_path"] + subDir + "/bbox.txt"
labelFile = data_conf["data_path"] + subDir + "/label.txt"
MessageDict = transform(bboxFile, labelFile)

for photoPath in MessageDict.iterkeys():
        try:
                cmd = ins_cmd % (photoPath, MessageDict[photoPath].split("!", 3)[3], MessageDict[photoPath].split("!", 3)[0], MessageDict[photoPath].split("!", 3)[1], MessageDict[photoPath].split("!", 3)[2])
                cursor.execute(cmd)
                db.commit()
        except Exception as e:
                print e
                print MessageDict[photoPath].split("!", 3)[3]
                db.rollback()
                print 'rollback'

#data_list = os.listdir(data_conf["data_path"])
#data_list.sort()
#for new_data in data_list:
#	try:
#		cmd = ins_cmd % ( new_data, "00")
#		cursor.execute(cmd)
#		db.commit()
#	except:
#		db.rollback()
#		print 'rollback'	

############### close database
db.close()

