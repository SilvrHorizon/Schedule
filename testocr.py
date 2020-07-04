from ScheduleImageProcessor import findCourses
import cv2

print(findCourses(cv2.imread('image0.jpeg', 0)))
cv2.imshow("Facit", cv2.imread('image0.jpeg'))
cv2.waitKey()