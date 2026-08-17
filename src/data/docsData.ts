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
  "auth.deps": "FastAPI dependency injection for route authentication",
  "auth.roles": "Role-Based Access Control (RBAC) route dependencies",
  "auth.status": "Account Status authorization dependencies",
  "auth.dashboard": "System metrics & total database resource counts"
}`
      }
    ],
    methods: [
      {
        name: '__init__',
        signature: 'Auth(engine: Engine, app: FastAPI)',
        description: 'Initializes the tc_auth core engine and registers attached sub-services.',
        isAsync: false,
        parameters: [
          { name: 'engine', type: 'sqlalchemy.Engine', required: true, description: 'Active SQLAlchemy engine instance connected to PostgreSQL or MySQL.' },
          { name: 'app', type: 'fastapi.FastAPI', required: true, description: 'Primary FastAPI application instance.' }
        ],
        returns: { type: 'Auth', description: 'Initialized Auth instance containing all sub-service properties.' },
        notes: 'Must be instantiated before registering any FastAPI routes or route dependencies.',
        example: `from tc_auth import Auth
from fastapi import FastAPI
from sqlalchemy import create_engine

app = FastAPI()
engine = create_engine("postgresql://workspace:admin@localhost:5432/tc_auth")
auth = Auth(engine=engine, app=app)`
      }
    ],
    codeSnippet: `from tc_auth import Auth
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine

# 1. FastAPI App Instance
app = FastAPI(title="Total Chaos Auth API")

# 2. Database Engine Connection
engine = create_engine("postgresql://workspace:admin@localhost:5432/tc_auth")

# 3. Initialize Auth System
auth = Auth(engine=engine, app=app)

# 4. Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://api.codesena.me", "https://codesena.me", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Email Configuration (SMTP)
auth.email.config(
    host="smtp.gmail.com",
    port=587,
    username="your-email@gmail.com",
    password="your-app-password",
    sender="your-email@gmail.com",
    sender_name="CodeSena Auth",
    use_tls=True
)

# 6. OAuth Configurations
auth.google.config(
    client_id="YOUR_GOOGLE_CLIENT_ID",
    client_secret="YOUR_GOOGLE_CLIENT_SECRET",
    redirect_uri="https://api.codesena.me/tc-auth/google/callback"
)

auth.github.config(
    client_id="YOUR_GITHUB_CLIENT_ID",
    client_secret="YOUR_GITHUB_CLIENT_SECRET",
    redirect_uri="https://api.codesena.me/tc-auth/github/callback"
)

# 7. JWT Settings
auth.jwt.config(
    secret_key="your-super-secret-key",
    algorithm="HS256",
    session_duration_days=7
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("connect:app", host="0.0.0.0", port=8000, reload=True)`
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
    codeSnippet: `from usage import auth

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
        signature: 'delete_user(account_id: int) -> None',
        description: 'Permanently deletes an account record from database by numeric ID.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric database primary key ID of account.' }
        ],
        returns: { type: 'None', description: 'None' }
      },
      {
        name: 'update_user',
        signature: 'update_user(account_id: int, name: str = None, email: str = None, handle: str = None, avatar_url: str = None, phone: str = None) -> None',
        description: 'Updates non-privileged standard fields of an existing account.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'name', type: 'str', required: false, description: 'Updated display name.' },
          { name: 'email', type: 'str', required: false, description: 'Updated email.' },
          { name: 'handle', type: 'str', required: false, description: 'Updated handle.' },
          { name: 'avatar_url', type: 'str', required: false, description: 'Updated avatar URL.' },
          { name: 'phone', type: 'str', required: false, description: 'Updated phone number.' }
        ],
        returns: { type: 'None', description: 'None' },
        notes: 'Does NOT update password, role, or status. Use update_password(), update_role(), or super_update().'
      },
      {
        name: 'super_update',
        signature: 'super_update(account_id: int, name: str = None, email: str = None, handle: str = None, avatar_url: str = None, phone: str = None, role: str = "user", status: str = None, password: str = None) -> None',
        description: 'Privileged administrative update capable of altering role, status, password, and standard fields simultaneously.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'role', type: 'str', required: false, description: 'New authorization role.' },
          { name: 'status', type: 'str', required: false, description: 'New account status.' },
          { name: 'password', type: 'str', required: false, description: 'New plain-text password (hashed internally).' }
        ],
        returns: { type: 'None', description: 'None' }
      },
      {
        name: 'update_password',
        signature: 'update_password(account_id: int, password: str) -> None',
        description: 'Hashes and updates password for an account.',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'password', type: 'str', required: true, description: 'New plain password.' }
        ],
        returns: { type: 'None', description: 'None' }
      },
      {
        name: 'update_status',
        signature: 'update_status(account_id: int, status: str) -> None',
        description: 'Changes account status (e.g. "active", "suspended", "inactive").',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'status', type: 'str', required: true, description: 'New status string.' }
        ],
        returns: { type: 'None', description: 'None' }
      },
      {
        name: 'update_role',
        signature: 'update_role(account_id: int, role: str) -> None',
        description: 'Changes account role (e.g. "user", "admin", "superadmin").',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' },
          { name: 'role', type: 'str', required: true, description: 'New role string.' }
        ],
        returns: { type: 'None', description: 'None' }
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
    codeSnippet: `from usage import auth

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
        signature: 'destroy_session(session_id: int) -> None',
        description: 'Deletes a single session record from database.',
        parameters: [
          { name: 'session_id', type: 'int', required: true, description: 'Numeric session ID.' }
        ],
        returns: { type: 'None', description: 'None' }
      },
      {
        name: 'destroy_all',
        signature: 'destroy_all(account_id: int) -> None',
        description: 'Deletes all sessions belonging to an account (logout from all devices).',
        parameters: [
          { name: 'account_id', type: 'int', required: true, description: 'Numeric account ID.' }
        ],
        returns: { type: 'None', description: 'None' }
      },
      {
        name: 'cleanup_expired',
        signature: 'cleanup_expired() -> None',
        description: 'Deletes all expired session records from the database.',
        returns: { type: 'None', description: 'None' }
      },
      {
        name: 'clear_all',
        signature: 'clear_all() -> None',
        description: 'Immediately purges ALL session records from database.',
        returns: { type: 'None', description: 'None' }
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
        signature: 'revoke(identifier: str, purpose: str) -> None',
        description: 'Deletes active OTP record for identifier and purpose.',
        parameters: [
          { name: 'identifier', type: 'str', required: true, description: 'Target email or phone.' },
          { name: 'purpose', type: 'str', required: true, description: 'Purpose string.' }
        ],
        returns: { type: 'None', description: 'None' }
      },
      {
        name: 'cleanup',
        signature: 'cleanup() -> None',
        description: 'Deletes all expired OTP records from database.',
        returns: { type: 'None', description: 'None' }
      },
      {
        name: 'clear_all',
        signature: 'clear_all() -> None',
        description: 'Immediately deletes ALL OTP records from database.',
        returns: { type: 'None', description: 'None' }
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
        signature: 'config(host: str, port: int, username: str, password: str, sender: str, sender_name: str = None, use_tls: bool = True) -> None',
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
        returns: { type: 'None', description: 'None' }
      },
      {
        name: 'load',
        signature: 'load() -> dict',
        description: 'Retrieves current SMTP configuration dictionary.',
        returns: { type: 'dict', description: 'Dictionary containing host, port, username, sender, etc.' }
      },
      {
        name: 'send',
        signature: 'send(to: str, subject: str, body: str, html: bool = False) -> None',
        description: 'Sends a custom plain text or HTML email message.',
        parameters: [
          { name: 'to', type: 'str', required: true, description: 'Recipient email address.' },
          { name: 'subject', type: 'str', required: true, description: 'Email subject.' },
          { name: 'body', type: 'str', required: true, description: 'Email body text or HTML.' },
          { name: 'html', type: 'bool', required: false, default: 'False', description: 'Set True for HTML rendering.' }
        ],
        returns: { type: 'None', description: 'None' }
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
        returns: { type: 'dict', description: '{"expires_at": "2026-08-11T18:16:00.001639"}' }
      },
      {
        name: 'send_login_otp',
        signature: 'send_login_otp(email: str) -> dict',
        description: 'Convenience helper that executes send_otp(email, purpose="login").',
        parameters: [
          { name: 'email', type: 'str', required: true, description: 'Recipient email address.' }
        ],
        returns: { type: 'dict', description: '{"expires_at": "..."}' }
      },
      {
        name: 'send_signup_otp',
        signature: 'send_signup_otp(email: str) -> dict',
        description: 'Convenience helper that executes send_otp(email, purpose="signup").',
        parameters: [
          { name: 'email', type: 'str', required: true, description: 'Recipient email address.' }
        ],
        returns: { type: 'dict', description: '{"expires_at": "..."}' }
      },
      {
        name: 'send_verify_email',
        signature: 'send_verify_email(email: str) -> dict',
        description: 'Convenience helper that executes send_otp(email, purpose="verify_email").',
        parameters: [
          { name: 'email', type: 'str', required: true, description: 'Recipient email address.' }
        ],
        returns: { type: 'dict', description: '{"expires_at": "..."}' }
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
        returns: { type: 'dict', description: 'Unlinked OAuth object.' }
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
        signature: 'config(client_id: str, client_secret: str, redirect_uri: str) -> None',
        description: 'Configures Google OAuth app credentials.',
        parameters: [
          { name: 'client_id', type: 'str', required: true, description: 'Google OAuth Client ID.' },
          { name: 'client_secret', type: 'str', required: true, description: 'Google OAuth Client Secret.' },
          { name: 'redirect_uri', type: 'str', required: true, description: 'Authorized redirect URI.' }
        ],
        returns: { type: 'None', description: 'None' }
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
        signature: 'config(client_id: str, client_secret: str, redirect_uri: str) -> None',
        description: 'Configures GitHub OAuth credentials.',
        parameters: [
          { name: 'client_id', type: 'str', required: true, description: 'GitHub OAuth Client ID.' },
          { name: 'client_secret', type: 'str', required: true, description: 'GitHub OAuth Client Secret.' },
          { name: 'redirect_uri', type: 'str', required: true, description: 'Authorized callback URL.' }
        ],
        returns: { type: 'None', description: 'None' }
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
from usage import auth

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
    id: 'deps',
    title: 'FastAPI Dependencies',
    module: 'auth.deps',
    description: 'FastAPI route injection dependencies for verifying JWT and active session state.',
    overview: `The \`auth.deps\` module provides FastAPI \`Depends()\` utilities that verify JWT signatures AND validate active server-side database sessions simultaneously.`,
    content: `If a session was revoked in the database, these dependencies immediately reject the request even if the JWT signature is cryptographically valid.`,
    schemas: [
      {
        title: 'Complete Auth Context Schema',
        description: 'Object returned when using user = Depends(auth.deps.get_current())',
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
        signature: 'get_current() -> Callable',
        description: 'FastAPI dependency that validates request authorization header and returns full auth context (account, session, payload).',
        returns: { type: 'Callable', description: 'FastAPI dependency function yielding {"account": dict, "session": dict, "payload": dict}.' },
        exceptions: ['HTTPException(401): Missing or invalid Bearer authorization header or revoked session.']
      },
      {
        name: 'get_current_account',
        signature: 'get_current_account() -> Callable',
        description: 'FastAPI dependency that injects only the authenticated account object.',
        returns: { type: 'Callable', description: 'FastAPI dependency function yielding account dictionary.' }
      },
      {
        name: 'get_current_session',
        signature: 'get_current_session() -> Callable',
        description: 'FastAPI dependency that injects only the active session object.',
        returns: { type: 'Callable', description: 'FastAPI dependency function yielding session dictionary.' }
      },
      {
        name: 'get_current_payload',
        signature: 'get_current_payload() -> Callable',
        description: 'FastAPI dependency that injects only the verified JWT decoded payload dictionary.',
        returns: { type: 'Callable', description: 'FastAPI dependency function yielding {"aid": int, "sid": int, "exp": int}.' }
      }
    ],
    codeSnippet: `from fastapi import FastAPI, Depends
from usage import auth

app = FastAPI()

# Protected route using full auth context
@app.get("/me")
def fetch_me(user=Depends(auth.deps.get_current())):
    return user

# Protected route using account only
@app.get("/me/account")
def fetch_account(account=Depends(auth.deps.get_current_account())):
    return account`
  },
  {
    id: 'roles',
    title: 'Role Authorization',
    module: 'auth.roles',
    description: 'FastAPI route protection dependencies for Role-Based Access Control (RBAC).',
    overview: `The \`auth.roles\` module provides authorization dependencies that execute AFTER authentication passes. It enforces role requirements (e.g. "admin", "moderator", "user").`,
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
from usage import auth

app = FastAPI()

# Only "admin" role allowed
@app.get("/admin/dashboard")
def admin_route(user=Depends(auth.roles.require("admin"))):
    return user

# "admin" OR "moderator" allowed
@app.get("/moderation")
def staff_route(user=Depends(auth.roles.allow("admin", "moderator"))):
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
from usage import auth

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
    methods: [
      {
        name: 'config',
        signature: 'config(secret_key: str, algorithm: str = "HS256", session_duration_days: int = 7) -> None',
        description: 'Configures JWT signing parameters.',
        parameters: [
          { name: 'secret_key', type: 'str', required: true, description: 'Secret key string.' },
          { name: 'algorithm', type: 'str', required: false, default: '"HS256"', description: 'HMAC algorithm.' },
          { name: 'session_duration_days', type: 'int', required: false, default: '7', description: 'Token expiration duration in days.' }
        ],
        returns: { type: 'None', description: 'None' }
      },
      {
        name: 'load',
        signature: 'load() -> dict',
        description: 'Returns current JWT configuration.',
        returns: { type: 'dict', description: '{"secret_key": ..., "algorithm": ..., "session_duration_days": ...}' }
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
      }
    ],
    codeSnippet: `from usage import auth

# Configure JWT
auth.jwt.config(secret_key="supersecretkey", algorithm="HS256", session_duration_days=7)

# Create Token
token = auth.jwt.create_access_token(data={"aid": 1, "sid": 60})

# Verify Token
payload = auth.jwt.verify_token(token=token)`
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
    codeSnippet: `from usage import auth

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
    module: '/tc-auth',
    description: 'Public authentication endpoints for account registration, email/password login, email OTP login, and password resetting.',
    overview: `Base path: \`/tc-auth\`. All endpoints in this section are publicly accessible. Successful signup and login requests return an \`access_token\` JWT string that must be attached as a Bearer header (\`Authorization: Bearer <access_token>\`) for protected endpoints.`,
    content: `Common Status Codes:
- 200 OK: Request succeeded. Returns access token or operation result.
- 400 Bad Request: Missing required body parameters or payload validation failure.
- 401 Unauthorized: Invalid credentials or incorrect/expired One-Time Password (OTP).
- 404 Not Found: Account with provided email or handle does not exist.`,
    schemas: [
      {
        title: 'Standard Login / Authentication Response Schema',
        description: 'Dictionary payload returned by signup/otp, signup/password, login/otp, login/password, and forgot/password',
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
      }
    ],
    methods: [
      {
        name: 'POST /tc-auth/send/email/otp/{purpose}',
        signature: 'POST /tc-auth/send/email/otp/{purpose}',
        description: 'Generates and sends a 6-digit numeric One-Time Password via SMTP to the recipient email address for a specific authentication flow.',
        parameters: [
          { name: 'purpose', type: 'path', required: true, description: 'OTP purpose flow key: "signup", "login", "reset", or "verify".' },
          { name: 'email', type: 'body (str)', required: true, description: 'Target email address to receive the OTP code.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"expires_at": 1735689600}'
        },
        exceptions: ['400 Bad Request: Invalid email format or missing body field.', '500 Internal Error: SMTP delivery failure.'],
        example: `// Request
await fetch("https://api.example.com/tc-auth/send/email/otp/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "jane@example.com" })
});`
      },
      {
        name: 'POST /tc-auth/signup/otp',
        signature: 'POST /tc-auth/signup/otp',
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
        example: `const res = await fetch("https://api.example.com/tc-auth/signup/otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
    otp: "123456",
    handle: "jane"
  })
});
const data = await res.json();`
      },
      {
        name: 'POST /tc-auth/signup/password',
        signature: 'POST /tc-auth/signup/password',
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
        example: `const res = await fetch("https://api.example.com/tc-auth/signup/password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Jane Doe",
    email: "jane@example.com",
    handle: "jane",
    password: "password123"
  })
});
const data = await res.json();`
      },
      {
        name: 'POST /tc-auth/login/otp',
        signature: 'POST /tc-auth/login/otp',
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
        example: `const res = await fetch("https://api.example.com/tc-auth/login/otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "jane@example.com",
    otp: "123456"
  })
});
const data = await res.json();`
      },
      {
        name: 'POST /tc-auth/login/password',
        signature: 'POST /tc-auth/login/password',
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
        example: `const res = await fetch("https://api.example.com/tc-auth/login/password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    identifier: "jane@example.com",
    password: "password123"
  })
});
const data = await res.json();`
      },
      {
        name: 'POST /tc-auth/forgot/password',
        signature: 'POST /tc-auth/forgot/password',
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
        example: `const res = await fetch("https://api.example.com/tc-auth/forgot/password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "jane@example.com",
    otp: "123456",
    password: "new-password123"
  })
});
const data = await res.json();`
      }
    ],
    codeSnippet: `// cURL Example: Login with Password
curl -X POST https://api.example.com/tc-auth/login/password \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "jane@example.com",
    "password": "password123"
  }'`
  },
  {
    id: 'oauth-routes',
    title: 'OAuth Login Routes',
    module: '/tc-auth',
    description: 'Browser-facing OAuth redirection endpoints for initiating and completing Google OpenID Connect and GitHub OAuth authentication.',
    overview: `Base path: \`/tc-auth\`. These endpoints manage browser redirects during third-party sign-in flows. The callback routes write session state cookies, so browsers must maintain cookies throughout the redirect chain.`,
    content: `OAuth Flow Overview:
1. User clicks provider login button in frontend application.
2. Frontend navigates browser to GET /tc-auth/{provider}/login?frontend_url={URL}.
3. Backend saves frontend_url in session and redirects browser to provider authorization consent page.
4. User authorizes request; provider redirects browser to backend GET /tc-auth/{provider}/callback with state and code.
5. Backend exchanges code for user profile, links or creates account, issues session token, and redirects browser back to \`\${frontend_url}/oauth/callback?access_token=...\`.`,
    methods: [
      {
        name: 'GET /tc-auth/google/login',
        signature: 'GET /tc-auth/google/login?frontend_url={URL}',
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
window.location.href = \`\${baseUrl}/tc-auth/google/login?frontend_url=\${encodeURIComponent(frontendUrl)}\`;`
      },
      {
        name: 'GET /tc-auth/google/callback',
        signature: 'GET /tc-auth/google/callback?code={CODE}&state={STATE}',
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
        name: 'GET /tc-auth/github/login',
        signature: 'GET /tc-auth/github/login?frontend_url={URL}',
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
window.location.href = \`\${baseUrl}/tc-auth/github/login?frontend_url=\${encodeURIComponent(frontendUrl)}\`;`
      },
      {
        name: 'GET /tc-auth/github/callback',
        signature: 'GET /tc-auth/github/callback?code={CODE}&state={STATE}',
        description: 'Callback target registered in GitHub Developer Settings. Fetches profile (including primary private email resolution), creates account/link, and redirects to frontend with access_token.',
        parameters: [
          { name: 'code', type: 'query (str)', required: true, description: 'Authorization code from GitHub.' },
          { name: 'state', type: 'query (str)', required: false, description: 'CSRF state string.' }
        ],
        returns: {
          type: 'HTTP 302 Redirect',
          description: 'Redirects browser to ${frontend_url}/oauth/callback?access_token={JWT_TOKEN}'
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
1. Configure provider credentials via Admin API: POST /tc-auth/config/google or POST /tc-auth/config/github.
2. Register exact redirect URIs in provider developer consoles:
   - Google: https://api.example.com/tc-auth/google/callback
   - GitHub: https://api.example.com/tc-auth/github/callback
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
    const url = \`\${backendUrl}/tc-auth/google/login?frontend_url=\${encodeURIComponent(frontendUrl)}\`;
    window.location.href = url;
  };

  const handleGitHub = () => {
    const url = \`\${backendUrl}/tc-auth/github/login?frontend_url=\${encodeURIComponent(frontendUrl)}\`;
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
    module: '/tc-auth',
    description: 'Protected endpoints for retrieving user profile context, updating account details, changing passwords, and revoking sessions.',
    overview: `Base path: \`/tc-auth\`. All endpoints in this section require an active JWT session token sent in the \`Authorization: Bearer <access_token>\` request header.`,
    schemas: [
      {
        title: 'Current User Response Schema (GET /me)',
        description: 'Comprehensive context dictionary returned by GET /tc-auth/me',
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
      }
    ],
    methods: [
      {
        name: 'GET /tc-auth/me',
        signature: 'GET /tc-auth/me',
        description: 'Returns profile details for authenticated user, current active session record, and decoded JWT payload claims.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer access token (e.g. "Bearer eyJhbGci...")' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Dictionary containing account, session, and payload objects.'
        },
        exceptions: ['401 Unauthorized: Invalid or expired Bearer access token.'],
        example: `const res = await fetch("https://api.example.com/tc-auth/me", {
  method: "GET",
  headers: {
    "Authorization": \`Bearer \${accessToken}\`
  }
});
const me = await res.json();`
      },
      {
        name: 'PATCH /tc-auth/me',
        signature: 'PATCH /tc-auth/me',
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
        example: `const res = await fetch("https://api.example.com/tc-auth/me", {
  method: "PATCH",
  headers: {
    "Authorization": \`Bearer \${accessToken}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "Jane Doe",
    avatar_url: "https://example.com/new-avatar.png"
  })
});
const account = await res.json();`
      },
      {
        name: 'PUT /tc-auth/update/password',
        signature: 'PUT /tc-auth/update/password',
        description: 'Hashes and updates plain-text password for the currently authenticated user.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer access token.' },
          { name: 'password', type: 'body (str)', required: true, description: 'New plain-text password.' }
        ],
        returns: {
          type: 'null',
          description: 'Returns null on success.'
        },
        exceptions: ['401 Unauthorized: Invalid access token.'],
        example: `await fetch("https://api.example.com/tc-auth/update/password", {
  method: "PUT",
  headers: {
    "Authorization": \`Bearer \${accessToken}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ password: "new-secure-password123" })
});`
      },
      {
        name: 'POST /tc-auth/logout',
        signature: 'POST /tc-auth/logout',
        description: 'Destroys the current active session record from the database and revokes session token.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer access token.' }
        ],
        returns: {
          type: 'null',
          description: 'Returns null on success.'
        },
        example: `await fetch("https://api.example.com/tc-auth/logout", {
  method: "POST",
  headers: { "Authorization": \`Bearer \${accessToken}\` }
});`
      },
      {
        name: 'POST /tc-auth/logout-all',
        signature: 'POST /tc-auth/logout-all',
        description: 'Revokes all active sessions across all devices for the current account.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Bearer access token.' }
        ],
        returns: {
          type: 'null',
          description: 'Returns null on success.'
        },
        example: `await fetch("https://api.example.com/tc-auth/logout-all", {
  method: "POST",
  headers: { "Authorization": \`Bearer \${accessToken}\` }
});`
      }
    ],
    codeSnippet: `curl -X GET https://api.example.com/tc-auth/me \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
  },
  {
    id: 'dashboard-routes',
    title: 'Dashboard & System Config Routes',
    module: '/tc-auth/config',
    description: 'System health check probe, live credentials loader, system metrics counters, and runtime service configuration setters.',
    overview: `Base path: \`/tc-auth/config\`. \`GET /pulse\` is public. All other endpoints require superadmin authorization header.`,
    schemas: [
      {
        title: 'System Configuration Load Response Schema',
        description: 'JSON returned by GET /tc-auth/config/load/',
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
      }
    ],
    methods: [
      {
        name: 'GET /tc-auth/config/pulse',
        signature: 'GET /tc-auth/config/pulse',
        description: 'Public health probe endpoint for monitoring service status, system clock, and availability.',
        parameters: [],
        returns: {
          type: 'JSON Object',
          description: '{"system_time": "2026-08-12T10:00:00.000000", "response": "Hello", "status": "healthy", "state": "active"}'
        },
        example: `const res = await fetch("https://api.example.com/tc-auth/config/pulse");
const data = await res.json();`
      },
      {
        name: 'GET /tc-auth/config/load/',
        signature: 'GET /tc-auth/config/load/',
        description: 'Loads active configuration settings for SMTP Email, GitHub OAuth, Google OAuth, and JWT Key settings.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin Bearer access token.' }
        ],
        returns: {
          type: 'JSON Object',
          description: 'Full config dictionary with masked sensitive credentials.'
        },
        exceptions: ['403 Forbidden: Account is not superadmin.'],
        example: `const res = await fetch("https://api.example.com/tc-auth/config/load/", {
  headers: { "Authorization": \`Bearer \${adminToken}\` }
});
const config = await res.json();`
      },
      {
        name: 'GET /tc-auth/config/counts',
        signature: 'GET /tc-auth/config/counts',
        description: 'Returns real-time database primary record counts for accounts, oauth links, active sessions, and OTP entries.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin Bearer access token.' }
        ],
        returns: {
          type: 'JSON Object',
          description: '{"accounts": 123, "oauth": 7, "sessions": 42, "otp": 3}'
        },
        example: `const res = await fetch("https://api.example.com/tc-auth/config/counts", {
  headers: { "Authorization": \`Bearer \${adminToken}\` }
});
const counts = await res.json();`
      },
      {
        name: 'POST /tc-auth/config/email',
        signature: 'POST /tc-auth/config/email',
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
        returns: { type: 'null', description: 'Returns null on success.' }
      },
      {
        name: 'POST /tc-auth/config/github',
        signature: 'POST /tc-auth/config/github',
        description: 'Configures GitHub OAuth App Client ID, Client Secret, and Callback Redirect URI.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin token.' },
          { name: 'client_id', type: 'body (str)', required: true, description: 'GitHub App Client ID.' },
          { name: 'client_secret', type: 'body (str)', required: true, description: 'GitHub App Client Secret.' },
          { name: 'redirect_uri', type: 'body (str)', required: true, description: 'Authorized Callback Redirect URI.' }
        ],
        returns: { type: 'null', description: 'Returns null on success.' }
      },
      {
        name: 'POST /tc-auth/config/google',
        signature: 'POST /tc-auth/config/google',
        description: 'Configures Google Cloud OAuth Client ID, Client Secret, and Callback Redirect URI.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin token.' },
          { name: 'client_id', type: 'body (str)', required: true, description: 'Google OAuth Client ID.' },
          { name: 'client_secret', type: 'body (str)', required: true, description: 'Google OAuth Client Secret.' },
          { name: 'redirect_uri', type: 'body (str)', required: true, description: 'Authorized Redirect URI.' }
        ],
        returns: { type: 'null', description: 'Returns null on success.' }
      },
      {
        name: 'POST /tc-auth/config/jwt',
        signature: 'POST /tc-auth/config/jwt',
        description: 'Configures JWT signing secret key, cryptographic algorithm, and active session duration in days.',
        parameters: [
          { name: 'Authorization', type: 'header (str)', required: true, description: 'Superadmin token.' },
          { name: 'secret_key', type: 'body (str)', required: true, description: 'JWT signing secret key.' },
          { name: 'algorithm', type: 'body (str)', required: false, default: '"HS256"', description: 'Signing algorithm.' },
          { name: 'session_duration_days', type: 'body (int)', required: false, default: '7', description: 'Session lifetime in days.' }
        ],
        returns: { type: 'null', description: 'Returns null on success.' }
      }
    ],
    codeSnippet: `curl -X GET https://api.example.com/tc-auth/config/load/ \\
  -H "Authorization: Bearer superadmin-secret-token"`
  },
  {
    id: 'dash-account',
    title: 'Admin Account Routes',
    module: '/tc-auth/account',
    description: 'Administrative endpoints for querying, creating, super-updating, and deleting system user accounts.',
    overview: `Base path: \`/tc-auth/account\`. Authentication required: \`Authorization: Bearer <access_token>\` belonging to an account with the \`superadmin\` role.`,
    methods: [
      {
        name: 'GET /tc-auth/account/',
        signature: 'GET /tc-auth/account/?page=1&limit=10',
        description: 'Returns a paginated collection of user account records.',
        parameters: [
          { name: 'page', type: 'query (int)', required: false, default: '1', description: 'Page number (minimum: 1).' },
          { name: 'limit', type: 'query (int)', required: false, default: '10', description: 'Items per page (range: 1-100).' }
        ],
        returns: {
          type: 'Array of Account Objects',
          description: 'List of account records matching pagination.'
        },
        example: `const res = await fetch("https://api.example.com/tc-auth/account/?page=1&limit=10", {
  headers: { "Authorization": \`Bearer \${adminToken}\` }
});
const accounts = await res.json();`
      },
      {
        name: 'GET /tc-auth/account/query',
        signature: 'GET /tc-auth/account/query?field={FIELD}&value={VALUE}',
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
        name: 'POST /tc-auth/account/',
        signature: 'POST /tc-auth/account/',
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
        name: 'PATCH /tc-auth/account/',
        signature: 'PATCH /tc-auth/account/',
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
        name: 'DELETE /tc-auth/account/',
        signature: 'DELETE /tc-auth/account/',
        description: 'Permanently deletes an account record and cascades session/OAuth links from database.',
        parameters: [
          { name: 'account_id', type: 'body (int)', required: true, description: 'Numeric ID of target account to delete.' }
        ],
        returns: {
          type: 'null',
          description: 'Returns null on success.'
        }
      }
    ],
    codeSnippet: `curl -X DELETE https://api.example.com/tc-auth/account/ \\
  -H "Authorization: Bearer superadmin-token" \\
  -H "Content-Type: application/json" \\
  -d '{ "account_id": 5 }'`
  },
  {
    id: 'dash-oauth',
    title: 'Admin OAuth Link Routes',
    module: '/tc-auth/oauth',
    description: 'Administrative endpoints for inspecting, filtering, manually creating, and removing third-party OAuth links.',
    overview: `Base path: \`/tc-auth/oauth\`. Requires superadmin authentication header.`,
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
        name: 'GET /tc-auth/oauth/',
        signature: 'GET /tc-auth/oauth/?page=1&limit=10',
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
        name: 'GET /tc-auth/oauth/query',
        signature: 'GET /tc-auth/oauth/query?field={FIELD}&value={VALUE}',
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
        name: 'POST /tc-auth/oauth/',
        signature: 'POST /tc-auth/oauth/',
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
        name: 'DELETE /tc-auth/oauth/',
        signature: 'DELETE /tc-auth/oauth/',
        description: 'Unlinks an OAuth provider from a local user account.',
        parameters: [
          { name: 'account_id', type: 'body (int)', required: true, description: 'Numeric account ID.' },
          { name: 'provider', type: 'body (str)', required: true, description: 'Provider name string ("google", "github").' }
        ],
        returns: {
          type: 'null',
          description: 'Returns null on success.'
        }
      }
    ],
    codeSnippet: `curl -X POST https://api.example.com/tc-auth/oauth/ \\
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
    module: '/tc-auth/otp',
    description: 'Administrative endpoints for generating raw One-Time Passwords, inspecting active OTPs, revoking codes, and purging expired records.',
    overview: `Base path: \`/tc-auth/otp\`. Requires superadmin authentication. Note: POST /tc-auth/otp/ creates and returns the raw unhashed OTP string and should only be invoked in trusted administrative tools.`,
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
        name: 'GET /tc-auth/otp/',
        signature: 'GET /tc-auth/otp/?page=1&limit=10',
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
        name: 'GET /tc-auth/otp/query',
        signature: 'GET /tc-auth/otp/query?identifier={IDENTIFIER}',
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
        name: 'POST /tc-auth/otp/',
        signature: 'POST /tc-auth/otp/',
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
        name: 'DELETE /tc-auth/otp/',
        signature: 'DELETE /tc-auth/otp/',
        description: 'Revokes active OTP record for a given identifier and purpose.',
        parameters: [
          { name: 'identifier', type: 'body (str)', required: true, description: 'Identifier string.' },
          { name: 'purpose', type: 'body (str)', required: true, description: 'Purpose key string.' }
        ],
        returns: { type: 'null', description: 'Returns null on success.' }
      },
      {
        name: 'DELETE /tc-auth/otp/cleanup',
        signature: 'DELETE /tc-auth/otp/cleanup',
        description: 'Deletes all expired OTP records from database.',
        parameters: [],
        returns: { type: 'null', description: 'Returns null on success.' }
      },
      {
        name: 'DELETE /tc-auth/otp/clear',
        signature: 'DELETE /tc-auth/otp/clear',
        description: 'Immediately purges ALL OTP records from database.',
        parameters: [],
        returns: { type: 'null', description: 'Returns null on success.' }
      }
    ],
    codeSnippet: `curl -X DELETE https://api.example.com/tc-auth/otp/cleanup \\
  -H "Authorization: Bearer superadmin-token"`
  },
  {
    id: 'dash-session',
    title: 'Admin Session Management Routes',
    module: '/tc-auth/session',
    description: 'Administrative endpoints for inspecting active sessions, destroying individual sessions, revoking all user sessions, and purging session records.',
    overview: `Base path: \`/tc-auth/session\`. Requires superadmin authorization. Security Notice: Session records store client IP addresses and User-Agent metadata.`,
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
        name: 'GET /tc-auth/session/',
        signature: 'GET /tc-auth/session/?page=1&limit=10',
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
        name: 'GET /tc-auth/session/query',
        signature: 'GET /tc-auth/session/query?field={FIELD}&value={VALUE}',
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
        name: 'DELETE /tc-auth/session/',
        signature: 'DELETE /tc-auth/session/',
        description: 'Destroys a single specific active session by numeric session ID.',
        parameters: [
          { name: 'session_id', type: 'body (int)', required: true, description: 'Numeric session ID to terminate.' }
        ],
        returns: { type: 'null', description: 'Returns null on success.' }
      },
      {
        name: 'DELETE /tc-auth/session/all',
        signature: 'DELETE /tc-auth/session/all',
        description: 'Destroys all active sessions belonging to a specific user account ID (forces logout across all devices).',
        parameters: [
          { name: 'account_id', type: 'body (int)', required: true, description: 'Numeric user account ID.' }
        ],
        returns: { type: 'null', description: 'Returns null on success.' }
      },
      {
        name: 'DELETE /tc-auth/session/cleanup',
        signature: 'DELETE /tc-auth/session/cleanup',
        description: 'Deletes all expired session records from database.',
        parameters: [],
        returns: { type: 'null', description: 'Returns null on success.' }
      },
      {
        name: 'DELETE /tc-auth/session/clear',
        signature: 'DELETE /tc-auth/session/clear',
        description: 'Immediately purges ALL active session records from database.',
        parameters: [],
        returns: { type: 'null', description: 'Returns null on success.' }
      }
    ],
    codeSnippet: `curl -X DELETE https://api.example.com/tc-auth/session/all \\
  -H "Authorization: Bearer superadmin-token" \\
  -H "Content-Type: application/json" \\
  -d '{ "account_id": 1 }'`
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

