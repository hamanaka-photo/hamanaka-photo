(() => {
  const STYLE_URL_PATTERN =
    /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi;

  const resolveAssetUrl = value => {
    const raw = String(value || '').trim();

    if (
      !raw ||
      /^(?:data:|blob:|javascript:|#)/i.test(raw)
    ) {
      return raw;
    }

    try {
      return new URL(raw, document.baseURI).href;
    } catch {
      return raw;
    }
  };

  const normalizeCssUrls = cssText => {
    const source = String(cssText || '');

    if (!/url\(/i.test(source)) {
      return source;
    }

    return source.replace(
      STYLE_URL_PATTERN,
      (match, doubleQuoted, singleQuoted, unquoted) => {
        const raw =
          doubleQuoted ??
          singleQuoted ??
          unquoted ??
          '';

        const value = String(raw).trim();

        if (!value) {
          return match;
        }

        const resolved = resolveAssetUrl(value);

        if (!resolved || resolved === value) {
          return match;
        }

        return `url("${resolved.replace(/"/g, '%22')}")`;
      }
    );
  };

  const normalizeElement = element => {
    if (!(element instanceof Element)) {
      return;
    }

    const styleText = element.getAttribute('style');

    if (styleText && /url\(/i.test(styleText)) {
      const normalized = normalizeCssUrls(styleText);

      if (normalized !== styleText) {
        element.setAttribute('style', normalized);
      }
    }

    element.querySelectorAll?.('[style]').forEach(child => {
      const childStyle = child.getAttribute('style');

      if (!childStyle || !/url\(/i.test(childStyle)) {
        return;
      }

      const normalized = normalizeCssUrls(childStyle);

      if (normalized !== childStyle) {
        child.setAttribute('style', normalized);
      }
    });
  };

  const scanDocument = () => {
    document.querySelectorAll('[style]').forEach(element => {
      const styleText = element.getAttribute('style');

      if (!styleText || !/url\(/i.test(styleText)) {
        return;
      }

      const normalized = normalizeCssUrls(styleText);

      if (normalized !== styleText) {
        element.setAttribute('style', normalized);
      }
    });
  };

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      if (
        record.type === 'attributes' &&
        record.target instanceof Element
      ) {
        normalizeElement(record.target);
        return;
      }

      record.addedNodes.forEach(node => {
        if (node instanceof Element) {
          normalizeElement(node);
        }
      });
    });
  });

  window.HAMANAKA_ASSET_URL = Object.freeze({
    resolve: resolveAssetUrl,
    normalizeCssUrls
  });

  scanDocument();

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style']
  });
})();