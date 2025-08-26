У меня есть 2 панели 3x-ui

Москва:
https://moscow.grozny.site:8181/NeoGKy05wFkIoW7/
login: ypffPps6H6
password: vVZAPWZh7a

Германания:
https://de.grozny.site:61866/m5xiWJ4rsGSf9vV/
login: KVZaPE4jA1
password: gcMi6691QT


мне надо сделать интерфейс, который бы создавал там, в подключении клиента, и вписывал бы данные оттуда, там айди только вроде нужно заменять, в конфиг:

```
    {
        "log": {
            "level": "info",
            "timestamp": true
        }, 
        "dns": {
            "servers": [
                {
                    "tag": "cloudflare",
                    "address": "https://1.1.1.1/dns-query",
                    "strategy": "ipv4_only"
                },
                {
                    "tag": "google",
                    "address": "https://8.8.8.8/dns-query",
                    "strategy": "ipv4_only"
                },
                {
                    "tag": "yandex-doh",
                    "address": "https://common.dot.dns.yandex.net/dns-query",
                    "strategy": "ipv4_only",
                    "address_resolver": "yandex-plain"
                },
                {
                    "tag": "yandex-plain",
                    "address": "77.88.8.8",
                    "strategy": "ipv4_only"
                }
            ],
            "final": "yandex-plain"
        },
        "outbounds": [
            {
                "tag": "direct",
                "type": "direct"
            },
            {
                "type": "vless",
                "tag": "moscow-ali",
                "server": "moscow.grozny.site",
                "server_port": 443,
                "uuid": "3dbbf6e5-96cb-4233-a6c5-ab8d73615321",
                "flow": "xtls-rprx-vision",
                "tls": {
                    "alpn": ["h2", "http/1.1"],
                    "enabled": true,
                    "server_name": "ya.ru",
                    "utls": {
                        "enabled": true,
                        "fingerprint": "chrome"
                    },
                    "reality": {
                        "enabled": true,
                        "public_key": "ZF6AAUCvUjIn8tI5CPqeJc8rnFzrjxFeIJYEoMsYgEY",
                        "short_id": "3b"
                    }
                }
            }, 
            {
                "type": "vless",
                "tag": "de-hetzner",
                "server": "de.grozny.site",
                "server_port": 443,
                "uuid": "6ed61a68-256e-4c9f-a355-1fe4a6f2ece0",
                "flow": "xtls-rprx-vision",
                "tls": {
                    "alpn": ["h2", "http/1.1"],
                    "enabled": true,
                    "server_name": "vk.ru",
                    "utls": {
                        "enabled": true,
                        "fingerprint": "chrome"
                    },
                    "reality": {
                        "enabled": true,
                        "public_key": "KibMR-hE7jasSqY7zJAoajwufXRoiy5ucVAQaZmZBB4",
                        "short_id": "d1594c7994a38c88"
                    }
                },
                "detour": "moscow-ali"
            }
        ],
        "route": {
            "rule_set": [
                {
                    "type": "remote",
                    "tag": "ru-ips",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geoip/ru.srs"
                },
                {
                    "type": "remote",
                    "tag": "youtube",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/youtube.srs"
                },
                {
                    "type": "remote",
                    "tag": "openai",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/openai.srs"
                },
                {
                    "type": "remote",
                    "tag": "anthropic",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/anthropic.srs"
                },
                {
                    "type": "remote",
                    "tag": "twitter",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/twitter.srs"
                },
                {
                    "type": "remote",
                    "tag": "instagram",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/instagram.srs"
                },
                {
                    "type": "remote",
                    "tag": "facebook",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/facebook.srs"
                },
                {
                    "type": "remote",
                    "tag": "telegram-sites",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/telegram.srs"
                },
                {
                    "type": "remote",
                    "tag": "telegram-ips",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geoip/telegram.srs"
                },
                {
                    "type": "remote",
                    "tag": "github",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/github.srs"
                },
                {
                    "type": "remote",
                    "tag": "tiktok",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/tiktok.srs"
                },
                {
                    "type": "remote",
                    "tag": "hetzner",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/hetzner.srs"
                },
                {
                    "type": "remote",
                    "tag": "x",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/x.srs"
                },
                {
                    "type": "remote",
                    "tag": "meta",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/meta.srs"
                },
                {
                    "type": "remote",
                    "tag": "oculus",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/oculus.srs"
                },
                {
                    "type": "remote",
                    "tag": "whatsapp",
                    "format": "binary",
                    "url": "https://github.com/MetaCubeX/meta-rules-dat/raw/sing/geo/geosite/whatsapp.srs"
                }
            ],
            "rules": [
                {
                "protocol": "dns",
                "action": "hijack-dns"
                },
                {
                    "action": "sniff"
                },
                {
                    "action": "route",
                    "outbound": "de-hetzner",
                    "domain_suffix": [
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
                        "speedtest.net"
                    ],
                    "rule_set": [
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
                    "action": "route",
                    "outbound": "moscow-ali",
                    "rule_set": [
                        "telegram-sites",
                        "telegram-ips"
                    ]
                },
                {
                    "action": "route",
                    "outbound": "direct",
                    "rule_set": [
                        "ru-ips",
                        "whatsapp"
                    ],
                    "domain_suffix": [
                        "2ip.ru"
                    ]
                },
                {
                    "action": "route",
                    "outbound": "moscow-ali"
                }
            ]
        },
        "inbounds": [
        {
            "type": "tun",
            "address": ["198.18.0.1/16"],
            "auto_route": true,
            "sniff": true
        }
        ]
    }
```

в соответствующее соеденение, я хочу это разместить на сервере, и оно там в какой то папке будет создавать конфиги с этими данными, с указанной мною именем

Чтобы я мог легко создавать для новых клиентов такие, мне именно вот такая связка из двух нужна, чтобы в россии работало, так как в россии напрямую к германии покдлючится самому нельзя, только вот так через промежуточное

вот этот конфиг, для айфона, но нужно еще расчитать так, что для андроида конфиг будет чуть иначе, для виндовса тоже, типо чтобы было 3 шаблона, для ios, android, windows, типо я буду выбирать для какой ОС создается конфиг и пишу имя, оно само заходит в аккаунты на московский 3x-ui и германский и создает там клиента в подключениях у меня, если есть АПИ у них, можно и их использовать

на чем делать интерфейс, чтобы он мог кофиги писать, сам подумай


после того, как я конфиг создам, надо еще чтобы оно было доступно по ссылке
например:
https://config.test-internet.ru/ali-ios.json
так как я в синг-боксе использую удаленные конфиги, чтобы в случае чего, просто в самом        
конфиге исправить, если вдруг пофиксят