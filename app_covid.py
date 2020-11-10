import os
import base64
from flask import Flask
from flask import render_template
from flask import Response
import unicodedata
import hashlib

from werkzeug.exceptions import BadRequest

from datetime import date
from datetime import datetime
from datetime import timedelta

import subprocess
import json

from functools import lru_cache

app = Flask(__name__)

app.config['TESTING']               = False
# app.config["TEMPLATES_AUTO_RELOAD"] = True


@lru_cache(None)
def get_reasons():
  return [ "travail",
           "achats",
           "sante",
           "famille",
           "handicap",
           "sport_animaux",
           "convocation",
           "missions",
           "enfants" ]

@lru_cache(None)
def get_reasons_as_set():
  return set(get_reasons())


@lru_cache(None)
def get_users():
  users      = {}
  users_list = []

  if os.path.isfile(os.path.join(os.path.dirname(__file__), 'users.json')) :
    with open(os.path.join(os.path.dirname(__file__), 'users.json'), 'r') as f :
      users_list = json.load(f)

  for user in users_list :
    prenom_sans_accent = ''.join((c for c in unicodedata.normalize('NFD', user['prenom']) if unicodedata.category(c) != 'Mn'))
    prenom_sans_accent = prenom_sans_accent.lower()
    for sep in (' ', '_', '-', '.', ',') :
      prenom_sans_accent = prenom_sans_accent.split(sep)[0]
    users[prenom_sans_accent]=user

  return users

def isBase64(sb):
    try:
      if isinstance(sb, str):
        # If there's any unicode here, an exception will be thrown and the function will return false
        sb_bytes = bytes(sb, 'ascii')
      elif isinstance(sb, bytes):
        sb_bytes = sb
      else:
        raise ValueError("Argument must be string or bytes")

      return base64.b64encode(base64.b64decode(sb_bytes)) == sb_bytes
    except Exception:
        return False

def get_pdf(name, motif):
  command = []
  today = datetime.today()
  now_shift = today + timedelta(minutes=3)

  users = get_users()
  if name in users :
    user = users[name]
    command = [os.path.join(os.path.dirname(__file__), 'launch_node.sh'),
               '--nom="%s"'%(user['nom']),
               '--prenom="%s"'%(user['prenom']),
               '--date="%s"'%(user['date']),
               '--lieu="%s"'%(user['lieu']),
               '--addresse="%s"'%(user['addresse']),
               '--ville="%s"'%(user['ville']),
               '--postal="%s"'%(user['postal']),
               '--datesortie="%s"'%today.strftime('%d/%m/%Y'),
               '--heuresortie="%s"'%(now_shift.strftime('%H:%M')),
               '--motif="%s"'%motif]
  else :
    raise BadRequest('Bad Request')

  if command :
    content = ''
    with subprocess.Popen(command, stdout=subprocess.PIPE) as proc :
     content += proc.stdout.read().decode('utf-8')
    content = content.strip()

  file_name = "attestation_covid_%s_%s_%s.pdf"%(name, today.strftime('%d%m%Y'), now_shift.strftime('%H_%M'))
  return (file_name, content)

@app.route('/')
def index():
  reasons = get_reasons()
  users   = get_users()
  known   = []
  for key in users :
    m = hashlib.sha256()
    m.update(key.encode('utf-8'))
    known.append(m.hexdigest())

  version = '1.0.a'
  return render_template('index.html',
                         known=known,
                         reasons=reasons,
                         version=version)


@app.route('/reasons', methods=['GET'])
def publish_reasons():
  """
  """
  result = {}
  for i, ele in enumerate(get_reasons()) :
    result[i] = ele
  return result

@app.route('/users', methods=['GET'])
def get_sha():
  """
  return user key as sha256
  """
  users = get_users()

  result = []
  for key in users :
    m = hashlib.sha256()
    m.update(key.encode('utf-8'))
    result.append(m.hexdigest())

  return {'known':result}

@app.route('/build/<raison>/<name>', methods=['POST', 'GET'])
def build(raison=None, name=None):
  users = get_users()
  if name not in users :
    raise BadRequest('Bad Request')

  reasons = get_reasons_as_set()
  if raison not in reasons :
    raise BadRequest('Bad Request')

  file_name, base64_pdf_content = get_pdf(name, raison)
  if isBase64(base64_pdf_content) :
    response = Response(base64.b64decode(bytes(base64_pdf_content, 'ascii')), mimetype='application/pdf')
    response.headers['Content-Disposition']= "attachment; filename=%s"%(file_name)
    return response
  raise BadRequest(base64_pdf_content)

