# -*- coding:utf-8 -*-
'''
'''
import MySQLdb
import os

db_conf = { 
	"user":"root",
	"password":"jingroup#420",
	"db_name":"textdata",
	}

data_conf = {
	"data_path":"/home/kelvin/work/project/textMarkTool_V2/dataController/static/data/",
	}

db = MySQLdb.connect("localhost",db_conf["user"],db_conf["password"],db_conf["db_name"], charset='utf8')
cursor = db.cursor()

################ insert data into table
ins_cmd = """
	INSERT INTO dataController_messagedatas(
	PhotoPath, Email, Message, Language, Scene, RectCount, Quality, Status, IsChecked) 
	VALUES ( '%s', '', '', '', '', 0, '', '%s', false);
	"""

data_list = os.listdir(data_conf["data_path"])
data_list.sort()
for new_data in data_list:
	try:
		cmd = ins_cmd % ( new_data, "00")
		cursor.execute(cmd)
		db.commit()
	except:
		db.rollback()
		print 'rollback'	

############### close database
db.close()

