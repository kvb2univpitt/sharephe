Install Virtual Environment
----------------------------------------------
mkdir venv
python3 -m venv venv
source venv/bin/activate

Dependencies
----------------------------------------------
pip install --upgrade pip
pip install wheel
pip install flask
pip install template-render
pip install flask-blueprint
pip install Flask-RESTful
pip install flask-wtf
pip install flask-moment
pip install requests
pip install boto3

pip install -U Flask-SQLAlchemy
pip install psycopg2-binary --upgrade  // postgresql
pip install cx_Oracle --upgrade  // oracle

pip install autopep8


Apache WSGI
----------------------------------------------
/usr/share/httpd/.aws/credentials

Run Development Server
----------------------------------------------
export FLASK_APP=webroot/sharephe.py
export FLASK_DEBUG=1
flask run

history -c;history -w;exit
clear;history -c;history -w
