import subprocess
import json

import tornado.escape
import tornado.ioloop
import tornado.web
import requests

import MySQLdb as mysql



DB_HOST = 'external-db.s4086.gridserver.com'
DB_NAME = 'db4086_modd'
DB_USER = 'db4086_modd_usr'
DB_PASS = 'f4zeHUga.age'

HTTP_PORT = 8080
VERIFY_TOKEN = 'e967b132621cc66da735eeaa6b34bddf'
TOPIC_OVERRIDE = "Overwatch"

#=- -=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=- -=#

def db_recall(req_id):

  _obj = {
    'id': 0,
    'channel': "N/A",
    'game_name': "N/A",
    'twitch_name': "N/A",
    'oauth_token': "N/A"
  }
  
  response = requests.post("http://beta.modd.live/api/oauth_req_help.php", data={ 'req_id' : req_id }, timeout=2.00)
  print ("response={response}".format(response=response))
  print ("response.status_code={status_code}".format(status_code=response.status_code))
  # print ("response.status_code={reason}".format(status_code=response.reason))
  print ("response.headers={headers}".format(headers=response.headers))
  print ("response.encoding={encoding}".format(encoding=response.encoding))
  print ("response.text={text}".format(text=response.text))
  print ("response.json()={json}".format(json=response.json()))


  
  _obj = response.json()
  
  # 
  # 
  # 
  # try:
  #   conn = mysql.connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
  #   with conn:
  #     cur = conn.cursor(mysql.cursors.DictCursor)
  #     cur.execute("SELECT `channel`, `game_name`, `twitch_name`, `oauth_token` FROM `help_requests` WHERE `id` = %d AND `enabled` = 1 LIMIT 1;" % (req_id))
  #     
  #     
  #     print "SELECT `channel`, `game_name`, `twitch_name`, `oauth_token` FROM `help_requests` WHERE `id` = %d AND `enabled` = 1 LIMIT 1;" % (req_id)
  # 
  #     if cur.rowcount == 1:
  #       row = cur.fetchone()
  #       _obj = {
  #         'id': req_id,
  #         'channel': row['channel'],
  #         'game_name': row['game_name'],
  #         'twitch_name': row['twitch_name'],
  #         'oauth_token': row['oauth_token']
  #       }
  #       
  #       try:
  #         cur.execute("UPDATE `help_requests` SET `enabled` = 0 WHERE `id` = %d LIMIT 1;" % (req_id))
  #         conn.commit()
  #         
  #       except mysql.Error, e:
  #         print "Error %d: %s" % (e.args[0], e.args[1])
  #         
  #       finally:
  #         pass
  #   
  #   conn.close()
  # 
  # except mysql.Error, e:
  #   print "Error %d: %s" % (e.args[0], e.args[1])
  # 
  # finally:
  #   pass
      
  return _obj



class HelpRequest(tornado.web.RequestHandler):
  
  #-- cors
  def set_default_headers(self):
    self.set_header('Access-Control-Allow-Origin', "*")
    self.set_header('Access-Control-Allow-Headers', "x-requested-with")
    self.set_header('Access-Control-Allow-Methods', "POST, GET, OPTIONS")
  
  #-- get request
  def get(self):
    print "GET --> %s" % (self.request)
    self.set_status(404)
    return
  
  #-- post request  
  def post(self):
    print "X-MODD-Signature: ({sig})\n{body}".format(sig=self.request.headers.get('X-MODD-Signature'), body=self.request.body)
    
    #-- make sure has token from api
    if self.request.headers.get('X-MODD-Signature') == VERIFY_TOKEN:
      
      #-- parse as json
      json_data = tornado.escape.json_decode(self.request.body)
      if json_data:
        
        #-- from db
        req_obj = db_recall(json_data['id'])
        print "{obj}".format(obj=req_obj)
        
        if 'result' in req_obj and req_obj['result'] == "OK":
          #-- call bot script
          subprocess.call("python irc_bot.py \"{twitch_name}\" \"{oauth_token}\" \"{channel}\" \"{game_name}\"".format(twitch_name=req_obj['twitch_name'], oauth_token=req_obj['oauth_token'], channel=req_obj['channel'], game_name=req_obj['game_name']), shell=True)
        
          #-- echo json
          self.write(json.dumps({
            'result': 1,
            'channel': req_obj['channel'],
            'twitch_name': req_obj['twitch_name']
          }))
          self.set_status(200)
          return
          
        else:
          self.set_status(403)
          return
            
            
    #-- error
    self.set_status(403)
    return

#=- -=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=- -=#


#-- endpoints
application = tornado.web.Application([
  (r"/help-request", HelpRequest)
])


#-- start www server
if __name__ == "__main__":
  application.listen(HTTP_PORT)
  tornado.ioloop.IOLoop.instance().start()