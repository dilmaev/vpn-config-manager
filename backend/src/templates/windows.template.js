const { baseTemplate, createMoscowOutbound, createGermanyOutbound } = require('./base.template');

function generateWindowsConfig(moscowData, germanyData) {
  return {
    ...baseTemplate,
    dns: {
      strategy: "prefer_ipv6",
      reverse_mapping: true,
      servers: [
        {
          tag: "cloudflare-tls",
          type: "tls",
          server: "1.1.1.1",
          tls: {
            server_name: "one.one.one.one"
          }
        }
      ]
    },
    inbounds: [
      {
        tag: "tun-in",
        type: "tun",
        address: [
          "10.0.0.1/30",
          "fd00::1/126"
        ],
        auto_route: true,
        strict_route: true
      }
    ],
    outbounds: [
      ...baseTemplate.outbounds,
      createMoscowOutbound(moscowData),
      createGermanyOutbound(germanyData, moscowData)
    ]
  };
}

module.exports = generateWindowsConfig;