## HealthWise-AI: MySQL to MongoDB Migration Guide

### ✅ Completed Steps

1. **✅ Updated requirements.txt**
   - Replaced `mysql-connector-python` with `pymongo>=4.0.0`

2. **✅ Updated config.py**
   - Replaced MySQL config with MongoDB config
   - Added MONGODB_URI property for connection string

3. **✅ Updated .env**
   - Replaced MySQL env variables with MongoDB env variables
   - Default: localhost:27017, no auth required

4. **✅ Rewrote db.py**
   - Replaced MySQL connection with PyMongo
   - Created MongoDB collections: users, health_records, predictions, recommendations
   - Added automatic index creation for better performance

5. **✅ Updated auth_routes.py**
   - register(): Uses MongoDB to check email uniqueness and insert user
   - login(): Uses MongoDB to find user and verify password
   - Returns `_id` as ObjectId string

---

### 📝 Next Steps Required

### **STEP 1: Install PyMongo**
```bash
cd backend
pip install -r requirements.txt
```

### **STEP 2: Set Up MongoDB**

**Option A: Local MongoDB (Recommended for development)**
```bash
# Install MongoDB Community Edition:
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# Mac: brew install mongodb-community
# Linux: Follow official MongoDB guide

# Start MongoDB service:
# Windows: mongod
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# MongoDB will run on localhost:27017
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Update .env:
```
MONGODB_USER=your_username
MONGODB_PASSWORD=your_password
MONGODB_DB_NAME=healthwise_ai
```

### **STEP 3: Update Remaining Route Files**

Replace all route files to use MongoDB:

- **health_routes.py** - Replace SQL queries with MongoDB queries
- **prediction_routes.py** - Use MongoDB for storing predictions
- **recommendation_routes.py** - Store recommendations in MongoDB
- **chat_routes.py** - MongoDB integration ready (already created)

### **STEP 4: Database Initialization**

```bash
python db.py
```

This will:
- Create collections if they don't exist
- Create indexes for better query performance
- Output connection status

### **STEP 5: Start Backend**

```bash
python app.py
```

---

### 🔄 Data Migration (Optional)

If you have existing MySQL data to migrate:

```bash
# Install mongoimport tool
# Then use this script to migrate:
python migrate_mysql_to_mongodb.py
```

---

### 📊 Collection Schema

**users**
```json
{
  "_id": ObjectId,
  "name": "string",
  "email": "string (unique)",
  "password_hash": "string",
  "created_at": "datetime"
}
```

**health_records**
```json
{
  "_id": ObjectId,
  "user_id": "string (user._id)",
  "age": number,
  "gender": "string",
  "height": number,
  "weight": number,
  "bmi": number,
  "systolic_bp": number,
  "diastolic_bp": number,
  "smoking_status": "string",
  "physical_activity": "string",
  "health_conditions": "string",
  "goal": "string",
  "created_at": "datetime"
}
```

**predictions**
```json
{
  "_id": ObjectId,
  "user_id": "string",
  "prediction_result": "string",
  "risk_score": number,
  "details": "object",
  "created_at": "datetime"
}
```

**recommendations**
```json
{
  "_id": ObjectId,
  "user_id": "string",
  "recommendation_type": "string",
  "recommendation_text": "string",
  "created_at": "datetime"
}
```

---

### ⚙️ Key Differences: SQL vs MongoDB

| Aspect | MySQL | MongoDB |
|--------|-------|---------|
| Primary Key | `id` (auto-increment INT) | `_id` (ObjectId) |
| Query | SQL `SELECT...WHERE...` | PyMongo `find()`, `find_one()` |
| Insert | `INSERT INTO...` | `insert_one()` |
| Update | `UPDATE...SET...` | `update_one()` |
| Delete | `DELETE FROM...` | `delete_one()` |
| Join | `INNER JOIN` | Nested documents/references |
| Transaction | BEGIN, COMMIT | MongoDB 4.0+ sessions |

---

### 🔗 Connection String Examples

**Local (No Auth)**
```
mongodb://localhost:27017
```

**Local (With Auth)**
```
mongodb://username:password@localhost:27017/healthwise_ai
```

**MongoDB Atlas**
```
mongodb+srv://username:password@cluster.mongodb.net/healthwise_ai
```

---

### 🐛 Troubleshooting

**Connection Error: "No module named 'pymongo'"**
```bash
pip install pymongo
```

**Connection Error: "Connection refused"**
- Check if MongoDB is running
- Verify connection string in .env
- Check firewall settings

**"email already exists" error**
- MongoDB created unique index on email field
- If you get duplicate errors on re-registration, drop and recreate collections:
```python
from db import get_database
db = get_database()
db.users.drop()
db.health_records.drop()
db.predictions.drop()
db.recommendations.drop()
```

---

### 📚 Useful MongoDB Commands

```bash
# Start MongoDB shell
mongosh

# List databases
show databases

# Use HealthWise database
use healthwise_ai

# List collections
show collections

# View all users
db.users.find()

# View specific user
db.users.findOne({email: "user@example.com"})

# Count documents
db.health_records.countDocuments()

# Delete all records (caution!)
db.health_records.deleteMany({})
```

---

### ✅ Verification Checklist

- [ ] MongoDB is installed and running
- [ ] `pymongo` is installed (`pip list | grep pymongo`)
- [ ] `.env` file is updated with MongoDB config
- [ ] `python db.py` runs successfully
- [ ] Collections are created in MongoDB
- [ ] All route files are updated to use MongoDB
- [ ] `python app.py` starts without errors
- [ ] Frontend can register and login successfully

---

### 🚀 Production Deployment

For production, use MongoDB Atlas:
1. Create MongoDB Atlas account
2. Set up production cluster
3. Enable IP whitelist
4. Get connection string
5. Update .env with Atlas connection string
6. Deploy backend

---

**Questions?** Check MongoDB documentation: https://docs.mongodb.com/

