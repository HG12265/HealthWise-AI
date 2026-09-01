"""
Cleanup script to remove all MySQL-related files
Run this script to clean up the project after MongoDB migration
"""

import os
import sys

# Files to remove
files_to_remove = [
    "backend/database/migrate_bp.py",
    "backend/database/migrate_goal.py", 
    "backend/test_integration.py",
    "backend/test_bp_integration.py",
    "backend/.env.example",  # Old template
    "backend/reset.sql",  # Old MySQL SQL file
]

def remove_files():
    """Remove MySQL-related files from the project."""
    print("╔═══════════════════════════════════════════════════════╗")
    print("║      Removing MySQL-Related Files from Project        ║")
    print("╚═══════════════════════════════════════════════════════╝\n")
    
    removed_count = 0
    
    for file_path in files_to_remove:
        full_path = os.path.join(os.path.dirname(__file__), file_path)
        
        if os.path.exists(full_path):
            try:
                os.remove(full_path)
                print(f"✅ Removed: {file_path}")
                removed_count += 1
            except Exception as e:
                print(f"❌ Failed to remove {file_path}: {e}")
        else:
            print(f"⏭️  Skip (not found): {file_path}")
    
    print(f"\n✅ Cleanup complete! Removed {removed_count} MySQL-related files.")
    print("\n📚 Remaining files for MongoDB:")
    print("   ✅ config.py - MongoDB configuration")
    print("   ✅ db.py - MongoDB connection and collections")
    print("   ✅ requirements.txt - Updated with pymongo")
    print("   ✅ .env - MongoDB credentials")
    print("   ✅ All route files - Converted to MongoDB")
    print("   ✅ test_mongodb_migration.py - MongoDB test suite")

if __name__ == "__main__":
    remove_files()
