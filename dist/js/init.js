"use strict";

//以下、iframe処理、ローカル環境だと楽天から読み込んだifraveにはjsもcssも効かない。本番はjsのみ効く。本番で確認する。cssを効かせたい場合はjsで操作する。
//ローカルだとこの下に他のスクリプト書いても無効化されてしまう。
//init.js:177 Uncaught DOMException: Failed to set a named property 'onload' on 'Window': Blocked a frame with origin "http://localhost:3000" from accessing a cross-origin frame. at http://localhost:3000/js/init.js?1700011187711:152:32

document.getElementById('headerframe').addEventListener('load', function () {
  var headerFrame = document.getElementById('headerframe').contentDocument;

  // Append stylesheet link to head
  var link = headerFrame.createElement('link');
  link.rel = 'stylesheet';
  link.href = './css/iframe.css';
  headerFrame.head.appendChild(link);

  // Hide elements with class 'slick-dots'
  var slickDots = headerFrame.querySelector('.slick-dots');
  if (slickDots) {
    slickDots.style.display = 'none';
  }
});
//ナビの高さ調節
//on.clickがなぜか効かない⇒要素を.contents()を通じて取得しないと駄目だった

document.getElementById('headerframe').addEventListener('load', function () {
  var iframe = document.getElementById('headerframe');
  var elementInIframe = iframe.contentDocument.getElementById('nav_globalBtn');
  elementInIframe.addEventListener('click', function () {
    iframe.classList.toggle("is-clicked");
  });
});

//footer高さ設定
var elmfooter = document.getElementById("footerFrame");
function changefooterHeight() {
  elmfooter.style.height = elmfooter.contentWindow.document.body.scrollHeight + "px";
}
elmfooter.contentWindow.onload = function () {
  changefooterHeight();
};
var timer = 0;
elmfooter.contentWindow.onresize = function () {
  if (timer > 0) {
    clearTimeout(timer);
  }
  timer = setTimeout(function () {
    changefooterHeight();
  }, 100);
};
//# sourceMappingURL=map/init.js.map



$(document).ready(function() {
  $('.tab').click(function() {
    var tabId = $(this).data('tab');
    $('.tab-content').removeClass('active');
    $('#' + tabId).addClass('active');
    $('.tab').removeClass('active');
    $(this).addClass('active');
  });
});
