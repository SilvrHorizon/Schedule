import numpy as np
import cv2
import pytesseract
from config import Config

from skimage.transform import rescale
from ScheduleImageProcessor.course import Course
from customUtilities.time import hour_minute_to_minutes 

# Initiate pytesseract
pytesseract.pytesseract.tesseract_cmd = Config.TESSERACT_PATH

def checkLine(line):
    for i in line:
        if i >= 240 or i <= 190:
            return False
    return True

def enhanceLines(grayImage):
    cropped = grayImage[150:-20]
    a = np.array([
        [2, 4, 1, 3],
        [3, 2, 1, 4],
        [2, 3, 2, 3],
        [2, 3, 4, 1]
    ])

    
    for p in range(cropped.shape[1]):
        if(checkLine(cropped[:, p])):
            cv2.line(grayImage, (p, 0), (p, grayImage.shape[0] - 1), 0, thickness=1)
    #cv2.imshow("Enhanced lines", cropped)
    
def findCourses(grayImage, debug=False):
    white = 230
    courses = ["MENTORSTID", "KEMKEM", "SAMSAM", "IDRIDR", "ENGENG", "MATMAT", "SVESVE", "JURPRI"]
    foundCourses = []

    courseBoxWidth = None
    estimatedWeekdayPositions = None

    enhanceLines(grayImage)


    for y in range(grayImage.shape[0]):
        for x in range(grayImage.shape[1]):
            
            # if not occupied[y][x]: 
            if grayImage[y][x] >= white:
                scanX = x
                scanY = y
                
                
                
                while grayImage[scanY][scanX] >= white: 
                    if scanX + 1 >= grayImage.shape[1]:
                        break
                    scanX += 1 
                
                scanX -= 1

                while grayImage[scanY][scanX] >= white: 
                    if scanY + 1 >= grayImage.shape[0]:
                        break
                    scanY += 1
                scanY -= 1

        
        
                # Exlude small false positives but still black them out for performance reasons
                if scanX - x <= 40 or scanY - y <= 20:
                    cv2.rectangle(grayImage, (x, y), (scanX, scanY), 0, -1)
                    continue

                cropped = grayImage[y:scanY, x:scanX]
                
                '''
                if cropped.shape[1] > 200:
                    print('Resizing')
                    cropped = rescale(cropped, 200 / cropped.shape[1], anti_aliasing=False)
                '''

                # cropped = cv2.threshold(cropped, 210, 255, cv2.THRESH_BINARY)[1]
                # This is the one that was working
                #cropped = cv2.adaptiveThreshold(cropped, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 9)
                 
                # cropped = skimage.transform.rescale
                cv2.GaussianBlur(cropped, (0,0), cv2.BORDER_DEFAULT)

                if debug:
                    cv2.imshow('cropped', cropped)
                    cv2.imshow("image", grayImage) 
                    cv2.waitKey()

                config = "--psm 6, -l swe"  
                text = pytesseract.image_to_string(cropped, config=config)

                # The blocks that have fewer than 5 chars are not interessting
                if len(text) < 8:
                    cv2.rectangle(grayImage, (x, y), (scanX, scanY), 0, -1)
                    continue

                # Divide the string to be able to get access to the information sepately
                parsed = text.split('\n')
                parsed = list(filter(None, parsed))  # Remove empty strings caused by tesseract
                
                if len(parsed) < 2:
                    cv2.rectangle(grayImage, (x, y), (scanX, scanY), 0, -1)  
                    continue

                courseText = parsed[0]
                timeSpan = parsed[1]
                
                if courseBoxWidth is None:
                    print("Decieded:", courseText)
                    courseBoxWidth = scanX - x
                    estimatedWeekdayPositions = []

                    for i in range(5):

                        estimatedWeekdayPositions.append(grayImage.shape[1] - courseBoxWidth * (5 - i))
                    print("Scanx and y: ", scanX, " ", scanY, " x:", x, " y: ", y)
                    print("estimatedWeekdayPositions:", estimatedWeekdayPositions)
                matchedCourse = courseText

                try:
                    beginTime, endTime = timeSpan.split('-')
                    #print(f'Begin: {beginTime}, end: {endTime}')
                    beginTime = list(map(int, beginTime.split(':', 2)))
                    #print("begin splitted")
                    endTime = list(map(int, endTime.split(':', 2)))
                    
                    if len(beginTime) != 2 or len(endTime) != 2:
                        raise ValueError('Times could not be split')
                    
                    #print("End splitted")
                    #print("Found:", Course(matchedCourse, beginTime, endTime, foundWeekday))
                except:
                    print("Timespan", timeSpan)
                    print('OCR was confused')
                    cv2.rectangle(grayImage, (x, y), (scanX, scanY), 0, -1)  
                    continue

                foundWeekday = -1
                tolerance = courseBoxWidth * 0.4
                print("Course: ", courseText, " pos: ", x)
                for i in range(len(estimatedWeekdayPositions)):
                    if estimatedWeekdayPositions[i] - tolerance < x and x < estimatedWeekdayPositions[i] + tolerance:
                        foundWeekday = i
                
                foundCourses.append(Course(matchedCourse, hour_minute_to_minutes(beginTime), hour_minute_to_minutes(endTime), foundWeekday))
                # Make sure that this region will not be selected again
                cv2.rectangle(grayImage, (x, y), (scanX, scanY), 0, -1)  
                if debug:
                    cv2.destroyAllWindows()     
    return foundCourses
