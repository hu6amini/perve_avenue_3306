// Twemoji Module - replaces custom emojis with Twemoji
// Waits for twemoji library and forum observer
'use strict';

var TwemojiModule = (function() {
    'use strict';

    const EMOJI_MAP = new Map([ 
        ['https://img.forumfree.net/html/emoticons/new/heart.svg', '2764.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/flame.svg', '1f525.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/stars.svg', '1f929.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/thumbup.svg', '1f44d.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/thumbdown.svg', '1f44e.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/w00t.svg', '1f92f.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/happy.svg', '1f60a.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/biggrin.svg', '1f600.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/bigsmile.svg', '1f603.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/smile.svg', '1f642.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/wink.svg', '1f609.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/tongue.svg', '1f61b.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/blep.svg', '1f61c.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/bleh.svg', '1f61d.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/laugh.svg', '1f606.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/haha.svg', '1f602.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/rotfl.svg', '1f923.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/hearts.svg', '1f60d.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/love.svg', '1f970.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/wub.svg', '1f60b.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/kiss.svg', '1f618.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/blush.svg', '263a.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/joy.svg', '1f60f.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/cool.svg', '1f60e.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/sad.svg', '1f641.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/cry.svg', '1f622.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/bigcry.svg', '1f62d.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/mad.svg', '1f620.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/dry.svg', '1f612.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/disgust.svg', '1f611.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/doh.svg', '1f623.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/neutral.svg', '1f610.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/unsure.svg', '1f615.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/mouthless.svg', '1f636.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/think.svg', '1f914.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/huh.svg', '1f928.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/ohmy.svg', '1f62f.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/rolleyes.svg', '1f644.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/sleep.svg', '1f634.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/sick.svg', '1f922.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/distraught.svg', '1f626.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/squint.svg', '1f62c.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/wacko.svg', '1f92a.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/upside.svg', '1f643.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/ph34r.svg', '1f977.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/alien.svg', '1f47d.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/shifty.svg', '1f608.svg'], 
        ['https://img.forumfree.net/html/emoticons/new/blink.svg', '1f440.svg'] 
    ]);

    const TWEMOJI_CONFIG = { 
        folder: 'svg',
        ext: '.svg',
        base: 'https://twemoji.maxcdn.com/v/latest/',
        className: 'twemoji',
        size: 'svg'
    };

    const PROCESSED_CLASS = 'twemoji-processed';
    const TWEMOJI_BASE_URL = TWEMOJI_CONFIG.base + 'svg/';

    let initialized = false;

    function shouldSkipContainer(container) {
        if (!container) return false;
        
        // Skip Twitter embed blocks entirely (prevent breaking widget replacement)
        if (container.matches && container.matches('.twitter-tweet')) return true;
        if (container.closest && container.closest('.twitter-tweet')) return true;
        
        // Skip editor / picker areas
        if (container.closest && container.closest('.ve-emoji-dropdown')) return true;
        if (container.closest && container.closest('.ve-content.color')) return true;
        if (container.matches) {
            if (container.matches('.ve-emoji-dropdown, .ve-content.color')) return true;
        }
        if (container.closest && container.closest('[contenteditable="true"]')) return true;
        if (container.getAttribute && container.getAttribute('contenteditable') === 'true') return true;
        
        return false;
    }

    // Helper: check if a node (or its ancestors) should be skipped
    function isNodeSkipped(node) {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
        return shouldSkipContainer(node);
    }

    // Custom callback for twemoji.parse to skip nodes inside skipped containers
    function twemojiFilterCallback(node) {
        if (isNodeSkipped(node)) {
            return false; // skip this node and its children
        }
        return true; // process normally
    }

    function getEmojiSelectors(src) {
        return [
            'img[src="' + src + '"]:not(.' + PROCESSED_CLASS + ')',
            'img[data-emoticon-url="' + src + '"]:not(.' + PROCESSED_CLASS + ')',
            'img[data-emoticon-preview="' + src + '"]:not(.' + PROCESSED_CLASS + ')'
        ];
    }

    // Replace custom SVG emojis (skipping blocked containers)
    function replaceCustomEmojis(container) {
        if (shouldSkipContainer(container)) return;
        if (!container || !container.querySelectorAll) return;

        for (const [oldSrc, newFile] of EMOJI_MAP) {
            const selectors = getEmojiSelectors(oldSrc);
            for (const selector of selectors) {
                const imgs = container.querySelectorAll(selector);
                for (let i = 0; i < imgs.length; i++) {
                    const img = imgs[i];
                    if (shouldSkipContainer(img)) continue;
                    const originalAttrs = {
                        src: img.src,
                        alt: img.alt,
                        dataEmoticonUrl: img.getAttribute('data-emoticon-url'),
                        dataEmoticonPreview: img.getAttribute('data-emoticon-preview'),
                        dataText: img.getAttribute('data-text')
                    };
                    img.src = TWEMOJI_BASE_URL + newFile;
                    img.classList.add('twemoji', PROCESSED_CLASS);
                    img.loading = 'lazy';
                    img.decoding = 'async';
                    if (originalAttrs.dataEmoticonUrl) img.setAttribute('data-emoticon-url', originalAttrs.dataEmoticonUrl);
                    if (originalAttrs.dataEmoticonPreview) img.setAttribute('data-emoticon-preview', originalAttrs.dataEmoticonPreview);
                    if (originalAttrs.dataText) img.setAttribute('data-text', originalAttrs.dataText);
                    if (originalAttrs.alt) img.alt = originalAttrs.alt;
                    img.onerror = function() {
                        console.warn('Failed to load emoji: ' + newFile);
                        this.src = originalAttrs.src;
                        this.classList.remove(PROCESSED_CLASS);
                        if (originalAttrs.dataEmoticonUrl) this.setAttribute('data-emoticon-url', originalAttrs.dataEmoticonUrl);
                        if (originalAttrs.dataEmoticonPreview) this.setAttribute('data-emoticon-preview', originalAttrs.dataEmoticonPreview);
                        if (originalAttrs.dataText) this.setAttribute('data-text', originalAttrs.dataText);
                        if (originalAttrs.alt) this.alt = originalAttrs.alt;
                    };
                }
            }
        }
    }

    // Main function that applies both custom and Unicode replacements
    function applyEmojiReplacement(container, syncMode) {
        if (shouldSkipContainer(container)) return;
        
        // First replace custom SVG emojis
        replaceCustomEmojis(container);
        
        // Then replace Unicode emojis using Twemoji, with a callback that skips blocked nodes
        if (window.twemoji && window.twemoji.parse) {
            const options = Object.assign({}, TWEMOJI_CONFIG, {
                callback: function(icon, options, variant) {
                    // If the current node being processed is inside a skipped container, return null (skip)
                    // Note: twemoji passes the icon code, but we need access to the node.
                    // We'll use a different approach: wrap the parse call with a node filter.
                }
            });
            
            // Twemoji's parse method can accept a third parameter (callback) that receives the node.
            // However, the easier way: use the `callback` option that receives the node?
            // Actually, twemoji.parse(node, options) does not have a built-in node filter.
            // We need to manually walk the DOM and apply twemoji.parse only on safe subtrees.
            
            // Better approach: traverse the container and apply twemoji.parse only on elements that are not skipped.
            // But that's inefficient. Instead, we can use a MutationObserver-like approach.
            // Since we are already skipping the container at the top, we need to ensure that inside the container,
            // we don't parse any descendants that are skipped.
            
            // The most reliable method: use the `callback` option that twemoji provides for each icon match.
            // The callback receives (icon, options, variant) but not the node. Not helpful.
            // Alternatively, we can use twemoji.parse with a `document` fragment and then filter.
            
            // Given the complexity, the simplest is to clone the container, remove all .twitter-tweet elements,
            // parse the clone, and then copy back only the emoji images? That would lose other changes.
            
            // After research, the best solution is to use the `callback` parameter of twemoji.parse
            // (the third argument) which is called for each emoji found and receives the node.
            // We can check that node and if it's inside a skipped container, we skip replacement.
            
            const parseFn = twemoji.parse;
            const originalParse = parseFn.bind(twemoji);
            
            // Override temporarily? No, just pass a custom callback.
            // The signature: twemoji.parse(node, options, callback) where callback is called for each emoji node.
            // We'll pass a callback that checks the node's ancestry.
            
            const twemojiCallback = function(node) {
                if (isNodeSkipped(node)) {
                    // Do nothing – leave the original text node as is
                    return;
                }
                // Otherwise, let Twemoji do its default replacement (by returning nothing)
                // We need to return the replacement node? Actually the callback is invoked after replacement?
                // According to twemoji docs: callback gets the node that will be replaced.
                // If we return false, it skips. So we can return false to skip.
                if (isNodeSkipped(node)) {
                    return false;
                }
                // Return undefined to continue with default replacement
            };
            
            const applySync = function() {
                if (syncMode === true) {
                    twemoji.parse(container, TWEMOJI_CONFIG, twemojiCallback);
                } else {
                    if (typeof requestIdleCallback !== 'undefined') {
                        requestIdleCallback(function() {
                            if (!shouldSkipContainer(container)) {
                                twemoji.parse(container, TWEMOJI_CONFIG, twemojiCallback);
                            }
                        }, { timeout: 1000 });
                    } else {
                        setTimeout(function() {
                            if (!shouldSkipContainer(container)) {
                                twemoji.parse(container, TWEMOJI_CONFIG, twemojiCallback);
                            }
                        }, 0);
                    }
                }
            };
            
            applySync();
        }
    }

    function initEmojiReplacement() {
        // Perform initial replacement SYNCHRONOUSLY with skip protection
        applyEmojiReplacement(document.body, true);

        // Register asynchronous callbacks for future dynamic content
        if (globalThis.forumObserver && typeof globalThis.forumObserver.register === 'function') {
            globalThis.forumObserver.register({
                id: 'emoji-replacer-picker',
                callback: function(node) { applyEmojiReplacement(node, false); },
                selector: '.picker-custom-grid, .picker-custom-item, .image-thumbnail, .ve-emoji-list',
                priority: 'high',
                pageTypes: ['topic', 'blog', 'search', 'forum']
            });
            globalThis.forumObserver.register({
                id: 'emoji-replacer-content',
                callback: function(node) { applyEmojiReplacement(node, false); },
                selector: '.post, .article, .content, .reply, .comment, .color, td[align], div[align]',
                priority: 'normal',
                pageTypes: ['topic', 'blog', 'search', 'forum']
            });
            globalThis.forumObserver.register({
                id: 'emoji-replacer-quotes',
                callback: function(node) { applyEmojiReplacement(node, false); },
                selector: '.quote, .code, .spoiler, .modern-quote, .modern-spoiler',
                priority: 'normal'
            });
            globalThis.forumObserver.register({
                id: 'emoji-replacer-user-content',
                callback: function(node) { applyEmojiReplacement(node, false); },
                selector: '.signature, .user-info, .profile-content, .post-content',
                priority: 'low'
            });
            console.log('Emoji replacer fully integrated with ForumCoreObserver (Twitter blocks skipped)');

            // Also process any existing emoji picker immediately (synchronously)
            setTimeout(function() {
                const pickerGrid = document.querySelector('.picker-custom-grid');
                if (pickerGrid && !shouldSkipContainer(pickerGrid)) {
                    applyEmojiReplacement(pickerGrid, true);
                    console.log('Found existing emoji picker, processed synchronously');
                }
            }, 500);
        } else {
            console.error('ForumCoreObserver not available - emoji replacement disabled');
        }
    }

    async function waitForTwemoji() {
        if (typeof twemoji !== 'undefined') return true;
        return new Promise((resolve) => {
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (typeof twemoji !== 'undefined') {
                    clearInterval(interval);
                    resolve(true);
                } else if (attempts >= 100) {
                    clearInterval(interval);
                    console.warn('Twemoji not loaded after 10 seconds, proceeding without it');
                    resolve(false);
                }
            }, 100);
        });
    }

    async function waitForForumObserver() {
        if (globalThis.forumObserver) return true;
        return new Promise((resolve) => {
            const handler = () => {
                window.removeEventListener('forum-observer-ready', handler);
                resolve(true);
            };
            window.addEventListener('forum-observer-ready', handler);
            setTimeout(() => {
                window.removeEventListener('forum-observer-ready', handler);
                console.warn('ForumObserver not ready after 5 seconds, proceeding anyway');
                resolve(false);
            }, 5000);
        });
    }

    async function initialize() {
        if (initialized) return;
        console.log('TwemojiModule initializing...');
        await waitForTwemoji();
        await waitForForumObserver();
        initEmojiReplacement();
        initialized = true;
        console.log('TwemojiModule ready');
        
        window.emojiReplacer = {
            replace: function(container) { applyEmojiReplacement(container, false); },
            replaceSync: function(container) { applyEmojiReplacement(container, true); },
            init: initEmojiReplacement,
            isReady: function() { return !!window.twemoji; },
            forcePickerUpdate: function() {
                const pickerGrid = document.querySelector('.picker-custom-grid');
                if (pickerGrid && !shouldSkipContainer(pickerGrid)) {
                    applyEmojiReplacement(pickerGrid, true);
                    return true;
                }
                return false;
            },
            shouldSkip: shouldSkipContainer
        };
    }

    return {
        initialize: initialize,
        name: 'twemoji',
        dependencies: ['twemojiLib', 'forumObserver']
    };
})();
