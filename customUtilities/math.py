def common_spans(span_list_0, span_list_1):
    lists = [span_list_0, span_list_1]
    
    index_0 = 0
    index_1 = 0

    found = []
    if len(span_list_0) <= 0 or len(span_list_1) <= 0:
        return found
    
    while(True):

        lower_border = max(span_list_0[index_0][0], span_list_1[index_1][0])
        upper_border = min(span_list_0[index_0][1], span_list_1[index_1][1])

        if lower_border < upper_border:
            found.append([lower_border, upper_border])
        
        if span_list_0[index_0][1] > span_list_1[index_1][1]:
            index_1 += 1
            if index_1 >= len(span_list_1):
                return found
        else:
            index_0 += 1
            if index_0 >= len(span_list_0):
                return found

