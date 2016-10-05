import sys # Used to add the BeautifulSoup folder the import path
import urllib2 # Used to read the html document
from bs4 import BeautifulSoup
import requests

query = 'led'
domain_to_filter = 'www.google.com'
start_page = 1
pages = 2
### Create opener with Google-friendly user agent
opener = urllib2.build_opener()
opener.addheaders = [('User-agent', 'Mozilla/5.0')]

### Open page & generate soup
### the "start" variable will be used to iterate through 10 pages.
#for start in range(start_page, (start_page + pages)):
    
def returnPaper(url):
    rpage = requests.get(url)
    #page = opener.open(url)
    soup = BeautifulSoup(rpage.text)
    title = soup.findAll('title') 
    messinfo = soup.findAll('script')     
    for i in range(len(messinfo)):
        if 'authors' in messinfo[i].text:
            for j in range(len(messinfo[i].text)):
                index1 = messinfo[i].text.find('\"authors":')
                index2 = messinfo[i].text.find(',\"isbn\"')
            authors = messinfo[i].text[index1+7:index2-2] # make an offset to display the abstract correctly
    
        if 'abstract' in messinfo[i].text:
            for j in range(len(messinfo[i].text)):
                index1 = messinfo[i].text.find('\"abstract\":')
                index2 = messinfo[i].text.find(',\"publicationTitle\"')
            abstract = messinfo[i].text[index1+12:index2-2] # make an offset to display the abstract correctly
        if 'publicationTitle' in messinfo[i].text:
            for j in range(len(messinfo[i].text)):
                index1 = messinfo[i].text.find('\"publicationTitle":')
                index2 = messinfo[i].text.find(',\"endPage"')
            publisher = messinfo[i].text[index1+19:index2-1]
            
        if 'chronOrPublicationDate' in messinfo[i].text:
            for j in range(len(messinfo[i].text)):
                index1 = messinfo[i].text.find('\"chronOrPublicationDate":')
                index2 = messinfo[i].text.find(',\"copyrightYear"')
            date = messinfo[i].text[index1+22:index2-2]
                            
    
    return  {"authors":authors,
             "abstract": abstract,
             "publisher": publisher,
             "date": date,
             "title": title[0].text,} 

url1 = "http://ieeexplore.ieee.org/document/6813779/"
url2 = "http://ieeexplore.ieee.org/document/6962856/"
url3 = "http://ieeexplore.ieee.org/document/6962856/"
             
print returnPaper(url2)

            
            
    