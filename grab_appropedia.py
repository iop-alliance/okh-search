#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Mar 26 12:29:45 2020

@author: andre
"""

import pandas as pd



manifestsLoc = "/home/andre/repositories/okh/okh-search/projects_okhs.csv"

date = "2020-03-26"

manifests = pd.read_csv(manifestsLoc)


appropediaLink = "https://openknowhow.appropedia.org/manifests/"

# adapted from https://towardsdatascience.com/how-to-web-scrape-with-python-in-4-minutes-bc49186a8460
# Import libraries
import requests
#import urllib.request
#import time
from bs4 import BeautifulSoup

# Set the URL you want to webscrape from
url = "https://openknowhow.appropedia.org/manifests/"

# Connect to the URL
response = requests.get(url)

# Parse HTML and save to BeautifulSoup object¶
soup = BeautifulSoup(response.text, "html.parser")


# To download the whole data set, let's do a for loop through all a tags
line_count = 1 #variable to track what line you are on
for one_a_tag in soup.findAll('a'):  #'a' tags are for links
    if line_count >= 6: #code for text files starts at line 36
        link = one_a_tag['href']
        name = link[4:link.find(".yml")]
        name = name.replace("%20", " ")
        link = url + link
        date_added = date
        temp = pd.DataFrame([[name,date_added,link]],columns=[
                                                     manifests.columns[0],
                                                     manifests.columns[1],
                                                     manifests.columns[2]])
        manifests = manifests.append(temp,ignore_index=True)
        #download_url = 'http://web.mta.info/developers/'+ link
        #urllib.request.urlretrieve(download_url,'./'+link[link.find('/turnstile_')+1:]) 
        #time.sleep(1) #pause the code for a sec
    #add 1 for next line
    line_count +=1

manifests.to_csv(manifestsLoc)