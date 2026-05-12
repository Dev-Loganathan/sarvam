"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcryptjs"));
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const PERMISSIONS = [
    // Customer module
    { code: 'customer:view', module: 'customer', description: 'View customer list and profiles' },
    { code: 'customer:create', module: 'customer', description: 'Create new customers' },
    { code: 'customer:edit', module: 'customer', description: 'Edit customer details' },
    { code: 'customer:delete', module: 'customer', description: 'Delete customers' },
    { code: 'customer:export', module: 'customer', description: 'Export customer data' },
    // Loan module
    { code: 'loan:view', module: 'loan', description: 'View loans' },
    { code: 'loan:create', module: 'loan', description: 'Create new loans' },
    { code: 'loan:edit', module: 'loan', description: 'Edit loan details' },
    { code: 'loan:approve', module: 'loan', description: 'Approve loan applications' },
    // Chit Fund module
    { code: 'chit:view', module: 'chit', description: 'View chit funds' },
    { code: 'chit:create', module: 'chit', description: 'Create chit funds' },
    { code: 'chit:edit', module: 'chit', description: 'Edit chit fund details' },
    // Payment module
    { code: 'payment:view', module: 'payment', description: 'View payments' },
    { code: 'payment:create', module: 'payment', description: 'Record payments' },
    // Report module
    { code: 'report:view', module: 'report', description: 'View reports' },
    { code: 'report:export', module: 'report', description: 'Export reports' },
    // User management
    { code: 'user:view', module: 'user', description: 'View users list' },
    { code: 'user:create', module: 'user', description: 'Create new users' },
    { code: 'user:edit', module: 'user', description: 'Edit user details' },
    { code: 'user:delete', module: 'user', description: 'Deactivate users' },
    { code: 'user:manage_roles', module: 'user', description: 'Create and manage roles' },
];
const ROLES = [
    {
        name: 'super_admin',
        displayName: 'Super Admin',
        description: 'Full system access including user management',
        isSystem: true,
        permissionCodes: PERMISSIONS.map(p => p.code), // ALL permissions
    },
    {
        name: 'admin',
        displayName: 'Admin',
        description: 'Full business access without user management',
        isSystem: true,
        permissionCodes: PERMISSIONS.filter(p => p.module !== 'user').map(p => p.code),
    },
    {
        name: 'staff',
        displayName: 'Staff',
        description: 'Day-to-day operations with limited access',
        isSystem: true,
        permissionCodes: [
            'customer:view', 'customer:create', 'customer:edit',
            'loan:view',
            'chit:view',
            'payment:view', 'payment:create',
            'report:view',
        ],
    },
];
async function main() {
    console.log('🌱 Seeding database...\n');
    // 1. Create permissions
    console.log('Creating permissions...');
    for (const perm of PERMISSIONS) {
        await prisma.permission.upsert({
            where: { code: perm.code },
            update: { module: perm.module, description: perm.description },
            create: perm,
        });
    }
    console.log(`  ✅ ${PERMISSIONS.length} permissions created\n`);
    // 2. Create roles with permissions
    console.log('Creating roles...');
    for (const roleDef of ROLES) {
        const { permissionCodes, ...roleData } = roleDef;
        const role = await prisma.role.upsert({
            where: { name: roleData.name },
            update: { displayName: roleData.displayName, description: roleData.description },
            create: roleData,
        });
        // Get permission IDs
        const permissions = await prisma.permission.findMany({
            where: { code: { in: permissionCodes } },
        });
        // Delete existing role-permission mappings and recreate
        await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
        for (const perm of permissions) {
            await prisma.rolePermission.create({
                data: { roleId: role.id, permissionId: perm.id },
            });
        }
        console.log(`  ✅ ${role.displayName} — ${permissions.length} permissions`);
    }
    // 3. Create default super admin user
    console.log('\nCreating default super admin user...');
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
    if (!superAdminRole) {
        throw new Error('Super admin role not found');
    }
    const defaultPassword = 'Sarvam@2024!!';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);
    const superAdmin = await prisma.user.upsert({
        where: { email: 'superadmin@sarvamfinance.com' },
        update: {},
        create: {
            email: 'superadmin@sarvamfinance.com',
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            mobile: '9999999999',
            roleId: superAdminRole.id,
        },
    });
    // Store initial password in history
    const existingHistory = await prisma.passwordHistory.findFirst({
        where: { userId: superAdmin.id, passwordHash }
    });
    if (!existingHistory) {
        await prisma.passwordHistory.create({
            data: {
                userId: superAdmin.id,
                passwordHash,
            },
        });
    }
    console.log(`  ✅ Super Admin created: superadmin@sarvamfinance.com`);
    console.log(`  🔑 Default password: ${defaultPassword}`);
    console.log(`  ⚠️  CHANGE THIS PASSWORD ON FIRST LOGIN!\n`);
    console.log('🎉 Seed complete!');
    await pool.end();
}
main()
    .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map