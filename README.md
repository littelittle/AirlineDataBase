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



