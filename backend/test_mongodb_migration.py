"""
Comprehensive MongoDB Migration Verification Script
This script tests all aspects of the MySQL to MongoDB migration.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db import get_mongodb_client, get_database, get_collection, init_db
from config import Config
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import datetime

def print_section(title):
    """Print a formatted section header."""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")

def test_connection():
    """Test MongoDB connection."""
    print_section("1. MONGODB CONNECTION TEST")
    try:
        client = get_mongodb_client()
        if client is None:
            print("❌ FAILED: Cannot connect to MongoDB")
            return False
        print("✅ MongoDB connection successful")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_database():
    """Test database initialization."""
    print_section("2. DATABASE INITIALIZATION TEST")
    try:
        db = get_database()
        if db is None:
            print("❌ FAILED: Cannot get database instance")
            return False
        print(f"✅ Database '{Config.MONGODB_DB_NAME}' retrieved successfully")
        
        # Check collections
        collections = db.list_collection_names()
        required_collections = ['users', 'health_records', 'predictions', 'recommendations']
        
        print(f"\n  Collections found: {len(collections)}")
        for coll in required_collections:
            if coll in collections:
                print(f"    ✅ {coll}")
            else:
                print(f"    ❌ {coll} - MISSING")
                return False
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_collections():
    """Test collection access."""
    print_section("3. COLLECTION ACCESS TEST")
    try:
        collections_to_test = {
            'users': "User accounts collection",
            'health_records': "Health assessment records",
            'predictions': "ML predictions",
            'recommendations': "AI recommendations"
        }
        
        for coll_name, desc in collections_to_test.items():
            coll = get_collection(coll_name)
            if coll is None:
                print(f"❌ {coll_name}: Cannot access collection")
                return False
            count = coll.count_documents({})
            print(f"✅ {coll_name}: {count} documents ({desc})")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_user_operations():
    """Test user CRUD operations."""
    print_section("4. USER CRUD OPERATIONS TEST")
    try:
        users_coll = get_collection('users')
        
        # Test email uniqueness index
        indexes = users_coll.index_information()
        has_email_index = 'email_1' in indexes
        if has_email_index:
            print("✅ Email unique index exists")
        else:
            print("❌ Email unique index missing")
            return False
        
        # Test insert
        test_user = {
            'name': 'Test User MongoDB',
            'email': f'test_mongodb_{datetime.utcnow().timestamp()}@test.com',
            'password_hash': generate_password_hash('TestPassword123'),
            'created_at': datetime.utcnow()
        }
        result = users_coll.insert_one(test_user)
        user_id = str(result.inserted_id)
        print(f"✅ User created with ID: {user_id}")
        
        # Test find
        found_user = users_coll.find_one({'_id': ObjectId(user_id)})
        if found_user:
            print(f"✅ User retrieved: {found_user['name']}")
        else:
            print("❌ User not found after insert")
            return False
        
        # Test password verification
        if check_password_hash(found_user['password_hash'], 'TestPassword123'):
            print("✅ Password verification works")
        else:
            print("❌ Password verification failed")
            return False
        
        # Test update
        users_coll.update_one({'_id': ObjectId(user_id)}, {'$set': {'name': 'Updated User'}})
        updated_user = users_coll.find_one({'_id': ObjectId(user_id)})
        if updated_user['name'] == 'Updated User':
            print("✅ User updated successfully")
        else:
            print("❌ User update failed")
            return False
        
        # Test delete
        users_coll.delete_one({'_id': ObjectId(user_id)})
        deleted_user = users_coll.find_one({'_id': ObjectId(user_id)})
        if deleted_user is None:
            print("✅ User deleted successfully")
        else:
            print("❌ User deletion failed")
            return False
        
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_health_records():
    """Test health records operations."""
    print_section("5. HEALTH RECORDS OPERATIONS TEST")
    try:
        health_coll = get_collection('health_records')
        
        # Create a test user first
        users_coll = get_collection('users')
        test_user = {
            'name': 'Health Test User',
            'email': f'healthtest_{datetime.utcnow().timestamp()}@test.com',
            'password_hash': generate_password_hash('Test123'),
            'created_at': datetime.utcnow()
        }
        user_result = users_coll.insert_one(test_user)
        user_id = str(user_result.inserted_id)
        
        # Test health record insert
        health_record = {
            'user_id': user_id,
            'age': 30,
            'gender': 'male',
            'height': 175,
            'weight': 75,
            'bmi': 24.5,
            'systolic_bp': 120,
            'diastolic_bp': 80,
            'smoking_status': 'non-smoker',
            'physical_activity': 'moderate',
            'health_conditions': 'none',
            'goal': 'fitness',
            'created_at': datetime.utcnow()
        }
        record_result = health_coll.insert_one(health_record)
        record_id = str(record_result.inserted_id)
        print(f"✅ Health record created with ID: {record_id}")
        
        # Test find by user_id
        records = list(health_coll.find({'user_id': user_id}))
        if len(records) > 0:
            print(f"✅ Found {len(records)} health record(s) for user")
        else:
            print("❌ Health records not found")
            return False
        
        # Test indexes
        indexes = health_coll.index_information()
        has_user_id_index = 'user_id_1' in indexes
        has_created_at_index = 'created_at_1' in indexes
        
        if has_user_id_index:
            print("✅ user_id index exists")
        else:
            print("❌ user_id index missing")
        
        if has_created_at_index:
            print("✅ created_at index exists")
        else:
            print("❌ created_at index missing")
        
        # Cleanup
        health_coll.delete_many({'user_id': user_id})
        users_coll.delete_one({'_id': ObjectId(user_id)})
        
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_predictions():
    """Test predictions collection."""
    print_section("6. PREDICTIONS COLLECTION TEST")
    try:
        pred_coll = get_collection('predictions')
        
        # Check indexes
        indexes = pred_coll.index_information()
        has_user_id_index = 'user_id_1' in indexes
        has_created_at_index = 'created_at_1' in indexes
        
        if has_user_id_index and has_created_at_index:
            print("✅ All required indexes exist on predictions collection")
        else:
            print("❌ Missing indexes on predictions collection")
            return False
        
        # Test insert
        prediction = {
            'user_id': 'test_user_123',
            'prediction_result': 'Low Risk',
            'risk_score': 0.23,
            'details': {'model': 'rf', 'confidence': 0.95},
            'created_at': datetime.utcnow()
        }
        result = pred_coll.insert_one(prediction)
        print(f"✅ Prediction document inserted: {result.inserted_id}")
        
        # Cleanup
        pred_coll.delete_one({'_id': result.inserted_id})
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_recommendations():
    """Test recommendations collection."""
    print_section("7. RECOMMENDATIONS COLLECTION TEST")
    try:
        rec_coll = get_collection('recommendations')
        
        # Check indexes
        indexes = rec_coll.index_information()
        has_user_id_index = 'user_id_1' in indexes
        has_created_at_index = 'created_at_1' in indexes
        
        if has_user_id_index and has_created_at_index:
            print("✅ All required indexes exist on recommendations collection")
        else:
            print("❌ Missing indexes on recommendations collection")
            return False
        
        # Test insert
        recommendation = {
            'user_id': 'test_user_456',
            'recommendation_type': 'Lifestyle & Nutrition',
            'recommendation_text': {'dietary': ['Eat healthy'], 'exercise': ['Walk 30 mins']},
            'created_at': datetime.utcnow()
        }
        result = rec_coll.insert_one(recommendation)
        print(f"✅ Recommendation document inserted: {result.inserted_id}")
        
        # Cleanup
        rec_coll.delete_one({'_id': result.inserted_id})
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_config():
    """Test configuration."""
    print_section("8. CONFIGURATION TEST")
    try:
        config = Config()
        print(f"✅ Database Name: {config.MONGODB_DB_NAME}")
        print(f"✅ MongoDB Host: {config.MONGODB_HOST}")
        print(f"✅ MongoDB Port: {config.MONGODB_PORT}")
        print(f"✅ MongoDB Atlas Mode: {config.MONGODB_ATLAS}")
        
        # Check connection string
        uri = config.MONGODB_URI
        if 'mongodb' in uri:
            print(f"✅ Connection URI format is valid")
            if config.MONGODB_ATLAS and 'mongodb+srv' in uri:
                print(f"✅ Using MongoDB Atlas (SRV) connection")
            elif not config.MONGODB_ATLAS and 'mongodb://' in uri:
                print(f"✅ Using direct MongoDB connection")
        else:
            print(f"❌ Invalid connection URI")
            return False
        
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def main():
    """Run all migration verification tests."""
    print("\n")
    print("╔══════════════════════════════════════════════════════════════════╗")
    print("║     HEALTHWISE-AI: MySQL → MongoDB Migration Verification        ║")
    print("╚══════════════════════════════════════════════════════════════════╝")
    
    tests = [
        ("MongoDB Connection", test_connection),
        ("Database Initialization", test_database),
        ("Collection Access", test_collections),
        ("User Operations", test_user_operations),
        ("Health Records", test_health_records),
        ("Predictions Collection", test_predictions),
        ("Recommendations Collection", test_recommendations),
        ("Configuration", test_config),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            passed = test_func()
            results.append((test_name, passed))
        except Exception as e:
            print(f"\n❌ Test Error: {e}")
            results.append((test_name, False))
    
    # Summary
    print_section("MIGRATION VERIFICATION SUMMARY")
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}  - {test_name}")
    
    print(f"\n{passed_count}/{total_count} tests passed")
    
    if passed_count == total_count:
        print("\n✅ ALL TESTS PASSED! MongoDB migration is complete and verified.")
        return 0
    else:
        print(f"\n❌ {total_count - passed_count} test(s) failed. Please review the errors above.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
