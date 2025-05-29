# AIRLINESYSTEM

## guide

### gitclone

```terminal
git clone https://github.com/littelittle/AirlineDataBase.git
```

### create the database schema

```terminal
cat db\schema\airlinedb_schema.sql | mysql -u root -p
```

### run the frontend

```terminal
cd frontend
npm install
npm start
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### run the backend

Set your password in

```python
# 数据库配置（请替换为你的实际信息）
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'YourPassword',# Use Your Password
    'database': 'AirlineDB',
    'charset': 'utf8mb4'
}

```

Open a new terminal.

```terminal
cd backend
flask run
```

## open the websites

temporary websites `http://localhost:3000/admin` and `http://localhost:3000/passenger`

### connection issues

The mysql-connector-python does not support MySQL 8.x's default authentication plugin caching_sha2_password, causing database query failures. (Respones may be `{"error":"Authentication plugin 'caching_sha2_password' is not supported"}`)

You may change the MySQL user's authentication method​​:

```SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

```terminal
pip install --upgrade mysql-connector-python
```

Then restart your mysql service.
