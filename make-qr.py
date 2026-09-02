#!/usr/bin/env python3
"""
申込フォームのQRコードを案内資料に埋め込むスクリプト。

使い方：
    python3 make-qr.py "https://forms.gle/xxxxxxxx"

Googleフォームの「配布用URL」を渡すと、
  1. photos/form-qr.png（Word版用）
  2. 案内資料HTMLのQR枠（SVGを直接埋め込み）
の両方を更新します。
"""
import re
import sys
import os

import segno

DIR = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(DIR, 'osato-fukushi-bosai-program.html')
PNG = os.path.join(DIR, 'photos', 'form-qr.png')

DARK = '#22302A'   # 資料の文字色に合わせる


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    url = sys.argv[1].strip()
    if not url.startswith(('http://', 'https://')):
        print('URLは http:// または https:// で始めてください。')
        sys.exit(1)

    # 誤り訂正レベルM（30%程度の汚れ・折れに耐える）
    qr = segno.make(url, error='m')

    # --- Word版用のPNG（印刷でも潰れない解像度）---
    qr.save(PNG, scale=12, border=2, dark=DARK, light='#FFFFFF')

    # --- HTMLに直接埋め込むSVG ---
    import io
    buf = io.BytesIO()
    qr.save(buf, kind='svg', border=2, dark=DARK, light=None,
            xmldecl=False, svgns=True, omitsize=True, svgclass=None, lineclass=None)
    svg = buf.getvalue().decode('utf-8').strip()
    # 拡大縮小できるようにviewBoxだけ残す
    svg = svg.replace('<svg ', '<svg role="img" aria-label="申込フォームのQRコード" ', 1)

    with open(HTML, encoding='utf-8') as f:
        s = f.read()
    new_frame = '<div class="qr-frame">' + svg + '</div>'
    s2, n = re.subn(r'<div class="qr-frame">.*?</div>\s*(?=<p class="qr-cap">)',
                    new_frame + '\n      ', s, flags=re.S)
    if n != 1:
        print('QR枠が見つかりませんでした（%d件）。HTMLの構造を確認してください。' % n)
        sys.exit(1)
    with open(HTML, 'w', encoding='utf-8') as f:
        f.write(s2)

    print('QRコードを作成しました')
    print('  URL :', url)
    print('  PNG :', PNG)
    print('  HTML:', HTML, '（QR枠を差し替え）')
    side = qr.symbol_size(scale=1, border=0)[0]
    print('マス目: %d×%d' % (side, side))


if __name__ == '__main__':
    main()
