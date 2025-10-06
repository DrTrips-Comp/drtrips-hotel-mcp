#!/usr/bin/env python3
"""
Validate server.json against MCP schema
"""
import json
import sys
import urllib.request
import os

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    os.system('chcp 65001 > nul')
    sys.stdout.reconfigure(encoding='utf-8')

def validate_server_json():
    """Validate server.json against the MCP schema"""
    try:
        # Read server.json
        with open('server.json', 'r', encoding='utf-8') as f:
            server_data = json.load(f)

        print("[OK] server.json is valid JSON")

        # Check required fields
        required_fields = {
            'namespace': str,
            'name': str,
            'description': str,
            'version': str,
            'deployment': dict
        }

        for field, expected_type in required_fields.items():
            if field not in server_data:
                print(f"[ERROR] Missing required field: {field}")
                return False
            if not isinstance(server_data[field], expected_type):
                print(f"[ERROR] Field '{field}' has wrong type (expected {expected_type.__name__})")
                return False
            print(f"[OK] {field}: {server_data[field] if not isinstance(server_data[field], dict) else '(object)'}")

        # Check deployment structure
        deployment = server_data.get('deployment', {})
        if deployment.get('type') != 'package':
            print(f"[ERROR] deployment.type should be 'package', got '{deployment.get('type')}'")
            return False

        package = deployment.get('package', {})
        if package.get('type') != 'npm':
            print(f"[ERROR] deployment.package.type should be 'npm', got '{package.get('type')}'")
            return False

        if not package.get('name'):
            print("[ERROR] deployment.package.name is required")
            return False

        print(f"[OK] deployment.type: {deployment['type']}")
        print(f"[OK] deployment.package.type: {package['type']}")
        print(f"[OK] deployment.package.name: {package['name']}")

        # Validate namespace format
        namespace = server_data.get('namespace', '')
        if not namespace.startswith('io.github.'):
            print(f"[WARN] namespace '{namespace}' should start with 'io.github.' for GitHub repos")
        else:
            print(f"[OK] Namespace format is valid for GitHub")

        print("\n[SUCCESS] All validation checks passed!")
        return True

    except json.JSONDecodeError as e:
        print(f"[ERROR] Invalid JSON: {e}")
        return False
    except FileNotFoundError:
        print("[ERROR] server.json not found")
        return False
    except Exception as e:
        print(f"[ERROR] Validation error: {e}")
        return False

if __name__ == '__main__':
    success = validate_server_json()
    sys.exit(0 if success else 1)
