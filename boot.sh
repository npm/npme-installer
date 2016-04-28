#!/bin/bash

read -r -d '' BANNER <<-'EOF'
╔═══════════════════════════════════════════════════════════════════════╗
║EnterpriseEnterpriseEnterpriseEnterpriseEnterpriseEnterpriseEnterpriseE║
║nte╔═══════════════╗nte╔═══════════════╗nte╔═══════════════════════╗eEn║
║ter║               ║ter║               ║ter║                       ║Ent║
║erp║       ╔═══╗   ║erp║       ╔═══╗   ║erp║       ╔═══╗   ╔═══╗   ║nte║
║rpr║       ║ris║   ║rpr║       ║ris║   ║rpr║       ║ris║   ║rpr║   ║ter║
║pri║       ║ise║   ║pri║       ║ise║   ║pri║       ║ise║   ║pri║   ║erp║
║ris║       ║seE║   ║ris║       ║seE║   ║ris║       ║seE║   ║ris║   ║rpr║
║ise║       ║eEn║   ║ise║       ╚═══╝   ║ise║       ║eEn║   ║ise║   ║pri║
║seE║       ║Ent║   ║seE║               ║seE║       ║Ent║   ║seE║   ║ris║
║eEn╚═══════╝nte╚═══╝eEn║       ╔═══════╝eEn╚═══════╝nte╚═══╝eEn╚═══╝ise║
║EnterpriseEnterpriseEnt║       ║terpriseEnterpriseEnterpriseEnterpriseE║
╚═══════════════════╗nte╚═══════╝erp╔═══════════════════════════════════╝
                    ║terpriseEnterpr║    E  n  t  e  r  p  r  i  s  e
                    ╚═══════════════╝
EOF
echo "$BANNER"
echo ""

if command -v node > /dev/null; then
  node_version=`node -v`
  npm_version=`npm -v`
  echo "  Node:        $node_version"
  echo "  npm:         $npm_version"
else
  echo "  Node:        Not installed"
  echo "  npm:         Not installed"
fi

if pgrep "docker" > /dev/null; then
  docker_version=`docker --version`
  echo "  Docker:      Running, $docker_version"
else
  if command -v docker > /dev/null; then
    docker_version=`docker --version`
    echo "  Docker:      Stopped, $docker_version"
  else
    echo "  Docker:      Not installed"
  fi
fi

if pgrep "replicated" > /dev/null; then
  repl_version=`replicated --version`
  echo "  Replicated:  Running, $repl_version"
else
  if command -v replicated > /dev/null; then
    repl_version=`replicated --version`
    echo "  Replicated:  Stopped, $repl_version"
  else
    echo "  Replicated:  Not installed"
  fi
fi

echo ""

public_ip=`dig +short myip.opendns.com @resolver1.opendns.com`
echo "  Visit https://$public_ip:8800 to configure your npm Enterprise instance"

echo ""
