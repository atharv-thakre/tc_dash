export interface ParamSpec {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
}

export interface MethodSpec {
  name: string;
  signature: string;
  description: string;
  isAsync?: boolean;
  parameters?: ParamSpec[];
  returns?: {
    type: string;
    description: string;
  };
  exceptions?: string[];
  notes?: string;
  example?: string;
}

export interface SchemaSpec {
  title: string;
  description?: string;
  json: string;
}

export interface DocItem {
  id: string;
  title: string;
  module: string;
  description: string;
  overview?: string;
  content?: string;
  schemas?: SchemaSpec[];
  methods?: MethodSpec[];
  codeSnippet?: string;
}

export const LIBRARY_DOCS: DocItem[] = [
  {
    id: 'setup',
    title: 'FastAPI Application Setup',
    module: 'tc_auth.Auth',
    description: 'Complete initialization guide for FastAPI with database engine, CORS, email, OAuth, and JWT configuration.',
    overview: `The \`tc_auth.Auth\` class is the primary entry point for bootstrapping authentication, session management, and authorization services inside a FastAPI application. It wires SQLAlchemy engines, FastAPI application instances, email services, JWT signers, and OAuth handlers together into a single unified instance.`,
    content: `Before starting your Uvicorn or Gunicorn production server, ensure your setup checklist is complete.`,
    schemas: [
      {
        title: 'Auth Object Sub-Services Directory',
        description: 'Properties available on the initialized auth object instance',
        json: `{
  "auth.account": "Account CRUD, password updates, role/status modifications, search & pagination",
  "auth.service": "High-level authentication flows (login, signup, session response creation)",
  "auth.get_user": "Single user lookup functions (by id, uid, email, handle, phone)",
  "auth.session": "Active server-side session management (create, revoke, list, clear)",
  "auth.otp": "One-Time Password generation, cryptographic hashing, and verification",
  "auth.email": "SMTP client configuration and automated HTML/OTP email delivery",
  "auth.oauth": "Third-party OAuth provider link management",
  "auth.google": "Google OpenID Connect flow handlers (config, login redirect, callback)",
  "auth.github": "GitHub OAuth flow handlers with private primary email resolution",
  "auth.jwt": "JWT key configuration, signing, and signature verification",
  "auth.cookie": "Cookie Configuration Subsystem for secure HttpOnly session cookies (access_token, refresh_token)",
  "auth.deps": "FastAPI dependency injection for route authentication (get_current, get_current_account)",
  "auth.role": "Role-Based Access Control (RBAC) route dependencies (require, allow, block)",
  "auth.status": "Account Status authorization dependencies (require, allow, block)",
  "auth.dashboard": "System metrics & total database resource counts"
}`
      }
    ],
    methods: [
      {
        name: '__init__',
        signature: 'Auth(engine: Engine, app: FastAPI = None)',
        description: 'Initializes the tc_auth core engine and attaches sub-services. The app instance is optional to support decoupled architectures.',
        isAsync: false,
        parameters: [
          { name: 'engine', type: 'sqlalchemy.Engine', required: true, description: 'Active SQLAlchemy engine instance connected to PostgreSQL or MySQL.' },
          { name: 'app', type: 'fastapi.FastAPI', required: false, default: 'None', description: 'Optional FastAPI application instance. If omitted, mount routes later via auth.include_routes(app).' }
        ],
        returns: { type: 'Auth', description: 'Initialized Auth instance containing all sub-service properties.' },
        notes: 'Best Practice: Instantiate Auth(engine=engine) in a shared connect.py module, then call auth.include_routes(app) in run.py. This decouples database setup from route registration and prevents circular imports.',
        example: `# connect.py
from tc_auth import Auth
from sqlalchemy import create_engine

engine = create_engine("postgresql://workspace:admin@localhost:5432/tc_auth")
auth = Auth(engine=engine)`
      },
      {
        name: 'include_routes',
        signature: 'auth.include_routes(app: FastAPI, prefix: str = "/tc-auth")',
        description: 'Registers all built-in tc_auth API routes (auth, account, session, otp, oauth, config) onto the FastAPI application.',
        isAsync: false,
        parameters: [
          { name: 'app', type: 'fastapi.FastAPI', required: true, description: 'Target FastAPI application instance.' },
          { name: 'prefix', type: 'str', required: false, default: '"/tc-auth"', description: 'Root path prefix for all authentication endpoints.' }
        ],
        returns: { type: 'None', description: 'Registers API routers directly onto app.' },
        notes: 'Mounting routes via include_routes eliminates circular dependency issues between database models and route controllers.',
        example: `# run.py
from fastapi import FastAPI
from connect import auth

app = FastAPI(title="Total Chaos Auth API")
auth.include_routes(app, prefix="/tc-auth")`
      }
    ],
    codeSnippet: `# 1. connect.py - Shared Database & Auth Singleton
from tc_auth import Auth
from sqlalchemy import create_engine

engine = create_engine("postgresql://workspace:admin@localhost:5432/tc_auth")
auth = Auth(engine=engine)

# 2. run.py - FastAPI Application & Route Mounting
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from connect import auth

app = FastAPI(title="Total Chaos Auth API")

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://api.codesena.me", "https://codesena.me", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all tc_auth routes under /tc-auth prefix
auth.include_routes(app, prefix="/tc-auth")

# Configure Sub-Services
auth.jwt.config(secret_key="your-super-secret-key", algorithm="HS256", session_duration_days=7)
auth.email.config(host="smtp.gmail.com", port=587, username="admin@example.com", password="app-password", sender="admin@example.com", use_tls=True)
auth.google.config(client_id="GOOGLE_CLIENT_ID", client_secret="GOOGLE_CLIENT_SECRET", redirect_uri="https://api.example.com/tc-auth/google/callback")
auth.github.config(client_id="GITHUB_CLIENT_ID", client_secret="GITHUB_CLIENT_SECRET", redirect_uri="https://api.example.com/tc-auth/github/callback")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("run:app", host="0.0.0.0", port=8000, reload=True)`
  },
  {
    id: 'auth-service',
    title: 'Auth Service',
    module: 'auth.service',
    description: 'High-level authentication workflows: signup, password/handle login, and session token response creation.',
    overview: `The \`auth.service\` module exposes primary authentication actions. All successful authentication actions automatically generate a server-side active session in the database, sign a JWT access token, and return a standardized response format.`,
    content: `Every successful login or signup returns the exact same dictionary structure containing the JWT token and the public account details.`,
    schemas: [
      {
        title: 'Standard Login Response Schema',
        description: 'Standard dictionary structure returned by signup(), login(), and create_login_response()',
        json: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOjEsInNpZCI6NjAsImV4cCI6MTc4NzEyOTg2N30...",
  "token_type": "Bearer",
  "account": {
    "id": 1,
    "uid": "1d7d1310-13e5-4769-8511-d3bc837cf55f",
    "name": "Test User",
    "handle": "testuser",
    "email": "testuser@example.com",
    "phone": "1234567890",
    "avatar_url": "https://example.com/avatar.jpg",
    "role": "user",
    "status": "active",
    "created_at": "2026-08-11T18:11:00.001639",
    "updated_at": "2026-08-11T18:11:00.001639"
  }
}`
      }
    ],
    methods: [
      {
        name: 'create_login_response',
        signature: 'create_login_response(account: dict, ip_address: str = None, user_agent: str = None) -> dict',
        description: 'Generates an access token and active session record for an existing account dictionary.',
        isAsync: false,
        parameters: [
          { name: 'account', type: 'dict', required: true, description: 'Account dictionary object returned by auth.get_user or auth.account.' },
          { name: 'ip_address', type: 'str', required: false, default: 'None', description: 'Client IP address from incoming HTTP request.' },
          { name: 'user_agent', type: 'str', required: false, default: 'None', description: 'Client User-Agent header string.' }
        ],
        returns: { type: 'dict', description: 'Standard login response dictionary with access_token, token_type, and account.' },
        notes: 'Inserts a new session record into DB with calculated expiry and signs JWT containing account ID (aid) and session ID (sid).',
        example: `account = auth.get_user.by_email("user@example.com")
response = auth.service.create_login_response(
    account=account,
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0"
)`
      },
      {
        name: 'signup',
        signature: 'signup(name: str, email: str, password: str, handle: str = None, phone: str = None, role: str = "user", status: str = None, ip_address: str = None, user_agent: str = None) -> dict',
        description: 'Registers a new user account, hashes the raw password using bcrypt, creates an active session, and returns the login response.',
        isAsync: false,
        parameters: [
          { name: 'name', type: 'str', required: true, description: 'Display name of user.' },
          { name: 'email', type: 'str', required: true, description: 'Unique email address.' },
          { name: 'password', type: 'str', required: true, description: 'Plain-text password (hashed internally).' },
          { name: 'handle', type: 'str', required: false, default: 'None', description: 'Unique username handle.' },
          { name: 'phone', type: 'str', required: false, default: 'None', description: 'Unique phone number.' },
          { name: 'role', type: 'str', required: false, default: '"user"', description: 'Account authorization role.' },
          { name: 'status', type: 'str', required: false, default: 'None', description: 'Account status string.' },
          { name: 'ip_address', type: 'str', required: false, default: 'None', description: 'Client IP address.' },
          { name: 'user_agent', type: 'str', required: false, default: 'None', description: 'Client User-Agent header.' }
        ],
        returns: { type: 'dict', description: 'Standard login response dictionary containing created account and JWT access token.' },
        exceptions: ['Exception: Email, handle, or phone already exists in database.'],
        example: `signup_res = auth.service.signup(
    name="Jane Doe",
    email="jane@example.com",
    password="SecurePassword123!",
    handle="janedoe",
    phone="+1987654321",
    role="user",
    status="active",
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0"
)`
      },
      {
        name: 'login',
        signature: 'login(identifier: str, password: str, ip_address: str = None, user_agent: str = None) -> dict',
        description: 'Authenticates an existing account using either email or username handle with plain-text password.',
        isAsync: false,
        parameters: [
          { name: 'identifier', type: 'str', required: true, description: 'User email address OR username handle.' },
          { name: 'password', type: 'str', required: true, description: 'Plain-text password for verification.' },
          { name: 'ip_address', type: 'str', required: false, default: 'None', description: 'Client IP address.' },
          { name: 'user_agent', type: 'str', required: false, default: 'None', description: 'Client User-Agent header.' }
        ],
        returns: { type: 'dict', description: 'Standard login response dictionary containing authenticated account and JWT access token.' },
        exceptions: ['Exception: User not found or invalid password credentials.'],
        example: `# Login using Email
res1 = auth.service.login(identifier="jane@example.com", password="SecurePassword123!")

# Login using Handle
res2 = auth.service.login(identifier="janedoe", password="SecurePassword123!")`
      }
    ],
    codeSnippet: `from connect import auth

# 1. Direct Signup
signup_resp = auth.service.signup(
    name="Test User",
    email="testuser@example.com",
    password="123456Password",
    handle="testuser",
    phone="1234567890",
    role="user",
    status="active",
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0"
)

# 2. Login via Email
email_login = auth.service.login(
    identifier="testuser@example.com",
    password="123456Password",
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0"
)

# 3. Login via Handle
handle_login = auth.service.login(
    identifier="testuser",
    password="123456Password"
)`
  },
  {
    id: 'account',
    title: 'Account API',
    module: 'auth.account',
    description: 'Full CRUD operations for user accounts, privileged role/status updates, password modifications, and pagination.',
    overview: `The \`auth.account\` module provides direct database operations for managing user records, updating passwords, altering user roles/statuses, and querying user collections.`,
    content: `Use \`auth.account\` for backend admin tools, user management dashboards, and profile editing workflows.`,
    schemas: [
      {
        title: 'User Account Record Schema',
        description: 'Complete user account database dictionary schema',
        json: `{
  "id": 1,
  "uid": "1d7d1310-13e5-4769-8511-d3bc837cf55f",
  "name": "Test User",
  "handle": "testuser",
  "email": "testuser@example.com",
  "phone": "1234567890",
  "avatar_url": "https://example.com/avatar.jpg",
  "role": "user",
  "status": "active",
  "created_at": "2026-08-11T18:11:00.001639",
  "updated_at": "2026-08-11T18:11:00.001639"
}`
      }
    ],
    methods: [
      {
        name: 'create_user',
        signature: 'create_user(name: str = None, password: str = None, email: str = None, handle: str = None, avatar_url: str = None, phone: str = None, role: str = "user", status: str = None) -> dict',
        description: 'Creates a new account in database with auto-hashed password.',
        parameters: [
          { name: 'name', type: 'str', required: false, default: 'None', description: 'Display name.' },
          { name: 'password', type: 'str', required: false, default: 'None', description: 'Plain password (hashed with bcrypt).' },
          { name: 'email', type: 'str', required: false, default: 'None', description: 'Unique email address.' },
          { name: 'handle', type: 'str', required: false, default: 'None', description: 'Unique username handle.' },
          { name: 'avatar_url', type: 'str', required: false, default: 'None', description: 'Profile avatar picture URL.' },
          { name: 'phone', type: 'str', required: false, default: 'None', description: 'Unique phone number.' },
          { name: 'role', type: 'str', required: false, default: '"user"', description: 'Account authorization role.' },
          { name: 'status', type: 'str', required: false, default: 'None', description: 'Account status.' }
        ],
        returns: { type: 'dict', description: 'Newly created account object.' },
        exceptions: ['Exception: Unique constraint violation on email, handle, or phone.']
      },
      {
        name: 'delete_user',
        signature: 'delete_user(account_id: int) -> dict',
        description: 'Permanently deletes an account record from database by numeric ID.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric database primary key ID of account.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "Account deleted successfully"}' }
      },
      {
        name: 'update_user',
        signature: 'update_user(account_id: int, name: str = None, email: str = None, handle: str = None, avatar_url: str = None, phone: str = None) -> dict',
        description: 'Updates non-privileged standard fields of an existing account.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'name', type: 'str', required: false, description: 'Updated display name.' },
          { name: 'email', type: 'str', required: false, description: 'Updated email.' },
          { name: 'handle', type: 'str', required: false, description: 'Updated handle.' },
          { name: 'avatar_url', type: 'str', required: false, description: 'Updated avatar URL.' },
          { name: 'phone', type: 'str', required: false, description: 'Updated phone number.' }
        ],
        returns: { type: 'dict', description: 'Updated account object dictionary.' },
        notes: 'Does NOT update password, role, or status. Use update_password(), update_role(), or super_update().'
      },
      {
        name: 'super_update',
        signature: 'super_update(account_id: int, name: str = None, email: str = None, handle: str = None, avatar_url: str = None, phone: str = None, role: str = "user", status: str = None, password: str = None) -> dict',
        description: 'Privileged administrative update capable of altering role, status, password, and standard fields simultaneously.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'role', type: 'str', required: false, description: 'New authorization role.' },
          { name: 'status', type: 'str', required: false, description: 'New account status.' },
          { name: 'password', type: 'str', required: false, description: 'New plain-text password (hashed internally).' }
        ],
        returns: { type: 'dict', description: 'Updated account object dictionary.' }
      },
      {
        name: 'update_password',
        signature: 'update_password(account_id: int, password: str) -> dict',
        description: 'Hashes and updates password for an account.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'password', type: 'str', required: true, description: 'New plain password.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "Password updated successfully"}' }
      },
      {
        name: 'update_status',
        signature: 'update_status(account_id: int, status: str) -> dict',
        description: 'Changes account status (e.g. "active", "suspended", "inactive").',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'status', type: 'str', required: true, description: 'New status string.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "Status updated successfully"}' }
      },
      {
        name: 'update_role',
        signature: 'update_role(account_id: int, role: str) -> dict',
        description: 'Changes account role (e.g. "user", "admin", "superadmin").',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'role', type: 'str', required: true, description: 'New role string.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "Role updated successfully"}' }
      },
      {
        name: 'get_all',
        signature: 'get_all(page: int = 1, limit: int = 10) -> list[dict]',
        description: 'Returns a paginated list of all system user accounts.',
        parameters: [
          { name: 'page', type: 'int', required: false, default: '1', description: 'Page number (1-indexed).' },
          { name: 'limit', type: 'int', required: false, default: '10', description: 'Items per page (range: 1-100).' }
        ],
        returns: { type: 'list[dict]', description: 'List of user account objects.' }
      },
      {
        name: 'query',
        signature: 'query(field: str, value: str) -> list[dict]',
        description: 'Searches user accounts by exact field value.',
        parameters: [
          { name: 'field', type: 'str', required: true, description: 'Search field name: "name", "handle", "email", "phone", "uid".' },
          { name: 'value', type: 'str', required: true, description: 'Query string.' }
        ],
        returns: { type: 'list[dict]', description: 'Matching account objects list, or empty list.' }
      }
    ],
    codeSnippet: `from usage import auth

# Create user manually
user = auth.account.create_user(
    name="Test User",
    password="123456Password",
    email="testuser@example.com",
    handle="testuser",
    avatar_url="https://example.com/avatar.jpg",
    phone="+1234567890",
    role="user",
    status="active"
)

# Admin role update
auth.account.update_role(account_id=1, role="admin")

# Update password
auth.account.update_password(account_id=1, password="NewSecretPassword123")

# Search users by name
results = auth.account.query(field="name", value="Test User")

# Paginated user list
page_1 = auth.account.get_all(page=1, limit=20)`
  },
  {
    id: 'get-user',
    title: 'User Lookups',
    module: 'auth.get_user',
    description: 'Retrieve user accounts by numeric ID, UUID, email, handle, or phone, with optional password hash inclusion.',
    overview: `The \`auth.get_user\` module contains dedicated helper methods for fetching individual account records from the database. All methods support the \`include_password\` parameter to optionally retrieve the bcrypt hash string for password verifications.`,
    content: `By default, \`include_password=False\` and password hashes are excluded from returned account dictionaries.`,
    methods: [
      {
        name: 'by_id',
        signature: 'by_id(account_id: int, include_password: bool = False) -> dict',
        description: 'Fetches account record by numeric database ID.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'include_password', type: 'bool', required: false, default: 'False', description: 'Whether to include password_hash field.' }
        ],
        returns: { type: 'dict', description: 'Account dictionary object.' },
        exceptions: ['Exception: Account ID not found in database.']
      },
      {
        name: 'by_uid',
        signature: 'by_uid(uid: str, include_password: bool = False) -> dict',
        description: 'Fetches account record by unique UUID string.',
        parameters: [
          { name: 'uid', type: 'str', required: true, description: 'UUID string.' },
          { name: 'include_password', type: 'bool', required: false, default: 'False', description: 'Whether to include password_hash field.' }
        ],
        returns: { type: 'dict', description: 'Account dictionary object.' },
        exceptions: ['Exception: Account UUID not found in database.']
      },
      {
        name: 'by_email',
        signature: 'by_email(email: str, include_password: bool = False) -> dict',
        description: 'Fetches account record by email address. Raises Exception if not found.',
        parameters: [
          { name: 'email', type: 'str', required: true, description: 'Email address.' },
          { name: 'include_password', type: 'bool', required: false, default: 'False', description: 'Whether to include password_hash field.' }
        ],
        returns: { type: 'dict', description: 'Account dictionary object.' },
        exceptions: ['Exception: Email address not found.']
      },
      {
        name: 'by_handle',
        signature: 'by_handle(handle: str, include_password: bool = False) -> dict',
        description: 'Fetches account record by username handle.',
        parameters: [
          { name: 'handle', type: 'str', required: true, description: 'Username handle.' },
          { name: 'include_password', type: 'bool', required: false, default: 'False', description: 'Whether to include password_hash field.' }
        ],
        returns: { type: 'dict', description: 'Account dictionary object.' },
        exceptions: ['Exception: Handle not found.']
      },
      {
        name: 'by_phone',
        signature: 'by_phone(phone: str, include_password: bool = False) -> dict',
        description: 'Fetches account record by phone number.',
        parameters: [
          { name: 'phone', type: 'str', required: true, description: 'Phone number.' },
          { name: 'include_password', type: 'bool', required: false, default: 'False', description: 'Whether to include password_hash field.' }
        ],
        returns: { type: 'dict', description: 'Account dictionary object.' },
        exceptions: ['Exception: Phone number not found.']
      },
      {
        name: 'find_by_email',
        signature: 'find_by_email(email: str, include_password: bool = False) -> dict | None',
        description: 'Safe email lookup that returns None if the account does not exist instead of raising an exception.',
        parameters: [
          { name: 'email', type: 'str', required: true, description: 'Email address to lookup.' },
          { name: 'include_password', type: 'bool', required: false, default: 'False', description: 'Whether to include password_hash field.' }
        ],
        returns: { type: 'dict | None', description: 'Account object if found, or None if account does not exist.' }
      }
    ],
    codeSnippet: `from connect import auth

# Fetch user by database ID
u1 = auth.get_user.by_id(account_id=1)

# Fetch user by UUID
u2 = auth.get_user.by_uid(uid="1d7d1310-13e5-4769-8511-d3bc837cf55f")

# Fetch user by email (raises if missing)
u3 = auth.get_user.by_email(email="testuser@example.com")

# Safe lookup without exception
u4 = auth.get_user.find_by_email(email="nonexistent@example.com")
if u4 is None:
    print("User does not exist in system")`
  },
  {
    id: 'session',
    title: 'Session Management',
    module: 'auth.session',
    description: 'Manage server-side active sessions, IP tracking, token hashing, expiration cleanup, and session termination.',
    overview: `The \`auth.session\` module maintains stateful server-side sessions in the database. When users log in, a session record storing the SHA-256 token hash, client IP address, User-Agent, and expiration timestamp is created.`,
    content: `Only token SHA-256 hashes are stored in the database for security. Raw session tokens are returned only during session creation.`,
    schemas: [
      {
        title: 'Session Record Object Schema',
        description: 'Active database session dictionary',
        json: `{
  "id": 1,
  "account_id": 1,
  "token_hash": "da4c0342fb73e2b5f7e03bf6adaa02b9bd2a45b8d535b1cee9f675e75e40df7d",
  "ip_address": "2405:201:301a:1a0b:90a:b200:b160:f17e",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "expires_at": "2026-08-12 00:11:03.646932",
  "created_at": "2026-08-12 00:11:03.646932"
}`
      }
    ],
    methods: [
      {
        name: 'create_session',
        signature: 'create_session(account_id: int, ip_address: str, user_agent: str) -> dict',
        description: 'Creates a new active session record for an account.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'ip_address', type: 'str', required: true, description: 'Client IP address.' },
          { name: 'user_agent', type: 'str', required: true, description: 'Client User-Agent header string.' }
        ],
        returns: { type: 'dict', description: '{"session_id": int, "token": str} containing raw session token.' }
      },
      {
        name: 'by_id',
        signature: 'by_id(session_id: int) -> dict',
        description: 'Retrieves session object by numeric session ID.',
        parameters: [
          { name: 'session_id', type: 'int', required: true, description: 'Numeric session ID.' }
        ],
        returns: { type: 'dict', description: 'Session dictionary object.' }
      },
      {
        name: 'by_account',
        signature: 'by_account(account_id: int) -> list[dict]',
        description: 'Retrieves all active session records for a specific account.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' }
        ],
        returns: { type: 'list[dict]', description: 'List of active session objects.' }
      },
      {
        name: 'destroy_session',
        signature: 'destroy_session(session_id: int) -> dict',
        description: 'Deletes a single session record from database.',
        parameters: [
          { name: 'session_id', type: 'int', required: true, description: 'Numeric session ID.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "Session destroyed successfully"}' }
      },
      {
        name: 'destroy_all',
        signature: 'destroy_all(account_id: int) -> dict',
        description: 'Deletes all sessions belonging to an account (logout from all devices).',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "All sessions destroyed for account", "count": 2}' }
      },
      {
        name: 'cleanup_expired',
        signature: 'cleanup_expired() -> dict',
        description: 'Deletes all expired session records from the database.',
        returns: { type: 'dict', description: '{"success": True, "message": "Expired sessions cleaned up successfully", "count": 5}' }
      },
      {
        name: 'clear_all',
        signature: 'clear_all() -> dict',
        description: 'Immediately purges ALL session records from database.',
        returns: { type: 'dict', description: '{"success": True, "message": "All sessions cleared successfully", "count": 10}' }
      },
      {
        name: 'get_all',
        signature: 'get_all(page: int = 1, limit: int = 10) -> list[dict]',
        description: 'Returns a paginated list of session records.',
        parameters: [
          { name: 'page', type: 'int', required: false, default: '1', description: 'Page number.' },
          { name: 'limit', type: 'int', required: false, default: '10', description: 'Items per page.' }
        ],
        returns: { type: 'list[dict]', description: 'List of session records.' }
      },
      {
        name: 'query',
        signature: 'query(field: str, value: str) -> list[dict]',
        description: 'Searches sessions by field ("id", "sid", "ip", "token"). Supports partial IP matching.',
        parameters: [
          { name: 'field', type: 'str', required: true, description: 'Search field.' },
          { name: 'value', type: 'str', required: true, description: 'Search query.' }
        ],
        returns: { type: 'list[dict]', description: 'Matching sessions list.' }
      }
    ],
    codeSnippet: `from usage import auth

# Create Session
sess = auth.session.create_session(account_id=1, ip_address="127.0.0.1", user_agent="Mozilla/5.0")

# Fetch all active sessions for account
sessions = auth.session.by_account(account_id=1)

# Revoke specific session
auth.session.destroy_session(session_id=1)

# Revoke all sessions for user (logout everywhere)
auth.session.destroy_all(account_id=1)

# Cleanup expired sessions
auth.session.cleanup_expired()`
  },
  {
    id: 'otp',
    title: 'OTP API',
    module: 'auth.otp',
    description: 'One-Time Password creation, cryptographic verification, attempt limiting, expiry, and revocation.',
    overview: `The \`auth.otp\` module handles generation and cryptographic verification of temporary numeric One-Time Passwords for logins, signups, password resets, and email verifications.`,
    content: `OTP codes are hashed prior to database persistence. Verification increments attempt counters and automatically revokes codes after success or maximum attempt limits.`,
    schemas: [
      {
        title: 'OTP Record Object Schema',
        description: 'OTP database entry dictionary',
        json: `{
  "id": 1,
  "identifier": "testuser@example.com",
  "purpose": "login",
  "code_hash": "sd34bn45yhj4edc7yhn9iwsx6yh0ol3e23er876t2e3rt7y6terty",
  "attempt": 1,
  "expires_at": "2026-08-11T18:11:00.001639",
  "created_at": "2026-08-11T18:11:00.001639"
}`
      }
    ],
    methods: [
      {
        name: 'create',
        signature: 'create(identifier: str, purpose: str, length: int = 6, expiry: int = 300) -> dict',
        description: 'Generates a random numeric OTP code and saves its hash to DB.',
        parameters: [
          { name: 'identifier', type: 'str', required: true, description: 'Target email address or phone number.' },
          { name: 'purpose', type: 'str', required: true, description: 'Purpose ("login", "signup", "reset", "verify_email").' },
          { name: 'length', type: 'int', required: false, default: '6', description: 'Number of digits (default: 6).' },
          { name: 'expiry', type: 'int', required: false, default: '300', description: 'Validity duration in seconds (default: 300).' }
        ],
        returns: { type: 'dict', description: '{"otp": "123456", "expires_at": "2026-08-11T18:16:00..."}' }
      },
      {
        name: 'verify',
        signature: 'verify(identifier: str, purpose: str, otp: str) -> None',
        description: 'Verifies plain OTP code against stored hash.',
        parameters: [
          { name: 'identifier', type: 'str', required: true, description: 'Target email address or phone number.' },
          { name: 'purpose', type: 'str', required: true, description: 'Purpose string.' },
          { name: 'otp', type: 'str', required: true, description: 'Numeric OTP string.' }
        ],
        returns: { type: 'None', description: 'None' },
        exceptions: [
          'OTPNotFoundError: No active OTP record found for identifier & purpose.',
          'OTPExpiredError: OTP code has expired.',
          'OTPInvalidError: Incorrect code (increments attempt counter).'
        ]
      },
      {
        name: 'revoke',
        signature: 'revoke(identifier: str, purpose: str) -> dict',
        description: 'Deletes active OTP record for identifier and purpose.',
        parameters: [
          { name: 'identifier', type: 'str', required: true, description: 'Target email or phone.' },
          { name: 'purpose', type: 'str', required: true, description: 'Purpose string.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "OTP revoked successfully", "count": 1}' }
      },
      {
        name: 'cleanup',
        signature: 'cleanup() -> dict',
        description: 'Deletes all expired OTP records from database.',
        returns: { type: 'dict', description: '{"success": True, "message": "Expired OTPs cleaned successfully", "count": 3}' }
      },
      {
        name: 'clear_all',
        signature: 'clear_all() -> dict',
        description: 'Immediately deletes ALL OTP records from database.',
        returns: { type: 'dict', description: '{"success": True, "message": "All OTPs cleared successfully", "count": 12}' }
      },
      {
        name: 'get_all',
        signature: 'get_all(page: int = 1, limit: int = 10) -> list[dict]',
        description: 'Returns a paginated list of OTP records.',
        parameters: [
          { name: 'page', type: 'int', required: false, default: '1', description: 'Page number.' },
          { name: 'limit', type: 'int', required: false, default: '10', description: 'Items per page.' }
        ],
        returns: { type: 'list[dict]', description: 'List of OTP records.' }
      },
      {
        name: 'query',
        signature: 'query(identifier: str) -> list[dict]',
        description: 'Searches OTP records by identifier (supports partial match).',
        parameters: [
          { name: 'identifier', type: 'str', required: true, description: 'Search term.' }
        ],
        returns: { type: 'list[dict]', description: 'Matching OTP records.' }
      }
    ],
    codeSnippet: `from usage import auth

# Generate OTP
res = auth.otp.create(identifier="user@example.com", purpose="login", length=6, expiry=300)

# Verify OTP
try:
    auth.otp.verify(identifier="user@example.com", purpose="login", otp="123456")
    print("Verification Successful!")
except Exception as e:
    print("Verification Error:", e)`
  },
  {
    id: 'email',
    title: 'Email Service',
    module: 'auth.email',
    description: 'SMTP client setup, HTML/plain text email sending, and pre-built OTP email templates.',
    overview: `The \`auth.email\` module provides SMTP integration for sending transactional emails and automated HTML-styled OTP emails directly to users.`,
    content: `When calling \`send_otp()\`, \`send_login_otp()\`, or \`send_signup_otp()\`, the plain OTP code is emailed directly to the user and is NOT exposed in the returned dictionary for maximum security.`,
    methods: [
      {
        name: 'config',
        signature: 'config(host: str, port: int, username: str, password: str, sender: str, sender_name: str = None, use_tls: bool = True) -> dict',
        description: 'Configures SMTP credentials and default sender headers.',
        parameters: [
          { name: 'host', type: 'str', required: true, description: 'SMTP host (e.g. "smtp.gmail.com").' },
          { name: 'port', type: 'int', required: true, description: 'SMTP port (587 for STARTTLS, 465 for SSL).' },
          { name: 'username', type: 'str', required: true, description: 'SMTP account username.' },
          { name: 'password', type: 'str', required: true, description: 'SMTP password or app password.' },
          { name: 'sender', type: 'str', required: true, description: 'Sender email address.' },
          { name: 'sender_name', type: 'str', required: false, default: 'None', description: 'Sender display header name.' },
          { name: 'use_tls', type: 'bool', required: false, default: 'True', description: 'Use STARTTLS if True, SSL if False.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "Email service configured successfully"}' }
      },
      {
        name: 'load',
        signature: 'load() -> dict',
        description: 'Retrieves current SMTP configuration dictionary.',
        returns: { type: 'dict', description: 'Dictionary containing host, port, username, sender, etc.' }
      },
      {
        name: 'send',
        signature: 'send(to: str, subject: str, body: str, html: bool = False) -> dict',
        description: 'Sends a custom plain text or HTML email message.',
        parameters: [
          { name: 'to', type: 'str', required: true, description: 'Recipient email address.' },
          { name: 'subject', type: 'str', required: true, description: 'Email subject.' },
          { name: 'body', type: 'str', required: true, description: 'Email body text or HTML.' },
          { name: 'html', type: 'bool', required: false, default: 'False', description: 'Set True for HTML rendering.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "Email sent successfully"}' }
      },
      {
        name: 'send_otp',
        signature: 'send_otp(email: str, purpose: str, expiry: int = 300) -> dict',
        description: 'Creates an OTP via auth.otp.create() and emails a styled HTML template to recipient.',
        parameters: [
          { name: 'email', type: 'str', required: true, description: 'Recipient email address.' },
          { name: 'purpose', type: 'str', required: true, description: 'OTP purpose string.' },
          { name: 'expiry', type: 'int', required: false, default: '300', description: 'Validity duration in seconds.' }
        ],
        returns: { type: 'dict', description: '{"expires_at": 1735689600}' }
      },
      {
        name: 'send_login_otp',
        signature: 'send_login_otp(email: str) -> dict',
        description: 'Convenience helper that executes send_otp(email, purpose="login").',
        parameters: [
          { name: 'email', type: 'str', required: true, description: 'Recipient email address.' }
        ],
        returns: { type: 'dict', description: '{"expires_at": 1735689600}' }
      },
      {
        name: 'send_signup_otp',
        signature: 'send_signup_otp(email: str) -> dict',
        description: 'Convenience helper that executes send_otp(email, purpose="signup").',
        parameters: [
          { name: 'email', type: 'str', required: true, description: 'Recipient email address.' }
        ],
        returns: { type: 'dict', description: '{"expires_at": 1735689600}' }
      },
      {
        name: 'send_verify_email',
        signature: 'send_verify_email(email: str) -> dict',
        description: 'Convenience helper that executes send_otp(email, purpose="verify_email").',
        parameters: [
          { name: 'email', type: 'str', required: true, description: 'Recipient email address.' }
        ],
        returns: { type: 'dict', description: '{"expires_at": 1735689600}' }
      }
    ],
    codeSnippet: `from usage import auth

# Configure SMTP
auth.email.config(
    host="smtp.gmail.com",
    port=587,
    username="app@example.com",
    password="app-password-secret",
    sender="app@example.com",
    sender_name="My App Support",
    use_tls=True
)

# Send Login OTP Email
res = auth.email.send_login_otp(email="user@example.com")`
  },
  {
    id: 'oauth',
    title: 'OAuth Core API',
    module: 'auth.oauth',
    description: 'Account linking for third-party OAuth providers (Google, GitHub), automatic user creation, and link unlinking.',
    overview: `The \`auth.oauth\` module provides core database operations for managing third-party provider account links. It connects internal user accounts with third-party provider user IDs.`,
    content: `When a user logs in via an OAuth provider, \`auth.oauth.login\` checks if a link exists. If absent, it automatically registers a new account and attaches the link.`,
    schemas: [
      {
        title: 'OAuth Link Record Schema',
        description: 'OAuth provider link database dictionary',
        json: `{
  "id": 1,
  "account_id": 1,
  "provider": "github",
  "provider_user_id": "1234567890",
  "created_at": "2026-08-11T18:11:00.001639"
}`
      }
    ],
    methods: [
      {
        name: 'login',
        signature: 'login(provider: str, provider_user_id: str, name: str = None, email: str = None, avatar_url: str = None, ip_address: str = None, user_agent: str = None) -> dict',
        description: 'Authenticates or registers a user via an OAuth provider link.',
        parameters: [
          { name: 'provider', type: 'str', required: true, description: 'Provider name ("github", "google").' },
          { name: 'provider_user_id', type: 'str', required: true, description: 'User ID on provider.' },
          { name: 'name', type: 'str', required: false, default: 'None', description: 'Profile display name.' },
          { name: 'email', type: 'str', required: false, default: 'None', description: 'Email address.' },
          { name: 'avatar_url', type: 'str', required: false, default: 'None', description: 'Avatar picture URL.' },
          { name: 'ip_address', type: 'str', required: false, default: 'None', description: 'Client IP.' },
          { name: 'user_agent', type: 'str', required: false, default: 'None', description: 'Client User-Agent.' }
        ],
        returns: { type: 'dict', description: 'Standard login response dictionary with access_token and account.' }
      },
      {
        name: 'find_oauth',
        signature: 'find_oauth(provider: str, provider_user_id: str) -> dict | None',
        description: 'Finds an OAuth link record by provider and provider user ID.',
        parameters: [
          { name: 'provider', type: 'str', required: true, description: 'Provider name.' },
          { name: 'provider_user_id', type: 'str', required: true, description: 'Provider user ID string.' }
        ],
        returns: { type: 'dict | None', description: 'OAuth link object if found, or None.' }
      },
      {
        name: 'link_account',
        signature: 'link_account(account_id: int, provider: str, provider_user_id: str) -> dict',
        description: 'Attaches an OAuth provider link to an existing account.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'provider', type: 'str', required: true, description: 'Provider name.' },
          { name: 'provider_user_id', type: 'str', required: true, description: 'Provider user ID.' }
        ],
        returns: { type: 'dict', description: 'Created OAuth link object.' }
      },
      {
        name: 'unlink_account',
        signature: 'unlink_account(account_id: int, provider: str) -> dict',
        description: 'Removes an OAuth provider link from an account.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'provider', type: 'str', required: true, description: 'Provider name.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "OAuth link removed successfully"}' }
      },
      {
        name: 'get_all',
        signature: 'get_all(page: int = 1, page_size: int = 10) -> list[dict]',
        description: 'Returns a paginated list of all OAuth link records.',
        parameters: [
          { name: 'page', type: 'int', required: false, default: '1', description: 'Page number.' },
          { name: 'page_size', type: 'int', required: false, default: '10', description: 'Items per page.' }
        ],
        returns: { type: 'list[dict]', description: 'OAuth records list.' }
      },
      {
        name: 'query',
        signature: 'query(field: str, value: str) -> list[dict]',
        description: 'Searches OAuth records by field ("id", "account_id", "provider_id").',
        parameters: [
          { name: 'field', type: 'str', required: true, description: 'Search field.' },
          { name: 'value', type: 'str', required: true, description: 'Search value.' }
        ],
        returns: { type: 'list[dict]', description: 'Matching OAuth records.' }
      }
    ],
    codeSnippet: `from usage import auth

# Link GitHub account manually
auth.oauth.link_account(account_id=1, provider="github", provider_user_id="1234567890")

# Unlink GitHub account
auth.oauth.unlink_account(account_id=1, provider="github")`
  },
  {
    id: 'google-oauth',
    title: 'Google OAuth Integration',
    module: 'auth.google',
    description: 'FastAPI routes for Google OpenID Connect flow, login redirects, and token exchange callbacks.',
    overview: `The \`auth.google\` module provides ready-to-use Google OAuth route handlers for FastAPI applications. It supports OpenID Connect profile retrieval, automatic account creation or linking, and session token redirection.`,
    content: `Make sure the redirect URI configured in \`auth.google.config\` matches the URI authorized in Google Cloud Console.`,
    methods: [
      {
        name: 'config',
        signature: 'config(client_id: str, client_secret: str, redirect_uri: str) -> dict',
        description: 'Configures Google OAuth app credentials.',
        parameters: [
          { name: 'client_id', type: 'str', required: true, description: 'Google OAuth Client ID.' },
          { name: 'client_secret', type: 'str', required: true, description: 'Google OAuth Client Secret.' },
          { name: 'redirect_uri', type: 'str', required: true, description: 'Authorized redirect URI.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "Google OAuth configured successfully"}' }
      },
      {
        name: 'load',
        signature: 'load() -> dict',
        description: 'Returns current Google OAuth credentials dictionary.',
        returns: { type: 'dict', description: '{"client_id": ..., "client_secret": ..., "redirect_uri": ...}' }
      },
      {
        name: 'login',
        signature: 'async login(request: Request, frontend_url: str) -> RedirectResponse',
        isAsync: true,
        description: 'Starts Google OAuth flow by saving frontend_url in session and redirecting user to Google consent screen.',
        parameters: [
          { name: 'request', type: 'starlette.requests.Request', required: true, description: 'FastAPI request instance.' },
          { name: 'frontend_url', type: 'str', required: true, description: 'Frontend URL to redirect to after authentication.' }
        ],
        returns: { type: 'RedirectResponse', description: 'RedirectResponse to Google OAuth consent screen.' }
      },
      {
        name: 'callback',
        signature: 'async callback(request: Request, ip_address: str = None, user_agent: str = None) -> RedirectResponse',
        isAsync: true,
        description: 'Handles OAuth code callback from Google, retrieves profile, creates session, and redirects to frontend with access_token.',
        parameters: [
          { name: 'request', type: 'starlette.requests.Request', required: true, description: 'FastAPI request instance.' },
          { name: 'ip_address', type: 'str', required: false, default: 'None', description: 'Client IP address.' },
          { name: 'user_agent', type: 'str', required: false, default: 'None', description: 'Client User-Agent.' }
        ],
        returns: { type: 'RedirectResponse', description: 'RedirectResponse to {frontend_url}/oauth/callback?access_token=...' }
      }
    ],
    codeSnippet: `from fastapi import FastAPI, Request
from usage import auth

app = FastAPI()

# Configure Google OAuth
auth.google.config(
    client_id="YOUR_GOOGLE_CLIENT_ID",
    client_secret="YOUR_GOOGLE_CLIENT_SECRET",
    redirect_uri="https://api.example.com/oauth/google/callback"
)

@app.get("/oauth/google/login")
async def google_login(request: Request):
    return await auth.google.login(request=request, frontend_url="https://app.example.com")

@app.get("/oauth/google/callback")
async def google_callback(request: Request):
    return await auth.google.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )`
  },
  {
    id: 'github-oauth',
    title: 'GitHub OAuth Integration',
    module: 'auth.github',
    description: 'FastAPI async handlers for GitHub OAuth flow, including primary verified email fallback resolution.',
    overview: `The \`auth.github\` module provides GitHub OAuth route handlers for FastAPI applications.`,
    content: `If a user's GitHub profile email is marked private, \`auth.github.callback\` automatically executes an authenticated sub-request to GET /user/emails on GitHub to resolve their primary verified email address before linking.`,
    methods: [
      {
        name: 'config',
        signature: 'config(client_id: str, client_secret: str, redirect_uri: str) -> dict',
        description: 'Configures GitHub OAuth credentials.',
        parameters: [
          { name: 'client_id', type: 'str', required: true, description: 'GitHub OAuth Client ID.' },
          { name: 'client_secret', type: 'str', required: true, description: 'GitHub OAuth Client Secret.' },
          { name: 'redirect_uri', type: 'str', required: true, description: 'Authorized callback URL.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "GitHub OAuth configured successfully"}' }
      },
      {
        name: 'load',
        signature: 'load() -> dict',
        description: 'Returns current GitHub OAuth credentials.',
        returns: { type: 'dict', description: '{"client_id": ..., "client_secret": ..., "redirect_uri": ...}' }
      },
      {
        name: 'login',
        signature: 'async login(request: Request, frontend_url: str) -> RedirectResponse',
        isAsync: true,
        description: 'Starts GitHub OAuth flow and redirects user to GitHub.',
        parameters: [
          { name: 'request', type: 'starlette.requests.Request', required: true, description: 'FastAPI request instance.' },
          { name: 'frontend_url', type: 'str', required: true, description: 'Frontend URL.' }
        ],
        returns: { type: 'RedirectResponse', description: 'RedirectResponse to GitHub.' }
      },
      {
        name: 'callback',
        signature: 'async callback(request: Request, ip_address: str = None, user_agent: str = None) -> RedirectResponse',
        isAsync: true,
        description: 'Handles code callback, resolves primary verified email, links account, and redirects to frontend with access_token.',
        parameters: [
          { name: 'request', type: 'starlette.requests.Request', required: true, description: 'FastAPI request instance.' },
          { name: 'ip_address', type: 'str', required: false, default: 'None', description: 'Client IP address.' },
          { name: 'user_agent', type: 'str', required: false, default: 'None', description: 'Client User-Agent.' }
        ],
        returns: { type: 'RedirectResponse', description: 'RedirectResponse to frontend callback URL.' }
      }
    ],
    codeSnippet: `from fastapi import FastAPI, Request
from connect import auth

app = FastAPI()

# Configure GitHub OAuth
auth.github.config(
    client_id="YOUR_GITHUB_CLIENT_ID",
    client_secret="YOUR_GITHUB_CLIENT_SECRET",
    redirect_uri="https://api.example.com/oauth/github/callback"
)

@app.get("/oauth/github/login")
async def github_login(request: Request):
    return await auth.github.login(request=request, frontend_url="https://app.example.com")

@app.get("/oauth/github/callback")
async def github_callback(request: Request):
    return await auth.github.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )`
  },
  {
    id: 'discord-oauth',
    title: 'Discord OAuth Integration',
    module: 'auth.discord',
    description: 'FastAPI async handlers for Discord OAuth 2.0 flow with identify/email scopes, CDN avatar URL resolution, and automated account linking.',
    overview: `The \`auth.discord\` module implements Discord OAuth2 authentication for FastAPI applications. It requests \`identify\` and \`email\` scopes, exchanges the code for access credentials at \`https://discord.com/api/oauth2/token\`, retrieves user profile data from \`https://discord.com/api/users/@me\`, resolves CDN avatar URLs (\`https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png\`), links or creates local user accounts, and returns standard Single or Dual tokens to the frontend callback.`,
    content: `Discord OAuth flow handles state validation for CSRF mitigation, automatic association with existing accounts sharing the verified email, and seamless redirection back to the frontend with access tokens and refresh tokens.`,
    schemas: [
      {
        title: 'Discord Profile Normalization Schema',
        description: 'Normalized user dictionary created by auth.discord.callback',
        json: `{
  "provider": "discord",
  "provider_user_id": "80351110224678912",
  "email": "gamer@example.com",
  "name": "Nighthawk",
  "avatar_url": "https://cdn.discordapp.com/avatars/80351110224678912/8342729096324a05a79303b806b65ee0.png",
  "verified": true
}`
      }
    ],
    methods: [
      {
        name: 'config',
        signature: 'config(client_id: str, client_secret: str, redirect_uri: str) -> dict',
        description: 'Configures Discord OAuth 2.0 application credentials.',
        parameters: [
          { name: 'client_id', type: 'str', required: true, description: 'Discord Application Client ID (Snowflake string).' },
          { name: 'client_secret', type: 'str', required: true, description: 'Discord Application Client Secret.' },
          { name: 'redirect_uri', type: 'str', required: true, description: 'Authorized redirect URL registered in the Discord Developer Portal.' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "Discord OAuth configured successfully"}' }
      },
      {
        name: 'load',
        signature: 'load() -> dict',
        description: 'Returns current Discord OAuth application configuration.',
        returns: { type: 'dict', description: '{"client_id": ..., "client_secret": ..., "redirect_uri": ...}' }
      },
      {
        name: 'login',
        signature: 'async login(request: Request, frontend_url: str) -> RedirectResponse',
        isAsync: true,
        description: 'Initiates Discord OAuth 2.0 flow with identify and email scopes and redirects the user to discord.com/oauth2/authorize.',
        parameters: [
          { name: 'request', type: 'starlette.requests.Request', required: true, description: 'FastAPI request instance.' },
          { name: 'frontend_url', type: 'str', required: true, description: 'Frontend application URL for final token redirect.' }
        ],
        returns: { type: 'RedirectResponse', description: 'RedirectResponse to Discord authorization consent screen.' }
      },
      {
        name: 'callback',
        signature: 'async callback(request: Request, ip_address: str = None, user_agent: str = None) -> RedirectResponse',
        isAsync: true,
        description: 'Handles Discord authorization code callback, resolves verified profile & CDN avatar, links or provisions account, and redirects to frontend with auth tokens.',
        parameters: [
          { name: 'request', type: 'starlette.requests.Request', required: true, description: 'FastAPI request instance containing code and state query params.' },
          { name: 'ip_address', type: 'str', required: false, default: 'None', description: 'Client IP address for audit trail.' },
          { name: 'user_agent', type: 'str', required: false, default: 'None', description: 'Client User-Agent for session record.' }
        ],
        returns: { type: 'RedirectResponse', description: 'RedirectResponse to frontend callback URL with access_token (and refresh_token if dual-token mode is active).' }
      }
    ],
    codeSnippet: `from fastapi import FastAPI, Request
from connect import auth

app = FastAPI()

# Configure Discord OAuth2
auth.discord.config(
    client_id="YOUR_DISCORD_CLIENT_ID",
    client_secret="YOUR_DISCORD_CLIENT_SECRET",
    redirect_uri="https://api.example.com/oauth/discord/callback"
)

@app.get("/oauth/discord/login")
async def discord_login(request: Request):
    return await auth.discord.login(request=request, frontend_url="https://app.example.com")

@app.get("/oauth/discord/callback")
async def discord_callback(request: Request):
    return await auth.discord.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )`
  },
  {
    id: 'deps',
    title: 'FastAPI Dependencies',
    module: 'auth.deps',
    description: 'FastAPI route injection dependencies for verifying JWT and active session state.',
    overview: `The \`auth.deps\` module provides direct FastAPI \`Depends()\` callables that verify JWT signatures AND validate active server-side database sessions simultaneously. Note: pass the dependency functions directly without parentheses, e.g. \`Depends(auth.deps.get_current)\`.`,
    content: `If a session was revoked in the database, these dependencies immediately reject the request even if the JWT signature is cryptographically valid.`,
    schemas: [
      {
        title: 'Complete Auth Context Schema',
        description: 'Object returned when using user = Depends(auth.deps.get_current)',
        json: `{
  "account": {
    "id": 1,
    "uid": "1d7d1310-13e5-4769-8511-d3bc837cf55f",
    "name": "Test User",
    "handle": "testuser",
    "email": "testuser@example.com",
    "role": "superadmin",
    "status": "active"
  },
  "session": {
    "id": 60,
    "account_id": 1,
    "ip_address": "127.0.0.1",
    "user_agent": "Mozilla/5.0",
    "expires_at": "2026-08-18T18:11:00"
  },
  "payload": {
    "aid": 1,
    "sid": 60,
    "exp": 1787129867
  }
}`
      }
    ],
    methods: [
      {
        name: 'get_current',
        signature: 'async get_current(request: Request, token: str = Depends(...)) -> dict',
        isAsync: true,
        description: 'FastAPI dependency that validates request authorization header and returns full auth context (account, session, payload). Passed directly to Depends: Depends(auth.deps.get_current).',
        returns: { type: 'dict', description: 'Full context dictionary: {"account": dict, "session": dict, "payload": dict}.' },
        exceptions: ['HTTPException(401): Missing or invalid Bearer authorization header or revoked session.']
      },
      {
        name: 'get_current_account',
        signature: 'async get_current_account(context: dict = Depends(get_current)) -> dict',
        isAsync: true,
        description: 'FastAPI dependency that injects only the authenticated account object. Used as Depends(auth.deps.get_current_account).',
        returns: { type: 'dict', description: 'Account dictionary.' }
      },
      {
        name: 'get_current_session',
        signature: 'async get_current_session(context: dict = Depends(get_current)) -> dict',
        isAsync: true,
        description: 'FastAPI dependency that injects only the active session object. Used as Depends(auth.deps.get_current_session).',
        returns: { type: 'dict', description: 'Session dictionary.' }
      },
      {
        name: 'get_current_payload',
        signature: 'async get_current_payload(context: dict = Depends(get_current)) -> dict',
        isAsync: true,
        description: 'FastAPI dependency that injects only the verified JWT decoded payload dictionary. Used as Depends(auth.deps.get_current_payload).',
        returns: { type: 'dict', description: 'Payload dictionary: {"aid": int, "sid": int, "exp": int}.' }
      }
    ],
    codeSnippet: `from fastapi import FastAPI, Depends
from connect import auth

app = FastAPI()

# Protected route using full auth context (passed WITHOUT parentheses)
@app.get("/me")
def fetch_me(user=Depends(auth.deps.get_current)):
    return user

# Protected route using account only
@app.get("/me/account")
def fetch_account(account=Depends(auth.deps.get_current_account)):
    return account`
  },
  {
    id: 'roles',
    title: 'Role Authorization',
    module: 'auth.role',
    description: 'FastAPI route protection dependencies for Role-Based Access Control (RBAC).',
    overview: `The \`auth.role\` module provides authorization dependency factories that execute AFTER authentication passes. It enforces role requirements (e.g. "admin", "moderator", "user"). Note: these are factory functions called with parameters inside Depends: \`Depends(auth.role.require("admin"))\`.`,
    content: `If the user's role does not satisfy the constraint, the route raises a 403 PermissionDeniedError.`,
    methods: [
      {
        name: 'require',
        signature: 'require(role: str) -> Callable',
        description: 'Allows access ONLY if authenticated account role matches the specified string exactly.',
        parameters: [
          { name: 'role', type: 'str', required: true, description: 'Required role string (e.g. "admin").' }
        ],
        returns: { type: 'Callable', description: 'FastAPI dependency function.' },
        exceptions: ['PermissionDeniedError: Account role does not match required role.']
      },
      {
        name: 'allow',
        signature: 'allow(*roles: str) -> Callable',
        description: 'Allows access if account role matches ANY of the listed roles.',
        parameters: [
          { name: '*roles', type: 'str (varargs)', required: true, description: 'Allowed role strings (e.g. "admin", "moderator").' }
        ],
        returns: { type: 'Callable', description: 'FastAPI dependency function.' },
        exceptions: ['PermissionDeniedError: Account role is not in allowed list.']
      },
      {
        name: 'block',
        signature: 'block(*roles: str) -> Callable',
        description: 'Denies access if account role matches ANY of the listed roles.',
        parameters: [
          { name: '*roles', type: 'str (varargs)', required: true, description: 'Blocked role strings.' }
        ],
        returns: { type: 'Callable', description: 'FastAPI dependency function.' },
        exceptions: ['PermissionDeniedError: Account role is in blocked list.']
      }
    ],
    codeSnippet: `from fastapi import FastAPI, Depends
from connect import auth

app = FastAPI()

# Only "admin" role allowed (factory called WITH parentheses)
@app.get("/admin/dashboard")
def admin_route(user=Depends(auth.role.require("admin"))):
    return user

# "admin" OR "moderator" allowed
@app.get("/moderation")
def staff_route(user=Depends(auth.role.allow("admin", "moderator"))):
    return user`
  },
  {
    id: 'status',
    title: 'Status Authorization',
    module: 'auth.status',
    description: 'FastAPI route protection dependencies based on user account status (e.g. active, pending, suspended).',
    overview: `The \`auth.status\` module provides authorization dependencies based on the account's \`status\` field.`,
    content: `Use status dependencies to block suspended or inactive accounts from reaching sensitive routes.`,
    methods: [
      {
        name: 'require',
        signature: 'require(status: str) -> Callable',
        description: 'Allows access ONLY if authenticated account status matches specified string.',
        parameters: [
          { name: 'status', type: 'str', required: true, description: 'Required status (e.g. "active").' }
        ],
        returns: { type: 'Callable', description: 'FastAPI dependency function.' },
        exceptions: ['PermissionDeniedError: Account status does not match required status.']
      },
      {
        name: 'allow',
        signature: 'allow(*statuses: str) -> Callable',
        description: 'Allows access if account status matches ANY of the specified statuses.',
        parameters: [
          { name: '*statuses', type: 'str (varargs)', required: true, description: 'Allowed statuses.' }
        ],
        returns: { type: 'Callable', description: 'FastAPI dependency function.' },
        exceptions: ['PermissionDeniedError: Account status is not in allowed list.']
      },
      {
        name: 'block',
        signature: 'block(*statuses: str) -> Callable',
        description: 'Denies access if account status matches ANY of the specified statuses.',
        parameters: [
          { name: '*statuses', type: 'str (varargs)', required: true, description: 'Blocked statuses.' }
        ],
        returns: { type: 'Callable', description: 'FastAPI dependency function.' },
        exceptions: ['PermissionDeniedError: Account status is in blocked list.']
      }
    ],
    codeSnippet: `from fastapi import FastAPI, Depends
from connect import auth

app = FastAPI()

# Block suspended accounts
@app.get("/protected")
def protected_route(user=Depends(auth.status.block("suspended", "inactive"))):
    return user`
  },
  {
    id: 'jwt',
    title: 'JWT API',
    module: 'auth.jwt',
    description: 'Cryptographic JSON Web Token creation, signature verification, algorithm configuration, and payload decoding.',
    overview: `The \`auth.jwt\` module manages cryptographic JWT keys, token creation, and payload verification.`,
    content: `All access tokens generated by \`tc_auth\` are signed using the secret key configured in \`auth.jwt.config()\`.`,
    schemas: [
      {
        title: 'JWT Configuration Schema',
        description: 'Returned by auth.jwt.load()',
        json: `{
  "secret_key": "your-super-secret-key",
  "algorithm": "HS256",
  "session_duration_days": 1
}`
      },
      {
        title: 'Verified JWT Payload Schema',
        description: 'Decoded payload returned by auth.jwt.verify_token()',
        json: `{
  "aid": 1,
  "sid": 60,
  "exp": 1787129867
}`
      }
    ],
    methods: [
      {
        name: 'config',
        signature: 'config(secret_key: str, algorithm: str = "HS256", session_duration_days: int = 7, dual_token_mode: bool = True, access_token_expire_minutes: int = 15, refresh_token_expire_days: int = 30) -> dict',
        description: 'Configures JWT signing parameters and toggles Single-Token vs Dual-Token mode.',
        parameters: [
          { name: 'secret_key', type: 'str', required: true, description: 'Secret key string.' },
          { name: 'algorithm', type: 'str', required: false, default: '"HS256"', description: 'HMAC algorithm (HS256, HS384, HS512).' },
          { name: 'session_duration_days', type: 'int', required: false, default: '7', description: 'Token expiration duration in days (for single token mode).' },
          { name: 'dual_token_mode', type: 'bool', required: false, default: 'True', description: 'Enables short-lived access tokens with rotating refresh tokens.' },
          { name: 'access_token_expire_minutes', type: 'int', required: false, default: '15', description: 'Access token expiration in minutes (dual token mode).' },
          { name: 'refresh_token_expire_days', type: 'int', required: false, default: '30', description: 'Refresh token lifetime in days (dual token mode).' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "JWT configured successfully"}' }
      },
      {
        name: 'load',
        signature: 'load() -> dict',
        description: 'Returns current JWT configuration.',
        returns: { type: 'dict', description: '{"secret_key": ..., "algorithm": ..., "session_duration_days": ..., "dual_token_mode": ...}' }
      },
      {
        name: 'create_access_token',
        signature: 'create_access_token(data: dict) -> str',
        description: 'Signs and encodes a payload dictionary into a JWT string.',
        parameters: [
          { name: 'data', type: 'dict', required: true, description: 'Claims payload (e.g. {"aid": 1, "sid": 60}).' }
        ],
        returns: { type: 'str', description: 'Signed JWT string.' }
      },
      {
        name: 'verify_token',
        signature: 'verify_token(token: str) -> dict',
        description: 'Verifies JWT signature and expiration claim.',
        parameters: [
          { name: 'token', type: 'str', required: true, description: 'Encoded JWT string.' }
        ],
        returns: { type: 'dict', description: 'Decoded payload dictionary.' },
        exceptions: ['InvalidTokenError: Signature verification failed or token is expired.']
      },
      {
        name: 'rotate_refresh_token',
        signature: 'rotate_refresh_token(refresh_token: str) -> dict',
        description: 'Validates and invalidates single-use refresh token, issuing a new access token and rotated refresh token.',
        parameters: [
          { name: 'refresh_token', type: 'str', required: true, description: 'Single-use refresh token string.' }
        ],
        returns: { type: 'dict', description: '{"access_token": "...", "refresh_token": "...", "token_type": "Bearer"}' },
        exceptions: ['InvalidTokenError: Expired, invalid, or replayed refresh token.']
      },
      {
        name: 'verify_refresh_token',
        signature: 'verify_refresh_token(refresh_token: str) -> dict',
        description: 'Verifies refresh token active status and retrieves associated session metadata without revoking it.',
        parameters: [
          { name: 'refresh_token', type: 'str', required: true, description: 'Refresh token string.' }
        ],
        returns: { type: 'dict', description: 'Refresh token session information.' }
      }
    ],
    codeSnippet: `from connect import auth

# Configure JWT with Dual-Token Mode
auth.jwt.config(
    secret_key="supersecretkey",
    algorithm="HS256",
    session_duration_days=7,
    dual_token_mode=True,
    access_token_expire_minutes=15,
    refresh_token_expire_days=30
)

# Create Access Token
token = auth.jwt.create_access_token(data={"aid": 1, "sid": 60})

# Verify Token
payload = auth.jwt.verify_token(token=token)

# Rotate Refresh Token on Renewal
fresh_tokens = auth.jwt.rotate_refresh_token(refresh_token="tc_jwt_ref_example")`
  },
  {
    id: 'token-architecture',
    title: 'Single vs Dual Token Modes & Token Rotation',
    module: 'auth.jwt (Token Architecture)',
    description: 'Deep-dive architectural guide comparing Single-Token and Dual-Token modes, token rotation mechanics, reuse detection, and Axios retry queues.',
    overview: `tc_auth natively supports two distinct token lifecycle architectures:

1. Single-Token Mode:
   A lightweight session architecture using a single long-lived JWT access token (e.g. 7 days). Eliminates database lookups for token renewal and reduces network overhead. Ideal for simple SPAs, microservices, and internal tools where stateless tokens are preferred.

2. Dual-Token Mode (Recommended for Production Web & Mobile):
   Combines short-lived access tokens (e.g. 15 minutes) with rotating, database-backed refresh tokens (e.g. 30 days). When the access token expires, the client's HTTP interceptor silently exchanges the refresh token for a fresh access token and a newly rotated refresh token without interrupting the user session.`,
    content: `Token Rotation & Reuse Attack Mitigation:
- Each refresh token is strictly single-use.
- Upon successful exchange at POST /token/refresh, the presented refresh token is immediately invalidated in the database, and a brand-new cryptographically random refresh token is issued.
- If a previously invalidated refresh token is ever presented again (replay attack or compromised credential), tc_auth immediately revokes all active sessions and refresh tokens associated with that user account to prevent unauthorized access.
- In the frontend client (apiClient.ts), an Axios interceptor maintains a request queue during active refresh calls to prevent multiple concurrent refresh requests from colliding (thundering herd protection).`,
    schemas: [
      {
        title: 'Single-Token Mode Auth Response Schema',
        description: 'Returned by login/signup endpoints when dual_token_mode is False',
        json: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOjEsInNpZCI6NjAsImV4cCI6MTc4NzEyOTg2N30...",
  "token_type": "Bearer",
  "account": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}`
      },
      {
        title: 'Dual-Token Mode Auth Response Schema',
        description: 'Returned by login/signup endpoints when dual_token_mode is True',
        json: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOjEsInNpZCI6NjAsImV4cCI6MTc4NzEyOTg2N30...",
  "refresh_token": "tc_jwt_ref_9a8b7c6d5e4f3a2b1c0d",
  "token_type": "Bearer",
  "account": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}`
      },
      {
        title: 'Token Refresh Endpoint Response Schema (POST /token/refresh)',
        description: 'Response payload after rotating the refresh token',
        json: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOjEsInNpZCI6NjEsImV4cCI6MTc4NzEzMDc2N30...",
  "refresh_token": "tc_jwt_ref_fresh_new_random_token_string",
  "token_type": "Bearer"
}`
      }
    ],
    methods: [
      {
        name: 'config',
        signature: 'config(secret_key: str, algorithm: str = "HS256", session_duration_days: int = 7, dual_token_mode: bool = True, access_token_expire_minutes: int = 15, refresh_token_expire_days: int = 30) -> dict',
        description: 'Configures JWT parameters and toggles between Single-Token and Dual-Token modes.',
        parameters: [
          { name: 'secret_key', type: 'str', required: true, description: 'HMAC secret key used for signing and verifying tokens.' },
          { name: 'algorithm', type: 'str', required: false, default: '"HS256"', description: 'Cryptographic algorithm (HS256, HS384, HS512).' },
          { name: 'session_duration_days', type: 'int', required: false, default: '7', description: 'Expiration duration for single-token access JWTs (days).' },
          { name: 'dual_token_mode', type: 'bool', required: false, default: 'True', description: 'If True, enables short-lived access tokens + rotating refresh tokens. If False, operates in single-token mode.' },
          { name: 'access_token_expire_minutes', type: 'int', required: false, default: '15', description: 'Short-lived access token expiration duration (minutes).' },
          { name: 'refresh_token_expire_days', type: 'int', required: false, default: '30', description: 'Database-backed refresh token expiration duration (days).' }
        ],
        returns: { type: 'dict', description: '{"success": True, "message": "JWT and token mode configured successfully"}' }
      },
      {
        name: 'rotate_refresh_token',
        signature: 'rotate_refresh_token(refresh_token: str) -> dict',
        description: 'Verifies the supplied refresh token, revokes it in the database, generates a fresh access token and rotated refresh token.',
        parameters: [
          { name: 'refresh_token', type: 'str', required: true, description: 'Active single-use refresh token.' }
        ],
        returns: { type: 'dict', description: '{"access_token": "...", "refresh_token": "...", "token_type": "Bearer"}' },
        exceptions: [
          'InvalidTokenError: Refresh token is invalid or expired.',
          'TokenReuseError: Refresh token was already used; account sessions revoked for security.'
        ]
      },
      {
        name: 'verify_refresh_token',
        signature: 'verify_refresh_token(refresh_token: str) -> dict',
        description: 'Validates refresh token existence and status in database without consuming/rotating it.',
        parameters: [
          { name: 'refresh_token', type: 'str', required: true, description: 'Refresh token string to inspect.' }
        ],
        returns: { type: 'dict', description: 'Refresh token record with account_id and expiry.' }
      }
    ],
    codeSnippet: `from fastapi import FastAPI, HTTPException, Depends
from connect import auth
from pydantic import BaseModel

app = FastAPI()

# 1. Configure Dual-Token Mode (Short-lived access + rotating refresh)
auth.jwt.config(
    secret_key="production_super_secret_key",
    algorithm="HS256",
    dual_token_mode=True,
    access_token_expire_minutes=15,
    refresh_token_expire_days=30
)

# 2. Refresh Endpoint for Client Token Rotation
class RefreshRequest(BaseModel):
    refresh_token: str

@app.post("/token/refresh")
async def refresh_tokens(payload: RefreshRequest):
    try:
        tokens = auth.jwt.rotate_refresh_token(refresh_token=payload.refresh_token)
        return tokens
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))`
  },
  {
    id: 'sdk-cookie',
    title: 'Cookie Configuration Subsystem',
    module: 'auth.cookie',
    description: 'Configure and manage HttpOnly session cookies for browser-based authentication, dual-mode token extraction, and cross-site cookie policies.',
    overview: `The \`auth.cookie\` subsystem allows backend services to toggle between \`localStorage\` mode (default, Bearer tokens) and \`Cookie\` mode (secure, HttpOnly session cookies). When \`cookie_mode=True\`, authentication and refresh endpoints automatically attach secure \`Set-Cookie\` headers on responses, and dependencies seamlessly extract tokens from cookies when the \`Authorization\` header is absent.`,
    content: `# Cookie Configuration Subsystem (\`auth.cookie\`)

## Overview

\`tc_auth\` provides a unified Cookie Configuration Subsystem allowing backends to switch between:
1. **Default Mode (\`cookie_mode = False\`)**: Pure \`localStorage\` mode. Tokens are returned in JSON response bodies and query parameters; requests use \`Authorization: Bearer <token>\`.
2. **Cookie Mode (\`cookie_mode = True\`)**: The backend sets secure, \`HttpOnly\` cookies (\`access_token\` and optional \`refresh_token\`). Browsers automatically transport cookies via \`credentials: "include"\`.

Both modes maintain **100% backwards compatibility** — if an incoming request provides an \`Authorization: Bearer <token>\` header, it is always preferred over cookie extraction.

---

## Configuration Reference

\`\`\`python
auth.cookie.config(
    cookie_mode=True,                     # Toggle cookie mode (default: False)
    access_cookie_name="access_token",    # Cookie name for access token
    refresh_cookie_name="refresh_token",  # Cookie name for refresh token
    path="/",                             # Cookie path scope
    domain=None,                          # Optional domain (e.g. ".example.com")
    secure=True,                          # Set True in production (HTTPS)
    httponly=True,                        # Prevent JavaScript access (XSS protection)
    samesite="lax",                       # "lax", "strict", or "none"
    max_age=None                          # Max-Age in seconds (None = auto-sync with JWT duration)
)
\`\`\``,
    schemas: [
      {
        title: 'Cookie Configuration Schema',
        description: 'Parameters accepted by auth.cookie.config and returned by /config/load',
        json: `{
  "cookie_mode": true,
  "access_cookie_name": "access_token",
  "refresh_cookie_name": "refresh_token",
  "path": "/",
  "domain": null,
  "secure": false,
  "httponly": true,
  "samesite": "lax",
  "max_age": null
}`
      }
    ],
    methods: [
      {
        name: 'config',
        signature: 'auth.cookie.config(cookie_mode: bool = False, access_cookie_name: str = "access_token", refresh_cookie_name: str = "refresh_token", path: str = "/", domain: str = None, secure: bool = False, httponly: bool = True, samesite: str = "lax", max_age: int = None)',
        description: 'Configures runtime cookie parameters for token setting, clearing, and extraction.',
        isAsync: false,
        parameters: [
          { name: 'cookie_mode', type: 'bool', required: false, default: 'False', description: 'Enable HttpOnly session cookie attachment.' },
          { name: 'access_cookie_name', type: 'str', required: false, default: '"access_token"', description: 'Name of the access token cookie.' },
          { name: 'refresh_cookie_name', type: 'str', required: false, default: '"refresh_token"', description: 'Name of the refresh token cookie.' },
          { name: 'path', type: 'str', required: false, default: '"/"', description: 'Cookie path scope.' },
          { name: 'domain', type: 'str | None', required: false, default: 'None', description: 'Optional cross-subdomain cookie domain.' },
          { name: 'secure', type: 'bool', required: false, default: 'False', description: 'Requires HTTPS transmission (set True in production).' },
          { name: 'httponly', type: 'bool', required: false, default: 'True', description: 'Prevents client JavaScript access.' },
          { name: 'samesite', type: 'str', required: false, default: '"lax"', description: 'SameSite policy: "lax", "strict", or "none".' },
          { name: 'max_age', type: 'int | None', required: false, default: 'None', description: 'Optional explicit cookie lifetime in seconds.' }
        ],
        returns: { type: 'dict', description: 'Active cookie configuration dictionary.' },
        example: `auth.cookie.config(cookie_mode=True, secure=True, httponly=True, samesite="lax")`
      },
      {
        name: 'set_cookies',
        signature: 'auth.cookie.set_cookies(response: Response, access_token: str, refresh_token: str = None)',
        description: 'Attaches configured Set-Cookie headers for access token and optional refresh token to FastAPI Response.',
        isAsync: false,
        parameters: [
          { name: 'response', type: 'fastapi.Response', required: true, description: 'Outgoing HTTP response object.' },
          { name: 'access_token', type: 'str', required: true, description: 'JWT access token string.' },
          { name: 'refresh_token', type: 'str | None', required: false, default: 'None', description: 'Rotating refresh token string if dual token mode is active.' }
        ],
        returns: { type: 'None', description: 'Modifies response headers in-place.' },
        example: `@app.post("/login")
async def login(res: Response):
    token_data = auth.service.login_password(email="user@test.com", password="pwd", response=res)
    return token_data`
      },
      {
        name: 'clear_cookies',
        signature: 'auth.cookie.clear_cookies(response: Response)',
        description: 'Sets expired Max-Age=0 Set-Cookie headers to destroy session cookies in user browser.',
        isAsync: false,
        parameters: [
          { name: 'response', type: 'fastapi.Response', required: true, description: 'Outgoing HTTP response object.' }
        ],
        returns: { type: 'None', description: 'Modifies response headers in-place.' },
        example: `@app.post("/logout")
async def logout(res: Response):
    auth.cookie.clear_cookies(res)
    return {"success": True, "message": "Logged out"}`
      }
    ],
    codeSnippet: `from fastapi import FastAPI, Response, Request
from connect import auth

app = FastAPI()

# Enable Cookie Mode
auth.cookie.config(
    cookie_mode=True,
    secure=True,
    httponly=True,
    samesite="lax"
)

auth.include_routes(app)`
  },
  {
    id: 'frontend-token-guide',
    title: 'Frontend Token Guide: Single & Dual Modes',
    module: 'Frontend Integration (Axios & Fetch)',
    description: 'Comprehensive, production-ready integration pattern for frontend applications (React, Next.js, Vue, Axios, Fetch) to seamlessly handle both Single-Token Mode and Dual-Token Mode with tc_auth.',
    overview: `tc_auth supports two distinct authentication token paradigms: Single-Token Mode (default 7-day access token with zero refresh overhead) and Dual-Token Mode (15-minute short-lived access token paired with rotating 7-to-30 day refresh tokens).

A robust frontend application should be adaptive — automatically utilizing refresh tokens when provided by the backend, while gracefully falling back to standard single-token behavior when refresh tokens are absent.`,
    content: `# Frontend Token Usage Guide: Single-Token & Dual-Token Modes

This guide provides a comprehensive, production-ready integration pattern for frontend applications (React, Next.js, Vue, Vanilla JS, Axios, Fetch) to seamlessly handle **both Single-Token Mode and Dual-Token Mode** with \`tc_auth\`.

---

## 1. Overview: Single-Token vs. Dual-Token Mode

| Feature | Single-Token Mode (Default) | Dual-Token Mode (Enabled via \`dual_token_mode=True\`) |
| :--- | :--- | :--- |
| **Access Token** | Long-lived (default 7 days) | Short-lived (default 15 minutes) |
| **Refresh Token** | *None* | Long-lived (default 7 days) |
| **Protected Requests** | \`Authorization: Bearer <access_token>\` | \`Authorization: Bearer <access_token>\` |
| **Token Expiry Behavior** | Redirect to \`/login\` when token expires (HTTP 401) | Auto-refresh access token via \`POST /tc-auth/token/refresh\` without logging user out |
| **OAuth Callback URL** | \`?access_token=...\` | \`?access_token=...&refresh_token=...\` |
| **Login/Signup Response** | \`{ "access_token": "...", "account": {...} }\` | \`{ "access_token": "...", "refresh_token": "...", "account": {...} }\` |

---

## 2. Universal Frontend Strategy

A robust frontend application should be **adaptive** — automatically utilizing refresh tokens when provided by the backend, while gracefully falling back to standard single-token behavior when refresh tokens are absent.

\`\`\`
                  ┌─────────────────────────────────┐
                  │ User Logs In / OAuth Callback   │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                   Does response have \`refresh_token\`?
                                   │
                   ┌───────────────┴───────────────┐
                   ▼ YES                           ▼ NO
        ┌──────────────────────┐        ┌──────────────────────┐
        │ Dual-Token Active    │        │ Single-Token Active  │
        │ - Store access_token │        │ - Store access_token │
        │ - Store refresh_token│        │ - No refresh needed  │
        └──────────┬───────────┘        └──────────┬───────────┘
                   │                               │
                   ▼                               ▼
        ┌──────────────────────────────────────────────────────┐
        │ Outgoing API Requests: \`Authorization: Bearer token\` │
        └──────────────────────────┬───────────────────────────┘
                                   │
                                   ▼
                       API Returns HTTP 401?
                                   │
                   ┌───────────────┴───────────────┐
                   ▼ YES                           ▼ NO
          Is \`refresh_token\` available?         Request Succeeded (200 OK)
                   │
         ┌─────────┴─────────┐
         ▼ YES               ▼ NO
  ┌───────────────┐   ┌──────────────────────┐
  │ Call /refresh │   │ Clear tokens         │
  │ Replay Request│   │ Redirect to \`/login\` │
  └───────────────┘   └──────────────────────┘
\`\`\`

---

## 3. Universal Axios Implementation (Recommended)

This client handles:
1. Automatic token attachment on all outgoing requests.
2. Intercepting \`401 Unauthorized\` errors.
3. **Queue / Mutex Lock**: If multiple API requests fail with 401 at the same time, only **one** refresh request is sent; all other pending requests wait and replay automatically once the new token arrives.
4. Automatic fallback if in Single-Token Mode or if the refresh token expires.

\`\`\`typescript
// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com/tc-auth";

// Token storage helpers
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem("access_token"),
  getRefreshToken: () => localStorage.getItem("refresh_token"),
  setTokens: (accessToken: string, refreshToken?: string | null) => {
    localStorage.setItem("access_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
  },
  clearTokens: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
  hasRefreshToken: () => Boolean(localStorage.getItem("refresh_token")),
};

// Create Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle 401 & Concurrent Token Refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check if error is 401 and request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = tokenStorage.getRefreshToken();

      // Case A: Single-Token Mode (No refresh token exists) OR Refresh Endpoint itself failed
      if (!refreshToken || originalRequest.url?.includes("/token/refresh")) {
        tokenStorage.clearTokens();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=true";
        }
        return Promise.reject(error);
      }

      // Case B: Dual-Token Mode (Refresh token exists)
      if (isRefreshing) {
        // Queue concurrent requests while token is refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = \`Bearer \${token}\`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call token refresh endpoint
        const response = await axios.post(\`\${API_BASE_URL}/token/refresh\`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Store refreshed tokens
        tokenStorage.setTokens(access_token, newRefreshToken);

        // Update default header and original request header
        apiClient.defaults.headers.common["Authorization"] = \`Bearer \${access_token}\`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = \`Bearer \${access_token}\`;
        }

        processQueue(null, access_token);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        tokenStorage.clearTokens();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=true";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
\`\`\`

---

## 4. Universal Native Fetch Implementation

If you prefer lightweight \`fetch\` without third-party dependencies:

\`\`\`typescript
// src/api/fetchClient.ts
const API_BASE_URL = "https://api.example.com/tc-auth";

interface RequestOptions extends RequestInit {
  _retry?: boolean;
}

export async function customFetch(endpoint: string, options: RequestOptions = {}): Promise<Response> {
  let accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", \`Bearer \${accessToken}\`);
  }

  let response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized
  if (response.status === 401 && !options._retry) {
    // If dual-token mode is active and we have a refresh token:
    if (refreshToken && !endpoint.includes("/token/refresh")) {
      options._retry = true;

      try {
        const refreshRes = await fetch(\`\${API_BASE_URL}/token/refresh\`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem("access_token", data.access_token);
          if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token);
          }

          // Retry original request with newly issued token
          headers.set("Authorization", \`Bearer \${data.access_token}\`);
          return fetch(\`\${API_BASE_URL}\${endpoint}\`, {
            ...options,
            headers,
          });
        }
      } catch (e) {
        console.error("Token refresh failed:", e);
      }
    }

    // Single-token mode OR refresh failed -> clear & redirect
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }

  return response;
}
\`\`\`

---

## 5. Handling Logins & Signups

Store tokens dynamically regardless of single or dual-token mode:

\`\`\`typescript
// Handle Password Login, OTP Login, or Signup
async function handleLoginResponse(responsePayload: {
  access_token: string;
  refresh_token?: string;
  account: any;
}) {
  // 1. Always store access_token
  localStorage.setItem("access_token", responsePayload.access_token);

  // 2. If dual-token mode is active, store refresh_token; otherwise clear any old refresh_token
  if (responsePayload.refresh_token) {
    localStorage.setItem("refresh_token", responsePayload.refresh_token);
  } else {
    localStorage.removeItem("refresh_token");
  }

  // 3. Navigate to app dashboard
  window.location.href = "/dashboard";
}
\`\`\`

---

## 6. Handling OAuth Callbacks (Google, GitHub, Discord)

When the user completes OAuth login, the backend redirects the browser back to \`{frontend_url}/oauth/callback\` with query parameters.

### Query Parameter Shapes:
- **Single-Token Mode**: \`https://app.example.com/oauth/callback?access_token=eyJhbGci...\`
- **Dual-Token Mode**: \`https://app.example.com/oauth/callback?access_token=eyJhbGci...&refresh_token=eyJhbGci...\`
- **Account Linking**: \`https://app.example.com/oauth/callback?linked=true&provider=google\`

### React Router / Next.js Callback Router:

\`\`\`tsx
// src/pages/OAuthCallback.tsx or app/oauth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const linked = searchParams.get("linked");
    const provider = searchParams.get("provider");
    const error = searchParams.get("error");

    // Case 1: Successful Login or Signup
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      } else {
        localStorage.removeItem("refresh_token");
      }

      // Clean query parameters from URL history for security
      window.history.replaceState({}, document.title, window.location.pathname);
      router.replace("/dashboard");
      return;
    }

    // Case 2: Successful Secondary Account Linking
    if (linked === "true") {
      router.replace(\`/settings/security?linked=true&provider=\${provider}\`);
      return;
    }

    // Case 3: Linking or Auth Error
    if (error || linked === "false") {
      router.replace(\`/settings/security?error=\${encodeURIComponent(error || "Linking failed")}\`);
      return;
    }

    router.replace("/login");
  }, [searchParams, router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Authenticating, please wait...</p>
    </div>
  );
}
\`\`\`

---

## 7. Logout Strategy

When logging out, destroy the server session and clear all local tokens:

\`\`\`typescript
async function logout() {
  const accessToken = localStorage.getItem("access_token");

  try {
    if (accessToken) {
      await fetch("https://api.example.com/tc-auth/logout", {
        method: "POST",
        headers: {
          Authorization: \`Bearer \${accessToken}\`,
        },
      });
    }
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    // Clear both tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  }
}
\`\`\`

---

## 8. Summary Checklist for Frontend Teams

1. **Always send \`Authorization: Bearer <access_token>\`**: Never send the \`refresh_token\` in \`Authorization\` headers (doing so triggers a \`401 Unauthorized\` security rejection).
2. **Dynamically check for \`refresh_token\`**: If present, persist it and enable auto-refresh on 401; if absent, treat as Single-Token Mode.
3. **Queue simultaneous requests**: Use the Axios response interceptor with request queuing to prevent multiple parallel \`/token/refresh\` calls when several components fetch on mount.
4. **Clean OAuth callback URLs**: Use \`window.history.replaceState\` or client-side navigation (\`router.replace\`) immediately after reading tokens to prevent tokens leaking in browser history or referrer headers.
5. **Handle Refresh Token Rotation**: Whenever \`/token/refresh\` returns a new \`refresh_token\`, update \`localStorage\` with the new value.`,
    schemas: [
      {
        title: 'Single-Token vs Dual-Token Response Schemas',
        description: 'Returned by login/signup endpoints based on dual_token_mode configuration',
        json: `// Single-Token Mode Response (dual_token_mode=False)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "account": {
    "id": "acc_101",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}

// Dual-Token Mode Response (dual_token_mode=True)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "tc_jwt_ref_9a8b7c6d5e4f3a2b1c0d",
  "token_type": "Bearer",
  "account": {
    "id": "acc_101",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}`
      },
      {
        title: 'POST /token/refresh Payload & Rotated Response',
        description: 'Exchanging refresh token for a fresh access token and rotated refresh token',
        json: `// Request: POST /tc-auth/token/refresh
{
  "refresh_token": "tc_jwt_ref_9a8b7c6d5e4f3a2b1c0d"
}

// Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fresh_access_token...",
  "refresh_token": "tc_jwt_ref_new_rotated_single_use_token_string",
  "token_type": "Bearer"
}`
      }
    ],
    methods: [
      {
        name: 'tokenStorage.setTokens',
        signature: 'setTokens(accessToken: string, refreshToken?: string | null): void',
        description: 'Stores access_token and conditionally stores or clears refresh_token based on Single vs Dual mode.',
        isAsync: false,
        parameters: [
          { name: 'accessToken', type: 'string', required: true, description: 'JWT Bearer access token string.' },
          { name: 'refreshToken', type: 'string | null', required: false, description: 'Rotating refresh token string if present; if omitted, clears any existing refresh token.' }
        ],
        returns: { type: 'void', description: 'Synchronously sets localStorage values.' },
        notes: 'Guarantees that switching between dual and single token modes never leaves orphaned refresh tokens.',
        example: `tokenStorage.setTokens(response.access_token, response.refresh_token);`
      },
      {
        name: 'apiClient.interceptors.response',
        signature: 'apiClient.interceptors.response.use(onSuccess, onErrorWithQueue)',
        description: 'Axios response interceptor that catches 401 errors, checks for refresh_token, queues concurrent requests, calls /token/refresh once, and replays all failed requests with the new token.',
        isAsync: true,
        parameters: [
          { name: 'error', type: 'AxiosError', required: true, description: 'Intercepted HTTP error object.' }
        ],
        returns: { type: 'Promise<AxiosResponse>', description: 'Replayed request resolving to original expected response.' },
        notes: 'Features a queue / mutex lock to prevent the Thundering Herd problem when multiple components mount concurrently.',
        example: `// Concurrent requests waiting for refresh token replay automatically
const [profile, settings, stats] = await Promise.all([
  apiClient.get('/me'),
  apiClient.get('/settings'),
  apiClient.get('/stats')
]);`
      },
      {
        name: 'customFetch',
        signature: 'customFetch(endpoint: string, options?: RequestOptions): Promise<Response>',
        description: 'Zero-dependency native fetch wrapper supporting Bearer authorization and 401 auto-retry with token refresh.',
        isAsync: true,
        parameters: [
          { name: 'endpoint', type: 'string', required: true, description: 'API relative path (e.g. /account/me).' },
          { name: 'options', type: 'RequestOptions', required: false, description: 'Standard Fetch RequestInit options.' }
        ],
        returns: { type: 'Promise<Response>', description: 'Native fetch Response.' },
        example: `const res = await customFetch('/account/me');
const data = await res.json();`
      }
    ],
    codeSnippet: `// Quick Reference: Adaptive Login Token Storing
export async function handleLogin(credentials: { email: string; password: string }) {
  const res = await apiClient.post('/login/password', credentials);
  const { access_token, refresh_token, account } = res.data;

  // Single or Dual Mode: tokenStorage handles both automatically
  tokenStorage.setTokens(access_token, refresh_token);
  return account;
}`
  },
  {
    id: 'magic-link-guide',
    title: 'Magic Link Authentication System',
    module: 'Authentication & OTP Extension',
    description: 'Seamless passwordless authentication built directly on top of the battle-tested OTP infrastructure with zero redundant tables, bot-safe verification, and instant browser redirection.',
    overview: `The Magic Link system in tc_auth provides seamless, passwordless authentication built directly on top of the core OTP infrastructure.

Instead of introducing redundant database tables or conflicting token stores, Magic Links utilize the core OTP table (identifier, purpose, code_hash, expires_at, attempts) and OTPService. This provides a unified lifecycle for email codes and one-click login links.`,
    content: `# Magic Link Authentication System

The **Magic Link** system in \`tc_auth\` provides seamless, passwordless authentication built directly on top of the battle-tested email OTP infrastructure.

Instead of introducing redundant database tables or conflicting token stores, Magic Links utilize the core \`OTP\` table (\`identifier\`, \`purpose\`, \`code_hash\`, \`expires_at\`, \`attempts\`) and \`OTPService\`.

---

## 1. UI Design & Intent Guideline: When to Use Which Route

To ensure the best user experience and clear separation of intent, follow this rule when integrating frontend forms:

| User Action in UI | Endpoint to Call | Rationale |
| :--- | :--- | :--- |
| User explicitly clicks **"Send me Magic Link"** / **"Sign In with Magic Link"** button | **\`POST /tc-auth/send/email/link/{purpose}\`** | **Use this route ONLY when the user explicitly requests a magic link.** When a user clicks a dedicated magic link button, their primary expectation is a one-click login link. This endpoint communicates explicit intent, sets descriptive subject lines (e.g., "Sign-In Link & Code"), and requires/resolves the frontend destination URL. |
| User enters email in a standard OTP form and clicks **"Send OTP"** / **"Request Code"** | **\`POST /tc-auth/send/email/otp/{purpose}\`** | **Use this route for standard OTP / code-based flows.** When a user enters their email and expects a 6-digit code to type into an input field, call this route. It preserves the classic OTP experience while still embedding a convenient one-click link if \`frontend_url\` is detected. |

---

## 2. End-to-End Authentication Flows

### Flow A: Dedicated Magic Link Login
1. **Frontend Request**: User clicks **"Send me Magic Link"** tab/button. Frontend calls:
   \`\`\`http
   POST /tc-auth/send/email/link/login
   Content-Type: application/json

   {
     "email": "user@example.com",
     "frontend_url": "https://app.example.com"
   }
   \`\`\`
2. **Email Delivery**: Backend generates a 6-digit OTP, stores its cryptographic hash in the \`OTP\` table, and dispatches an email featuring both the prominent one-click login button and the backup 6-digit code.
3. **Browser Direct Click**: User opens their email and clicks the Magic Link button:
   \`\`\`http
   GET https://api.example.com/tc-auth/link/login?email=user%40example.com&otp=491823&frontend_url=https%3A%2F%2Fapp.example.com
   \`\`\`
4. **Instant Redirection**: Backend verifies the OTP hash against the database, creates a session, and issues an HTTP 307 redirect back to the frontend:
   \`\`\`
   https://app.example.com/oauth/callback?access_token=eyJhbGciOi...&refresh_token=tc_jwt_ref_...&verified=true
   \`\`\`
5. **Frontend Auto-Login**: The existing \`/oauth/callback\` page extracts \`access_token\` and \`refresh_token\`, stores them in \`localStorage\`, and navigates to the dashboard.

---

### Flow B: Bot-Safe Programmatic Verification (Anti-Scanner Defense)
To prevent corporate email security scanners (e.g., Outlook SafeLinks, Proofpoint) from consuming single-use links before the user clicks them, you can configure your email templates to link directly to a frontend landing page (e.g., \`https://app.example.com/login?email=...&otp=...\`), which then performs a programmatic verification:

\`\`\`typescript
// Frontend executes a POST request on user interaction (e.g. "Confirm Login" button)
const res = await apiClient.post("/link/login", {
  email: emailFromQuery,
  otp: otpFromQuery
});

const { access_token, refresh_token, account } = res.data;
tokenStorage.setTokens(access_token, refresh_token);
window.location.href = "/dashboard";
\`\`\`

---

## 3. Frontend Integration Code Examples

### Requesting a Magic Link (React / TypeScript)
\`\`\`typescript
import { authService } from './services/authService';

async function handleRequestMagicLink(email: string) {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    await authService.sendMagicLink(email, 'login', origin);
    toast.success('Magic link dispatched! Check your inbox.');
  } catch (error: any) {
    toast.error(error.message || 'Failed to send magic link');
  }
}
\`\`\`

### Pre-populating and Handling Magic Link Callbacks
\`\`\`typescript
// Inside LoginPage or SignupPage useEffect
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const emailParam = params.get('email');
  const otpParam = params.get('otp');
  const verifiedParam = params.get('verified');

  if (emailParam) {
    setEmail(emailParam);
  }

  // If user opened with link containing OTP, switch to OTP tab and prefill
  if (otpParam) {
    setOtp(otpParam);
    setTab('otp');
  }
}, []);
\`\`\``,
    schemas: [
      {
        title: 'POST /send/email/link/{purpose} Request & Response',
        description: 'Payload schema for requesting an explicit magic authentication link',
        json: `// Request
POST /tc-auth/send/email/link/login
{
  "email": "developer@example.com",
  "frontend_url": "https://app.example.com"
}

// Response: 200 OK
{
  "expires_at": 1735689600,
  "frontend_url": "https://app.example.com"
}`
      },
      {
        title: 'POST /link/{purpose} Bot-Safe Programmatic Response',
        description: 'Response payload returned when programmatically verifying a magic link',
        json: `// Request: POST /tc-auth/link/login
{
  "email": "developer@example.com",
  "otp": "491823"
}

// Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "tc_jwt_ref_9a8b7c6d5e4f3a2b1c0d",
  "token_type": "Bearer",
  "account": {
    "id": 1,
    "uid": "2d7b5f8e-8d8a-4cc4-9c3d-2f2c6c4d2e28",
    "name": "Jane Doe",
    "email": "developer@example.com",
    "role": "user",
    "status": "active"
  }
}`
      }
    ],
    methods: [
      {
        name: 'POST /send/email/link/{purpose}',
        signature: 'POST /send/email/link/{purpose}',
        description: 'Dispatches a magic authentication link email with explicit subject lines, customized button URLs, and backup 6-digit codes.',
        parameters: [
          { name: 'purpose', type: 'path', required: true, description: '"login", "signup", "reset", or "verify".' },
          { name: 'email', type: 'body (str)', required: true, description: 'Destination email address.' },
          { name: 'frontend_url', type: 'body (str)', required: false, description: 'Base application URL for one-click redirect callback.' }
        ],
        returns: { type: 'JSON Object', description: '{"expires_at": 1735689600, "frontend_url": "..."}' }
      },
      {
        name: 'GET /link/{purpose}',
        signature: 'GET /link/{purpose}?email={EMAIL}&otp={CODE}&frontend_url={URL}',
        description: 'Direct browser link handler. Validates the OTP code from query parameters, generates access & refresh tokens, and issues an HTTP 307 redirect to frontend callback.',
        parameters: [
          { name: 'purpose', type: 'path', required: true, description: 'Flow purpose.' },
          { name: 'email', type: 'query (str)', required: true, description: 'Target email.' },
          { name: 'otp', type: 'query (str)', required: true, description: '6-digit verification code.' },
          { name: 'frontend_url', type: 'query (str)', required: false, description: 'Frontend redirect origin.' }
        ],
        returns: { type: 'HTTP 307', description: 'Redirects to ${frontend_url}/oauth/callback with tokens.' }
      },
      {
        name: 'POST /link/{purpose}',
        signature: 'POST /link/{purpose}',
        description: 'Bot-safe programmatic verification route. Accepts email and OTP code in JSON body and returns JWT access & refresh tokens.',
        parameters: [
          { name: 'purpose', type: 'path', required: true, description: 'Flow purpose.' },
          { name: 'email', type: 'body (str)', required: true, description: 'Account email address.' },
          { name: 'otp', type: 'body (str)', required: true, description: '6-digit verification code.' }
        ],
        returns: { type: 'JSON Object', description: 'Login token response with access_token and account.' }
      }
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard Metrics',
    module: 'auth.dashboard',
    description: 'System-wide summary counters for accounts, active sessions, OAuth links, and OTP records.',
    overview: `The \`auth.dashboard\` module provides real-time system metrics for administrative dashboards.`,
    content: `Returns summary counts directly from the database engine.`,
    schemas: [
      {
        title: 'System Resource Counts Schema',
        description: 'Dictionary returned by get_counts()',
        json: `{
  "accounts": 12,
  "oauth": 4,
  "sessions": 8,
  "otp": 3
}`
      }
    ],
    methods: [
      {
        name: 'get_counts',
        signature: 'get_counts() -> dict',
        description: 'Returns total counts for main authentication database tables.',
        returns: { type: 'dict', description: '{"accounts": int, "oauth": int, "sessions": int, "otp": int}' }
      }
    ],
    codeSnippet: `from connect import auth

# Get system counters
counts = auth.dashboard.get_counts()
print("Accounts:", counts["accounts"])
print("Active Sessions:", counts["sessions"])`
  }
];

export const API_DOCS: DocItem[] = [
  {
    id: 'login-routes',
    title: 'Sign In / Sign Up Routes',
    module: 'Authentication',
    description: 'Public authentication endpoints for account registration, email/password login, email OTP login, and password resetting.',
    overview: `Clean relative endpoints (e.g. \`/login/password\`, \`/signup/otp\`). The configured base URL (such as \`https://api.codesena.me/tc-auth\` or \`http://localhost:8000/tc-auth\`) already routes to the service mount, so client API calls should never hardcode \`/tc-auth\`. Successful signup and login requests return an \`access_token\` JWT string attached as a Bearer header (\`Authorization: Bearer <access_token>\`) for protected endpoints.`,
    content: `Common Status Codes:
- 200 OK: Request succeeded. Returns access token or operation result.
- 400 Bad Request: Missing required body parameters or payload validation failure.
- 401 Unauthorized: Invalid credentials or incorrect/expired One-Time Password (OTP).
- 404 Not Found: Account with provided email or handle does not exist.`,
    schemas: [
      {
        title: 'Single-Token Mode Login Response Schema',
        description: 'Dictionary payload returned by auth endpoints when dual_token_mode is False (standard 7-day access token)',
        json: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOjEsInNpZCI6NjAsImV4cCI6MTc4NzEyOTg2N30...",
  "token_type": "Bearer",
  "account": {
    "id": 1,
    "uid": "2d7b5f8e-8d8a-4cc4-9c3d-2f2c6c4d2e28",
    "name": "Jane Doe",
    "handle": "jane",
    "email": "jane@example.com",
    "phone": null,
    "avatar_url": null,
    "role": "user",
    "status": "active",
    "created_at": "2026-08-07T12:00:00",
    "updated_at": "2026-08-07T12:00:00"
  }
}`
      },
      {
        title: 'Dual-Token Mode Login Response Schema',
        description: 'Dictionary payload returned by auth endpoints when dual_token_mode is True (short-lived access token + rotating refresh token)',
        json: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOjEsInNpZCI6NjAsImV4cCI6MTc4NzEzMDc2N30...",
  "refresh_token": "tc_jwt_ref_9a8b7c6d5e4f3a2b1c0d",
  "token_type": "Bearer",
  "account": {
    "id": 1,
    "uid": "2d7b5f8e-8d8a-4cc4-9c3d-2f2c6c4d2e28",
    "name": "Jane Doe",
    "handle": "jane",
    "email": "jane@example.com",
    "phone": null,
    "avatar_url": null,
    "role": "user",
    "status": "active",
    "created_at": "2026-08-07T12:00:00",
    "updated_at": "2026-08-07T12:00:00"
  }
}`
      }
    ],
    methods: [
      {
        name: 'POST /send/email/otp/{purpose}',
        signature: 'POST /send/email/otp/{purpose}',
        description: 'Generates and sends a 6-digit numeric One-Time Password via SMTP to the recipient email address for a specific authentication flow. Optionally accepts frontend_url to also embed a magic login link into the email.',
        parameters: [
          { name: 'purpose', type: 'path', required: true, description: 'OTP purpose flow key: "signup", "login", "reset", or "verify".' },
          { name: 'email', type: 'body (str)', required: true, description: 'Target email address to receive the OTP code.' },
          { name: 'frontend_url', type: 'body (str) | header | query', required: false, description: 'Optional frontend root URL (e.g. "https://app.example.com"). If provided, generates and embeds a one-click magic link into the email.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"expires_at": 1735689600, "frontend_url": "https://app.example.com"}'
        },
        exceptions: ['400 Bad Request: Invalid email format or missing body field.', '500 Internal Error: SMTP delivery failure.'],
        example: `// Request using apiClient with optional frontend_url
await apiClient.post("/send/email/otp/login", {
  email: "jane@example.com",
  frontend_url: window.location.origin
});`
      },
      {
        name: 'POST /send/email/link/{purpose}',
        signature: 'POST /send/email/link/{purpose}',
        description: 'Explicit route used when the user clicks "Send me Magic Link" in the UI. Explicitly sets magic-link email templates, resolves the frontend destination URL, and generates a one-click authentication link.',
        parameters: [
          { name: 'purpose', type: 'path', required: true, description: 'Flow purpose: "login", "signup", "reset", or "verify".' },
          { name: 'email', type: 'body (str)', required: true, description: 'Target email address.' },
          { name: 'frontend_url', type: 'body (str) | header | query', required: false, description: 'Frontend base URL. Auto-detected from Origin, Referer, or Host headers if omitted.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"expires_at": 1735689600, "frontend_url": "https://app.example.com"}'
        },
        exceptions: ['400 Bad Request: Invalid email format.', '500 Internal Error: Email dispatch failure.'],
        example: `// Dedicated Magic Link request
await apiClient.post("/send/email/link/login", {
  email: "jane@example.com",
  frontend_url: window.location.origin
});`
      },
      {
        name: 'GET /link/{purpose}',
        signature: 'GET /link/{purpose}?email={EMAIL}&otp={CODE}&frontend_url={URL}',
        description: 'Direct browser link clicked from email inbox. Verifies the OTP, provisions session tokens, and responds with an HTTP 307 redirect directly to the frontend callback (/oauth/callback or /magic-link/callback) with access_token and refresh_token query params.',
        parameters: [
          { name: 'purpose', type: 'path', required: true, description: 'Target flow: "login", "signup", "reset", or "verify".' },
          { name: 'email', type: 'query (str)', required: true, description: 'Email address encoded in magic link.' },
          { name: 'otp', type: 'query (str)', required: true, description: '6-digit OTP code embedded in magic link.' },
          { name: 'frontend_url', type: 'query (str)', required: false, description: 'Frontend redirect URL.' }
        ],
        returns: {
          type: 'HTTP 307 Redirect',
          description: 'Redirects browser to ${frontend_url}/oauth/callback?access_token={JWT}&refresh_token={REF_TOKEN}&verified=true'
        },
        exceptions: ['HTTP 307 Redirect with ?error=... on expired or invalid code.'],
        example: `// User clicks link in email:
// https://api.example.com/tc-auth/link/login?email=jane%40example.com&otp=491823&frontend_url=https%3A%2F%2Fapp.example.com`
      },
      {
        name: 'POST /link/{purpose}',
        signature: 'POST /link/{purpose}',
        description: 'Bot-safe programmatic verification endpoint. Allows frontend apps to verify magic link tokens or manual OTP codes asynchronously without exposing GET verification to automated email security scanners.',
        parameters: [
          { name: 'purpose', type: 'path', required: true, description: 'Target flow: "login", "signup", "reset", or "verify".' },
          { name: 'email', type: 'body (str)', required: true, description: 'Email address.' },
          { name: 'otp', type: 'body (str)', required: true, description: '6-digit OTP verification code.' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Standard token response containing access_token, refresh_token (in dual mode), token_type, and account.'
        },
        exceptions: ['401 Unauthorized: Invalid or expired OTP code.', '404 Not Found: Account not found.'],
        example: `const res = await apiClient.post("/link/login", {
  email: "jane@example.com",
  otp: "491823"
});
const { access_token, refresh_token, account } = res.data;`
      },
      {
        name: 'POST /signup/otp',
        signature: 'POST /signup/otp',
        description: 'Verifies an active signup OTP code and registers a new account in the database. Returns access token and session.',
        parameters: [
          { name: 'name', type: 'body (str)', required: true, description: 'User display name.' },
          { name: 'email', type: 'body (str)', required: true, description: 'Unique user email address.' },
          { name: 'password', type: 'body (str)', required: true, description: 'Account password (hashed with bcrypt).' },
          { name: 'otp', type: 'body (str)', required: true, description: '6-digit OTP code received via email.' },
          { name: 'handle', type: 'body (str)', required: false, default: 'None', description: 'Unique username handle.' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Standard Login Response containing access_token, token_type, and account details.'
        },
        exceptions: ['400 Bad Request: Account with email or handle already exists.', '401 Unauthorized: Invalid or expired OTP code.'],
        example: `const res = await apiClient.post("/signup/otp", {
  name: "Jane Doe",
  email: "jane@example.com",
  password: "password123",
  otp: "123456",
  handle: "jane"
});
const data = res.data;`
      },
      {
        name: 'POST /signup/password',
        signature: 'POST /signup/password',
        description: 'Creates a new user account directly with name, email, handle, and password without requiring an email OTP step.',
        parameters: [
          { name: 'name', type: 'body (str)', required: true, description: 'User display name.' },
          { name: 'email', type: 'body (str)', required: true, description: 'Unique user email address.' },
          { name: 'password', type: 'body (str)', required: true, description: 'Account password.' },
          { name: 'handle', type: 'body (str)', required: false, description: 'Unique username handle.' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Standard Login Response with access_token and created account.'
        },
        exceptions: ['400 Bad Request: Duplicate email or handle.'],
        example: `const res = await apiClient.post("/signup/password", {
  name: "Jane Doe",
  email: "jane@example.com",
  handle: "jane",
  password: "password123"
});
const data = res.data;`
      },
      {
        name: 'POST /login/otp',
        signature: 'POST /login/otp',
        description: 'Authenticates an existing user account using email address and a valid login OTP code.',
        parameters: [
          { name: 'email', type: 'body (str)', required: true, description: 'User account email address.' },
          { name: 'otp', type: 'body (str)', required: true, description: '6-digit OTP code.' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Standard Login Response containing access_token and account.'
        },
        exceptions: ['401 Unauthorized: Invalid or expired OTP.', '404 Not Found: User not found.'],
        example: `const res = await apiClient.post("/login/otp", {
  email: "jane@example.com",
  otp: "123456"
});
const data = res.data;`
      },
      {
        name: 'POST /login/password',
        signature: 'POST /login/password',
        description: 'Authenticates a user account using an identifier (email address or username handle) and plain-text password.',
        parameters: [
          { name: 'identifier', type: 'body (str)', required: true, description: 'User email address OR username handle.' },
          { name: 'password', type: 'body (str)', required: true, description: 'Account plain-text password.' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Standard Login Response with access_token and account details.'
        },
        exceptions: ['401 Unauthorized: Invalid identifier or incorrect password.'],
        example: `const res = await apiClient.post("/login/password", {
  identifier: "jane@example.com",
  password: "password123"
});
const data = res.data;`
      },
      {
        name: 'POST /forgot/password',
        signature: 'POST /forgot/password',
        description: 'Resets account password after verifying a valid reset OTP code, then logs in the user and returns a fresh access token.',
        parameters: [
          { name: 'email', type: 'body (str)', required: true, description: 'Account email address.' },
          { name: 'otp', type: 'body (str)', required: true, description: 'Password reset OTP code.' },
          { name: 'password', type: 'body (str)', required: true, description: 'New plain-text password.' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Standard Login Response with fresh access_token.'
        },
        exceptions: ['401 Unauthorized: Invalid OTP code.', '404 Not Found: Account not found.'],
        example: `const res = await apiClient.post("/forgot/password", {
  email: "jane@example.com",
  otp: "123456",
  password: "new-password123"
});
const data = res.data;`
      },
      {
        name: 'POST /token/refresh',
        signature: 'POST /token/refresh',
        description: 'Exchanges a valid refresh token for a newly generated access token and rotated refresh token (Dual-Token Mode).',
        parameters: [
          { name: 'refresh_token', type: 'body (str)', required: true, description: 'Valid refresh token string previously received from login.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"access_token": "...", "refresh_token": "...", "token_type": "Bearer"}'
        },
        exceptions: ['401 Unauthorized: Invalid or expired refresh token.'],
        example: `const res = await apiClient.post("/token/refresh", {
  refresh_token: storedRefreshToken
});
const { access_token, refresh_token } = res.data;`
      }
    ],
    codeSnippet: `// cURL Example: Login with Password (using baseUrl)
curl -X POST \${BASE_URL}/login/password \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "jane@example.com",
    "password": "password123"
  }'`
  },
  {
    id: 'oauth-routes',
    title: 'OAuth Login Routes',
    module: 'OAuth',
    description: 'Browser-facing OAuth redirection endpoints for initiating and completing Google OpenID Connect, GitHub, and Discord OAuth authentication.',
    overview: `Endpoints manage browser redirects during third-party sign-in flows (Google, GitHub, and Discord). The callback routes handle code exchanges, profile normalization, user account auto-provisioning or linking, and redirect back to the client application with access tokens (and rotating refresh tokens if dual-token mode is enabled).`,
    content: `OAuth Flow Overview:
1. User clicks provider login button (Google, GitHub, or Discord) in frontend application.
2. Frontend navigates browser to GET /{provider}/login?frontend_url={URL}.
3. Backend saves frontend_url in session and redirects browser to provider authorization consent page.
4. User authorizes request; provider redirects browser to backend callback with state and code.
5. Backend exchanges code for user profile, links or creates account, issues session tokens, and redirects browser back to \`\${frontend_url}/oauth/callback?access_token={JWT}&provider={provider}\` (plus \`&refresh_token={TOKEN}\` when dual-token mode is active).`,
    methods: [
      {
        name: 'GET /google/login',
        signature: 'GET /google/login?frontend_url={URL}',
        description: 'Initiates Google OAuth 2.0 OpenID Connect authorization flow by redirecting the browser to Google consent screen.',
        parameters: [
          { name: 'frontend_url', type: 'query (str)', required: true, description: 'URL of frontend app where the user should be returned after authentication.' }
        ],
        returns: {
          type: 'HTTP 302 Redirect',
          description: 'Redirects browser to https://accounts.google.com/o/oauth2/v2/auth...'
        },
        example: `// Frontend Initiation
const frontendUrl = "https://app.example.com";
window.location.href = \`\${baseUrl}/google/login?frontend_url=\${encodeURIComponent(frontendUrl)}\`;`
      },
      {
        name: 'GET /google/callback',
        signature: 'GET /google/callback?code={CODE}&state={STATE}',
        description: 'Callback target registered in Google Cloud Console. Exchanges authorization code for Google ID token, creates local user/session, and redirects to frontend with token.',
        parameters: [
          { name: 'code', type: 'query (str)', required: true, description: 'Authorization code provided by Google.' },
          { name: 'state', type: 'query (str)', required: false, description: 'State param used for CSRF protection.' }
        ],
        returns: {
          type: 'HTTP 302 Redirect',
          description: 'Redirects browser to ${frontend_url}/oauth/callback?access_token={JWT_TOKEN}'
        }
      },
      {
        name: 'GET /github/login',
        signature: 'GET /github/login?frontend_url={URL}',
        description: 'Initiates GitHub OAuth flow by redirecting the browser to github.com/login/oauth/authorize.',
        parameters: [
          { name: 'frontend_url', type: 'query (str)', required: true, description: 'URL of frontend app for final token redirect.' }
        ],
        returns: {
          type: 'HTTP 302 Redirect',
          description: 'Redirects browser to https://github.com/login/oauth/authorize...'
        },
        example: `// Frontend Initiation
const frontendUrl = "https://app.example.com";
window.location.href = \`\${baseUrl}/github/login?frontend_url=\${encodeURIComponent(frontendUrl)}\`;`
      },
      {
        name: 'GET /github/callback',
        signature: 'GET /github/callback?code={CODE}&state={STATE}',
        description: 'Callback target registered in GitHub Developer Settings. Fetches profile (including primary private email resolution), creates account/link, and redirects to frontend with access_token.',
        parameters: [
          { name: 'code', type: 'query (str)', required: true, description: 'Authorization code from GitHub.' },
          { name: 'state', type: 'query (str)', required: false, description: 'CSRF state string.' }
        ],
        returns: {
          type: 'HTTP 302 Redirect',
          description: 'Redirects browser to ${frontend_url}/oauth/callback?access_token={JWT_TOKEN}'
        }
      },
      {
        name: 'GET /discord/login',
        signature: 'GET /discord/login?frontend_url={URL}',
        description: 'Initiates Discord OAuth2 flow by redirecting the browser to Discord OAuth2 authorization URL with identify and email scopes.',
        parameters: [
          { name: 'frontend_url', type: 'query (str)', required: true, description: 'URL of frontend app where user should be redirected after authorization.' }
        ],
        returns: {
          type: 'HTTP 302 Redirect',
          description: 'Redirects browser to https://discord.com/api/oauth2/authorize...'
        },
        example: `// Frontend Initiation
const frontendUrl = "https://app.example.com";
window.location.href = \`\${baseUrl}/discord/login?frontend_url=\${encodeURIComponent(frontendUrl)}\`;`
      },
      {
        name: 'GET /discord/callback',
        signature: 'GET /discord/callback?code={CODE}&state={STATE}',
        description: 'Discord OAuth callback target. Exchanges authorization code for Discord user identity, links or creates account, and redirects to frontend with token.',
        parameters: [
          { name: 'code', type: 'query (str)', required: true, description: 'Authorization code returned by Discord.' },
          { name: 'state', type: 'query (str)', required: false, description: 'CSRF state query string.' }
        ],
        returns: {
          type: 'HTTP 302 Redirect',
          description: 'Redirects browser to ${frontend_url}/oauth/callback?access_token={JWT_TOKEN}&provider=discord'
        }
      }
    ],
    codeSnippet: `// Handle OAuth Token in Frontend Callback Page (/oauth/callback)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('access_token');

if (token) {
  localStorage.setItem('access_token', token);
  window.location.href = '/dashboard';
}`
  },
  {
    id: 'oauth-integration',
    title: 'OAuth Integration Guide',
    module: 'Frontend Architecture',
    description: 'Detailed browser integration patterns, configuration steps, and security guidelines for implementing OAuth sign-in.',
    overview: `This guide explains how to connect your browser-based SPA (React, Vue, Svelte, or plain JavaScript) to tc_auth OAuth endpoints.`,
    content: `Prerequisites Checklist:
1. Configure provider credentials via Admin API: POST /config/google or POST /config/github.
2. Register exact redirect URIs in provider developer consoles:
   - Google: {BASE_URL}/google/callback (e.g. https://api.example.com/tc-auth/google/callback)
   - GitHub: {BASE_URL}/github/callback (e.g. https://api.example.com/tc-auth/github/callback)
3. Client Security: Never embed client_secret in browser code! Credentials remain securely stored inside backend service memory or database.`,
    codeSnippet: `// Complete Frontend Integration React Hook Example
import { useEffect } from 'react';

export function useOAuthCallback(onSuccess) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    
    if (token) {
      // Store token and clean URL
      localStorage.setItem('access_token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      onSuccess(token);
    }
  }, [onSuccess]);
}

export function OAuthButtons({ backendUrl, frontendUrl }) {
  const handleGoogle = () => {
    const url = \`\${backendUrl}/google/login?frontend_url=\${encodeURIComponent(frontendUrl)}\`;
    window.location.href = url;
  };

  const handleGitHub = () => {
    const url = \`\${backendUrl}/github/login?frontend_url=\${encodeURIComponent(frontendUrl)}\`;
    window.location.href = url;
  };

  return (
    <div className="flex gap-3">
      <button onClick={handleGoogle}>Sign in with Google</button>
      <button onClick={handleGitHub}>Sign in with GitHub</button>
    </div>
  );
}`
  },
  {
    id: 'profile-routes',
    title: 'Profile & User Routes',
    module: 'User Profile',
    description: 'Protected endpoints for retrieving user profile context, updating account details, changing passwords, and revoking sessions.',
    overview: `Clean relative endpoints (e.g. \`/me\`, \`/logout\`). Protected endpoints for retrieving user profile context, updating account details, changing passwords, and revoking sessions. All endpoints require an active JWT session token sent in \`Authorization: Bearer <access_token>\`.`,
    schemas: [
      {
        title: 'Current User Response Schema (GET /me)',
        description: 'Comprehensive context dictionary returned by GET /me',
        json: `{
  "account": {
    "id": 1,
    "uid": "2d7b5f8e-8d8a-4cc4-9c3d-2f2c6c4d2e28",
    "name": "Jane Doe",
    "handle": "jane",
    "email": "jane@example.com",
    "phone": "+15555550100",
    "avatar_url": "https://example.com/avatar.png",
    "role": "user",
    "status": "active",
    "created_at": "2026-08-07T12:00:00",
    "updated_at": "2026-08-07T12:00:00"
  },
  "session": {
    "id": 9,
    "account_id": 1,
    "token_hash": "a8f5f167...",
    "ip_address": "203.0.113.10",
    "user_agent": "Mozilla/5.0",
    "expires_at": "2026-08-14T12:00:00",
    "created_at": "2026-08-07T12:00:00"
  },
  "payload": {
    "aid": 1,
    "sid": 9,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}`
      },
      {
        title: 'Standard Action Response Schema',
        description: 'Returned by update password, logout, and session revocation actions',
        json: `{
  "success": true,
  "message": "<Description of action performed>",
  "count": 1
}`
      }
    ],
    methods: [
      {
        name: 'GET /me',
        signature: 'GET /me',
        description: 'Returns profile details for authenticated user, current active session record, and decoded JWT payload claims.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer access token (e.g. "Bearer eyJhbGci...")' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Dictionary containing account, session, and payload objects.'
        },
        exceptions: ['401 Unauthorized: Invalid or expired Bearer access token.'],
        example: `// Using apiClient
const res = await apiClient.get("/me");
const me = res.data;

// Or with fetch:
const res = await fetch(\`\${baseUrl}/me\`, {
  headers: { "Authorization": \`Bearer \${accessToken}\` }
});
const me = await res.json();`
      },
      {
        name: 'PATCH /me',
        signature: 'PATCH /me',
        description: 'Updates standard profile fields (name, email, handle, avatar URL, phone) for the authenticated user.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer access token.' },
          { name: 'name', type: 'body (str)', required: false, description: 'Updated display name.' },
          { name: 'email', type: 'body (str)', required: false, description: 'Updated email address.' },
          { name: 'handle', type: 'body (str)', required: false, description: 'Updated username handle.' },
          { name: 'avatar_url', type: 'body (str)', required: false, description: 'Updated avatar picture URL.' },
          { name: 'phone', type: 'body (str)', required: false, description: 'Updated phone number.' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Updated user account record object.'
        },
        exceptions: ['400 Bad Request: Unique constraint violation on email or handle.', '401 Unauthorized: Missing or invalid token.'],
        example: `const res = await apiClient.patch("/me", {
  name: "Jane Doe",
  avatar_url: "https://example.com/new-avatar.png"
});
const account = res.data;`
      },
      {
        name: 'PUT /update/password',
        signature: 'PUT /update/password',
        description: 'Hashes and updates plain-text password for the currently authenticated user.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer access token.' },
          { name: 'password', type: 'body (str)', required: true, description: 'New plain-text password.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "Password updated successfully", "count": 1}'
        },
        exceptions: ['401 Unauthorized: Invalid access token.'],
        example: `const res = await apiClient.put("/update/password", {
  password: "new-secure-password123"
});
const data = res.data; // { success: true, message: "Password updated successfully", count: 1 }`
      },
      {
        name: 'POST /logout',
        signature: 'POST /logout',
        description: 'Destroys the current active session record from the database and revokes session token.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer access token.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "Session destroyed successfully", "count": 1}'
        },
        example: `const res = await apiClient.post("/logout");
const data = res.data; // { success: true, message: "Session destroyed successfully", count: 1 }`
      },
      {
        name: 'POST /logout-all',
        signature: 'POST /logout-all',
        description: 'Revokes all active sessions across all devices for the current account.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer access token.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "All sessions destroyed for account", "count": 1}'
        },
        example: `const res = await apiClient.post("/logout-all");
const data = res.data; // { success: true, message: "All sessions destroyed for account", count: 1 }`
      },
      {
        name: 'GET /account/oauth/links',
        signature: 'GET /account/oauth/links',
        description: 'Returns all external OAuth provider accounts (Google, GitHub, Discord) linked to the authenticated user.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer access token.' }
        ],
        returns: {
          type: 'JSON Array',
          description: '[{"id": 1, "account_id": "...", "provider": "google", "provider_user_id": "...", "created_at": "..."}]'
        },
        example: `const res = await apiClient.get("/account/oauth/links");
const linkedProviders = res.data;`
      },
      {
        name: 'POST /account/oauth/link/:provider',
        signature: 'POST /account/oauth/link/:provider',
        description: 'Initiates or attaches an external OAuth provider to the current user account.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer access token.' },
          { name: 'provider', type: 'path (str)', required: true, description: '"google", "github", or "discord".' },
          { name: 'provider_user_id', type: 'body (str)', required: false, description: 'Direct provider account identifier when linking directly.' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Created OAuth link representation.'
        },
        example: `const res = await apiClient.post("/account/oauth/link/discord", {
  provider_user_id: "discord_user_12345"
});`
      },
      {
        name: 'DELETE /account/oauth/:provider',
        signature: 'DELETE /account/oauth/:provider',
        description: 'Unlinks an OAuth provider from the account. Enforces Lockout Prevention (safe unlinking): rejects request with 400 if user has no password and this is their only auth method.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer access token.' },
          { name: 'provider', type: 'path (str)', required: true, description: 'Provider name ("google", "github", or "discord").' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "OAuth link for \'github\' removed successfully"}'
        },
        exceptions: [
          '400 Bad Request: Cannot unlink provider: account must have a password or at least one other active authentication method.'
        ],
        example: `try {
  const res = await apiClient.delete("/account/oauth/github");
  toast.success(res.data.message);
} catch (err) {
  toast.error(err.response?.data?.message || "Cannot unlink provider");
}`
      }
    ],
    codeSnippet: `curl -X GET \${BASE_URL}/me \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
  },
  {
    id: 'dashboard-routes',
    title: 'Dashboard & System Config Routes',
    module: 'System Configuration',
    description: 'System health check probe, live credentials loader, system metrics counters, and runtime service configuration setters.',
    overview: `Base configuration endpoints: \`/config\`. \`GET /config/pulse\` is public. All other endpoints require superadmin authorization header.`,
    schemas: [
      {
        title: 'System Configuration Load Response Schema',
        description: 'JSON returned by GET /config/load/',
        json: `{
  "email": {
    "host": "smtp.gmail.com",
    "port": 587,
    "username": "mailer@example.com",
    "password": "***",
    "sender": "noreply@example.com",
    "sender_name": "Auth Module",
    "use_tls": true
  },
  "github": {
    "client_id": "1234567890abcdef",
    "client_secret": "*******************",
    "redirect_uri": "https://api.example.com/tc-auth/github/callback"
  },
  "google": {
    "client_id": "9876543210.apps.googleusercontent.com",
    "client_secret": "*******************",
    "redirect_uri": "https://api.example.com/tc-auth/google/callback"
  },
  "jwt": {
    "secret_key": "*******************",
    "algorithm": "HS256",
    "session_duration_days": 7
  }
}`
      },
      {
        title: 'Standard Action Response Schema',
        description: 'Returned by system and provider configuration updates',
        json: `{
  "success": true,
  "message": "<Description of configuration updated>"
}`
      }
    ],
    methods: [
      {
        name: 'GET /config/pulse',
        signature: 'GET /config/pulse',
        description: 'Public health probe endpoint for monitoring service status, system clock, and availability.',
        parameters: [],
        returns: {
          type: 'JSON Object',
          description: '{"system_time": "2026-08-12T10:00:00.000000", "response": "Hello", "status": "healthy", "state": "active"}'
        },
        example: `const res = await apiClient.get("/config/pulse");
const data = res.data;`
      },
      {
        name: 'GET /config/load/',
        signature: 'GET /config/load/',
        description: 'Loads active configuration settings for SMTP Email, GitHub OAuth, Google OAuth, and JWT Key settings.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin Bearer access token.' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Full config dictionary with masked sensitive credentials.'
        },
        exceptions: ['403 Forbidden: Account is not superadmin.'],
        example: `const res = await apiClient.get("/config/load/");
const config = res.data;`
      },
      {
        name: 'GET /config/counts',
        signature: 'GET /config/counts',
        description: 'Returns real-time database primary record counts for accounts, oauth links, active sessions, and OTP entries.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin Bearer access token.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"accounts": 123, "oauth": 7, "sessions": 42, "otp": 3}'
        },
        example: `const res = await apiClient.get("/config/counts");
const counts = res.data;`
      },
      {
        name: 'POST /config/email',
        signature: 'POST /config/email',
        description: 'Sets or updates SMTP email service configuration settings in application state.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin token.' },
          { name: 'host', type: 'body (str)', required: true, description: 'SMTP server host.' },
          { name: 'port', type: 'body (int)', required: true, description: 'SMTP port (587 or 465).' },
          { name: 'username', type: 'body (str)', required: true, description: 'SMTP account username.' },
          { name: 'password', type: 'body (str)', required: true, description: 'SMTP password.' },
          { name: 'sender', type: 'body (str)', required: true, description: 'Default sender email address.' },
          { name: 'sender_name', type: 'body (str)', required: false, description: 'Sender display header name.' },
          { name: 'use_tls', type: 'body (bool)', required: false, default: 'true', description: 'Enable TLS connection.' }
        ],
        returns: { type: 'JSON Object', description: '{"success": true, "message": "Email service configured successfully"}' }
      },
      {
        name: 'POST /config/github',
        signature: 'POST /config/github',
        description: 'Configures GitHub OAuth App Client ID, Client Secret, and Callback Redirect URI.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin token.' },
          { name: 'client_id', type: 'body (str)', required: true, description: 'GitHub App Client ID.' },
          { name: 'client_secret', type: 'body (str)', required: true, description: 'GitHub App Client Secret.' },
          { name: 'redirect_uri', type: 'body (str)', required: true, description: 'Authorized Callback Redirect URI.' }
        ],
        returns: { type: 'JSON Object', description: '{"success": true, "message": "GitHub OAuth configured successfully"}' }
      },
      {
        name: 'POST /config/google',
        signature: 'POST /config/google',
        description: 'Configures Google Cloud OAuth Client ID, Client Secret, and Callback Redirect URI.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin token.' },
          { name: 'client_id', type: 'body (str)', required: true, description: 'Google OAuth Client ID.' },
          { name: 'client_secret', type: 'body (str)', required: true, description: 'Google OAuth Client Secret.' },
          { name: 'redirect_uri', type: 'body (str)', required: true, description: 'Authorized Redirect URI.' }
        ],
        returns: { type: 'JSON Object', description: '{"success": true, "message": "Google OAuth configured successfully"}' }
      },
      {
        name: 'POST /config/discord',
        signature: 'POST /config/discord',
        description: 'Configures Discord OAuth2 Client ID, Client Secret, and Callback Redirect URI.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin token.' },
          { name: 'client_id', type: 'body (str)', required: true, description: 'Discord Application Client ID.' },
          { name: 'client_secret', type: 'body (str)', required: true, description: 'Discord Application Client Secret.' },
          { name: 'redirect_uri', type: 'body (str)', required: true, description: 'Authorized Redirect URI.' }
        ],
        returns: { type: 'JSON Object', description: '{"success": true, "message": "Discord OAuth configured successfully"}' }
      },
      {
        name: 'POST /config/jwt',
        signature: 'POST /config/jwt',
        description: 'Configures JWT signing secret key, cryptographic algorithm, active session duration, and dual-token refresh settings.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin token.' },
          { name: 'secret_key', type: 'body (str)', required: true, description: 'JWT signing secret key.' },
          { name: 'algorithm', type: 'body (str)', required: false, default: '"HS256"', description: 'Signing algorithm.' },
          { name: 'session_duration_days', type: 'body (int)', required: false, default: '7', description: 'Session lifetime in days.' },
          { name: 'dual_token_mode', type: 'body (bool)', required: false, default: 'false', description: 'Enable dual-token (Access + Refresh Token) issuance.' },
          { name: 'access_token_expire_minutes', type: 'body (int)', required: false, default: '15', description: 'Short-lived access token expiration in minutes.' },
          { name: 'refresh_token_expire_days', type: 'body (int)', required: false, default: '7', description: 'Long-lived refresh token expiration in days.' }
        ],
        returns: { type: 'JSON Object', description: '{"success": true, "message": "JWT configured successfully"}' }
      },
      {
        name: 'POST /config/cookie',
        signature: 'POST /config/cookie',
        description: 'Configures runtime Cookie Subsystem parameters (cookie mode toggle, cookie names, path, domain, secure flag, httponly flag, and samesite policy).',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin token.' },
          { name: 'cookie_mode', type: 'body (bool)', required: false, default: 'false', description: 'Toggle Cookie Mode on or off.' },
          { name: 'access_cookie_name', type: 'body (str)', required: false, default: '"access_token"', description: 'Access token cookie name.' },
          { name: 'refresh_cookie_name', type: 'body (str)', required: false, default: '"refresh_token"', description: 'Refresh token cookie name.' },
          { name: 'path', type: 'body (str)', required: false, default: '"/"', description: 'Cookie path.' },
          { name: 'domain', type: 'body (str | null)', required: false, default: 'null', description: 'Optional cross-domain cookie attribute.' },
          { name: 'secure', type: 'body (bool)', required: false, default: 'false', description: 'Enable Secure flag (HTTPS required).' },
          { name: 'httponly', type: 'body (bool)', required: false, default: 'true', description: 'Enable HttpOnly flag (XSS protection).' },
          { name: 'samesite', type: 'body (str)', required: false, default: '"lax"', description: 'SameSite policy: "lax", "strict", or "none".' },
          { name: 'max_age', type: 'body (int | null)', required: false, default: 'null', description: 'Optional custom Max-Age seconds.' }
        ],
        returns: { type: 'JSON Object', description: '{"success": true, "message": "Cookie configured successfully"}' }
      }
    ],
    codeSnippet: `curl -X GET \${BASE_URL}/config/load/ \\
  -H "Authorization: Bearer superadmin-secret-token"`
  },
  {
    id: 'dash-account',
    title: 'Admin Account Routes',
    module: 'Account Management',
    description: 'Administrative endpoints for querying, creating, super-updating, and deleting system user accounts.',
    overview: `Base path: \`/account\`. Authentication required: \`Authorization: Bearer <access_token>\` belonging to an account with the \`superadmin\` role.`,
    methods: [
      {
        name: 'GET /account/',
        signature: 'GET /account/?page=1&limit=10',
        description: 'Returns a paginated collection of user account records.',
        parameters: [
          { name: 'page', type: 'query (int)', required: false, default: '1', description: 'Page number (minimum: 1).' },
          { name: 'limit', type: 'query (int)', required: false, default: '10', description: 'Items per page (range: 1-100).' }
        ],
        returns: {
          type: 'Array of Account Objects',
          description: 'List of account records matching pagination.'
        },
        example: `const res = await apiClient.get("/account/?page=1&limit=10");
const accounts = res.data;`
      },
      {
        name: 'GET /account/query',
        signature: 'GET /account/query?field={FIELD}&value={VALUE}',
        description: 'Searches user accounts by exact field matching.',
        parameters: [
          { name: 'field', type: 'query (str)', required: true, description: 'Search field: "id", "uid", "email", "handle", "name", "phone".' },
          { name: 'value', type: 'query (str)', required: true, description: 'Value to search for.' }
        ],
        returns: {
          type: 'Array of Account Objects',
          description: 'Matching user account records list.'
        }
      },
      {
        name: 'POST /account/',
        signature: 'POST /account/',
        description: 'Administrative account creation endpoint with full control over user role and status.',
        parameters: [
          { name: 'name', type: 'body (str)', required: true, description: 'Display name.' },
          { name: 'email', type: 'body (str)', required: true, description: 'Email address.' },
          { name: 'password', type: 'body (str)', required: true, description: 'Account password.' },
          { name: 'handle', type: 'body (str)', required: false, description: 'Username handle.' },
          { name: 'role', type: 'body (str)', required: false, default: '"user"', description: 'Role string ("user", "admin", "superadmin").' },
          { name: 'status', type: 'body (str)', required: false, default: '"active"', description: 'Account status ("active", "suspended").' }
        ],
        returns: {
          type: 'Account Object',
          description: 'Created account dictionary.'
        }
      },
      {
        name: 'PATCH /account/',
        signature: 'PATCH /account/',
        description: 'Privileged super update endpoint capable of altering role, status, password, email, and metadata simultaneously.',
        parameters: [
          { name: 'account_id', type: 'body (int)', required: true, description: 'Target account numeric ID.' },
          { name: 'role', type: 'body (str)', required: false, description: 'New authorization role.' },
          { name: 'status', type: 'body (str)', required: false, description: 'New account status.' },
          { name: 'password', type: 'body (str)', required: false, description: 'New password (hashed internally).' },
          { name: 'name', type: 'body (str)', required: false, description: 'Updated display name.' }
        ],
        returns: {
          type: 'Account Object',
          description: 'Updated account record.'
        }
      },
      {
        name: 'DELETE /account/',
        signature: 'DELETE /account/',
        description: 'Permanently deletes an account record and cascades session/OAuth links from database.',
        parameters: [
          { name: 'account_id', type: 'body (int)', required: true, description: 'Numeric ID of target account to delete.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "Account deleted successfully"}'
        }
      }
    ],
    codeSnippet: `curl -X DELETE \${BASE_URL}/account/ \\
  -H "Authorization: Bearer superadmin-token" \\
  -H "Content-Type: application/json" \\
  -d '{ "account_id": 5 }'`
  },
  {
    id: 'dash-oauth',
    title: 'Admin OAuth Link Routes',
    module: 'OAuth Management',
    description: 'Administrative endpoints for inspecting, filtering, manually creating, and removing third-party OAuth links.',
    overview: `Base path: \`/oauth\`. Requires superadmin authentication header.`,
    schemas: [
      {
        title: 'OAuth Provider Link Record Schema',
        description: 'Database OAuth link dictionary',
        json: `{
  "id": 1,
  "account_id": 1,
  "provider": "google",
  "provider_user_id": "109876543210987654321",
  "created_at": "2026-08-07T12:00:00"
}`
      }
    ],
    methods: [
      {
        name: 'GET /oauth/',
        signature: 'GET /oauth/?page=1&limit=10',
        description: 'Returns a paginated list of all active third-party OAuth links.',
        parameters: [
          { name: 'page', type: 'query (int)', required: false, default: '1', description: 'Page number.' },
          { name: 'limit', type: 'query (int)', required: false, default: '10', description: 'Items per page.' }
        ],
        returns: {
          type: 'Array of OAuth Link Objects',
          description: 'List of OAuth provider links.'
        }
      },
      {
        name: 'GET /oauth/query',
        signature: 'GET /oauth/query?field={FIELD}&value={VALUE}',
        description: 'Searches OAuth links by field ("id", "provider_id", "account_id").',
        parameters: [
          { name: 'field', type: 'query (str)', required: true, description: 'Field name.' },
          { name: 'value', type: 'query (str)', required: true, description: 'Target search value.' }
        ],
        returns: {
          type: 'Array of OAuth Link Objects',
          description: 'Matching OAuth records list.'
        }
      },
      {
        name: 'POST /oauth/',
        signature: 'POST /oauth/',
        description: 'Manually links a third-party OAuth provider user ID to an existing local account.',
        parameters: [
          { name: 'account_id', type: 'body (int)', required: true, description: 'Numeric ID of local account.' },
          { name: 'provider', type: 'body (str)', required: true, description: 'Provider name ("google", "github").' },
          { name: 'provider_user_id', type: 'body (str)', required: true, description: 'Provider unique user identifier.' }
        ],
        returns: {
          type: 'OAuth Link Object',
          description: 'Created OAuth link dictionary.'
        }
      },
      {
        name: 'DELETE /oauth/',
        signature: 'DELETE /oauth/',
        description: 'Unlinks an OAuth provider from a local user account.',
        parameters: [
          { name: 'account_id', type: 'body (int)', required: true, description: 'Numeric account ID.' },
          { name: 'provider', type: 'body (str)', required: true, description: 'Provider name string ("google", "github").' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "OAuth link removed successfully"}'
        }
      }
    ],
    codeSnippet: `curl -X POST \${BASE_URL}/oauth/ \\
  -H "Authorization: Bearer superadmin-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "account_id": 1,
    "provider": "github",
    "provider_user_id": "12345678"
  }'`
  },
  {
    id: 'dash-otp',
    title: 'Admin OTP Management Routes',
    module: 'OTP Management',
    description: 'Administrative endpoints for generating raw One-Time Passwords, inspecting active OTPs, revoking codes, and purging expired records.',
    overview: `Base path: \`/otp\`. Requires superadmin authentication. Note: POST /otp/ creates and returns the raw unhashed OTP string and should only be invoked in trusted administrative tools.`,
    schemas: [
      {
        title: 'OTP Database Record Schema',
        description: 'Active OTP database entry dictionary',
        json: `{
  "id": 1,
  "identifier": "jane@example.com",
  "purpose": "login",
  "code_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "attempts": 0,
  "expires_at": "2026-08-07T12:05:00",
  "created_at": "2026-08-07T12:00:00"
}`
      }
    ],
    methods: [
      {
        name: 'GET /otp/',
        signature: 'GET /otp/?page=1&limit=10',
        description: 'Returns a paginated list of OTP database records.',
        parameters: [
          { name: 'page', type: 'query (int)', required: false, default: '1', description: 'Page number.' },
          { name: 'limit', type: 'query (int)', required: false, default: '10', description: 'Items per page.' }
        ],
        returns: {
          type: 'Array of OTP Records',
          description: 'List of active/historical OTP entries.'
        }
      },
      {
        name: 'GET /otp/query',
        signature: 'GET /otp/query?identifier={IDENTIFIER}',
        description: 'Looks up active OTP records by target identifier (email address or phone number).',
        parameters: [
          { name: 'identifier', type: 'query (str)', required: true, description: 'Target email address or phone string.' }
        ],
        returns: {
          type: 'Array of OTP Records',
          description: 'Matching OTP entries.'
        }
      },
      {
        name: 'POST /otp/',
        signature: 'POST /otp/',
        description: 'Generates an OTP code for an identifier and purpose, returning the raw OTP code directly in response.',
        parameters: [
          { name: 'identifier', type: 'body (str)', required: true, description: 'Recipient email or phone.' },
          { name: 'purpose', type: 'body (str)', required: true, description: 'OTP purpose ("login", "signup", "reset").' },
          { name: 'expiry', type: 'body (int)', required: false, default: '300', description: 'Validity duration in seconds.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"otp": "123456", "expires_at": 1735689600}'
        }
      },
      {
        name: 'DELETE /otp/',
        signature: 'DELETE /otp/',
        description: 'Revokes active OTP record for a given identifier and purpose.',
        parameters: [
          { name: 'identifier', type: 'body (str)', required: true, description: 'Identifier string.' },
          { name: 'purpose', type: 'body (str)', required: true, description: 'Purpose key string.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "OTP revoked successfully", "count": 1}'
        }
      },
      {
        name: 'DELETE /otp/cleanup',
        signature: 'DELETE /otp/cleanup',
        description: 'Deletes all expired OTP records from database.',
        parameters: [],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "Expired OTPs cleaned successfully", "count": 3}'
        }
      },
      {
        name: 'DELETE /otp/clear',
        signature: 'DELETE /otp/clear',
        description: 'Immediately purges ALL OTP records from database.',
        parameters: [],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "All OTPs cleared successfully", "count": 12}'
        }
      }
    ],
    codeSnippet: `curl -X DELETE \${BASE_URL}/otp/cleanup \\
  -H "Authorization: Bearer superadmin-token"`
  },
  {
    id: 'dash-session',
    title: 'Admin Session Management Routes',
    module: 'Session Management',
    description: 'Administrative endpoints for inspecting active sessions, destroying individual sessions, revoking all user sessions, and purging session records.',
    overview: `Base path: \`/session\`. Requires superadmin authorization. Security Notice: Session records store client IP addresses and User-Agent metadata.`,
    schemas: [
      {
        title: 'Active Session Database Schema',
        description: 'Session database object',
        json: `{
  "id": 9,
  "account_id": 1,
  "token_hash": "da4c0342fb73e2b5f7e03bf6adaa02b9bd2a45b8d535b1cee9f675e75e40df7d",
  "ip_address": "203.0.113.10",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "expires_at": "2026-08-08T12:00:00",
  "created_at": "2026-08-07T12:00:00"
}`
      }
    ],
    methods: [
      {
        name: 'GET /session/',
        signature: 'GET /session/?page=1&limit=10',
        description: 'Returns a paginated list of active server-side session records.',
        parameters: [
          { name: 'page', type: 'query (int)', required: false, default: '1', description: 'Page number.' },
          { name: 'limit', type: 'query (int)', required: false, default: '10', description: 'Items per page.' }
        ],
        returns: {
          type: 'Array of Session Records',
          description: 'Active session entries.'
        }
      },
      {
        name: 'GET /session/query',
        signature: 'GET /session/query?field={FIELD}&value={VALUE}',
        description: 'Searches session records by field ("id", "sid", "token", "ip"). Supports partial IP matching.',
        parameters: [
          { name: 'field', type: 'query (str)', required: true, description: 'Field name.' },
          { name: 'value', type: 'query (str)', required: true, description: 'Query value.' }
        ],
        returns: {
          type: 'Array of Session Records',
          description: 'Matching session entries list.'
        }
      },
      {
        name: 'DELETE /session/',
        signature: 'DELETE /session/',
        description: 'Destroys a single specific active session by numeric session ID.',
        parameters: [
          { name: 'session_id', type: 'body (int)', required: true, description: 'Numeric session ID to terminate.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "Session destroyed successfully"}'
        }
      },
      {
        name: 'DELETE /session/all',
        signature: 'DELETE /session/all',
        description: 'Destroys all active sessions belonging to a specific user account ID (forces logout across all devices).',
        parameters: [
          { name: 'account_id', type: 'body (int)', required: true, description: 'Numeric user account ID.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "All sessions destroyed for account", "count": 2}'
        }
      },
      {
        name: 'DELETE /session/cleanup',
        signature: 'DELETE /session/cleanup',
        description: 'Deletes all expired session records from database.',
        parameters: [],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "Expired sessions cleaned up successfully", "count": 5}'
        }
      },
      {
        name: 'DELETE /session/clear',
        signature: 'DELETE /session/clear',
        description: 'Immediately purges ALL active session records from database.',
        parameters: [],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "All sessions cleared successfully", "count": 14}'
        }
      }
    ],
    codeSnippet: `curl -X DELETE \${BASE_URL}/session/all \\
  -H "Authorization: Bearer superadmin-token" \\
  -H "Content-Type: application/json" \\
  -d '{ "account_id": 1 }'`
  },
  {
    id: 'dash-config',
    title: 'Admin System & Provider Configuration Routes',
    module: 'System Configuration',
    description: 'Endpoints for viewing system configuration and updating JWT token modes (Single vs Dual Token), OAuth providers (Google, GitHub, Discord), and SMTP settings.',
    overview: `Base path: \`/config\`. Requires superadmin authentication header. Allows dynamic adjustment of authentication tokens, expiration lifetimes, and external OAuth client keys.`,
    schemas: [
      {
        title: 'System Configuration Schema',
        description: 'Complete system configuration object',
        json: `{
  "jwt": {
    "secret_key": "****************",
    "algorithm": "HS256",
    "session_duration_days": 7,
    "dual_token_mode": true,
    "access_token_expire_minutes": 15,
    "refresh_token_expire_days": 30
  },
  "smtp": {
    "host": "smtp.example.com",
    "port": 587,
    "user": "no-reply@example.com",
    "from_email": "no-reply@example.com"
  },
  "oauth": {
    "google": { "client_id": "...", "redirect_uri": "..." },
    "github": { "client_id": "...", "redirect_uri": "..." },
    "discord": { "client_id": "...", "redirect_uri": "..." }
  }
}`
      }
    ],
    methods: [
      {
        name: 'GET /config/',
        signature: 'GET /config/',
        description: 'Returns the current active system configuration including JWT mode, SMTP settings, and configured OAuth providers.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer superadmin access token.' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Full system configuration dictionary.'
        },
        example: `const res = await apiClient.get("/config/");
const config = res.data;`
      },
      {
        name: 'POST /config/jwt',
        signature: 'POST /config/jwt',
        description: 'Updates JWT configuration and toggles between Single-Token mode and Dual-Token mode with custom expiration intervals.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer superadmin access token.' },
          { name: 'secret_key', type: 'body (str)', required: false, description: 'New signing secret key.' },
          { name: 'algorithm', type: 'body (str)', required: false, description: 'Algorithm (e.g. HS256).' },
          { name: 'session_duration_days', type: 'body (int)', required: false, description: 'Token duration in days (Single-Token mode).' },
          { name: 'dual_token_mode', type: 'body (bool)', required: false, description: 'Set to true for Dual-Token mode, false for Single-Token mode.' },
          { name: 'access_token_expire_minutes', type: 'body (int)', required: false, description: 'Access token expiration in minutes (Dual-Token mode).' },
          { name: 'refresh_token_expire_days', type: 'body (int)', required: false, description: 'Refresh token lifetime in days (Dual-Token mode).' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "JWT configuration updated successfully"}'
        },
        example: `await apiClient.post("/config/jwt", {
  dual_token_mode: true,
  access_token_expire_minutes: 15,
  refresh_token_expire_days: 30
});`
      },
      {
        name: 'POST /config/discord',
        signature: 'POST /config/discord',
        description: 'Updates Discord OAuth2 application client ID, client secret, and authorized redirect URI.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer superadmin access token.' },
          { name: 'client_id', type: 'body (str)', required: true, description: 'Discord Application Client ID.' },
          { name: 'client_secret', type: 'body (str)', required: true, description: 'Discord Application Client Secret.' },
          { name: 'redirect_uri', type: 'body (str)', required: true, description: 'Registered Discord callback redirect URI.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "Discord configuration updated successfully"}'
        },
        example: `await apiClient.post("/config/discord", {
  client_id: "123456789012345678",
  client_secret: "DISCORD_SECRET_HERE",
  redirect_uri: "https://api.example.com/oauth/discord/callback"
});`
      },
      {
        name: 'POST /config/google',
        signature: 'POST /config/google',
        description: 'Updates Google OAuth 2.0 Client ID, Client Secret, and redirect URI.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer superadmin access token.' },
          { name: 'client_id', type: 'body (str)', required: true, description: 'Google Cloud Client ID.' },
          { name: 'client_secret', type: 'body (str)', required: true, description: 'Google Cloud Client Secret.' },
          { name: 'redirect_uri', type: 'body (str)', required: true, description: 'Google Cloud authorized redirect URI.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "Google configuration updated successfully"}'
        }
      },
      {
        name: 'POST /config/github',
        signature: 'POST /config/github',
        description: 'Updates GitHub OAuth application Client ID, Client Secret, and redirect URI.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer superadmin access token.' },
          { name: 'client_id', type: 'body (str)', required: true, description: 'GitHub OAuth Client ID.' },
          { name: 'client_secret', type: 'body (str)', required: true, description: 'GitHub OAuth Client Secret.' },
          { name: 'redirect_uri', type: 'body (str)', required: true, description: 'GitHub OAuth callback redirect URI.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"success": true, "message": "GitHub configuration updated successfully"}'
        }
      }
    ],
    codeSnippet: `curl -X POST \${BASE_URL}/config/jwt \\
  -H "Authorization: Bearer superadmin-token" \\
  -H "Content-Type: application/json" \\
  -d '{ "dual_token_mode": true, "access_token_expire_minutes": 15, "refresh_token_expire_days": 30 }'`
  },
  {
    id: 'system-route',
    title: 'System Routes Placeholder',
    module: 'tc_auth.api.system_route',
    description: 'Internal system route module reserved for platform extensions and automated background hooks.',
    overview: `The module \`tc_auth/api/system_route.py\` is reserved for internal framework lifecycle hooks and background health monitors.`,
    content: `Currently, no public API routes are declared under system_route.py. Additional endpoints will be added here as system requirements evolve.`,
    codeSnippet: `# tc_auth/api/system_route.py
from fastapi import APIRouter

router = APIRouter(prefix="/system", tags=["System"])
# System extensions will be attached here.`
  }
];

export const API_DOCS_PLACEHOLDER = API_DOCS;

