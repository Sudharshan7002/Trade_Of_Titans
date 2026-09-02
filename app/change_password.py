"""CLI utility to change password for any user in Trade of Titans."""

import sys
import getpass
from app.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


def update_password(username: str, new_password: str) -> bool:
    if not new_password or len(new_password.strip()) < 4:
        print("Error: Password must be at least 4 characters long.")
        return False

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"Error: User '{username}' was not found in the database.")
            return False

        user.password_hash = hash_password(new_password)
        if user.country_id:
            from app.models.country import Country
            country = db.get(Country, user.country_id)
            if country:
                country.password = new_password
        db.commit()
        print(f"Success: Password for '{username}' (role: {user.role}) has been updated.")
        return True
    except Exception as e:
        db.rollback()
        print(f"Error updating password: {e}")
        return False
    finally:
        db.close()


def main():
    if len(sys.argv) >= 3:
        username = sys.argv[1].strip()
        new_password = sys.argv[2].strip()
        success = update_password(username, new_password)
        sys.exit(0 if success else 1)

    print("========================================")
    print("  Trade of Titans - Password Manager    ")
    print("========================================")
    print("Select an account to change password for:")
    print("  1) admin")
    print("  2) trading_center")
    print("  3) ranking")
    print("  4) Other (enter username)")
    choice = input("\nEnter choice [1-4]: ").strip()

    if choice == "1":
        username = "admin"
    elif choice == "2":
        username = "trading_center"
    elif choice == "3":
        username = "ranking"
    elif choice == "4":
        username = input("Enter username: ").strip()
    else:
        print("Invalid choice. Exiting.")
        sys.exit(1)

    try:
        new_password = getpass.getpass(f"Enter new password for '{username}': ").strip()
        confirm_password = getpass.getpass("Confirm new password: ").strip()
    except Exception:
        # Fallback if getpass is not supported in non-interactive shell
        new_password = input(f"Enter new password for '{username}': ").strip()
        confirm_password = input("Confirm new password: ").strip()

    if new_password != confirm_password:
        print("Error: Passwords do not match.")
        sys.exit(1)

    success = update_password(username, new_password)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
