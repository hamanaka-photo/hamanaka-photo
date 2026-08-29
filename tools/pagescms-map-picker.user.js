// ==UserScript==
// @name         HAMANAKA PHOTO - Pages CMS MAP位置ボタン
// @namespace    https://hamanaka-photo.github.io/
// @version      1.0.0
// @description  Pages CMSのMAP位置欄に「地図上で指定」ボタンを追加します。
// @match        https://app.pagescms.org/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const PICKER_URL =
    'https://hamanaka-photo.github.io/hamanaka-photo/map-coordinate-picker.html';

  const BUTTON_MARK =
    'data-hamanaka-map-picker-button';

  const normalize =
    value =>
      String(value || '')
        .replace(/\s+/g, '')
        .trim();

  const findTextFieldContainer =
    labelText => {
      const candidates =
        [...document.querySelectorAll(
          'label, [data-slot="form-label"], p, span'
        )];

      const target =
        candidates.find(element => {
          const text =
            normalize(
              element.textContent
            );

          return (
            text === normalize(labelText) ||
            text.startsWith(
              normalize(labelText)
            )
          );
        });

      if (!target) {
        return null;
      }

      let node = target;

      for (let i = 0; i < 6; i += 1) {
        if (!node) {
          break;
        }

        const input =
          node.querySelector?.(
            'input, textarea'
          );

        if (input) {
          return {
            container: node,
            input
          };
        }

        node =
          node.parentElement;
      }

      return null;
    };

  const getSpotName = () => {
    const result =
      findTextFieldContainer(
        'スポット名'
      );

    return (
      result?.input?.value ||
      ''
    ).trim();
  };

  const getPositionValue = () => {
    const result =
      findTextFieldContainer(
        'MAP位置（x,y）'
      );

    return (
      result?.input?.value ||
      ''
    ).trim();
  };

  const buildPickerUrl = () => {
    const url =
      new URL(PICKER_URL);

    url.searchParams.set(
      'context',
      'フォトマップ・撮影スポット'
    );

    url.searchParams.set(
      'field',
      'MAP位置（x,y）'
    );

    const spot =
      getSpotName();

    if (spot) {
      url.searchParams.set(
        'spot',
        spot
      );
    }

    const position =
      getPositionValue();

    if (
      /^(100|[1-9][0-9]?),(100|[1-9][0-9]?)$/
        .test(position)
    ) {
      url.searchParams.set(
        'position',
        position
      );
    }

    return url.toString();
  };

  const styleButton = button => {
    Object.assign(
      button.style,
      {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        minHeight: '36px',
        marginTop: '8px',
        padding: '0 14px',
        border: '1px solid #17364d',
        borderRadius: '7px',
        background: '#17364d',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: '700',
        lineHeight: '1',
        cursor: 'pointer'
      }
    );
  };

  const installButton = () => {
    if (
      document.querySelector(
        `[${BUTTON_MARK}]`
      )
    ) {
      return;
    }

    const result =
      findTextFieldContainer(
        'MAP位置（x,y）'
      );

    if (!result) {
      return;
    }

    const button =
      document.createElement(
        'button'
      );

    button.type =
      'button';

    button.setAttribute(
      BUTTON_MARK,
      'true'
    );

    button.textContent =
      '地図上で指定 ↗';

    button.title =
      '地図を開いてMAP位置を選択します';

    styleButton(button);

    button.addEventListener(
      'click',
      event => {
        event.preventDefault();
        event.stopPropagation();

        const url =
          buildPickerUrl();

        window.open(
          url,
          '_blank'
        );
      }
    );

    const helper =
      document.createElement(
        'div'
      );

    helper.style.marginTop =
      '5px';

    helper.style.color =
      '#64748b';

    helper.style.fontSize =
      '12px';

    helper.textContent =
      '地図で位置を選び、コピー後にこの欄へ Ctrl+V してください。';

    result.container.appendChild(
      button
    );

    result.container.appendChild(
      helper
    );
  };

  const observer =
    new MutationObserver(
      () => {
        installButton();
      }
    );

  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true
    }
  );

  installButton();
})();