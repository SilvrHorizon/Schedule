from ScheduleImageProcessor import findCourses, enhanceLines
import cv2

#enhanceLines(cv2.imread('image1.jpeg', 0))

#cv2.imshow("Facit", cv2.imread('image1.jpeg'))
print(findCourses(cv2.imread('IMG_0900.png', 0), debug=True))
cv2.waitKey()