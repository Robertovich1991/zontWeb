#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  Teltonika TCP Gateway — Ubuntu 22.04 Installation Script
# ══════════════════════════════════════════════════════════════
set -e

echo "═══════════════════════════════════════════════════"
echo "  Teltonika TCP Gateway — Installation"
echo "═══════════════════════════════════════════════════"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js: $NODE_VERSION"

# Create directory
APP_DIR="/opt/teltonika-gateway"
echo ""
echo "📁 Installing to: $APP_DIR"
sudo mkdir -p "$APP_DIR"

# Copy files
sudo cp teltonika-decoder.js "$APP_DIR/"
sudo cp test-simulator.js "$APP_DIR/"

# Create .env if not exists
if [ ! -f "$APP_DIR/.env" ]; then
    sudo cp .env.example "$APP_DIR/.env"
    echo ""
    echo "⚠️  IMPORTANT: Edit the .env file with your actual values:"
    echo "   sudo nano $APP_DIR/.env"
    echo ""
    echo "   Required settings:"
    echo "   - WEBHOOK_URL: Your Emergent backend webhook URL"
    echo "   - GPS_API_KEY: Your GPS webhook API key"
else
    echo "✅ .env already exists, keeping current config"
fi

# Open firewall port
echo ""
echo "🔥 Opening port 5055 in firewall..."
sudo ufw allow 5055/tcp 2>/dev/null || echo "   (ufw not active or not installed)"
sudo iptables -A INPUT -p tcp --dport 5055 -j ACCEPT 2>/dev/null || true

# Create systemd service
echo ""
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/teltonika-gateway.service > /dev/null << 'EOF'
[Unit]
Description=Teltonika TCP Gateway — GPS Decoder
After=network.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/opt/teltonika-gateway
ExecStart=/usr/bin/node teltonika-decoder.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=teltonika-gateway
Environment=NODE_ENV=production

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/teltonika-gateway

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable teltonika-gateway

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ Installation complete!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  📝 Next steps:"
echo ""
echo "  1. Edit configuration:"
echo "     sudo nano $APP_DIR/.env"
echo ""
echo "  2. Start the service:"
echo "     sudo systemctl start teltonika-gateway"
echo ""
echo "  3. Check status:"
echo "     sudo systemctl status teltonika-gateway"
echo ""
echo "  4. View logs:"
echo "     sudo journalctl -u teltonika-gateway -f"
echo ""
echo "  5. Test with simulator:"
echo "     cd $APP_DIR && node test-simulator.js"
echo ""
echo "  6. Configure your FMB920:"
echo "     - Server IP: $(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_VPS_IP')"
echo "     - Server Port: 5055"
echo "     - Protocol: TCP"
echo ""
