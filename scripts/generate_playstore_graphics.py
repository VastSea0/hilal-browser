import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

DOWNLOADS = os.path.expanduser('~/Downloads')
OUT_DIR = 'playstore/graphics'

FILES_INFO = [
    {
        'file': 'Screenshot 2026-09-09 at 08.26.59.jpg',
        'key': '01_home',
        'tag_tr': 'MATERIAL 3 EXPRESSIVE',
        'tag_en': 'MATERIAL 3 EXPRESSIVE',
        'title_tr': 'Modern ve Hızlı Başlangıç',
        'title_en': 'Modern & Fast Start',
        'sub_tr': 'Kişiselleştirilebilir ana sayfa ve anında erişim kısayolları',
        'sub_en': 'Personalized home screen with instant access shortcuts',
        'accent': (56, 189, 248), # Sky blue
        'cx': 353.5,
        'cy': 141.5
    },
    {
        'file': 'Screenshot 2026-09-09 at 08.29.43.jpg',
        'key': '02_privacy',
        'tag_tr': 'MOZILLA GECKOVIEW',
        'tag_en': 'MOZILLA GECKOVIEW',
        'title_tr': 'Gerçek Gizlilik & Güvenlik',
        'title_en': 'True Privacy & Security',
        'sub_tr': 'Gelişmiş izleyici engelleme ve parmak izi koruması',
        'sub_en': 'Advanced tracker blocking and fingerprinting protection',
        'accent': (52, 211, 153), # Emerald
        'cx': 375.5,
        'cy': 127.5
    },
    {
        'file': 'Screenshot 2026-09-09 at 08.29.59.jpg',
        'key': '03_workspaces',
        'tag_tr': 'ÇALIŞMA ALANLARI',
        'tag_en': 'TAB WORKSPACES',
        'title_tr': 'Sekmelerinizi Düzenleyin',
        'title_en': 'Organize Your Spaces',
        'sub_tr': 'İş, araştırma ve kişisel sekmelerinizi alanlara ayırın',
        'sub_en': 'Separate work, research, and personal browsing seamlessly',
        'accent': (129, 140, 248), # Indigo
        'cx': 383.5,
        'cy': 171.5
    },
    {
        'file': 'Screenshot 2026-09-09 at 08.30.37.jpg',
        'key': '04_options',
        'tag_tr': 'ERGONOMİK KONTROLLER',
        'tag_en': 'ERGONOMIC CONTROLS',
        'title_tr': 'Tek Dokunuşla Yönetim',
        'title_en': 'One-Handed Navigation',
        'sub_tr': 'Tüm sayfa eylemleri ve alan geçişleri elinizin altında',
        'sub_en': 'Quick actions, bookmarks, and space switcher at your fingertips',
        'accent': (96, 165, 250), # Blue
        'cx': 343.5,
        'cy': 81.5
    },
    {
        'file': 'Screenshot 2026-09-09 at 08.30.49.jpg',
        'key': '05_settings',
        'tag_tr': 'TAM ÖZELLEŞTİRME',
        'tag_en': 'TOTAL CUSTOMIZATION',
        'title_tr': 'Koyu Mod ve Esnek Düzen',
        'title_en': 'Dark Mode & Flexible UI',
        'sub_tr': 'Yüzen çubuklar, web koyu modu ve derin ayarlar',
        'sub_en': 'Floating bars, website dark theme, and granular settings',
        'accent': (244, 114, 182), # Pink / Rose
        'cx': 321.5,
        'cy': 79.5
    },
    {
        'file': 'Screenshot 2026-09-09 at 08.32.51.jpg',
        'key': '06_bangs',
        'tag_tr': 'HİLAL BANGS ARAMA',
        'tag_en': 'HILAL BANGS ENGINE',
        'title_tr': 'Işık Hızında Doğrudan Arama',
        'title_en': 'Instant Direct Search',
        'sub_tr': '!g, !yt, !w ile doğrudan istediğiniz sitede arayın',
        'sub_en': 'Search directly across YouTube, Google, and Wikipedia with bangs',
        'accent': (251, 191, 36), # Amber / Gold
        'cx': 351.5,
        'cy': 87.5
    }
]

# Fonts
font_heavy = lambda sz: ImageFont.truetype('/System/Library/Fonts/Avenir Next.ttc', sz, index=8)
font_bold = lambda sz: ImageFont.truetype('/System/Library/Fonts/Avenir Next.ttc', sz, index=0)
font_demi = lambda sz: ImageFont.truetype('/System/Library/Fonts/Avenir Next.ttc', sz, index=2)
font_med = lambda sz: ImageFont.truetype('/System/Library/Fonts/Avenir Next.ttc', sz, index=5)
font_reg = lambda sz: ImageFont.truetype('/System/Library/Fonts/Avenir Next.ttc', sz, index=7)

print("--- STEP 1: Cutouts & Extracted Screens ---")
chassis_master = Image.open('scratch/test_rembg/test1_phone_only.png').convert('RGBA')
cutouts = {}
screens = {}

for info in FILES_INFO:
    fpath = os.path.join(DOWNLOADS, info['file'])
    orig_im = Image.open(fpath)
    
    cx, cy = info['cx'], info['cy']
    x1 = int(round(cx - 321.5))
    y1 = int(round(cy - 52))
    screen = orig_im.crop((x1, y1, x1 + 643, y1 + 1444)).convert('RGBA')
    
    screen_path = os.path.join(OUT_DIR, 'screens_extracted', f"screen_{info['key']}.png")
    screen.save(screen_path)
    screens[info['key']] = screen
    
    mockup = chassis_master.copy()
    mockup.paste(screen, (34, 69))
    
    cutout_path = os.path.join(OUT_DIR, 'raw_cutouts', f"{info['key']}_transparent.png")
    mockup.save(cutout_path)
    cutouts[info['key']] = mockup

print("--- STEP 2: Official Play Store App Icon (512x512) ---")
# Build 512x512 App Icon according to Google Play Specification (full bleed square, Google Play applies corner radius)
icon_bg = np.zeros((512, 512, 4), dtype=np.uint8)
center = 256
for y in range(512):
    for x in range(512):
        dist = np.sqrt((x - center)**2 + (y - center)**2)
        factor = min(1.0, dist / 340.0)
        # Gradient from #1E293B (slate-800) to #0A0F1D (dark navy)
        r = int(30 * (1 - factor) + 10 * factor)
        g = int(41 * (1 - factor) + 15 * factor)
        b = int(59 * (1 - factor) + 29 * factor)
        icon_bg[y, x] = [r, g, b, 255]

icon_canvas = Image.fromarray(icon_bg, 'RGBA')

# Subtle ambient circular glow
icon_glow = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(icon_glow)
glow_draw.ellipse([center - 150, center - 150, center + 150, center + 150], fill=(56, 189, 248, 45))
icon_glow = icon_glow.filter(ImageFilter.GaussianBlur(50))
icon_canvas = Image.alpha_composite(icon_canvas, icon_glow)

# Crescent Logo in center
logo_src = Image.open('android/app/src/main/res/drawable/ic_hilal_logo.png').convert('RGBA')
logo_size = 320
logo_resized = logo_src.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

# Subtle shadow underneath crescent
logo_shadow = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
lx = (512 - logo_size) // 2
ly = (512 - logo_size) // 2
logo_shadow.paste(logo_resized, (lx, ly + 8), logo_resized)
# convert to black silhouette for shadow
shadow_arr = np.array(logo_shadow)
shadow_arr[:, :, :3] = 0
shadow_arr[:, :, 3] = (shadow_arr[:, :, 3].astype(np.float32) * 0.45).astype(np.uint8)
logo_shadow = Image.fromarray(shadow_arr, 'RGBA').filter(ImageFilter.GaussianBlur(14))

icon_canvas = Image.alpha_composite(icon_canvas, logo_shadow)
icon_canvas.paste(logo_resized, (lx, ly), logo_resized)

# Save full bleed standard for Play Store Console
icon_console_path = os.path.join(OUT_DIR, 'app_icon', 'icon_512x512.png')
icon_canvas.convert('RGB').save(icon_console_path)

# Also generate squircle preview
icon_preview = icon_canvas.copy()
mask = Image.new('L', (512, 512), 0)
m_draw = ImageDraw.Draw(mask)
m_draw.rounded_rectangle([0, 0, 512, 512], radius=115, fill=255)
icon_preview.putalpha(mask)
icon_preview.save(os.path.join(OUT_DIR, 'app_icon', 'icon_512x512_squircle_preview.png'))
print("Play Store App Icon (512x512) generated successfully!")

print("--- STEP 3: Store Showcase Screenshots (1080x2400) ---")

def render_store_screenshot(info, lang='tr'):
    W, H = 1080, 2400
    accent = info['accent']
    
    # Base gradient
    canvas_arr = np.zeros((H, W, 4), dtype=np.uint8)
    top_c = np.array([15, 22, 35, 255], dtype=np.float32)
    bot_c = np.array([7, 10, 16, 255], dtype=np.float32)
    for y in range(H):
        rat = y / H
        c = (1 - rat) * top_c + rat * bot_c
        canvas_arr[y, :] = c.astype(np.uint8)
    canvas = Image.fromarray(canvas_arr, 'RGBA')
    
    # Ambient radial glow behind phone
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    g_draw.ellipse([W//2 - 380, 500, W//2 + 380, 1300], fill=(accent[0], accent[1], accent[2], 26))
    glow = glow.filter(ImageFilter.GaussianBlur(130))
    canvas = Image.alpha_composite(canvas, glow)
    
    # Text Header Overlay
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    tag_text = info[f'tag_{lang}']
    title_text = info[f'title_{lang}']
    sub_text = info[f'sub_{lang}']
    
    f_tag = font_demi(26)
    f_title = font_heavy(56)
    f_sub = font_med(32)
    
    # Tag Pill
    bbox_tag = draw.textbbox((0, 0), tag_text, font=f_tag)
    tw = bbox_tag[2] - bbox_tag[0]
    th = bbox_tag[3] - bbox_tag[1]
    px, py = 24, 10
    pw, ph = tw + px * 2, th + py * 2
    px0 = (W - pw) // 2
    py0 = 135
    
    draw.rounded_rectangle([px0, py0, px0 + pw, py0 + ph], radius=ph//2,
                           fill=(20, 30, 48, 220), outline=(accent[0], accent[1], accent[2], 180), width=2)
    draw.text((px0 + px, py0 + py - 2), tag_text, fill=(accent[0], accent[1], accent[2], 255), font=f_tag)
    
    # Title
    bbox_t = draw.textbbox((0, 0), title_text, font=f_title)
    tx = (W - (bbox_t[2] - bbox_t[0])) // 2
    ty = py0 + ph + 34
    draw.text((tx, ty), title_text, fill=(255, 255, 255, 255), font=f_title)
    
    # Subtitle
    bbox_s = draw.textbbox((0, 0), sub_text, font=f_sub)
    sx = (W - (bbox_s[2] - bbox_s[0])) // 2
    sy = ty + (bbox_t[3] - bbox_t[1]) + 22
    draw.text((sx, sy), sub_text, fill=(148, 163, 184, 255), font=f_sub)
    
    canvas = Image.alpha_composite(canvas, overlay)
    
    # Floating Phone Mockup
    phone = cutouts[info['key']]
    target_w = 840
    ratio = target_w / phone.width
    target_h = int(phone.height * ratio)
    phone_resized = phone.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    phone_x = (W - target_w) // 2
    phone_y = sy + (bbox_s[3] - bbox_s[1]) + 55
    
    # Realistic shadows
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle([phone_x + 10, phone_y + 25, phone_x + target_w - 10, phone_y + target_h + 15],
                             radius=65, fill=(0, 0, 0, 115))
    shadow = shadow.filter(ImageFilter.GaussianBlur(35))
    
    shadow2 = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    s2_draw = ImageDraw.Draw(shadow2)
    s2_draw.rounded_rectangle([phone_x + 25, phone_y + 40, phone_x + target_w - 25, phone_y + target_h + 30],
                              radius=80, fill=(0, 0, 0, 75))
    shadow2 = shadow2.filter(ImageFilter.GaussianBlur(65))
    
    canvas = Image.alpha_composite(canvas, shadow2)
    canvas = Image.alpha_composite(canvas, shadow)
    canvas.paste(phone_resized, (phone_x, phone_y), phone_resized)
    
    out_file = os.path.join(OUT_DIR, 'store_screenshots', lang, f"{info['key']}.png")
    canvas.convert('RGB').save(out_file, quality=95)
    print(f"Generated {lang.upper()} screenshot: {info['key']}.png")

for info in FILES_INFO:
    render_store_screenshot(info, lang='tr')
    render_store_screenshot(info, lang='en')

print("--- STEP 4: Feature Graphic (1024x500) Refined ---")

def render_feature_graphic(lang='tr'):
    W, H = 1024, 500
    
    # Gradient background
    canvas_arr = np.zeros((H, W, 4), dtype=np.uint8)
    left_c = np.array([13, 20, 34, 255], dtype=np.float32)
    right_c = np.array([8, 11, 20, 255], dtype=np.float32)
    for x in range(W):
        rat = x / W
        c = (1 - rat) * left_c + rat * right_c
        canvas_arr[:, x] = c.astype(np.uint8)
    canvas = Image.fromarray(canvas_arr, 'RGBA')
    
    # Ambient glows
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    g_draw.ellipse([60, 60, 480, 480], fill=(56, 189, 248, 25))
    g_draw.ellipse([620, 40, 1020, 460], fill=(99, 102, 241, 25))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    canvas = Image.alpha_composite(canvas, glow)
    
    # Right side: 2 angled/layered phone mockups
    p1 = cutouts['01_home']
    p2 = cutouts['02_privacy']
    
    # Shift phones rightwards to give left text room
    target_h1 = 430
    r1 = target_h1 / p1.height
    w1 = int(p1.width * r1)
    p1_s = p1.resize((w1, target_h1), Image.Resampling.LANCZOS)
    
    target_h2 = 390
    r2 = target_h2 / p2.height
    w2 = int(p2.width * r2)
    p2_s = p2.resize((w2, target_h2), Image.Resampling.LANCZOS)
    
    # Shadow for p2 (privacy phone, background)
    p2_x, p2_y = 800, 75
    s2 = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    s2_draw = ImageDraw.Draw(s2)
    s2_draw.rounded_rectangle([p2_x - 10, p2_y + 10, p2_x + w2 + 10, p2_y + target_h2 + 10], radius=35, fill=(0, 0, 0, 130))
    s2 = s2.filter(ImageFilter.GaussianBlur(30))
    canvas = Image.alpha_composite(canvas, s2)
    canvas.paste(p2_s, (p2_x, p2_y), p2_s)
    
    # Shadow for p1 (home phone, foreground)
    p1_x, p1_y = 620, 40
    s1 = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    s1_draw = ImageDraw.Draw(s1)
    s1_draw.rounded_rectangle([p1_x - 10, p1_y + 10, p1_x + w1 + 10, p1_y + target_h1 + 10], radius=35, fill=(0, 0, 0, 160))
    s1 = s1.filter(ImageFilter.GaussianBlur(35))
    canvas = Image.alpha_composite(canvas, s1)
    canvas.paste(p1_s, (p1_x, p1_y), p1_s)
    
    # Left side: Brand, Title, Description, Badges
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Logo
    logo = Image.open('android/app/src/main/res/drawable/ic_hilal_logo.png').convert('RGBA')
    logo_sz = 72
    logo_r = logo.resize((logo_sz, logo_sz), Image.Resampling.LANCZOS)
    overlay.paste(logo_r, (60, 65), logo_r)
    
    # App Title
    f_brand = font_heavy(48)
    draw.text((148, 76), "Hilal Browser", fill=(255, 255, 255, 255), font=f_brand)
    
    # Tagline
    f_tagline = font_demi(24)
    tagline_text = "Özgür, Hızlı & Gizlilik Odaklı Web" if lang == 'tr' else "Fast, Private & Modern Web Browser"
    draw.text((60, 160), tagline_text, fill=(56, 189, 248, 255), font=f_tagline)
    
    # Multi-line Description within width 520px
    f_desc = font_med(18)
    if lang == 'tr':
        desc_lines = [
            "Material 3 Expressive tasarımı ve",
            "bağımsız Mozilla GeckoView motoruyla."
        ]
    else:
        desc_lines = [
            "Powered by Mozilla GeckoView and",
            "expressive Material 3 design."
        ]
    
    dy = 205
    for dl in desc_lines:
        draw.text((60, dy), dl, fill=(148, 163, 184, 255), font=f_desc)
        dy += 26
    
    # Feature Badges
    badges = [
        "GeckoView Motoru" if lang == 'tr' else "GeckoView Engine",
        "Material 3 Expressive",
        "Çalışma Alanları" if lang == 'tr' else "Workspaces",
        "Hilal Bangs Arama" if lang == 'tr' else "Hilal Bangs"
    ]
    
    bx = 60
    by = 285
    f_b = font_med(15)
    for i, b_text in enumerate(badges):
        bb = draw.textbbox((0, 0), b_text, font=f_b)
        bw = bb[2] - bb[0] + 24
        bh = bb[3] - bb[1] + 16
        if bx + bw > 580:
            bx = 60
            by += bh + 12
        draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=bh//2, fill=(22, 33, 52, 230),
                               outline=(56, 189, 248, 130), width=1)
        draw.text((bx + 12, by + 7), b_text, fill=(226, 232, 240, 255), font=f_b)
        bx += bw + 12
        
    canvas = Image.alpha_composite(canvas, overlay)
    
    out_file = os.path.join(OUT_DIR, 'feature_graphic', f"feature_graphic_{lang}.png")
    canvas.convert('RGB').save(out_file, quality=95)
    print(f"Generated Refined Feature Graphic: feature_graphic_{lang}.png")

render_feature_graphic('tr')
render_feature_graphic('en')

print("All graphics finalized successfully!")
