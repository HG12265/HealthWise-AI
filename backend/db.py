import os
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from config import Config
from datetime import datetime

# Global MongoDB client instance
_mongodb_client = None
_mongodb_db = None

def get_mongodb_client():
    """
    Creates and returns a MongoDB client connection using credentials from Config.
    """
    global _mongodb_client
    
    if _mongodb_client is None:
        try:
            uri = Config().MONGODB_URI
            _mongodb_client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # Test connection
            _mongodb_client.admin.command('ping')
            print(f"✅ Connected to MongoDB: {Config.MONGODB_HOST}:{Config.MONGODB_PORT}")
        except (ServerSelectionTimeoutError, ConnectionFailure) as err:
            print(f"❌ MongoDB Connection Error: {err}")
            return None
    
    return _mongodb_client

def get_database():
    """
    Gets the MongoDB database instance.
    """
    global _mongodb_db
    
    if _mongodb_db is None:
        client = get_mongodb_client()
        if client is not None:
            _mongodb_db = client[Config.MONGODB_DB_NAME]
            print(f"✅ Using database: {Config.MONGODB_DB_NAME}")
    
    return _mongodb_db

def get_collection(collection_name):
    """
    Gets a specific MongoDB collection.
    """
    db = get_database()
    if db is not None:
        return db[collection_name]
    return None

def init_db():
    """
    Initializes the MongoDB database with collections and indexes.
    """
    client = get_mongodb_client()
    if client is None:
        print("Could not connect to MongoDB server to initialize database.")
        return False

    try:
        db = get_database()
        if db is None:
            return False

        # Create collections if they don't exist
        collections = ['users', 'health_records', 'predictions', 'recommendations']
        
        for collection_name in collections:
            if collection_name not in db.list_collection_names():
                db.create_collection(collection_name)
                print(f"✅ Created collection: {collection_name}")
            else:
                print(f"ℹ️  Collection already exists: {collection_name}")

        # Create indexes for better query performance
        # Users collection indexes
        users_collection = db['users']
        users_collection.create_index('email', unique=True)
        print("✅ Created index on users.email")

        # Health records collection indexes
        health_records_collection = db['health_records']
        health_records_collection.create_index('user_id')
        health_records_collection.create_index('created_at')
        print("✅ Created indexes on health_records")

        # Predictions collection indexes
        predictions_collection = db['predictions']
        predictions_collection.create_index('user_id')
        predictions_collection.create_index('created_at')
        print("✅ Created indexes on predictions")

        # Recommendations collection indexes
        recommendations_collection = db['recommendations']
        recommendations_collection.create_index('user_id')
        recommendations_collection.create_index('created_at')
        print("✅ Created indexes on recommendations")

        print(f"\n✅ MongoDB database '{Config.MONGODB_DB_NAME}' initialized successfully!")
        return True

    except Exception as e:
        print(f"❌ Error initializing MongoDB: {e}")
        return False

def close_db_connection():
    """
    Closes the MongoDB connection.
    """
    global _mongodb_client
    if _mongodb_client:
        _mongodb_client.close()
        _mongodb_client = None
        print("✅ MongoDB connection closed")

if __name__ == "__main__":
    init_db()

