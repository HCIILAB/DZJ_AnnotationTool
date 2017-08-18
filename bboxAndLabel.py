# -*- coding:utf8 -*-

def fromTxtToMessageForm(bboxFile, labelFile):
    # read the files
    bboxList = []
    LabelList = []
    with open(bboxFile, 'r') as f:
        bboxList = f.readlines()
    with open(labelFile, 'r') as f:
        LabelList = f.readlines()

    # convert List to Dict
    bboxFilePathSet = set([ bbox.split(' ', 1)[0] for bbox in bboxList ])
    labelFilePathSet = set([ label.split(' ', 1)[0] for label in LabelList ])

    # check set
    # checkSet = bboxFilePathSet - labelFilePathSet
    # print "checkSet length:", len(checkSet), checkSet
    bboxLen = len(bboxFilePathSet)
    labelLen = len(labelFilePathSet)
    if bboxLen != labelLen:
        # the number in each file doesn't match, some info of pics lost
        print "bboxLen, labelLen:", bboxLen, labelLen
        raise Exception("mappingNum error")

    retDict = {}

    tmpFilePath = ''
    cnt = 0
    bboxPt = 0
    labelPt = 0

    while(cnt < bboxLen):
        tmpFilePath = bboxList[bboxPt].split(' ', 1)[0] # the pic name
        retDict[tmpFilePath] = '' # initialization
        while(bboxPt < len(bboxList) and tmpFilePath == bboxList[bboxPt].split(' ', 1)[0]):
            # push the data in certain way, columns are splited by ";"
            if(len(retDict[tmpFilePath]) == 0):
                retDict[tmpFilePath] += "!".join(bboxList[bboxPt].split(' ', 4)[1:4]) + '!'
            retDict[tmpFilePath] += bboxList[bboxPt].split(' ', 4)[4].strip() + ';'
            bboxPt += 1
        if(tmpFilePath != LabelList[labelPt].split(' ', 1)[0]):
            raise Exception("mapping filepath error")
        retDict[tmpFilePath] = retDict[tmpFilePath][:-1]
        retDict[tmpFilePath] += '!'
        while(labelPt < len(LabelList) and tmpFilePath == LabelList[labelPt].split(' ', 1)[0]):
            retDict[tmpFilePath] += LabelList[labelPt].split(' ', 2)[2].strip().replace(' ', '').replace('\t', '') + ';'
            labelPt += 1
        retDict[tmpFilePath] = retDict[tmpFilePath][:-1]
        cnt += 1
    return retDict
        

if __name__ == '__main__':
    MessageDict = {}
    bboxFile = "./bbox.txt"
    labelFile = "./label.txt"
    try:
        MessageDict = fromTxtToMessageForm(bboxFile, labelFile)
    except Exception as e:
        print e
    else:
        for item in MessageDict.values():
            print item
