#!/usr/bin/env python3
"""Build demo HTML files by inlining base64 images and SVG avatars.

Replaces placeholders in *.tpl.html with:
- base64 PPT images (data URIs)
- Neo avatar SVG (various sizes)
- Actor avatar SVG (various sizes)

Outputs to ../<name>.html
"""
import base64
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEMO = os.path.dirname(HERE)  # demo/
ROOT = os.path.dirname(DEMO)   # prototype/
PPT  = os.path.join(ROOT, 'assets', 'ppt')

def b64_img(name):
    with open(os.path.join(PPT, name), 'rb') as f:
        return 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode('ascii')

# Inline SVG avatars (as data URIs so they work inside <img src="">)
# Neo: cyan-violet gradient circle with a spark/star symbol
def neo_svg(size):
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="{s}" height="{s}" viewBox="0 0 64 64">'
        '<defs>'
        '<linearGradient id="ng" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0%" stop-color="#22D3EE"/>'
        '<stop offset="50%" stop-color="#A78BFA"/>'
        '<stop offset="100%" stop-color="#8B5CF6"/>'
        '</linearGradient>'
        '<radialGradient id="glow" cx="0.3" cy="0.3" r="0.7">'
        '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>'
        '<stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>'
        '</radialGradient>'
        '</defs>'
        '<circle cx="32" cy="32" r="30" fill="url(#ng)"/>'
        '<circle cx="32" cy="32" r="30" fill="url(#glow)"/>'
        '<path d="M32 16 L34.5 28 L46 30.5 L34.5 33 L32 45 L29.5 33 L18 30.5 L29.5 28 Z" fill="#0A0B10" opacity="0.85"/>'
        '<circle cx="46" cy="18" r="2.2" fill="#FCD34D" opacity="0.9"/>'
        '<circle cx="18" cy="45" r="1.6" fill="#67E8F9" opacity="0.9"/>'
        '</svg>'
    ).format(s=size)
    return 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode('utf-8')).decode('ascii')

# Actor: gradient circle with "赵" Chinese char
def actor_svg(size):
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="{s}" height="{s}" viewBox="0 0 64 64">'
        '<defs>'
        '<linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0%" stop-color="#67E8F9"/>'
        '<stop offset="100%" stop-color="#06B6D4"/>'
        '</linearGradient>'
        '</defs>'
        '<circle cx="32" cy="32" r="30" fill="url(#ag)"/>'
        '<text x="32" y="42" font-family="PingFang SC, Inter, sans-serif" font-size="30" '
        'font-weight="600" text-anchor="middle" fill="#0A0B10">赵</text>'
        '</svg>'
    ).format(s=size)
    return 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode('utf-8')).decode('ascii')


def neo_img(size_class, extra_classes=''):
    """Full <img> tag for Neo avatars. size_class: pixel size tokens."""
    src = neo_svg(96)  # 96px master, scale via CSS
    cls = 'neo-avatar rounded-lg object-cover shrink-0 ' + size_class + ' ' + extra_classes
    return '<img src="{}" alt="Neo" class="{}" />'.format(src, cls.strip())

def neo_brand_img():
    src = neo_svg(192)
    return '<img src="{}" alt="Neo" class="neo-brand-avatar h-28 w-28 xl:h-40 xl:w-40 object-contain relative z-10" />'.format(src)

def actor_img(size_class, extra_classes=''):
    src = actor_svg(96)
    cls = 'object-cover ' + size_class + ' ' + extra_classes
    return '<img src="{}" alt="赵工" class="{}" />'.format(src, cls.strip())

def actor_img_96_header():
    """Header portrait with glow border, 96px"""
    src = actor_svg(192)
    return (
        '<img src="{}" alt="赵工" class="h-24 w-24 rounded-2xl object-cover mx-auto" '
        'style="border:2px solid rgba(34,211,238,0.4);box-shadow:0 0 24px rgba(34,211,238,0.25)" />'
    ).format(src)

def actor_turn_img():
    """Actor avatar inside dialogue turn (36px, cyan border)"""
    src = actor_svg(96)
    return (
        '<div class="h-9 w-9 rounded-xl overflow-hidden shrink-0" '
        'style="border:1px solid rgba(34,211,238,0.4);box-shadow:0 0 16px rgba(34,211,238,0.2)">'
        '<img src="{}" alt="赵" class="h-full w-full object-cover" />'
        '</div>'
    ).format(src)


def build_lecture():
    """For lecture page: store base64 images as JS map, set src at load time.

    This avoids duplicating large base64 strings (2-3x per image).
    """
    tpl = open(os.path.join(HERE, '03-lecture.tpl.html'), 'r', encoding='utf-8').read()
    imgs = {
        'img_2_1': b64_img('MANAGER3_segment_2.1.jpg'),
        'img_3_1': b64_img('MANAGER3_segment_3.1.jpg'),
        'img_4_1': b64_img('MANAGER3_segment_4.1.jpg'),
        'img_4_2': b64_img('MANAGER3_segment_4.2.jpg'),
        'img_5_1': b64_img('MANAGER3_segment_5.1.jpg'),
        'img_8_1': b64_img('MANAGER3_segment_8.1.jpg'),
    }
    # Replace placeholders with tiny 1x1 transparent png for initial HTML, then JS swaps
    TINY = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
    placeholder_map = {
        '__IMG_2_1__': 'img_2_1',
        '__IMG_3_1__': 'img_3_1',
        '__IMG_4_1__': 'img_4_1',
        '__IMG_4_2__': 'img_4_2',
        '__IMG_5_1__': 'img_5_1',
        '__IMG_8_1__': 'img_8_1',
    }
    # Use a tiny transparent GIF for the initial src, store the real key in data-img-key.
    # A <script> early in <head> walks the doc and wires up each <img data-img-key="...">
    # with src=DEMO_IMGS[key] before the images render, avoiding 404 fetches.
    TINY_GIF = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
    # Two patterns of usage:
    #   src="__IMG_X_Y__" → replace with src="TINY" data-img-key="img_X_Y"
    #   data-img="__IMG_X_Y__" → replace with data-img-key="img_X_Y" data-img="TINY"
    for ph, key in placeholder_map.items():
        tpl = tpl.replace('src="' + ph + '"', 'src="' + TINY_GIF + '" data-img-key="' + key + '"')
        tpl = tpl.replace('data-img="' + ph + '"', 'data-img="' + TINY_GIF + '" data-img-src-key="' + key + '"')
    # Build the IMG map as JS
    js_map = 'window.DEMO_IMGS = {\n'
    for k, v in imgs.items():
        js_map += '  "{}": "{}",\n'.format(k, v)
    js_map += '};\n'
    # Bootstrap script to inject the data URIs at page load. Placed in <head> so images
    # resolve on DOMContentLoaded, avoiding parse-time 404s.
    head_script = (
        '<script>\n' + js_map +
        'document.addEventListener("DOMContentLoaded", function(){\n'
        '  document.querySelectorAll("img[data-img-key]").forEach(function(el){\n'
        '    var k = el.getAttribute("data-img-key");\n'
        '    if (window.DEMO_IMGS[k]) el.src = window.DEMO_IMGS[k];\n'
        '  });\n'
        '  document.querySelectorAll("[data-img-src-key]").forEach(function(el){\n'
        '    var k = el.getAttribute("data-img-src-key");\n'
        '    if (window.DEMO_IMGS[k]) el.setAttribute("data-img", window.DEMO_IMGS[k]);\n'
        '  });\n'
        '});\n'
        '</script>\n'
    )
    # Inject right before </head>
    tpl = tpl.replace('</head>', head_script + '</head>')
    tpl = tpl.replace('__NEO_BRAND_SVG__', neo_brand_img())
    tpl = tpl.replace('__NEO_AVATAR_10__', neo_img('h-10 w-10 rounded-xl'))
    tpl = tpl.replace('__NEO_AVATAR_7__', neo_img('h-7 w-7'))
    out = os.path.join(DEMO, '03-lecture.html')
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(tpl)
    return out

def build_practice():
    tpl = open(os.path.join(HERE, '04-practice.tpl.html'), 'r', encoding='utf-8').read()
    tpl = tpl.replace('__NEO_BRAND_SVG__', neo_brand_img())
    tpl = tpl.replace('__NEO_AVATAR_10__', neo_img('h-10 w-10 rounded-xl'))
    tpl = tpl.replace('__NEO_AVATAR_7__', neo_img('h-7 w-7'))
    # Actor large header
    tpl = tpl.replace('__ACTOR_AVATAR_96__', actor_img_96_header())
    # Actor 36px turn avatars (3 instances)
    for mk in ['__ACTOR_AVATAR_36_0__', '__ACTOR_AVATAR_36_1__', '__ACTOR_AVATAR_36_2__']:
        tpl = tpl.replace(mk, actor_turn_img())
    out = os.path.join(DEMO, '04-practice.html')
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(tpl)
    return out

def build_inquiry():
    tpl = open(os.path.join(HERE, '06-inquiry.tpl.html'), 'r', encoding='utf-8').read()
    tpl = tpl.replace('__NEO_BRAND_SVG__', neo_brand_img())
    tpl = tpl.replace('__NEO_AVATAR_10__', neo_img('h-10 w-10 rounded-xl'))
    tpl = tpl.replace('__NEO_AVATAR_7__', neo_img('h-7 w-7'))
    # Neo 9px (phase2 dialogue) — 4 instances
    for mk in ['__NEO_AVATAR_9_0__', '__NEO_AVATAR_9_1__', '__NEO_AVATAR_9_2__', '__NEO_AVATAR_9_3__']:
        tpl = tpl.replace(mk, neo_img('h-9 w-9 rounded-xl'))
    out = os.path.join(DEMO, '06-inquiry.html')
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(tpl)
    return out

def build_hall_new():
    tpl = open(os.path.join(HERE, '02-hall-new.tpl.html'), 'r', encoding='utf-8').read()
    tpl = tpl.replace('__NEO_BRAND_SVG__', neo_brand_img().replace('h-28 w-28 xl:h-40 xl:w-40', 'h-40 w-40'))
    tpl = tpl.replace('__NEO_AVATAR_10__', neo_img('h-10 w-10 rounded-xl'))
    tpl = tpl.replace('__NEO_AVATAR_7__', neo_img('h-7 w-7'))
    out = os.path.join(DEMO, '02-hall-new.html')
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(tpl)
    return out


if __name__ == '__main__':
    paths = []
    paths.append(build_lecture())
    paths.append(build_practice())
    paths.append(build_inquiry())
    paths.append(build_hall_new())
    for p in paths:
        size = os.path.getsize(p)
        print('built {}  ({} bytes, {:.1f} KB)'.format(os.path.basename(p), size, size/1024.0))
