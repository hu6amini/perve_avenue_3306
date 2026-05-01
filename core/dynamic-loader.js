document.documentElement.lang = "en";

// ============================================================================
// STYLESHEETS (preload + async load)
// ============================================================================
const STYLESHEETS = Object.freeze([
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@888654e/lightgallery@2.7.1/lightgallery.min.css",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@e44a482/lightgallery@2.7.1/lg-zoom.min.css",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@c5a5f52/lightgallery@2.7.1/lg-thumbnail.min.css",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@b6a816a/lightgallery@2.7.1/lg-fullscreen.min.css",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@d4e08c6/lightgallery@2.7.1/lg-share.min.css",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@c64ef50/lightgallery@2.7.1/lg-autoplay.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/lite-youtube-embed/0.3.3/lite-yt-embed.min.css"
]);

STYLESHEETS.forEach(function(e) {
    var n = document.createElement("link");
    n.rel = "preload";
    n.as = "style";
    n.href = e;
    var t = document.createElement("link");
    t.rel = "stylesheet";
    t.href = e;
    t.media = "print";
    t.onload = function() { t.media = "all"; };
    document.head.append(n, t);
});

// ============================================================================
// SCRIPT LOADER WITH RETRIES
// ============================================================================
function loadScript(src, retries, delayMs) {
    retries = retries || 3;
    delayMs = delayMs || 1000;
    return new Promise(function(resolve, reject) {
        var attempt = 0;
        function tryLoad() {
            var script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.crossOrigin = "anonymous";
            script.referrerPolicy = "no-referrer";
            script.onload = function() { resolve(); };
            script.onerror = function() {
                attempt++;
                if (attempt < retries) {
                    console.warn('Failed to load ' + src + ', retrying (' + attempt + '/' + retries + ')...');
                    setTimeout(tryLoad, delayMs * attempt);
                } else {
                    console.error('Failed to load ' + src + ' after ' + retries + ' attempts');
                    reject(new Error('Script load failed: ' + src));
                }
            };
            document.head.appendChild(script);
        }
        tryLoad();
    });
}

// ============================================================================
// SCRIPT ORDER (critical dependencies first)
// ============================================================================
const SCRIPT_URLS = [
    // External libraries (required by modules)
    "https://cdnjs.cloudflare.com/ajax/libs/twemoji-js/14.0.2/twemoji.min.js",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@77a2243/lightgallery@2.7.1/lightgallery.min.js",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@e44a482/lightgallery@2.7.1/lg-zoom.min.js",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@b199e98/lightgallery@2.7.1/lg-thumbnail.min.js",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@8b2d601/lightgallery@2.7.1/lg-fullscreen.min.js",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@42de4d6/lightgallery@2.7.1/lg-share.min.js",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@a7e3cfe/lightgallery@2.7.1/lg-autoplay.min.js",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@c98180c/lightgallery@2.7.1/lg-hash.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/lite-youtube-embed/0.3.3/lite-yt-embed.js",
    "https://cdn.jsdelivr.net/npm/lite-vimeo-embed@0.3.0/+esm",
    
    // Core utilities (no dependencies)
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@c7477a9/core/dom-utils.js",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@be3f0b0/core/event-bus.js",
    
    // Forum Core Observer (must be before modules that use it)
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@de3f849/forum_core_observer.js",
    
    // Modules (each will wait for forum-observer-ready internally)
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@54f32c0/core/media-dimensions.js",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@5cca0ae/core/twemoji.js",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@4fbf14e/modules/posts.js",
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@4bfa595/modules/modals.js",
    
    // Main enhancer (last)
    "https://cdn.jsdelivr.net/gh/hu6amini/perve_avenue@7f0ee7b/core/forum-enhancer.js"
];

async function loadAllScripts() {
    for (var i = 0; i < SCRIPT_URLS.length; i++) {
        var url = SCRIPT_URLS[i];
        try {
            await loadScript(url, 3, 1000);
            console.log('Loaded: ' + url);
        } catch (err) {
            console.error('Aborting further loads because critical script failed:', url, err);
            // Optionally show a user-visible error banner
            var banner = document.createElement('div');
            banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#c00;color:#fff;padding:8px;text-align:center;z-index:99999;';
            banner.textContent = 'Forum Enhancer: Failed to load ' + url + '. Please refresh the page.';
            document.body.appendChild(banner);
            break;
        }
    }
}

// Instant page preload (non‑critical)
var instantPagePreload = document.createElement("link");
Object.assign(instantPagePreload, {
    rel: "preload",
    as: "script",
    href: "https://cdn.jsdelivr.net/npm/instant.page@5.2.0/instantpage.min.js",
    crossOrigin: "anonymous"
});
document.head.appendChild(instantPagePreload);

// Start loading when DOM ready
function startLoading() {
    loadAllScripts().catch(function(e) {
        console.error('Dynamic loader error:', e);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startLoading);
} else {
    startLoading();
}
