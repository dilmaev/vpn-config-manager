const baseTemplate = {
  log: {
    level: "error",
    timestamp: true
  },
  route: {
    rule_set: [
      {
        type: "remote",
        tag: "ru-ips",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geoip/ru.srs"
      },
      {
        type: "remote",
        tag: "youtube",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/youtube.srs"
      },
      {
        type: "remote",
        tag: "openai",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/openai.srs"
      },
      {
        type: "remote",
        tag: "anthropic",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/anthropic.srs"
      },
      {
        type: "remote",
        tag: "twitter",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/twitter.srs"
      },
      {
        type: "remote",
        tag: "instagram",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/instagram.srs"
      },
      {
        type: "remote",
        tag: "facebook",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/facebook.srs"
      },
      {
        type: "remote",
        tag: "telegram-sites",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/telegram.srs"
      },
      {
        type: "remote",
        tag: "telegram-ips",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geoip/telegram.srs"
      },
      {
        type: "remote",
        tag: "github",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/github.srs"
      },
      {
        type: "remote",
        tag: "tiktok",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/tiktok.srs"
      },
      {
        type: "remote",
        tag: "hetzner",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/hetzner.srs"
      },
      {
        type: "remote",
        tag: "x",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/x.srs"
      },
      {
        type: "remote",
        tag: "meta",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/meta.srs"
      },
      {
        type: "remote",
        tag: "oculus",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/oculus.srs"
      },
      {
        type: "remote",
        tag: "whatsapp",
        format: "binary",
        url: "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/whatsapp.srs"
      }
    ],
    rules: [
      {
        action: "sniff"
      },
      {
        protocol: "dns",
        action: "hijack-dns"
      },
      {
        action: "route",
        outbound: "de-hetzner",
        domain_suffix: [
          "myip.ru",
          "rutracker.org",
          "rutrk.org",
          "rutracker.cc",
          "hostinger.com",
          "cloudflare-ech.com",
          "sociogramm.ru",
          "sentry.io",
          "greasyfork.org",
          "oculus.com",
          "byteoversea.com",
          "trae-api-sg.mchost.guru",
          "trae.ai",
          "byteintlapi.com",
          "ahrefs.com",
          "speedtest.net",
          "2ip.ru"
        ],
        rule_set: [
          "openai",
          "anthropic",
          "twitter",
          "instagram",
          "facebook",
          "github",
          "tiktok",
          "hetzner",
          "x",
          "meta",
          "oculus",
          "youtube"
        ]
      },
      {
        action: "route",
        outbound: "moscow-ali",
        rule_set: [
          "telegram-sites",
          "telegram-ips",
          "whatsapp"
        ]
      },
      {
        action: "route",
        outbound: "direct",
        rule_set: [
          "ru-ips"
        ]
      },
      {
        action: "route",
        outbound: "moscow-ali"
      }
    ]
  },
  outbounds: [
    {
      tag: "direct",
      type: "direct"
    }
  ]
};

function createMoscowOutbound(moscowData) {
  return {
    type: "vless",
    tag: "moscow-ali",
    server: moscowData.server,
    server_port: moscowData.port,
    uuid: moscowData.uuid,
    flow: "xtls-rprx-vision",
    tls: {
      enabled: true,
      server_name: "ya.ru",
      alpn: ["h2", "http/1.1"],
      utls: {
        enabled: true,
        fingerprint: "chrome"
      },
      reality: {
        enabled: true,
        public_key: moscowData.publicKey,
        short_id: moscowData.shortId
      }
    }
  };
}

function createGermanyOutbound(germanyData, moscowData) {
  // Germany server - connect through Moscow (detour) because direct access from Russia is blocked
  return {
    type: "vless",
    tag: "de-hetzner",
    server: germanyData.server,
    server_port: germanyData.port,
    uuid: germanyData.uuid,
    flow: "xtls-rprx-vision",
    tls: {
      enabled: true,
      server_name: "vk.ru",
      alpn: ["h2", "http/1.1"],
      utls: {
        enabled: true,
        fingerprint: "chrome"
      },
      reality: {
        enabled: true,
        public_key: germanyData.publicKey,
        short_id: germanyData.shortId
      }
    },
    detour: "moscow-ali"  // Connect to Germany through Moscow proxy
  };
}

module.exports = {
  baseTemplate,
  createMoscowOutbound,
  createGermanyOutbound
};