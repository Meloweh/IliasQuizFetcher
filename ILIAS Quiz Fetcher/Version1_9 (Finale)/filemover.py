from pathlib import Path
import os
import time

SESSON_NAME = None

path_to_download_folder = str(os.path.join(Path.home(), "Downloads"))

if not os.path.exists(path_to_download_folder):
    print('Make sure this is your download path: ' + path_to_download_folder)
    exit(0)

path_to_queue_folder = path_to_download_folder + '\queue\\'

path_to_target_folder = str(os.path.join(Path.home(), "OneDrive\TestFetcher\pagedata\\"))

if not os.path.exists(path_to_target_folder):
    print('Make sure this is your target path: ' + path_to_target_folder)
    exit(0)

def mpath(file):
    return path_to_queue_folder + file
    
while True:
    if os.path.exists(path_to_queue_folder):
        files = []
        (dirpath, dirnames, filenames) = next(os.walk(path_to_queue_folder))

        for file in filenames:
            if file.find('crdownload') != -1:
                filenames.remove(file)
            
        files.extend(filenames)
        if len(files) > 0:
            if SESSON_NAME == None:
                temp_str = files[0][:files[0].find('.')]
                for c in '0123456789() ':
                    temp_str = temp_str.replace(c, '')
                SESSON_NAME = temp_str# + '.html'
            
            for i1 in range(len(files)):
                for i in range(len(files)-1):
                    if os.path.getctime(mpath(files[i])) > os.path.getctime(mpath(files[i+1])):
                        temp = files[i]
                        files[i] = files[i+1]
                        files[i+1] = temp

            try:
                (p1, p2, p3) = next(os.walk(path_to_target_folder))
                
                if(p3.count('maxpagenumber.html') != 0):
                    p3.remove('maxpagenumber.html')

                if(p3.count('pagecount.html') != 0):
                    p3.remove('pagecount.html')

                newpagecounter = len(p3)

                #print(p3)

                for file in files:
                    
                    f = open(path_to_queue_folder + file)
                    fstr = f.read()
                    f.close()
                    os.remove(path_to_queue_folder + file)

                    flag = 'Frage '
                    flag_infix = ' von '
                    
                    questionindex_start = fstr.find(flag, 0, len(fstr)) + len(flag)
                    questionindex_end = fstr.find(flag_infix, 0, len(fstr))
                    question_number = ''

                    while fstr[questionindex_start:questionindex_start+1].isnumeric():
                        question_number += fstr[questionindex_start:questionindex_start+1]
                        questionindex_start += 1

                    max_question_str = ''
                    max_question_index = questionindex_end + len(flag_infix)
                    while fstr[max_question_index:max_question_index+1].isnumeric():
                        max_question_str += fstr[max_question_index:max_question_index+1]
                        max_question_index += 1

                    if not os.path.exists(path_to_target_folder + 'maxpagenumber.html'):
                        maxpagefile = open(path_to_target_folder + 'maxpagenumber.html', 'w')
                        maxpagefile.write(max_question_str)
                        maxpagefile.close()
                    
                    if not os.path.exists(path_to_target_folder + SESSON_NAME + question_number + '.html'):
                        session_file = open(path_to_target_folder + SESSON_NAME + question_number + '.html', 'w')
                        session_file.write(fstr)
                        session_file.close()
                        #print(str(question_number))
                        #print(str(newpagecounter))
                        newpagecounter += 1

                #////////////////////////////

                pagecount = open(path_to_target_folder + 'pagecount.html', 'w')
                pagecount.write(str(newpagecounter))
                pagecount.close()

                #////////////////////////////
            except IOError:
                continue
        time.sleep(0.5)

