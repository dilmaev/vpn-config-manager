const { baseTemplate, createMoscowOutbound, createGermanyOutbound } = require('./base.template');

function generateAndroidConfig(moscowData, germanyData) {
  return {
    ...baseTemplate,
    log: {
      level: "error",
      timestamp: true
    },
    dns: {
      servers: [
        {
          tag: "bootstrap-local",
          address: "local"
        },
        {
          tag: "cloudflare",
          address: "https://cloudflare-dns.com/dns-query",
          strategy: "ipv4_only",
          detour: "direct",
          address_resolver: "bootstrap-local"
        },
        {
          tag: "google",
          address: "https://dns.google/dns-query",
          strategy: "ipv4_only",
          detour: "direct",
          address_resolver: "bootstrap-local"
        }
      ],
      final: "cloudflare",
      strategy: "ipv4_only"
    },
    inbounds: [
      {
        type: "tun",
        tag: "tun-in",
        address: ["172.18.0.1/30"],
        mtu: 1500,
        auto_route: true,
        stack: "system"
      }
    ],
    outbounds: [
      ...baseTemplate.outbounds,
      createMoscowOutbound(moscowData),
      createGermanyOutbound(germanyData, moscowData)
    ],
    route: {
      ...baseTemplate.route,
      override_android_vpn: true,
      auto_detect_interface: true,
      rules: [
        ...baseTemplate.route.rules.slice(0, 2),
        {
          action: "route",
          outbound: "direct",
          domain_suffix: [
            "cloudflare-dns.com",
            "dns.google"
          ],
          ip_cidr: [
            "1.1.1.1/32",
            "1.0.0.1/32",
            "8.8.8.8/32",
            "8.8.4.4/32"
          ]
        },
        ...baseTemplate.route.rules.slice(2)
      ]
    }
  };
}

module.exports = generateAndroidConfig;