import os
from dotenv import load_dotenv

# Load environment variables from .env file if available
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "healthwise_ai_secret_key_default")
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("FLASK_DEBUG", "1") == "1"

    # MongoDB Configuration
    MONGODB_HOST = os.getenv("MONGODB_HOST", "localhost")
    MONGODB_PORT = int(os.getenv("MONGODB_PORT", 27017))
    MONGODB_USER = os.getenv("MONGODB_USER", "")
    MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD", "")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "healthwise_ai")
    MONGODB_ATLAS = os.getenv("MONGODB_ATLAS", "false").lower() == "true"
    
    # MongoDB Connection String
    @property
    def MONGODB_URI(self):
        direct_uri = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")
        if direct_uri:
            return direct_uri
        if self.MONGODB_USER and self.MONGODB_PASSWORD:
            if self.MONGODB_ATLAS:
                # MongoDB Atlas connection string (uses mongodb+srv://)
                return f"mongodb+srv://{self.MONGODB_USER}:{self.MONGODB_PASSWORD}@{self.MONGODB_HOST}/{self.MONGODB_DB_NAME}?retryWrites=true&w=majority"
            else:
                # Local MongoDB connection string
                return f"mongodb://{self.MONGODB_USER}:{self.MONGODB_PASSWORD}@{self.MONGODB_HOST}:{self.MONGODB_PORT}/{self.MONGODB_DB_NAME}"
        else:
            return f"mongodb://{self.MONGODB_HOST}:{self.MONGODB_PORT}"

    # Gemini API Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")


