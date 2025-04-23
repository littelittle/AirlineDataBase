from api.admin import admin_api
from api.passenger import passenger_api
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允许跨域请求
app.config['DEBUG'] = True 

# 注册 API 蓝图
app.register_blueprint(admin_api, url_prefix='/api/admin')
app.register_blueprint(passenger_api, url_prefix='/api/passenger')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)