import pyrootutils
root = pyrootutils.setup_root(
    search_from=__file__,
    indicator=["pyproject.toml"],
    pythonpath=True,
    dotenv=True,
)

from api.admin import admin_api
from api.passenger import passenger_api
from api.auth import auth_api
from flask import Flask
from flask_cors import CORS


app = Flask(__name__)
CORS(app, origins="http://localhost:3000", supports_credentials=True)  # 允许跨域请求
app.config['DEBUG'] = True 

# 注册 API 蓝图
app.register_blueprint(admin_api, url_prefix='/api/admin')
app.register_blueprint(passenger_api, url_prefix='/api/passenger')
app.register_blueprint(auth_api, url_prefix='/api/auth')

if __name__ == '__main__': 
    app.config['DEBUG'] = True  # 开启调试模式
    app.run(host='0.0.0.0', port=5000, debug=True)