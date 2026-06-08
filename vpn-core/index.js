import crypto from "crypto";

const DEFAULT_DNS = "1.1.1.1";
const DEFAULT_ALLOWED_IPS = ["0.0.0.0/0", "::/0"];

function randomBase64Key() {
  return crypto.randomBytes(32).toString("base64");
}

export function generateWireGuardKeyPair() {
  // Placeholder implementation for generating WireGuard keys.
  // For production, replace with an actual WireGuard key management flow.
  return {
    privateKey: randomBase64Key(),
    publicKey: randomBase64Key(),
  };
}

export function buildInterfaceConfig({
  privateKey,
  address = "10.200.200.1/24",
  listenPort = 51820,
  dns = DEFAULT_DNS,
} = {}) {
  return `# A2 Node WireGuard interface\n[Interface]\nPrivateKey = ${privateKey}\nAddress = ${address}\nListenPort = ${listenPort}\nDNS = ${dns}\n`;
}

export function buildPeerBlock({
  publicKey,
  presharedKey,
  allowedIPs = DEFAULT_ALLOWED_IPS,
  endpoint,
  persistentKeepalive = 25,
} = {}) {
  const block = [`[Peer]`, `PublicKey = ${publicKey}`];

  if (presharedKey) {
    block.push(`PresharedKey = ${presharedKey}`);
  }

  if (endpoint) {
    block.push(`Endpoint = ${endpoint}`);
  }

  block.push(`AllowedIPs = ${allowedIPs.join(", ")}`);

  if (persistentKeepalive) {
    block.push(`PersistentKeepalive = ${persistentKeepalive}`);
  }

  return `${block.join("\n")}\n`;
}

export function buildServerConfig({
  privateKey,
  address = "10.200.200.1/24",
  listenPort = 51820,
  dns = DEFAULT_DNS,
  peer,
} = {}) {
  const interfaceConfig = buildInterfaceConfig({
    privateKey,
    address,
    listenPort,
    dns,
  });

  if (!peer) {
    return interfaceConfig;
  }

  return `${interfaceConfig}\n${buildPeerBlock(peer)}`;
}

export function buildClientConfig({
  privateKey,
  publicKey,
  presharedKey,
  address = "10.200.200.2/32",
  dns = DEFAULT_DNS,
  endpoint,
  allowedIPs = DEFAULT_ALLOWED_IPS,
} = {}) {
  const interfaceConfig = buildInterfaceConfig({
    privateKey,
    address,
    dns,
  });

  const peerBlock = buildPeerBlock({
    publicKey,
    presharedKey,
    endpoint,
    allowedIPs,
  });

  return `${interfaceConfig}\n${peerBlock}`;
}

if (process.argv[1].endsWith("index.js")) {
  const serverKeys = generateWireGuardKeyPair();
  const clientKeys = generateWireGuardKeyPair();

  const serverConfig = buildServerConfig({
    privateKey: serverKeys.privateKey,
    peer: {
      publicKey: clientKeys.publicKey,
      allowedIPs: ["10.200.200.2/32"],
    },
  });

  const clientConfig = buildClientConfig({
    privateKey: clientKeys.privateKey,
    publicKey: serverKeys.publicKey,
    endpoint: "vpn.a2node.local:51820",
  });

  console.log("# Server config:\n");
  console.log(serverConfig);
  console.log("# Client config:\n");
  console.log(clientConfig);
}
