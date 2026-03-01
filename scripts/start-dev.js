const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

// Get PORT from command line args, .env file or environment
function getPort() {
  // Check command line arguments first
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    return args[portIndex + 1];
  }
  const portArg = args.find(arg => arg.startsWith('--port='));
  if (portArg) {
    return portArg.split('=')[1];
  }

  if (process.env.PORT) {
    return process.env.PORT;
  }
  
  const envPath = path.join(process.cwd(), '.env');

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('PORT=')) {
        return trimmed.split('=')[1].trim();
      }
    }
  }
  
  return '3000'; // Default
}

const PORT = getPort();

console.log(`${GREEN}Detected PORT: ${PORT}${RESET}`);

// Kill process on the specified port
function killPort(port) {
  try {
    if (process.platform === 'win32') {
      // Find PID using netstat
      const command = `netstat -ano | findstr :${port}`;
      const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      
      const lines = output.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && /^\d+$/.test(pid) && pid !== '0') {
            pids.add(pid);
          }
        }
      });
      
      if (pids.size > 0) {
        console.log(`${YELLOW}Port ${port} is in use. Killing processes: ${Array.from(pids).join(', ')}...${RESET}`);
        pids.forEach(pid => {
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            console.log(`${GREEN}Killed process ${pid}${RESET}`);
          } catch (e) {
            console.log(`${RED}Failed to kill process ${pid}: ${e.message}${RESET}`);
          }
        });
      } else {
        console.log(`${GREEN}Port ${port} is free.${RESET}`);
      }
    } else {
      // Unix/Mac (lsof)
      const pid = execSync(`lsof -t -i:${port}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
      if (pid) {
        console.log(`${YELLOW}Port ${port} is in use by PID ${pid}. Killing...${RESET}`);
        execSync(`kill -9 ${pid}`);
        console.log(`${GREEN}Killed process ${pid}${RESET}`);
      }
    }
  } catch (error) {
    // If command fails (e.g. netstat finds nothing), it throws. That means port is likely free.
    // console.log(`${GREEN}Port ${port} seems free (or check failed).${RESET}`);
  }
}

killPort(PORT);

console.log(`${GREEN}Starting Next.js dev server on port ${PORT}...${RESET}`);

// Start Next.js
const argsToPass = ['next', 'dev'];
const userArgs = process.argv.slice(2);

// Check if port is specified in args
const hasPortArg = userArgs.includes('-p') || userArgs.some(arg => arg.startsWith('--port'));

if (userArgs.length > 0) {
  argsToPass.push(...userArgs);
}

// If port wasn't in args, append the one we found (from env or default)
if (!hasPortArg) {
  argsToPass.push('-p', PORT);
}

console.log(`${GREEN}Command: npx ${argsToPass.join(' ')}${RESET}`);

const nextDev = spawn('npx', argsToPass, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT }
});

nextDev.on('close', (code) => {
  process.exit(code);
});
