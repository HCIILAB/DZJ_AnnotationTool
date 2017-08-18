#-*-coding:utf8-*-

import cv2
#import numpy as np 
import Image, ImageDraw

datapath = '/home/kelvin/work/project/DaZangJingMarkTool/dataController/static/data/closed_beta/'
filepath = ''
with open('./out20170817.txt', 'r') as f:
    records = f.readlines()

recordNum = 3

filepath = records[recordNum].split('\t')[1]

im = Image.open(datapath + filepath)
draw = ImageDraw.Draw(im)

pointStr = records[recordNum].split('\t')[3].split("!")[0]
pointsAry = pointStr.split(";")
for pointCol in pointsAry:
    points = pointCol.split(',')
    points = map(lambda s:float(s), points)
    i = 0
    while(i<len(points)/4):
        draw.rectangle([(points[0+i*4],points[1+i*4]),(points[0+i*4]+points[2+i*4],points[1+i*4]+points[3+i*4])])
        i+=1

del draw
im.show()
cv2.waitKey(0)

