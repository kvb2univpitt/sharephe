import sys
sys.path.insert(0, '/home/user/sharephe')
sys.path.append('/home/user/sharephe/venv/lib64/python3.10/site-packages')

from webroot import create_app
application = create_app()
