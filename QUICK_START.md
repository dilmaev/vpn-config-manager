# Quick Start Guide

## Installation on Ubuntu Server

### 1. Upload to server
```bash
# Pack on local machine (without node_modules)
tar -czf vpn-config.tar.gz --exclude node_modules --exclude .git --exclude configs/* .

# Upload
scp vpn-config.tar.gz root@your-server:/home/

# On server
ssh root@your-server
cd /home
tar -xzf vpn-config.tar.gz
```

### 2. Run installer
```bash
chmod +x install.sh
sudo ./install.sh
```

### 3. Configure credentials
```bash
nano /home/vpn-config/.env
# Enter your 3x-ui login/password
```

### 4. Setup Nginx
```bash
# Copy generated config
cp /home/vpn-config/nginx-site.conf /etc/nginx/sites-available/config.test-internet.ru.conf
ln -sf /etc/nginx/sites-available/config.test-internet.ru.conf /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 5. Done!
- Admin panel: https://config.test-internet.ru/admin
- Configs: https://config.test-internet.ru/client-name.json

## Management

### Check status
```bash
pm2 status
pm2 logs
```

### Restart
```bash
pm2 restart all
```

### Update
```bash
# Just run installer again
./install.sh
```