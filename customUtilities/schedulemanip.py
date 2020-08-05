import math

from ScheduleImageProcessor import course

from customUtilities.math import common_spans
from customUtilities.time import hour_minute_to_minutes
from customUtilities.bitmanip import countBits



TRACK_BEGINS = int(hour_minute_to_minutes([8, 00]))
TRACK_ENDS = int(hour_minute_to_minutes([17, 30]))
TRACK_MINUTE_RESOLUTION = int(5)
TOTAL_BITS = (TRACK_ENDS - TRACK_BEGINS) // TRACK_MINUTE_RESOLUTION

def getFreeTime(binary, includeFirst=False, includeLast=False):
    checkbit = 1
    
    if not includeFirst:
        shifted = 0
        checkbit = 1 << shifted
        while not(checkbit & binary) and shifted <= TOTAL_BITS:
            binary |= checkbit
            shifted += 1
            checkbit = checkbit << shifted
    
    upto = 1 << TOTAL_BITS

    onFree = False
    began = 0
    end = -1

    free_time = []

    while checkbit <= upto:

        if (not (checkbit & binary)) and not onFree:
            onFree = True
            began = checkbit
        elif (checkbit & binary) and onFree:
            onFree = False
            end = checkbit

            beganPos = int(math.log2(began & -began))
            endPos = int(math.log2(end & -end))

            free_time.append([beganPos * TRACK_MINUTE_RESOLUTION + TRACK_BEGINS, endPos * TRACK_MINUTE_RESOLUTION + TRACK_BEGINS])

            print("Free time from: {} to {}".format(beganPos, endPos))
        
        checkbit = checkbit << 1

    if includeLast and began > end:
        print("appending last")
        end = 1 << (TOTAL_BITS)
        beganPos = int(math.log2(began & -began))
        endPos = int(math.log2(end & -end))
        free_time.append([beganPos * TRACK_MINUTE_RESOLUTION + TRACK_BEGINS, endPos * TRACK_MINUTE_RESOLUTION + TRACK_BEGINS])

    return free_time

# This method expects a sorted courses list
# TODO make the course skipping better
def getBinaryRepresentation(courses):
    start_at = 0
    
    '''
    for i in range(len(courses) - 1):
        if hour_minute_to_minutes(courses[i].begins) >= TRACK_BEGINS:
            start_at = i
            break
    '''

    print(start_at)
    binary = 0
    for i in range(start_at, len(courses)):
        binary_begin_pos = (courses[i].begins - TRACK_BEGINS) // TRACK_MINUTE_RESOLUTION
        binary_end_pos = (courses[i].ends - TRACK_BEGINS) // TRACK_MINUTE_RESOLUTION
        
        if binary_begin_pos < 0:
            binary = 0
        
        if binary_end_pos > TOTAL_BITS:
            binary_end_pos = 1 << (TOTAL_BITS - 1)

        if binary_begin_pos > TRACK_ENDS:
            break

        for i in range(binary_begin_pos, binary_end_pos):
            binary |= (1 << i)

    return binary


def extract_breaks(classes):
    breaks = []
    for i in range(len(classes) - 1):
        breaks.append( [classes[i].ends, classes[i+1].begins] )

    return breaks

def extract_free_time(classes):
    free = extract_breaks(classes)
    if(len(classes) == 0):
        return [[0, hour_minute_to_minutes([24,0])]]
    
    free.insert(0, [0, classes[0].begins])
    free.append([classes[-1].ends, hour_minute_to_minutes([24,0])])
    return free 

def extract_begins(classes):
    if len(classes) < 1:
        return -1  
    
    return classes[0].begins
    

def extract_ends(classes):
    if len(classes) < 1:
        return -1
    
    return classes[-1].ends

        




