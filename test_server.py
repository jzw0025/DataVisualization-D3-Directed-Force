# We need to import the jsonify object, it will let us
# output json, and it will take care of the right string
# data conversion, the headers for the response, etc
from flask import Flask, jsonify
import json
from Queue import *
from pandas.io.json import json_normalize

###########  google bookmarks ############
with open ("/Users/junchaowei/Library/Application Support/Google/Chrome/Default/Bookmarks") as f:
    BookmarkTree = json.load(f)

dict_queue = Queue()
root=json_normalize(BookmarkTree['roots']['bookmark_bar'],['children'])
s = root.to_dict()

out = []
link = []
### make a root research node which connects all sub nodes.
temp = {}
temp['label'] = "Junchao Research"
temp['site'] = "https://scholar.google.com/citations?user=7sJEXqMAAAAJ&hl=en"
temp['id'] = "node"+str(0)
node={}
node['name'] = temp
out.append(node)
### create sub nodes 
if 'children' in s.keys(): # root of dictionary
     for j in s['name']: # loop all the names of folder            
        temp = {}
        label = s['name'].get(j) # this gets the name
        temp['label'] = label
        #temp['label'] = "test"
        temp['site'] = j
        temp['id'] = "node"+str(len(out))
        #temp['site'] = "test"
        node={}
        node['name'] = temp
        out.append(node)
        ### connecting the sub-root to the root
        templink = {}
        templink['target'] = 0
        templink['source'] = len(out)
        link.append(templink)
        ###`
        subNodes = s['children'][j] #s['children'] is dictionary,s['children'][j] is a list
        targetNode = len(out)-1 # this locks the target node
        #print "the target node root:" + str(len(out))
        for k in subNodes:
            temp = {}
            temp['label'] = k['name'] # this gets the name
            temp['site'] =  k['url']  # the site for the name
            temp['id'] = "node"+str(len(out))
            #temp['label'] = "test"
            #temp['site'] =  "test"
            node={}
            node['name'] = temp
            out.append(node)
            #print "the source node root:" + str(len(out))
            templink = {}
            templink['target'] = targetNode
            templink['source'] = len(out)-1
            link.append(templink)

##############   Flask Server Host Json  ####################
# Initialize the Flask application
app = Flask(__name__)

from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper


def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator
    
# This route will return a list in JSON format
@app.route('/')
@crossdomain(origin='*')
def index():
    # This is a dummy list, 2 nested arrays containing some
    # params and values
    list = out,link
    # jsonify will do for us all the work, returning the
    # previous data structure in JSON
    return jsonify(results=list)

if __name__ == '__main__':
    app.run(
        host="0.0.0.0",
        port=int("2525")
    )
