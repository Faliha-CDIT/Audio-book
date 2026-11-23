const { withAndroidManifest } = require('@expo/config-plugins');
const { mkdirSync, writeFileSync } = require('fs');
const { resolve, join } = require('path');

/**
 * Expo Config Plugin: withNetworkSecurityConfig
 *
 * Adds an Android Network Security Configuration that:
 *   - Blocks cleartext (HTTP) traffic globally.
 *   - Pins only the STABLE intermediate + root CA keys for sarva.cditproject.org.
 *
 * WHY NO LEAF PIN:
 *   Let's Encrypt renews leaf certificates every ~90 days. Pinning the leaf key
 *   causes audio/API calls to fail silently on some Android devices whenever the
 *   cert is renewed, because the pinned SHA-256 no longer matches. By pinning only
 *   the intermediate (Let's Encrypt E7) and root (ISRG Root X1) we get MITM
 *   protection that survives routine leaf cert renewals.
 *
 * Pins included:
 *   - Let's Encrypt E7 intermediate CA  (changes only when LE rotates intermediates)
 *   - ISRG Root X1 root CA              (most stable; changes only if LE changes root)
 *   - ISRG Root X2 root CA              (future-proof backup)
 *
 * IMPORTANT: If the CDN / CA provider changes away from Let's Encrypt,
 * update all three pins and rebuild.
 */

const NETWORK_SECURITY_CONFIG_XML = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Block cleartext (HTTP) traffic on all connections -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>

    <!-- Stable CA-level pins for the backend API domain -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">sarva.cditproject.org</domain>
        <pin-set expiration="2028-01-01">
            <!--
                Let's Encrypt E7 intermediate CA.
                Survives leaf-cert renewals (~90 days).
            -->
            <pin digest="SHA-256">y7xVm0TVJNahMr2sZydE2jQH8SquXV9yLF9seROHHHU=</pin>

            <!--
                ISRG Root X1 (primary Let's Encrypt root).
                Changes only if Let's Encrypt replaces root CA.
            -->
            <pin digest="SHA-256">C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=</pin>

            <!--
                ISRG Root X2 (backup Let's Encrypt root).
            -->
            <pin digest="SHA-256">diGVwiVYbubAI3RW4hB9xU8e/CH2GnkuvXFuiMMjNqY=</pin>
        </pin-set>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
</network-security-config>`;

function withNetworkSecurityConfig(config) {
  return withAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];

    if (mainApplication) {
      // Set the networkSecurityConfig attribute on <application>
      mainApplication.$['android:networkSecurityConfig'] =
        '@xml/network_security_config';
    }

    // Write the network_security_config.xml to android/app/src/main/res/xml/
    // Only execute if we have a valid platform project root (during prebuild/build)
    if (config.modRequest && config.modRequest.platformProjectRoot) {
      const resXmlDir = resolve(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'xml'
      );

      mkdirSync(resXmlDir, { recursive: true });

      const xmlFilePath = join(resXmlDir, 'network_security_config.xml');
      writeFileSync(xmlFilePath, NETWORK_SECURITY_CONFIG_XML, 'utf-8');
    }

    return config;
  });
}

module.exports = withNetworkSecurityConfig;
