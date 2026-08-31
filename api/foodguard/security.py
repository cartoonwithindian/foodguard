"""SSRF-safe URL fetching for ``POST /search/url``.

Only http/https are allowed. Every resolved host (after redirects) is checked
against private / loopback / link-local / reserved ranges before the bytes are
downloaded, with a size cap and bounded redirects/timeouts. Temp files are always
cleaned up by the caller.
"""

from __future__ import annotations

import ipaddress
import socket

import requests

from .engine import PipelineError

ALLOWED_SCHEMES = ("http", "https")

# RFC-5735 / RFC-6598 / multicast / reserved / CGNAT ranges considered unsafe
_BLOCKED_NETWORKS = (
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("100.64.0.0/10"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.0.0.0/24"),
    ipaddress.ip_network("192.0.2.0/24"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("198.18.0.0/15"),
    ipaddress.ip_network("198.51.100.0/24"),
    ipaddress.ip_network("203.0.113.0/24"),
    ipaddress.ip_network("224.0.0.0/4"),
    ipaddress.ip_network("240.0.0.0/4"),
)

_BLOCKED_IP6_NETWORKS = (
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("::/128"),
    ipaddress.ip_network("64:ff9b::/96"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
    ipaddress.ip_network("ff00::/8"),
    ipaddress.ip_network("2001:db8::/32"),
)


def _is_safe_ip(ip: ipaddress._BaseAddress) -> bool:
    if ip.version == 4:
        return not any(ip in net for net in _BLOCKED_NETWORKS)
    return not any(ip in net for net in _BLOCKED_IP6_NETWORKS)


def _resolve_safe(url: str) -> None:
    """Resolve a hostname and raise if it maps to a blocked (private) address."""
    from urllib.parse import urlparse

    host = urlparse(url).hostname
    if not host:
        raise PipelineError(f"Unparseable host in URL: {url}", status=400)
    try:
        infos = socket.getaddrinfo(host, None, proto=socket.IPPROTO_TCP)
    except socket.gaierror as exc:
        raise PipelineError(f"Could not resolve host {host}", status=400) from exc

    for info in infos:
        addr = info[4][0]
        ip = ipaddress.ip_address(addr.split("%")[0])
        if not _is_safe_ip(ip):
            raise PipelineError(
                f"Blocked address {addr} (private/reserved)", status=400
            )


class ImageFetcher:
    def __init__(self, settings):
        self.settings = settings
        self.max_bytes = int(settings.max_image_mb * 1024 * 1024)
        self.session = requests.Session()
        self.session.max_redirects = settings.url_max_redirects
        self.session.headers.update({"User-Agent": "FoodGuard/1.0"})

    def fetch(self, url: str) -> tuple[bytes, str]:
        """Return (bytes, final_content_type) for a validated image URL."""
        from urllib.parse import urlparse

        parsed = urlparse(url)
        if parsed.scheme not in ALLOWED_SCHEMES:
            raise PipelineError(
                f"URL scheme '{parsed.scheme}' not allowed; use http(s)", status=400
            )
        if not parsed.hostname:
            raise PipelineError("URL must include a host", status=400)

        # Validate every host we might reach (initial + each redirect) up front.
        _resolve_safe(url)

        resp = self.session.get(
            url, timeout=self.settings.url_timeout_s, stream=True
        )
        resp.raise_for_status()

        # Check the final host as well (in case of redirects).
        _resolve_safe(resp.url)

        content_type = resp.headers.get("Content-Type", "")
        if "image" not in content_type:
            raise PipelineError(
                f"URL did not return an image (Content-Type: {content_type or 'missing'})",
                status=422,
            )

        chunks = []
        size = 0
        for chunk in resp.iter_content(chunk_size=65536):
            if not chunk:
                continue
            size += len(chunk)
            if size > self.max_bytes:
                resp.close()
                raise PipelineError(
                    f"Image exceeds {self.settings.max_image_mb:.0f} MB limit",
                    status=413,
                )
            chunks.append(chunk)
        resp.close()

        if not chunks:
            raise PipelineError("Downloaded image is empty", status=422)
        return b"".join(chunks), content_type

