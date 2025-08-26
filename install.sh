#!/bin/bash

# ============================================
# VPN Config Manager - Universal Installer
# ============================================
# This script handles both fresh installation and updates
# Run with: sudo ./install.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "==========================================="
echo "VPN Config Manager - Installation"
echo "==========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}Please run as root (use sudo)${NC}"
   exit 1
fi

# Detect if this is update or fresh install
APP_DIR="/home/vpn-config"
IS_UPDATE=false

if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Existing installation detected. Running update...${NC}"
    IS_UPDATE=true
else
    echo -e "${YELLOW}Fresh installation starting...${NC}"
fi

# Step 1: System packages
echo -e "${YELLOW}Step 1: Checking system packages...${NC}"
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo -e "${GREEN}Node.js version: $(node -v)${NC}"
echo -e "${GREEN}npm version: $(npm -v)${NC}"

# Step 2: PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
fi

# Step 3: Setup application
echo -e "${YELLOW}Step 3: Setting up application...${NC}"

if [ "$IS_UPDATE" = false ]; then
    # Fresh install - copy files
    if [ -f "package.json" ] && [ -d "backend" ] && [ -d "frontend" ]; then
        echo "Copying files to $APP_DIR..."
        mkdir -p $APP_DIR
        cp -r ./* $APP_DIR/
        cp .env.example $APP_DIR/.env.example 2>/dev/null || true
    else
        echo -e "${RED}Error: Please run from project directory${NC}"
        exit 1
    fi
else
    # Update - backup and copy new files
    echo "Backing up current configuration..."
    cp $APP_DIR/.env $APP_DIR/.env.backup 2>/dev/null || true
    
    # Copy new files preserving .env
    rsync -av --exclude='.env' --exclude='configs/' --exclude='node_modules/' --exclude='logs/' ./ $APP_DIR/
fi

cd $APP_DIR

# Step 4: Environment setup
echo -e "${YELLOW}Step 4: Setting up environment...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${RED}IMPORTANT: Edit .env file with your credentials!${NC}"
        echo -e "${RED}Location: $APP_DIR/.env${NC}"
    fi
fi

# Step 5: Backend setup
echo -e "${YELLOW}Step 5: Installing backend dependencies...${NC}"
cd $APP_DIR/backend
npm install --production

# Step 6: Frontend setup
echo -e "${YELLOW}Step 6: Building frontend...${NC}"
cd $APP_DIR/frontend

# Create production environment
cat > .env.production << EOF
REACT_APP_API_URL=/api
EOF

npm install
npm run build

# Step 7: Create start script for frontend
echo -e "${YELLOW}Step 7: Creating startup scripts...${NC}"
cat > $APP_DIR/start-frontend.sh << 'EOF'
#!/bin/bash
cd /home/vpn-config
exec npx serve -s frontend/build -l 3000
EOF
chmod +x $APP_DIR/start-frontend.sh

# Step 8: PM2 configuration
echo -e "${YELLOW}Step 8: Setting up PM2...${NC}"
cd $APP_DIR

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'vpn-config-backend',
      script: './backend/src/index.js',
      cwd: '/home/vpn-config',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'vpn-config-frontend',
      script: './start-frontend.sh',
      interpreter: 'bash',
      cwd: '/home/vpn-config',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
EOF

# Create directories
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/configs

# Start PM2
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# Step 9: Firewall
echo -e "${YELLOW}Step 9: Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 3001/tcp 2>/dev/null || true
    ufw allow 22/tcp 2>/dev/null || true
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
fi

# Step 10: Create Nginx config
echo -e "${YELLOW}Step 10: Creating Nginx configuration...${NC}"
cat > $APP_DIR/nginx-site.conf << 'EOF'
# Auto-generated Nginx configuration for VPN Config Manager
# Copy to: /etc/nginx/sites-available/config.test-internet.ru.conf

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name config.test-internet.ru;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name config.test-internet.ru;

    charset utf-8;

    # SSL certificates (update paths if needed)
    ssl_certificate     /etc/letsencrypt/live/config.test-internet.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/config.test-internet.ru/privkey.pem;

    # Security headers
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    autoindex off;

    # Logs
    access_log /var/log/nginx/config.test-internet.ru-access.log;
    error_log /var/log/nginx/config.test-internet.ru-error.log;

    # JSON configs
    location ~* \.json$ {
        root /home/vpn-config/configs;
        try_files $uri @backend;
        default_type application/json;
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
    }

    # Static files
    location /static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Favicon and other root files
    location ~ ^/(favicon\.ico|logo192\.png|manifest\.json|robots\.txt)$ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # API
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin panel
    location /admin {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend fallback
    location @backend {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Root - 404 for security
    location = / {
        return 404;
    }

    # Hide hidden files
    location ~ /\. {
        deny all;
    }

    client_max_body_size 10M;
}
EOF

echo "==========================================="
echo -e "${GREEN}Installation completed!${NC}"
echo "==========================================="
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Edit credentials (if fresh install):"
echo "   nano $APP_DIR/.env"
echo ""
echo "2. Configure Nginx:"
echo "   cp $APP_DIR/nginx-site.conf /etc/nginx/sites-available/config.test-internet.ru.conf"
echo "   ln -sf /etc/nginx/sites-available/config.test-internet.ru.conf /etc/nginx/sites-enabled/"
echo "   nginx -t && systemctl reload nginx"
echo ""
echo "3. Check status:"
echo "   pm2 status"
echo "   pm2 logs"
echo ""
echo -e "${GREEN}URLs:${NC}"
echo "   Admin panel: https://config.test-internet.ru/admin"
echo "   Config example: https://config.test-internet.ru/client-ios.json"
echo "   API health: https://config.test-internet.ru/api/health"
echo ""
echo "==========================================="