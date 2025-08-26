const { baseTemplate, createMoscowOutbound, createGermanyOutbound } = require('./base.template');

function generateIosConfig(moscowData, germanyData) {
  const germanyOutbounds = createGermanyOutbound(germanyData, moscowData);
  
  return {
    log: {
      level: "info",
      timestamp: true
    },
    dns: {
      servers: [
        {
          tag: "cloudflare",
          address: "https://1.1.1.1/dns-query",
          strategy: "ipv4_only"
        },
        {
          tag: "google",
          address: "https://8.8.8.8/dns-query",
          strategy: "ipv4_only"
        },
        {
          tag: "yandex-doh",
          address: "https://common.dot.dns.yandex.net/dns-query",
          strategy: "ipv4_only",
          address_resolver: "yandex-plain"
        },
        {
          tag: "yandex-plain",
          address: "77.88.8.8",
          strategy: "ipv4_only"
        }
      ],
      final: "yandex-plain"
    },
    outbounds: [
      ...baseTemplate.outbounds,
      createMoscowOutbound(moscowData),
      ...(Array.isArray(germanyOutbounds) ? germanyOutbounds : [germanyOutbounds])
    ],
    route: baseTemplate.route,
    inbounds: [
      {
        type: "tun",
        address: ["198.18.0.1/16"],
        auto_route: true,
        sniff: true
      }
    ]
  };
}

module.exports = generateIosConfig;