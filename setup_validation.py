"""
Trinity AI System Validation Script
Checks system dependencies, configuration, and health.
"""
import sys
import os
from pathlib import Path
import importlib.util


def check_python_version():
    """Check if Python version is adequate."""
    print("🔍 Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python {version.major}.{version.minor} detected. Python 3.8+ required.")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True


def check_required_packages():
    """Check if required packages are installed."""
    print("\n🔍 Checking required packages...")
    required = [
        "fastapi", "uvicorn", "pydantic", "PyPDF2", "docx", 
        "PIL", "pytesseract", "fitz", "openpyxl", "psutil"
    ]
    
    missing = []
    for package in required:
        # Handle special cases
        pkg_import = package
        if package == "docx":
            pkg_import = "docx"
        elif package == "PIL":
            pkg_import = "PIL"
        elif package == "fitz":
            pkg_import = "fitz"
        
        if importlib.util.find_spec(pkg_import) is None:
            missing.append(package)
            print(f"❌ {package} - NOT INSTALLED")
        else:
            print(f"✅ {package}")
    
    if missing:
        print(f"\n⚠️  Missing packages: {', '.join(missing)}")
        print("   Run: python -m pip install -r requirements.txt")
        return False
    return True


def check_optional_packages():
    """Check optional AI engine packages."""
    print("\n🔍 Checking optional AI engine packages...")
    optional = {
        "openai": "OpenAI",
        "anthropic": "Anthropic", 
        "google.genai": "Gemini"
    }
    
    available = []
    for package, name in optional.items():
        if importlib.util.find_spec(package.split('.')[0]) is not None:
            print(f"✅ {name} SDK installed")
            available.append(name)
        else:
            print(f"⚠️  {name} SDK not installed (optional)")
    
    return available


def check_api_keys():
    """Check if API keys are configured."""
    print("\n🔍 Checking API keys...")
    keys = {
        "GEMINI_API_KEY": "Gemini",
        "OPENAI_API_KEY": "OpenAI",
        "ANTHROPIC_API_KEY": "Anthropic"
    }
    
    configured = []
    for env_var, name in keys.items():
        if os.getenv(env_var):
            print(f"✅ {name} API key configured")
            configured.append(name)
        else:
            print(f"⚠️  {name} API key not set (optional)")
    
    return configured


def check_directories():
    """Check if required directories exist."""
    print("\n🔍 Checking directory structure...")
    required_dirs = ["middleware", "routers", "tests"]
    required_files = [
        "app.py", "config.py", "telemetry.py", 
        "trinity_orchestrator_unified.py", "requirements.txt", "index.html"
    ]
    
    all_ok = True
    
    for dir_name in required_dirs:
        path = Path(dir_name)
        if path.exists() and path.is_dir():
            print(f"✅ {dir_name}/ directory exists")
        else:
            print(f"❌ {dir_name}/ directory missing")
            all_ok = False
    
    for file_name in required_files:
        path = Path(file_name)
        if path.exists() and path.is_file():
            print(f"✅ {file_name} exists")
        else:
            print(f"❌ {file_name} missing")
            all_ok = False
    
    return all_ok


def check_uploads_directory():
    """Ensure uploads directory exists."""
    print("\n🔍 Checking uploads directory...")
    uploads = Path("uploads")
    if not uploads.exists():
        print("⚠️  uploads/ directory not found, creating...")
        uploads.mkdir(exist_ok=True)
        print("✅ Created uploads/ directory")
    else:
        print("✅ uploads/ directory exists")
    return True


def run_import_test():
    """Test importing main application modules."""
    print("\n🔍 Testing module imports...")
    modules = [
        "app",
        "config", 
        "telemetry",
        "trinity_orchestrator_unified"
    ]
    
    all_ok = True
    for module in modules:
        try:
            __import__(module)
            print(f"✅ {module} imports successfully")
        except Exception as e:
            print(f"❌ {module} import failed: {e}")
            all_ok = False
    
    return all_ok


def main():
    """Run all validation checks."""
    print("=" * 60)
    print("Trinity AI System Validation")
    print("=" * 60)
    
    checks = [
        ("Python Version", check_python_version),
        ("Required Packages", check_required_packages),
        ("Directory Structure", check_directories),
        ("Uploads Directory", check_uploads_directory),
    ]
    
    results = {}
    for name, check_func in checks:
        try:
            results[name] = check_func()
        except Exception as e:
            print(f"\n❌ Error during {name} check: {e}")
            results[name] = False
    
    # Optional checks (don't fail overall)
    check_optional_packages()
    check_api_keys()
    
    # Import test
    try:
        results["Module Imports"] = run_import_test()
    except Exception as e:
        print(f"\n❌ Error during import test: {e}")
        results["Module Imports"] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\n{passed}/{total} checks passed")
    
    if passed == total:
        print("\n🎉 System validation successful! Ready to start Trinity AI.")
        print("\nTo start the server, run:")
        print("  .\\start-local.ps1")
        print("\nOr manually:")
        print("  python -m uvicorn app:app --port 8090")
        return 0
    else:
        print("\n⚠️  Some checks failed. Please address the issues above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
