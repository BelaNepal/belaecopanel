const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

function getEnvValue(key) {
  // Try to read form process.env first
  if (process.env[key]) {
    return process.env[key];
  }

  // Try to read from .env file
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('#')) continue;
      const [k, v] = line.split('=');
      if (k && k.trim() === key) {
        return v ? v.trim() : undefined;
      }
    }
  }
  return undefined;
}

const port = getEnvValue('PORT') || '3000';

console.log(`Checking port ${port}...`);

try {
  // Check if port is in use and kill it
  // Using cross-platform approach: 'npx kill-port' is a handy utility but requires internet or pre-install
  // We can try to use system commands.
  
  // Windows
  if (process.platform === 'win32') {
    try {
        const output = execSync(`netstat -ano | findstr :${port}`).toString();
        // Extract PID
        const lines = output.split('\n').filter(line => line.includes('LISTENING'));
        if (lines.length > 0) {
            const parts = lines[0].trim().split(/\s+/);
            const pid = parts[parts.length - 1]; // PID is usually the last column
            if (pid) {
                console.log(`Port ${port} is in use by PID ${pid}. Killing process...`);
                execSync(`taskkill /F /PID ${pid}`);
                console.log('Process killed.');
            }
        }
    } catch (e) {
        // netstat returns error if nothing found, which is good (port free)
    }
  } else {
    // Linux/Mac
    try {
        const output = execSync(`lsof -i :${port} -t`).toString().trim();
        if (output) {
             console.log(`Port ${port} is in use by PID ${output}. Killing process...`);
             execSync(`kill -9 ${output}`);
             console.log('Process killed.');
        }
    } catch (e) {
        // lsof returns error if nothing found
    }
  }

  console.log(`Starting Next.js on port ${port}...`);
  
  // Use spawn to keep the output streaming and colorized
  const nextDev = spawn('npx', ['next', 'dev', '-p', port], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: port }
  });

  nextDev.on('close', (code) => {
    process.exit(code);
  });

} catch (error) {
  console.error('Failed to start dev server:', error);
  process.exit(1);
}
