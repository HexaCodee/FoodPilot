import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const shell = isWindows;

const serviceDirs = [
    'event-service',
    'order-tracking-api',
    'restaurant-admin',
    'client-admin',
    'client-mobile',
].map((dir) => path.join(root, dir));

const authApiDir = path.join(
    root,
    'Authentication-service',
    'auth-service',
    'src',
    'AuthService.Api'
);

const run = (command, args = [], options = {}) =>
    new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: options.cwd,
            env: process.env,
            shell: options.shell ?? shell,
            stdio: options.stdio ?? 'inherit',
            detached: options.detached ?? false,
        });

        child.on('error', reject);
        child.on('exit', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
            }
        });

        if (options.detached) {
            child.unref();
        }
    });

const runIfAvailable = async (command, args, label) => {
    try {
        await run(command, args);
        return true;
    } catch (error) {
        console.warn(`[WARN] ${label}: ${error.message}`);
        return false;
    }
};

const installDependencies = async () => {
    console.log('\n[INSTALL] Installing service dependencies...');
    for (const serviceDir of serviceDirs) {
        console.log(`  Installing in ${path.basename(serviceDir)}...`);
        await run('pnpm', ['install'], { cwd: serviceDir });
    }
};

const startDatabases = async () => {
    console.log('\n[DB] Starting databases...');

    if (isWindows) {
        const scriptPath = path.join(root, 'scripts', 'start-databases.ps1');
        await run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath], { shell: false });
        return;
    }

    const postgresCompose = path.join(root, 'pg', 'docker-compose.yml');
    if (existsSync(postgresCompose)) {
        const dockerStarted = await runIfAvailable(
            'docker',
            ['compose', '-f', postgresCompose, 'up', '-d'],
            'Docker Compose for PostgreSQL'
        );

        if (!dockerStarted) {
            await runIfAvailable(
                'docker-compose',
                ['-f', postgresCompose, 'up', '-d'],
                'docker-compose for PostgreSQL'
            );
        }
    }

    for (const service of ['mongodb', 'mongod', 'postgresql']) {
        const started = await runIfAvailable(
            'sudo',
            ['-n', 'systemctl', 'start', service],
            `systemd service ${service}`
        );

        if (started) {
            console.log(`  Requested ${service} to start.`);
        }
    }
};

const buildDotnet = async () => {
    console.log('\n[DOTNET] Building AuthService.Api...');
    await run('dotnet', ['build'], { cwd: authApiDir });
};

const startDetachedService = ({ name, cwd, command, args }) => {
    const child = spawn(command, args, {
        cwd,
        env: process.env,
        detached: true,
        shell,
        stdio: 'ignore',
    });

    child.unref();
    console.log(`  ${name} started (pid ${child.pid})`);
};

const startServices = async () => {
    console.log('\n[SERVICES] Launching application processes...');

    startDetachedService({
        name: 'AUTH',
        cwd: authApiDir,
        command: 'dotnet',
        args: ['run', '--no-build'],
    });

    startDetachedService({
        name: 'RESTAURANT',
        cwd: path.join(root, 'restaurant-admin'),
        command: 'pnpm',
        args: ['run', 'dev'],
    });

    startDetachedService({
        name: 'ORDERS',
        cwd: path.join(root, 'order-tracking-api'),
        command: 'pnpm',
        args: ['run', 'dev'],
    });

    startDetachedService({
        name: 'EVENTS',
        cwd: path.join(root, 'event-service'),
        command: 'pnpm',
        args: ['run', 'dev'],
    });

    startDetachedService({
        name: 'CLIENT',
        cwd: path.join(root, 'client-admin'),
        command: 'pnpm',
        args: ['run', 'dev'],
    });

    startDetachedService({
        name: 'MOBILE',
        cwd: path.join(root, 'client-mobile'),
        command: 'pnpm',
        args: ['run', 'dev'],
    });
};

try {
    await installDependencies();
    await startDatabases();
    await buildDotnet();
    await startServices();
    console.log('\n[OK] Root development environment started.');
} catch (error) {
    console.error(`\n[ERROR] ${error.message}`);
    process.exitCode = 1;
}