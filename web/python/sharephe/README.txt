Install Virtual Environment
----------------------------------------------
python3 -m venv venv
source venv/bin/activate
python3 -m pip install --upgrade pip

Dependencies
----------------------------------------------
pip install flask
pip install template-render
pip install flask-blueprint
pip install requests
pip install Flask-RESTful
pip install boto3

Apache WSGI (
----------------------------------------------
export AWS_DEFAULT_REGION=us-east-1
export AWS_CONFIG_FILE=/home/kvb2/.aws/config
export AWS_SHARED_CREDENTIALS_FILE=/home/kvb2/.aws/credentials

./usr/share/httpd/.aws/credentials

Run Development Server
----------------------------------------------
export FLASK_APP=webroot/sharephe.py
export FLASK_DEBUG=1
flask run

history -c;history -w;exit
clear;history -c;history -w
