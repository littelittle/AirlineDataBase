# AIRLINESYSTEM

## guide

### gitclone

```terminal
git clone https://github.com/littelittle/AirlineDataBase.git
```

### create the database schema

```terminal
# windows
cat db\schema\airlinedb_schema.sql | mysql -u root -p 
# or linux/macos
cat db/schema/airlinedb_schema.sql | mysql -u root -p
```

### run the frontend

```terminal
cd frontend
npm install
npm start
```

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


### run the backend

Set your password in

```python
# 数据库配置（请替换为你的实际信息）
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': os.getenv('DBPassword'),# Use Your Password
    'database': 'AirlineDB',
    'charset': 'utf8mb4'
}

```

Open a new terminal.

```terminal
cd backend
pip install -r requirements.txt
flask run
```

## open the websites

enter `http://localhost:3000`
You can log in to the Airline Management page by registering an account named admin, and log in to the Passenger page by registering any other username. If you have run concurrent tests using the concurrent_test.py script(see instruction below) before, the system will create an admin account based on the password you passed in (default: 123456). 

### potential connection issues

The mysql-connector-python does not support MySQL 8.x's default authentication plugin caching_sha2_password, causing database query failures. (Respones may be `{"error":"Authentication plugin 'caching_sha2_password' is not supported"}`)

You may change the MySQL user's authentication method:

```SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

```terminal
pip install --upgrade mysql-connector-python
```

Then restart your mysql service.

### run the concurrent test

The concurrent test script simulates multiple users making transactions at the same time. You can configure the number of threads (users), the number of requests per user, whether to clear the database before the test, and the verbosity of the output.

**Arguments:**

- `--threads`, `-t`: Number of concurrent threads (users). Default: 100
- `--requests`, `-r`: Number of requests per thread (per user). Default: 7
- `--clear`, `-c`: If set, clear the database before running the test (dangerous!)(But is needed if you want to run it again for it is not allowed to buy the same product twice). Default: not set
- `--verbose`, `-v`: If set, print detailed output for each request. Default: not set (only summary is printed)
- `--password`, `-p`: Password of admin. default: 123456

**Usage examples:**

```bash
# Basic usage (default: 10 threads, 7 requests per thread, no clear, summary only)
python concurrent_test.py

# Specify number of threads and requests per thread
python concurrent_test.py --threads 50 --requests 10

# Use short options and clear the database before the test
python concurrent_test.py -t 20 -r 5 -c

# Enable verbose output
python concurrent_test.py -t 10 -r 3 -v
```

- Make sure the backend server is running before executing the test.
- Note that when number of requests per thread exceeds the number of products, the exceeded requests will 100% fail.
- If `-c`/`--clear` is set, the script will clear all data in the database at the start of the test (via the `/admin/clear-all` endpoint). **Use with caution!**
- At the end of the test, the script will print the total number of transaction requests and the number of failed transaction requests.
