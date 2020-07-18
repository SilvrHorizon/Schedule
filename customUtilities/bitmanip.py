import math

def countBits(number):  
    return int((math.log(number) / 
                math.log(2)) + 1)