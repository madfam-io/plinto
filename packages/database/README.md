# @janua/database

> **Unified database abstraction layer** for the Janua platform

**Version:** 0.1.0 · **Databases:** PostgreSQL, Redis · **Status:** Production Ready

## 📋 Overview

@janua/database provides a unified, type-safe database abstraction layer for all Janua services. It includes PostgreSQL for primary data storage, Redis for caching and sessions, database migrations, connection pooling, and monitoring utilities.

## 🚀 Quick Start

### Installation

```bash
# Install package
yarn add @janua/database

# Install database drivers
yarn add pg redis
```

### Basic Setup

```typescript
import { Database, Redis, migrate } from '@janua/database';

// Initialize PostgreSQL
const db = new Database({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production',
  poolSize: 20
});

// Initialize Redis
const redis = new Redis({
  url: process.env.REDIS_URL,
  maxRetries: 3
});

// Run migrations
await migrate.up();

// Start using
const user = await db.users.findById(userId);
await redis.set(`user:${userId}`, user, 3600);
```

## 🏗️ Architecture

### Package Structure

```
packages/database/
├── src/
│   ├── postgres/           # PostgreSQL implementation
│   │   ├── client.ts      # Database client
│   │   ├── pool.ts        # Connection pooling
│   │   ├── query.ts       # Query builder
│   │   └── types.ts       # PostgreSQL types
│   ├── redis/             # Redis implementation
│   │   ├── client.ts      # Redis client
│   │   ├── cache.ts       # Caching utilities
│   │   ├── session.ts     # Session management
│   │   └── pubsub.ts      # Pub/Sub functionality
│   ├── migrations/        # Database migrations
│   │   ├── runner.ts      # Migration runner
│   │   ├── generator.ts   # Migration generator
│   │   └── migrations/    # Migration files
│   ├── models/           # Data models
│   │   ├── user.ts       # User model
│   │   ├── organization.ts # Organization model
│   │   ├── session.ts    # Session model
│   │   └── base.ts       # Base model class
│   ├── repositories/     # Repository pattern
│   │   ├── user.repo.ts  # User repository
│   │   ├── org.repo.ts   # Organization repository
│   │   └── base.repo.ts  # Base repository
│   ├── utils/           # Utilities
│   │   ├── connection.ts # Connection management
│   │   ├── transaction.ts # Transaction helpers
│   │   ├── monitoring.ts # Database monitoring
│   │   └── backup.ts     # Backup utilities
│   └── index.ts         # Main export
├── migrations/          # Migration files
│   ├── 001_create_users.sql
│   ├── 002_create_organizations.sql
│   └── ...
├── seeds/              # Seed data
│   ├── development.ts  # Dev seed data
│   └── test.ts        # Test seed data
├── tests/             # Test files
└── package.json      # Package config
```

### Database Architecture

```
┌─────────────────────────────────────┐
│         Application Layer           │
├─────────────────────────────────────┤
│      @janua/database               │
│  ┌───────────────────────────────┐  │
│  │     Repository Layer          │  │
│  │  ┌──────────┬──────────┐      │  │
│  │  │   ORM    │  Query   │      │  │
│  │  │  Models  │ Builder  │      │  │
│  │  └──────────┴──────────┘      │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  ┌─────────────┬─────────────┐      │
│  │ PostgreSQL  │    Redis    │      │
│  │   Primary   │  Cache/Sess │      │
│  └─────────────┴─────────────┘      │
└─────────────────────────────────────┘
```

## 🗄️ PostgreSQL

### Connection Management

```typescript
import { Database } from '@janua/database';

const db = new Database({
  // Connection options
  host: 'localhost',
  port: 5432,
  database: 'janua',
  user: 'janua_user',
  password: 'secure_password',
  
  // Or use connection string
  connectionString: 'postgresql://user:pass@host:5432/db',
  
  // Pool configuration
  poolSize: 20,
  idleTimeout: 30000,
  connectionTimeout: 2000,
  
  // SSL configuration
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync('ca-cert.pem')
  }
});

// Health check
const isHealthy = await db.healthCheck();

// Get pool stats
const stats = db.getPoolStats();
// { total: 20, idle: 15, busy: 5 }
```

### Query Builder

```typescript
import { query } from '@janua/database';

// Simple queries
const users = await query('users')
  .select('id', 'name', 'email')
  .where('active', true)
  .orderBy('created_at', 'desc')
  .limit(10)
  .execute();

// Complex queries
const results = await query('users')
  .select('u.*', 'o.name as org_name')
  .from('users', 'u')
  .leftJoin('organizations', 'o', 'u.org_id = o.id')
  .where('u.created_at', '>', new Date('2024-01-01'))
  .whereIn('u.role', ['admin', 'member'])
  .groupBy('u.id', 'o.name')
  .having('count(u.id)', '>', 5)
  .execute();

// Raw SQL when needed
const custom = await db.raw(`
  SELECT * FROM users
  WHERE email LIKE $1
  AND created_at > $2
`, ['%@example.com', yesterday]);
```

### Models & ORM

```typescript
import { Model, Column, Table } from '@janua/database';

@Table('users')
export class User extends Model {
  @Column({ primary: true })
  id: string;
  
  @Column({ unique: true })
  email: string;
  
  @Column({ nullable: true })
  name?: string;
  
  @Column({ type: 'jsonb' })
  metadata: Record<string, any>;
  
  @Column({ default: 'now()' })
  createdAt: Date;
  
  // Relationships
  async getOrganization() {
    return Organization.findById(this.orgId);
  }
  
  async getSessions() {
    return Session.where('userId', this.id);
  }
}

// Using models
const user = await User.create({
  email: 'user@example.com',
  name: 'John Doe'
});

const users = await User.where('active', true)
  .orderBy('createdAt', 'desc')
  .limit(10);

await user.update({ name: 'Jane Doe' });
await user.delete();
```

### Repositories

```typescript
import { UserRepository } from '@janua/database/repositories';

const userRepo = new UserRepository(db);

// Repository methods
const user = await userRepo.findById(userId);
const users = await userRepo.findByEmail(email);
const activeUsers = await userRepo.findActive();

// Custom repository methods
export class CustomUserRepository extends UserRepository {
  async findByOrganization(orgId: string) {
    return this.query()
      .where('org_id', orgId)
      .where('active', true)
      .execute();
  }
  
  async findWithRoles() {
    return this.query()
      .select('users.*', 'roles.name as role')
      .leftJoin('user_roles', 'ur', 'users.id = ur.user_id')
      .leftJoin('roles', 'roles.id = ur.role_id')
      .execute();
  }
}
```

### Transactions

```typescript
import { transaction } from '@janua/database';

// Automatic transaction management
const result = await transaction(async (trx) => {
  const user = await trx.users.create({
    email: 'user@example.com'
  });
  
  const org = await trx.organizations.create({
    name: 'New Org',
    ownerId: user.id
  });
  
  await trx.memberships.create({
    userId: user.id,
    orgId: org.id,
    role: 'owner'
  });
  
  return { user, org };
});

// Manual transaction control
const trx = await db.beginTransaction();
try {
  await trx.query('UPDATE users SET ...').execute();
  await trx.query('INSERT INTO logs ...').execute();
  await trx.commit();
} catch (error) {
  await trx.rollback();
  throw error;
}
```

## 🔴 Redis

### Cache Management

```typescript
import { Redis, Cache } from '@janua/database';

const redis = new Redis({
  url: 'redis://localhost:6379',
  password: 'optional',
  db: 0,
  keyPrefix: 'janua:',
  maxRetries: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000)
});

// Basic operations
await redis.set('key', 'value');
const value = await redis.get('key');
await redis.delete('key');

// With expiration
await redis.set('session:123', userData, 3600); // 1 hour TTL

// Cache helper
const cache = new Cache(redis);

const user = await cache.remember(
  `user:${userId}`,
  3600,
  async () => {
    return await db.users.findById(userId);
  }
);

// Cache invalidation
await cache.forget(`user:${userId}`);
await cache.flush(); // Clear all cache
```

### Session Store

```typescript
import { SessionStore } from '@janua/database/redis';

const sessions = new SessionStore(redis, {
  prefix: 'session:',
  ttl: 86400 // 24 hours
});

// Create session
const sessionId = await sessions.create({
  userId: 'user_123',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});

// Get session
const session = await sessions.get(sessionId);

// Update session
await sessions.touch(sessionId); // Extend TTL
await sessions.update(sessionId, { lastActive: new Date() });

// Delete session
await sessions.destroy(sessionId);

// Get all user sessions
const userSessions = await sessions.getUserSessions('user_123');
```

### Pub/Sub

```typescript
import { PubSub } from '@janua/database/redis';

const pubsub = new PubSub(redis);

// Subscribe to channels
pubsub.subscribe('auth:events', (message) => {
  console.log('Auth event:', message);
});

pubsub.subscribe('user:*', (channel, message) => {
  console.log(`Event on ${channel}:`, message);
});

// Publish messages
await pubsub.publish('auth:events', {
  type: 'user.login',
  userId: 'user_123',
  timestamp: new Date()
});

// Pattern subscriptions
pubsub.psubscribe('user:*', (pattern, channel, message) => {
  console.log(`Pattern ${pattern}, channel ${channel}:`, message);
});

// Unsubscribe
pubsub.unsubscribe('auth:events');
```

### Rate Limiting

```typescript
import { RateLimiter } from '@janua/database/redis';

const limiter = new RateLimiter(redis, {
  prefix: 'rate:',
  window: 60, // 1 minute
  maxRequests: 100
});

// Check rate limit
const { allowed, remaining, resetAt } = await limiter.check(
  `api:${userId}`
);

if (!allowed) {
  throw new Error(`Rate limit exceeded. Reset at ${resetAt}`);
}

// Consume rate limit
await limiter.consume(`api:${userId}`, 1);

// Reset rate limit
await limiter.reset(`api:${userId}`);
```

## 🔄 Migrations

### Running Migrations

```typescript
import { Migrator } from '@janua/database/migrations';

const migrator = new Migrator({
  database: db,
  migrationsPath: './migrations',
  tableName: 'migrations'
});

// Run all pending migrations
await migrator.up();

// Rollback last migration
await migrator.down();

// Run specific migration
await migrator.run('001_create_users.sql');

// Get migration status
const status = await migrator.status();
// [{ name: '001_create_users.sql', applied: true, appliedAt: Date }]
```

### Creating Migrations

```bash
# Generate new migration
yarn db:migrate:create create_products_table

# Creates: migrations/003_create_products_table.sql
```

```sql
-- migrations/003_create_products_table.sql
-- UP
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_name ON products(name);

-- DOWN
DROP TABLE IF EXISTS products;
```

### Seed Data

```typescript
import { Seeder } from '@janua/database/seeds';

const seeder = new Seeder(db);

// Run seed files
await seeder.run('development'); // seeds/development.ts
await seeder.run('test');        // seeds/test.ts

// Create seed file
export default async function seed(db: Database) {
  await db.users.createMany([
    { email: 'admin@example.com', role: 'admin' },
    { email: 'user@example.com', role: 'user' }
  ]);
  
  await db.organizations.create({
    name: 'Test Organization',
    slug: 'test-org'
  });
}
```

## 📊 Monitoring

### Database Metrics

```typescript
import { Monitor } from '@janua/database/monitoring';

const monitor = new Monitor(db, redis);

// Get database metrics
const metrics = await monitor.getMetrics();
/*
{
  postgres: {
    connections: { active: 5, idle: 15, total: 20 },
    queries: { count: 1523, avgTime: 23.5 },
    size: '152MB',
    tables: 15
  },
  redis: {
    memory: '48MB',
    connections: 10,
    ops: { get: 5234, set: 2341 },
    hitRate: 0.92
  }
}
*/

// Query performance
const slow = await monitor.getSlowQueries(100); // > 100ms

// Connection monitoring
monitor.onConnectionError((error) => {
  console.error('Database connection error:', error);
});
```

### Query Logging

```typescript
// Enable query logging
db.enableQueryLogging({
  logSlowQueries: true,
  slowQueryThreshold: 100, // ms
  logAllQueries: process.env.NODE_ENV === 'development'
});

// Query event handlers
db.on('query', (query, duration) => {
  console.log(`Query took ${duration}ms:`, query);
});

db.on('slow-query', (query, duration) => {
  logger.warn(`Slow query (${duration}ms):`, query);
});
```

## 🔐 Security

### SQL Injection Prevention

```typescript
// Parameterized queries (safe)
await db.query(
  'SELECT * FROM users WHERE email = $1 AND active = $2',
  [email, true]
);

// Query builder (safe)
await query('users')
  .where('email', email)
  .where('active', true)
  .execute();

// NEVER do this
await db.raw(`SELECT * FROM users WHERE email = '${email}'`); // UNSAFE!
```

### Connection Security

```typescript
// SSL/TLS connection
const db = new Database({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('ca-cert.pem'),
    key: fs.readFileSync('client-key.pem'),
    cert: fs.readFileSync('client-cert.pem')
  }
});

// Encrypted Redis connection
const redis = new Redis({
  url: 'rediss://localhost:6380', // Note: rediss://
  tls: {
    ca: fs.readFileSync('ca-cert.pem')
  }
});
```

## 🧪 Testing

### Test Utilities

```typescript
import { TestDatabase, TestRedis } from '@janua/database/testing';

// Setup test database
const testDb = await TestDatabase.create();
await testDb.migrate();
await testDb.seed();

// Run tests
const user = await testDb.users.create({ email: 'test@example.com' });

// Cleanup
await testDb.cleanup();

// Mock Redis
const mockRedis = new TestRedis();
await mockRedis.set('key', 'value');
```

### Integration Testing

```typescript
import { createTestDatabase } from '@janua/database/testing';

describe('User Repository', () => {
  let db: Database;
  
  beforeAll(async () => {
    db = await createTestDatabase();
    await db.migrate();
  });
  
  afterAll(async () => {
    await db.close();
  });
  
  beforeEach(async () => {
    await db.truncate(['users', 'organizations']);
  });
  
  test('creates user', async () => {
    const user = await db.users.create({
      email: 'test@example.com'
    });
    expect(user.id).toBeDefined();
  });
});
```

## 🚀 Performance

### Connection Pooling

```typescript
// Optimal pool configuration
const db = new Database({
  // Pool size based on formula:
  // (max_connections - superuser_connections) / app_instances
  poolSize: 20,
  
  // Connections
  min: 2,                    // Minimum connections
  max: 20,                   // Maximum connections
  
  // Timeouts
  idleTimeout: 30000,        // 30 seconds
  connectionTimeout: 2000,   // 2 seconds
  statementTimeout: 30000,   // 30 seconds
  
  // Behavior
  allowExitOnIdle: true,     // Allow process to exit
  propagateCreateError: false // Don't fail on connection error
});
```

### Query Optimization

```typescript
// Use indexes
await db.raw(`
  CREATE INDEX CONCURRENTLY idx_users_email 
  ON users(email) 
  WHERE deleted_at IS NULL
`);

// Batch operations
await db.users.createMany(users); // Single query

// Pagination
const page = await query('users')
  .select('id', 'name') // Only needed columns
  .offset(100)
  .limit(20)
  .execute();

// Prepared statements
const stmt = await db.prepare(
  'SELECT * FROM users WHERE org_id = $1'
);
const users = await stmt.execute([orgId]);
```

## 🛠️ CLI Tools

```bash
# Migration commands
yarn db:migrate:up        # Run pending migrations
yarn db:migrate:down      # Rollback last migration
yarn db:migrate:create    # Create new migration
yarn db:migrate:status    # Show migration status

# Seed commands
yarn db:seed:run          # Run seed files
yarn db:seed:create       # Create seed file

# Database commands
yarn db:reset            # Drop and recreate database
yarn db:truncate         # Truncate all tables
yarn db:backup           # Create database backup
yarn db:restore          # Restore from backup
```

## 📚 Resources

- [Database Documentation](https://docs.janua.dev/packages/database)
- [Query Builder Guide](https://docs.janua.dev/packages/database/query-builder)
- [Migration Guide](https://docs.janua.dev/packages/database/migrations)
- [Performance Tuning](https://docs.janua.dev/packages/database/performance)

## 🎯 Roadmap

### Current Version (0.1.0)
- ✅ PostgreSQL integration
- ✅ Redis integration
- ✅ Migration system
- ✅ Basic monitoring

### Next Release (0.2.0)
- [ ] MongoDB support
- [ ] Read replicas
- [ ] Database sharding
- [ ] Advanced caching strategies

## 🤝 Contributing

See [Database Contributing Guide](../../docs/contributing/database.md) for development guidelines.

## 📄 License

Part of the Janua platform. See [LICENSE](../../LICENSE) in the root directory.