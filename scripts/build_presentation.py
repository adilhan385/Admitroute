import os
import sys
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_deck(is_eight_slides=False):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Palettes
    C_BG_DARK = RGBColor(15, 23, 42)        # Slate 900
    C_BG_LIGHT = RGBColor(248, 250, 252)    # Slate 50
    C_WHITE = RGBColor(255, 255, 255)
    C_CARD_BORDER = RGBColor(226, 232, 240) # Slate 200
    C_TEXT_MAIN = RGBColor(15, 23, 42)     # Slate 900
    C_TEXT_MUTED = RGBColor(100, 116, 139) # Slate 500
    C_ACCENT_BLUE = RGBColor(37, 99, 235)  # Blue 600
    C_ACCENT_PURPLE = RGBColor(124, 58, 237) # Purple 600
    C_ACCENT_EMERALD = RGBColor(16, 185, 129) # Emerald 500
    C_ACCENT_ROSE = RGBColor(225, 29, 72)  # Rose 600
    C_SKY_BLUE = RGBColor(56, 189, 248)    # Sky 400

    logo_path = r'C:\Users\Адильхан\.gemini\antigravity\brain\0e1a86c3-eecb-4fe6-aef4-af12c5db5b08\admitroute_line_logo_1789549104894.jpg'

    def set_bg(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, tag_text, title_text, subtitle_text=""):
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(11.7), Inches(0.32))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        tf_tag.margin_left = tf_tag.margin_top = tf_tag.margin_right = tf_tag.margin_bottom = 0
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = tag_text.upper()
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = C_ACCENT_BLUE
        p_tag.font.name = 'Arial'

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.55))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = C_TEXT_MAIN
        p_title.font.name = 'Arial'

        if subtitle_text:
            sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.38), Inches(11.7), Inches(0.4))
            tf_sub = sub_box.text_frame
            tf_sub.word_wrap = True
            tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
            p_sub = tf_sub.paragraphs[0]
            p_sub.text = subtitle_text
            p_sub.font.size = Pt(12)
            p_sub.font.color.rgb = C_TEXT_MUTED
            p_sub.font.name = 'Arial'

    # =========================================================================
    # СЛАЙД 1: ТИТУЛЬНЫЙ
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1, C_BG_DARK)
    if os.path.exists(logo_path):
        s1.shapes.add_picture(logo_path, Inches(0.9), Inches(0.9), width=Inches(1.8))

    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(3.0), Inches(3.4), Inches(0.42))
    badge.fill.solid()
    badge.fill.fore_color.rgb = RGBColor(30, 41, 59)
    badge.line.color.rgb = RGBColor(51, 65, 85)
    tf_b = badge.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.text = "LOCUS HACKATHON 2026 • КЕЙС 02"
    p_b.font.size = Pt(11)
    p_b.font.bold = True
    p_b.font.color.rgb = C_SKY_BLUE
    p_b.font.name = 'Arial'
    p_b.alignment = PP_ALIGN.CENTER

    t_box = s1.shapes.add_textbox(Inches(0.9), Inches(3.6), Inches(11.5), Inches(1.6))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = "AdmitRoute"
    p_t.font.size = Pt(50)
    p_t.font.bold = True
    p_t.font.color.rgb = C_WHITE
    p_t.font.name = 'Arial'

    p_sub = tf_t.add_paragraph()
    p_sub.text = "Умная AI-платформа для честного поступления в университеты Казахстана и мира"
    p_sub.font.size = Pt(18)
    p_sub.font.color.rgb = RGBColor(148, 163, 184)
    p_sub.space_before = Pt(6)
    p_sub.font.name = 'Arial'

    highlights = [
        "✓ Алгоритм «Анти-иллюзия»: защита от ложных надежд и отказа",
        "✓ 36+ детальных программ + живой AI-поиск любого вуза планеты",
        "✓ Персональный роадмап дедлайнов, экспорт в iCal и Telegram-бот",
        "✓ Доступность для каждой семьи: 4 990 ₸ вместо $2,000 в агентствах"
    ]
    for i, h in enumerate(highlights):
        col = i % 2
        row = i // 2
        left = Inches(0.9 + col * 5.8)
        top = Inches(5.5 + row * 0.7)
        box = s1.shapes.add_textbox(left, top, Inches(5.5), Inches(0.5))
        p = box.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = RGBColor(226, 232, 240)
        p.font.name = 'Arial'

    # =========================================================================
    # СЛАЙД 2: ПРОБЛЕМА РЫНКА
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2, C_BG_LIGHT)
    add_header(s2, "1. Проблема рынка", "С чем сталкивается абитуриент и его семья?",
               "Поступление в университет сопряжено с непрозрачностью, огромными финансовыми затратами и риском потери года.")

    problems = [
        {
            "num": "01",
            "title": "Информационный хаос",
            "desc": "Сотни сайтов вузов на разных языках, скрытые требования, разрозненные даты ранней и поздней волн подачи. Поиск отнимает до 120 часов рутинного времени.",
            "stat": "120+ часов",
            "stat_label": "тратит семья на ручной сбор информации"
        },
        {
            "num": "02",
            "title": "Дорогие агентства",
            "desc": "Консалтинговые компании берут от $1,500 до $4,000 за подачу документов, часто продвигая коммерческие платные вузы-партнеры без гарантий гранта.",
            "stat": "$1,500 – $4,000",
            "stat_label": "средний чек консалтинга в Казахстане"
        },
        {
            "num": "03",
            "title": "Ложные надежды и отказ",
            "desc": "Без объективной аналитики абитуриенты подают только в недосягаемые Reach-вузы и при отказе теряют целый учебный год, оставаясь без альтернатив.",
            "stat": "до 45% отказов",
            "stat_label": "из-за несбалансированного списка вузов"
        }
    ]

    for i, p in enumerate(problems):
        left = Inches(0.8 + i * 4.0)
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.95), Inches(3.7), Inches(5.0))
        card.fill.solid()
        card.fill.fore_color.rgb = C_WHITE
        card.line.color.rgb = C_CARD_BORDER

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.3)

        p0 = tf.paragraphs[0]
        p0.text = p["num"]
        p0.font.size = Pt(26)
        p0.font.bold = True
        p0.font.color.rgb = C_ACCENT_ROSE
        p0.font.name = 'Arial'

        p1 = tf.add_paragraph()
        p1.text = p["title"]
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(6)
        p1.font.name = 'Arial'

        p2 = tf.add_paragraph()
        p2.text = p["desc"]
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(8)
        p2.font.name = 'Arial'

        p3 = tf.add_paragraph()
        p3.text = p["stat"]
        p3.font.size = Pt(18)
        p3.font.bold = True
        p3.font.color.rgb = C_TEXT_MAIN
        p3.space_before = Pt(24)
        p3.font.name = 'Arial'

        p4 = tf.add_paragraph()
        p4.text = p["stat_label"]
        p4.font.size = Pt(10)
        p4.font.color.rgb = C_TEXT_MUTED
        p4.font.name = 'Arial'

    # =========================================================================
    # СЛАЙД 3: НАШЕ РЕШЕНИЕ
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3, C_BG_LIGHT)
    add_header(s3, "2. Наше решение", "AdmitRoute: Персональный AI-навигатор поступления",
               "Объективная математическая оценка шансов, строгая защита от иллюзий и персональный пошаговый маршрут.")

    solutions = [
        {
            "badge": "МАТЕМАТИЧЕСКИЙ СКОРИНГ",
            "title": "Прозрачный расчет шансов",
            "desc": "Алгоритм сопоставляет GPA, IELTS/TOEFL, SAT/ЕНТ и активности с реальными требованиями вузов. Категоризация: Safety (надежные), Target (целевые), Reach (сложные), Unlikely (маловероятные).",
            "points": ["Точный расчет шансов в %", "Выявление академических пробелов", "Качественное объяснение «Почему подходит»"]
        },
        {
            "badge": "АНТИ-ИЛЛЮЗИЯ",
            "title": "Защита от риска отказа",
            "desc": "Система не дает ложных надежд: если профиль слаб для элитной программы, AdmitRoute прямо указывает на низкую вероятность (<12%) и предлагает гарантированные альтернативы со стипендиями.",
            "points": ["Предупреждения приемной комиссии", "Обязательная балансировка Safety-вузов", "Страховка от потери года"]
        },
        {
            "badge": "ПОШАГОВЫЙ РОАДМАП",
            "title": "План действий до дедлайна",
            "desc": "Формирование персонального графика с 3 волнами подачи (ранняя, регулярная, поздняя), статистики грантов прошлого года и генератора каркаса мотивационного письма (Personal Statement).",
            "points": ["Сроки Early / Regular / Late", "Прошлогодний конкурс на место", "Индивидуальный чек-лист документов"]
        }
    ]

    for i, s in enumerate(solutions):
        left = Inches(0.8 + i * 4.0)
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.95), Inches(3.7), Inches(5.0))
        card.fill.solid()
        card.fill.fore_color.rgb = C_WHITE
        card.line.color.rgb = C_ACCENT_BLUE if i == 0 else C_CARD_BORDER

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.3)

        p0 = tf.paragraphs[0]
        p0.text = s["badge"]
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.color.rgb = C_ACCENT_BLUE
        p0.font.name = 'Arial'

        p1 = tf.add_paragraph()
        p1.text = s["title"]
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(6)
        p1.font.name = 'Arial'

        p2 = tf.add_paragraph()
        p2.text = s["desc"]
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(8)
        p2.font.name = 'Arial'

        for pt in s["points"]:
            pp = tf.add_paragraph()
            pp.text = "✓ " + pt
            pp.font.size = Pt(10)
            pp.font.bold = True
            pp.font.color.rgb = C_TEXT_MAIN
            pp.space_before = Pt(6)
            pp.font.name = 'Arial'

    # =========================================================================
    # СЛАЙД 4: ЦЕЛЕВАЯ АУДИТОРИЯ (NEW!)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4, C_BG_LIGHT)
    add_header(s4, "3. Целевая аудитория", "Кто наши пользователи и кто принимает решение?",
               "Четкая сегментация аудитории с глубоким пониманием болей каждого сегмента и ценности AdmitRoute.")

    audiences = [
        {
            "tag": "B2C • КОНЕЧНЫЙ ПОЛЬЗОВАТЕЛЬ",
            "title": "Выпускники 10–11 классов",
            "desc": "Учащиеся школ, лицеев, НИШ и БИЛ, нацеленные на поступление на грант в Казахстане, Европе, Азии или США.",
            "pain_title": "КЛЮЧЕВЫЕ БОЛИ:",
            "pains": [
                "✕ Информационный хаос (120+ часов на сайты)",
                "✕ Непонимание реальных шансов на грант",
                "✕ Страх провалить дедлайны и потерять год"
            ],
            "value_title": "ЦЕННОСТЬ ADMITROUTE:",
            "values": [
                "✓ Точный расчет шансов в % без иллюзий",
                "✓ Персональный роадмап и Safety-вузы",
                "✓ Бот в Telegram с напоминаниями дедлайнов"
            ],
            "color": C_ACCENT_BLUE
        },
        {
            "tag": "B2C • ПЛАТЕЛЬЩИК И СЕМЬЯ",
            "title": "Родители абитуриентов",
            "desc": "Принимают финансовые решения в семье, несут колоссальную эмоциональную нагрузку и оплачивают подготовку.",
            "pain_title": "КЛЮЧЕВЫЕ БОЛИ:",
            "pains": [
                "✕ Огромные чеки агентств ($1,500 – $4,000)",
                "✕ Риск потери бюджета и навязывание платных вузов",
                "✕ Неведение: на каком этапе подготовка ребенка"
            ],
            "value_title": "ЦЕННОСТЬ ADMITROUTE:",
            "values": [
                "✓ Экономия семейного бюджета (подписка 4 990 ₸)",
                "✓ Шеринг-ссылка для родительского контроля",
                "✓ Уверенность и спокойствие за будущее ребенка"
            ],
            "color": C_ACCENT_PURPLE
        },
        {
            "tag": "B2B • ПАРТНЕРСТВО И МАСШТАБ",
            "title": "Школы и EdTech-центры",
            "desc": "Школьные профориентаторы, образовательные центры подготовки к ЕНТ/IELTS и частные консультанты.",
            "pain_title": "КЛЮЧЕВЫЕ БОЛИ:",
            "pains": [
                "✕ 1 профориентатор на 200+ учеников школы",
                "✕ Ручной сбор дедлайнов в Excel-таблицах",
                "✕ Сложность составления отчетов родителям"
            ],
            "value_title": "ЦЕННОСТЬ ADMITROUTE:",
            "values": [
                "✓ Единая панель мониторинга всех учеников",
                "✓ Экспорт красивых отчетов для родителей",
                "✓ Повышение % поступления учеников на гранты"
            ],
            "color": C_ACCENT_EMERALD
        }
    ]

    for i, a in enumerate(audiences):
        left = Inches(0.8 + i * 4.0)
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.95), Inches(3.7), Inches(5.0))
        card.fill.solid()
        card.fill.fore_color.rgb = C_WHITE
        card.line.color.rgb = a["color"]

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.28)
        tf.margin_top = Inches(0.25)

        p0 = tf.paragraphs[0]
        p0.text = a["tag"]
        p0.font.size = Pt(9.5)
        p0.font.bold = True
        p0.font.color.rgb = a["color"]
        p0.font.name = 'Arial'

        p1 = tf.add_paragraph()
        p1.text = a["title"]
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(4)
        p1.font.name = 'Arial'

        p2 = tf.add_paragraph()
        p2.text = a["desc"]
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(4)
        p2.font.name = 'Arial'

        p_pain_t = tf.add_paragraph()
        p_pain_t.text = a["pain_title"]
        p_pain_t.font.size = Pt(10)
        p_pain_t.font.bold = True
        p_pain_t.font.color.rgb = C_ACCENT_ROSE
        p_pain_t.space_before = Pt(10)
        p_pain_t.font.name = 'Arial'

        for pn in a["pains"]:
            ppn = tf.add_paragraph()
            ppn.text = pn
            ppn.font.size = Pt(9.5)
            ppn.font.color.rgb = RGBColor(71, 85, 105)
            ppn.space_before = Pt(2)
            ppn.font.name = 'Arial'

        p_val_t = tf.add_paragraph()
        p_val_t.text = a["value_title"]
        p_val_t.font.size = Pt(10)
        p_val_t.font.bold = True
        p_val_t.font.color.rgb = C_ACCENT_EMERALD
        p_val_t.space_before = Pt(10)
        p_val_t.font.name = 'Arial'

        for vl in a["values"]:
            pvl = tf.add_paragraph()
            pvl.text = vl
            pvl.font.size = Pt(9.5)
            pvl.font.bold = True
            pvl.font.color.rgb = C_TEXT_MAIN
            pvl.space_before = Pt(2)
            pvl.font.name = 'Arial'

    # =========================================================================
    # СЛАЙД 5: ДЕМОНСТРАЦИЯ И ПУТЬ ПОЛЬЗОВАТЕЛЯ
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5, C_BG_LIGHT)
    add_header(s5, "4. Демонстрация", "Пользовательский путь: от анкеты до гранта за 3 минуты",
               "Бесшовный интерактивный сценарий, полностью закрывающий требования Кейса 02 LOCUS Hackathon.")

    steps = [
        {
            "num": "ЭТАП 1",
            "title": "Анкета и диагностика профиля",
            "desc": "Ученик указывает класс, специальность, GPA, баллы IELTS/SAT/ЕНТ, бюджет и внеучебные активности. Алгоритм формирует мгновенное резюме сильных сторон и ограничений."
        },
        {
            "num": "ЭТАП 2",
            "title": "Сбалансированные рекомендации",
            "desc": "Каталог из 36+ детальных программ (KZ, Азия, Европа, США) с распределением на Reach, Target и Safety. Возможность сравнения любых 2 вузов по 8 ключевым критериям."
        },
        {
            "num": "ЭТАП 3",
            "title": "Живой AI-поиск любого вуза мира",
            "desc": "Ввод названия любого университета (Тренто, Bocconi, Waterloo, КБТУ, СДУ) — Gemini 3.6 Flash мгновенно выдает точную карточку с волнами, грантами и персональным шансом."
        },
        {
            "num": "ЭТАП 4",
            "title": "Канбан-трекер, эссе, бот и шеринг",
            "desc": "Индивидуальный роадмап дедлайнов, экспорт в календарь (.ics), генератор каркаса эссе, Telegram-бот с уведомлениями и ссылки доступа для родителей и менторов."
        }
    ]

    for i, st in enumerate(steps):
        col = i % 2
        row = i // 2
        left = Inches(0.8 + col * 5.9)
        top = Inches(1.95 + row * 2.5)

        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(5.6), Inches(2.25))
        card.fill.solid()
        card.fill.fore_color.rgb = C_WHITE
        card.line.color.rgb = C_CARD_BORDER

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.2)

        p0 = tf.paragraphs[0]
        p0.text = st["num"]
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.color.rgb = C_ACCENT_BLUE
        p0.font.name = 'Arial'

        p1 = tf.add_paragraph()
        p1.text = st["title"]
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(4)
        p1.font.name = 'Arial'

        p2 = tf.add_paragraph()
        p2.text = st["desc"]
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(4)
        p2.font.name = 'Arial'

    # =========================================================================
    # СЛАЙД 6: КОНКУРЕНТНЫЙ АНАЛИЗ (NEW!)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6, C_BG_LIGHT)
    add_header(s6, "5. Конкурентный анализ", "Почему AdmitRoute побеждает альтернативы на рынке?",
               "Сравнение с традиционным консалтингом, обычными чат-ботами общего назначения и сайтами вузов.")

    comps = [
        {
            "tag": "ТРАДИЦИОННЫЙ КОНСАЛТИНГ",
            "title": "Агентства поступления",
            "price": "$1,500 – $4,000",
            "price_sub": "за сопровождение 1 абитуриента",
            "items": [
                "✕ Заоблачная стоимость для 95% семей",
                "✕ Навязывают платные вузы за комиссию",
                "✕ Субъективная оценка «на глаз» куратора",
                "✕ Долгие ручные созвоны и бюрократия",
                "✕ Нет объективной гарантии гранта"
            ],
            "verdict": "ИТОГ: Дорого и ангажированно",
            "border": C_CARD_BORDER,
            "badge_col": C_TEXT_MUTED,
            "is_hero": False
        },
        {
            "tag": "ОБЫЧНЫЕ ЧАТ-БОТЫ (ИИ)",
            "title": "ChatGPT / Claude / Gemini",
            "price": "$0 – $20 / мес",
            "price_sub": "подписка на веб-сервисы",
            "items": [
                "✕ Галлюцинации и выдуманные требования",
                "✕ Не знают порогов ЕНТ и квот РК",
                "✕ Нет математического расчета шансов",
                "✕ Нет интерактивного роадмапа и календаря",
                "✕ Нет шеринга родителям и Telegram-бота"
            ],
            "verdict": "ИТОГ: Риск дезинформации",
            "border": C_CARD_BORDER,
            "badge_col": C_TEXT_MUTED,
            "is_hero": False
        },
        {
            "tag": "КАТАЛОГИ И САЙТЫ ВУЗОВ",
            "title": "Kundelik, сайты вузов",
            "price": "0 ₸ (Бесплатно)",
            "price_sub": "открытые веб-страницы",
            "items": [
                "✕ Разрозненный хаос на сотнях сайтов",
                "✕ Устаревшие правила и даты волн",
                "✕ Нет адаптации под баллы студента",
                "✕ Нет защиты от ложных надежд",
                "✕ 120+ часов на ручной поиск данных"
            ],
            "verdict": "ИТОГ: Информационный хаос",
            "border": C_CARD_BORDER,
            "badge_col": C_TEXT_MUTED,
            "is_hero": False
        },
        {
            "tag": "НАШЕ ПРЕИМУЩЕСТВО",
            "title": "AdmitRoute (Победитель)",
            "price": "0 ₸ / 4 990 ₸ мес",
            "price_sub": "Freemium + доступный PRO",
            "items": [
                "✓ Математический скоринг шансов в %",
                "✓ Алгоритм «Анти-иллюзия» против отказа",
                "✓ База РК и мира + живой AI-поиск",
                "✓ Дедлайны в iCal + Telegram-напоминания",
                "✓ Шеринг-ссылки для родителей и менторов"
            ],
            "verdict": "ИТОГ: Честно, точно и доступно",
            "border": C_ACCENT_BLUE,
            "badge_col": C_ACCENT_BLUE,
            "is_hero": True
        }
    ]

    for i, c in enumerate(comps):
        left = Inches(0.8 + i * 2.98)
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.95), Inches(2.78), Inches(5.0))
        card.fill.solid()
        card.fill.fore_color.rgb = RGBColor(238, 242, 255) if c["is_hero"] else C_WHITE
        card.line.color.rgb = c["border"]
        card.line.width = Pt(2) if c["is_hero"] else Pt(1)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.2)
        tf.margin_top = Inches(0.2)

        p0 = tf.paragraphs[0]
        p0.text = c["tag"]
        p0.font.size = Pt(8.5)
        p0.font.bold = True
        p0.font.color.rgb = c["badge_col"]
        p0.font.name = 'Arial'

        p1 = tf.add_paragraph()
        p1.text = c["title"]
        p1.font.size = Pt(13.5)
        p1.font.bold = True
        p1.font.color.rgb = C_ACCENT_BLUE if c["is_hero"] else C_TEXT_MAIN
        p1.space_before = Pt(3)
        p1.font.name = 'Arial'

        p_pr = tf.add_paragraph()
        p_pr.text = c["price"]
        p_pr.font.size = Pt(15)
        p_pr.font.bold = True
        p_pr.font.color.rgb = C_TEXT_MAIN
        p_pr.space_before = Pt(4)
        p_pr.font.name = 'Arial'

        p_prs = tf.add_paragraph()
        p_prs.text = c["price_sub"]
        p_prs.font.size = Pt(9)
        p_prs.font.color.rgb = C_TEXT_MUTED
        p_prs.font.name = 'Arial'

        for item in c["items"]:
            pi = tf.add_paragraph()
            pi.text = item
            pi.font.size = Pt(9)
            if c["is_hero"]:
                pi.font.bold = True
                pi.font.color.rgb = C_TEXT_MAIN
            else:
                pi.font.color.rgb = RGBColor(71, 85, 105)
            pi.space_before = Pt(5)
            pi.font.name = 'Arial'

        pv = tf.add_paragraph()
        pv.text = c["verdict"]
        pv.font.size = Pt(9.5)
        pv.font.bold = True
        pv.font.color.rgb = C_ACCENT_BLUE if c["is_hero"] else C_ACCENT_ROSE
        pv.space_before = Pt(12)
        pv.font.name = 'Arial'

    # =========================================================================
    # ВЕТВЛЕНИЕ: 8-СЛАЙДОВАЯ ИЛИ 10-СЛАЙДОВАЯ ВЕРСИЯ
    # =========================================================================
    if is_eight_slides:
        # ---------------------------------------------------------------------
        # СЛАЙД 7 (8-slides): РЫНОЧНЫЙ ПОТЕНЦИАЛ И БИЗНЕС-МОДЕЛЬ (Объединённый)
        # ---------------------------------------------------------------------
        s7 = prs.slides.add_slide(blank_layout)
        set_bg(s7, C_BG_LIGHT)
        add_header(s7, "6. Рынок и бизнес-модель", "Объем рынка и масштабируемая монетизация",
                   "Растущий спрос на гранты в Казахстане и устойчивая Unit-экономика: Freemium, B2C PRO и B2B.")

        # Left Column: Market metrics (2x2 mini cards)
        left_box_title = s7.shapes.add_textbox(Inches(0.8), Inches(1.95), Inches(5.6), Inches(0.35))
        p_lt = left_box_title.text_frame.paragraphs[0]
        p_lt.text = "РЫНОЧНЫЙ ОБЪЕМ (TAM / SAM / SOM)"
        p_lt.font.size = Pt(11)
        p_lt.font.bold = True
        p_lt.font.color.rgb = C_ACCENT_BLUE

        mini_metrics = [
            ("180 000+", "Выпускников школ в РК ежегодно (TAM)"),
            ("35 000+", "Абитуриентов за рубеж (SAM: Европа, Азия, США)"),
            ("75 000+", "Госгрантов в РК с жестким конкурсом"),
            ("+38%", "Ежегодный рост запросов на стипендии")
        ]
        for idx, (m_val, m_lbl) in enumerate(mini_metrics):
            m_col = idx % 2
            m_row = idx // 2
            m_l = Inches(0.8 + m_col * 2.85)
            m_t = Inches(2.35 + m_row * 2.25)
            m_card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, m_l, m_t, Inches(2.7), Inches(2.05))
            m_card.fill.solid()
            m_card.fill.fore_color.rgb = C_WHITE
            m_card.line.color.rgb = C_CARD_BORDER
            tf_m = m_card.text_frame
            tf_m.word_wrap = True
            tf_m.margin_left = tf_m.margin_right = Inches(0.2)
            tf_m.margin_top = Inches(0.2)
            p_mv = tf_m.paragraphs[0]
            p_mv.text = m_val
            p_mv.font.size = Pt(22)
            p_mv.font.bold = True
            p_mv.font.color.rgb = C_ACCENT_BLUE
            p_mv.font.name = 'Arial'
            p_ml = tf_m.add_paragraph()
            p_ml.text = m_lbl
            p_ml.font.size = Pt(10)
            p_ml.font.bold = True
            p_ml.font.color.rgb = C_TEXT_MAIN
            p_ml.space_before = Pt(4)
            p_ml.font.name = 'Arial'

        # Right Column: Pricing tiers
        right_box_title = s7.shapes.add_textbox(Inches(6.8), Inches(1.95), Inches(5.7), Inches(0.35))
        p_rt = right_box_title.text_frame.paragraphs[0]
        p_rt.text = "ТАРИФЫ И ИСТОЧНИКИ ВЫРУЧКИ"
        p_rt.font.size = Pt(11)
        p_rt.font.bold = True
        p_rt.font.color.rgb = C_ACCENT_EMERALD

        mini_tiers = [
            ("FREEMIUM (0 ₸)", "Широкий органический охват: топ-36 вузов, расчет шансов, базовый роадмап."),
            ("ADMITROUTE PRO (4 990 ₸ / мес)", "Безлимитный AI-поиск любого вуза мира, конструктор эссе, трекер дедлайнов и чат."),
            ("B2B ПАРТНЕРСТВО (По запросу)", "Для школ и центров: дашборд учеников, шеринг-отчеты родителям, пакетные скидки.")
        ]
        for idx, (t_title, t_desc) in enumerate(mini_tiers):
            t_t = Inches(2.35 + idx * 1.5)
            t_card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), t_t, Inches(5.7), Inches(1.35))
            t_card.fill.solid()
            t_card.fill.fore_color.rgb = RGBColor(238, 242, 255) if idx == 1 else C_WHITE
            t_card.line.color.rgb = C_ACCENT_BLUE if idx == 1 else C_CARD_BORDER
            tf_t = t_card.text_frame
            tf_t.word_wrap = True
            tf_t.margin_left = tf_t.margin_right = Inches(0.25)
            tf_t.margin_top = Inches(0.15)
            p_tt = tf_t.paragraphs[0]
            p_tt.text = t_title
            p_tt.font.size = Pt(12)
            p_tt.font.bold = True
            p_tt.font.color.rgb = C_ACCENT_BLUE if idx == 1 else C_TEXT_MAIN
            p_tt.font.name = 'Arial'
            p_td = tf_t.add_paragraph()
            p_td.text = t_desc
            p_td.font.size = Pt(10)
            p_td.font.color.rgb = C_TEXT_MUTED
            p_td.space_before = Pt(3)
            p_td.font.name = 'Arial'

        # ---------------------------------------------------------------------
        # СЛАЙД 8 (8-slides): КОМАНДА, ТЕХНОЛОГИИ И КОНТАКТЫ (Dark Navy)
        # ---------------------------------------------------------------------
        s8 = prs.slides.add_slide(blank_layout)
        set_bg(s8, C_BG_DARK)
        if os.path.exists(logo_path):
            s8.shapes.add_picture(logo_path, Inches(0.9), Inches(0.8), width=Inches(1.5))

        c_box = s8.shapes.add_textbox(Inches(0.9), Inches(2.1), Inches(11.5), Inches(1.4))
        tf_c = c_box.text_frame
        tf_c.word_wrap = True
        p_c0 = tf_c.paragraphs[0]
        p_c0.text = "AdmitRoute: Поступление без стресса и иллюзий"
        p_c0.font.size = Pt(32)
        p_c0.font.bold = True
        p_c0.font.color.rgb = C_WHITE
        p_c0.font.name = 'Arial'

        p_c1 = tf_c.add_paragraph()
        p_c1.text = "Создан для LOCUS Hackathon 2026 (Кейс 02, код LOCUSCASE2). Готов к масштабированию."
        p_c1.font.size = Pt(14)
        p_c1.font.color.rgb = RGBColor(148, 163, 184)
        p_c1.space_before = Pt(4)
        p_c1.font.name = 'Arial'

        # Tech highlights bar
        tech_bar = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(3.65), Inches(11.5), Inches(0.85))
        tech_bar.fill.solid()
        tech_bar.fill.fore_color.rgb = RGBColor(30, 41, 59)
        tech_bar.line.color.rgb = RGBColor(51, 65, 85)
        tf_tb = tech_bar.text_frame
        tf_tb.word_wrap = True
        tf_tb.margin_left = Inches(0.25)
        tf_tb.margin_top = Inches(0.12)
        p_tb0 = tf_tb.paragraphs[0]
        p_tb0.text = "ТЕХНОЛОГИЧЕСКИЙ СТЕК:"
        p_tb0.font.size = Pt(9.5)
        p_tb0.font.bold = True
        p_tb0.font.color.rgb = C_SKY_BLUE
        p_tb1 = tf_tb.add_paragraph()
        p_tb1.text = "Google Gemini 3.6 Flash • Neon Serverless PostgreSQL (AWS) • React 19 / TypeScript • Telegram Bot Webhooks"
        p_tb1.font.size = Pt(11.5)
        p_tb1.font.bold = True
        p_tb1.font.color.rgb = C_WHITE
        p_tb1.space_before = Pt(2)

        contacts = [
            {"title": "ОСНОВАТЕЛЬ И РАЗРАБОТКА", "val": "Адильхан", "sub": "Product & Engineering"},
            {"title": "WHATSAPP / ТЕЛЕФОН", "val": "+7 775 253 01 10", "sub": "Прямая связь и оформление PRO"},
            {"title": "TELEGRAM", "val": "@nftkoroi", "sub": "Оперативные ответы в мессенджере"}
        ]
        for i, ci in enumerate(contacts):
            left = Inches(0.9 + i * 4.0)
            card = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(4.75), Inches(3.7), Inches(2.1))
            card.fill.solid()
            card.fill.fore_color.rgb = RGBColor(30, 41, 59)
            card.line.color.rgb = RGBColor(51, 65, 85)
            tf = card.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_right = Inches(0.25)
            tf.margin_top = Inches(0.2)
            p0 = tf.paragraphs[0]
            p0.text = ci["title"]
            p0.font.size = Pt(10)
            p0.font.bold = True
            p0.font.color.rgb = C_SKY_BLUE
            p0.font.name = 'Arial'
            p1 = tf.add_paragraph()
            p1.text = ci["val"]
            p1.font.size = Pt(16)
            p1.font.bold = True
            p1.font.color.rgb = C_WHITE
            p1.space_before = Pt(4)
            p1.font.name = 'Arial'
            p2 = tf.add_paragraph()
            p2.text = ci["sub"]
            p2.font.size = Pt(11)
            p2.font.color.rgb = RGBColor(148, 163, 184)
            p2.space_before = Pt(4)
            p2.font.name = 'Arial'

    else:
        # ---------------------------------------------------------------------
        # СЛАЙД 7 (10-slides): РЫНОЧНЫЙ ПОТЕНЦИАЛ
        # ---------------------------------------------------------------------
        s7 = prs.slides.add_slide(blank_layout)
        set_bg(s7, C_BG_LIGHT)
        add_header(s7, "6. Рыночный потенциал", "Объем рынка и растущий спрос на высшее образование",
                   "Казахстан и Центральная Азия демонстрируют рекордный спрос на гранты и зарубежное образование.")

        metrics = [
            {
                "val": "180 000+",
                "label": "Выпускников школ в Казахстане ежегодно (TAM)",
                "sub": "Ежегодный растущий поток абитуриентов, поступающих в бакалавриат"
            },
            {
                "val": "35 000+",
                "label": "Абитуриентов, поступающих за рубеж (SAM)",
                "sub": "Высокий спрос на обучение в Европе (Италия DSU, Германия), Турции, Азии и США"
            },
            {
                "val": "75 000+",
                "label": "Государственных грантов РК",
                "sub": "Жесткая конкуренция требует точного сопоставления баллов с проходными порогами"
            },
            {
                "val": "+38%",
                "label": "Ежегодный рост запросов на гранты и стипендии",
                "sub": "Растущая потребность в программах полного финансирования: DSU, Stipendium, CSC"
            }
        ]

        for i, m in enumerate(metrics):
            col = i % 2
            row = i // 2
            left = Inches(0.8 + col * 5.9)
            top = Inches(1.95 + row * 2.5)
            card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(5.6), Inches(2.25))
            card.fill.solid()
            card.fill.fore_color.rgb = C_WHITE
            card.line.color.rgb = C_CARD_BORDER
            tf = card.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_right = Inches(0.3)
            tf.margin_top = Inches(0.2)
            p0 = tf.paragraphs[0]
            p0.text = m["val"]
            p0.font.size = Pt(28)
            p0.font.bold = True
            p0.font.color.rgb = C_ACCENT_BLUE
            p0.font.name = 'Arial'
            p1 = tf.add_paragraph()
            p1.text = m["label"]
            p1.font.size = Pt(13)
            p1.font.bold = True
            p1.font.color.rgb = C_TEXT_MAIN
            p1.space_before = Pt(4)
            p1.font.name = 'Arial'
            p2 = tf.add_paragraph()
            p2.text = m["sub"]
            p2.font.size = Pt(11)
            p2.font.color.rgb = C_TEXT_MUTED
            p2.space_before = Pt(4)
            p2.font.name = 'Arial'

        # ---------------------------------------------------------------------
        # СЛАЙД 8 (10-slides): БИЗНЕС-МОДЕЛЬ И МОНЕТИЗАЦИЯ
        # ---------------------------------------------------------------------
        s8 = prs.slides.add_slide(blank_layout)
        set_bg(s8, C_BG_LIGHT)
        add_header(s8, "7. Бизнес-модель", "Монетизация: B2C подписка и B2B партнерства",
                   "Прозрачное меню сравнения тарифов Free vs PRO и масштабируемые партнерства со школами.")

        tiers = [
            {
                "tag": "БЕСПЛАТНО",
                "price": "0 ₸",
                "title": "Freemium (Базовый)",
                "desc": "Максимальный органический охват абитуриентов:",
                "features": [
                    "Расчет шансов в топ-36 университетов",
                    "Классификация Safety / Target / Reach",
                    "Базовый роадмап и 3 волны дедлайнов",
                    "Лимит: 1 поиск гостю, 6 на Free"
                ]
            },
            {
                "tag": "ХИТ ПРОДАЖ",
                "price": "4 990 ₸ / мес",
                "title": "AdmitRoute PRO",
                "desc": "Для абитуриентов, нацеленных на гранты и зарубеж:",
                "features": [
                    "Безлимитный AI-поиск любого вуза мира",
                    "Генератор каркаса эссе (Personal Statement)",
                    "Глубокий аудит портфолио и активностей",
                    "Прямой чат с основателем по поступлению"
                ]
            },
            {
                "tag": "B2B ПАРТНЕРСТВО",
                "price": "Индивидуально",
                "title": "Для школ и центров",
                "desc": "Инструмент для образовательных центров и языковых школ:",
                "features": [
                    "Кабинет консультанта и профориентатора",
                    "Отслеживание дедлайнов учеников класса",
                    "White-label отчеты для родителей",
                    "Пакетные скидки на подписки PRO"
                ]
            }
        ]

        for i, t in enumerate(tiers):
            left = Inches(0.8 + i * 4.0)
            card = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.95), Inches(3.7), Inches(5.0))
            card.fill.solid()
            card.fill.fore_color.rgb = C_WHITE
            card.line.color.rgb = C_ACCENT_BLUE if i == 1 else C_CARD_BORDER

            tf = card.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_right = Inches(0.3)
            tf.margin_top = Inches(0.25)

            p0 = tf.paragraphs[0]
            p0.text = t["tag"]
            p0.font.size = Pt(10)
            p0.font.bold = True
            p0.font.color.rgb = C_ACCENT_BLUE if i == 1 else C_TEXT_MUTED
            p0.font.name = 'Arial'

            p1 = tf.add_paragraph()
            p1.text = t["price"]
            p1.font.size = Pt(22)
            p1.font.bold = True
            p1.font.color.rgb = C_TEXT_MAIN
            p1.space_before = Pt(4)
            p1.font.name = 'Arial'

            p2 = tf.add_paragraph()
            p2.text = t["title"]
            p2.font.size = Pt(15)
            p2.font.bold = True
            p2.font.color.rgb = C_TEXT_MAIN
            p2.space_before = Pt(2)
            p2.font.name = 'Arial'

            p3 = tf.add_paragraph()
            p3.text = t["desc"]
            p3.font.size = Pt(10)
            p3.font.color.rgb = C_TEXT_MUTED
            p3.space_before = Pt(4)
            p3.font.name = 'Arial'

            for feat in t["features"]:
                pf = tf.add_paragraph()
                pf.text = "• " + feat
                pf.font.size = Pt(10)
                pf.font.color.rgb = C_TEXT_MAIN
                pf.space_before = Pt(6)
                pf.font.name = 'Arial'

        # ---------------------------------------------------------------------
        # СЛАЙД 9 (10-slides): ТЕХНОЛОГИИ И АРХИТЕКТУРА (БЕЗ РОЛЕВОЙ МОДЕЛИ!)
        # ---------------------------------------------------------------------
        s9 = prs.slides.add_slide(blank_layout)
        set_bg(s9, C_BG_LIGHT)
        add_header(s9, "8. Технологии", "Архитектура решения и технологический стек платформы",
                   "Отказоустойчивая архитектура: сверхбыстрый AI-инференс, глобальная БД и Telegram-автоматизация.")

        tech_cards = [
            {
                "tag": "ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ",
                "title": "Google Gemini 3.6 Flash + Grounded Base",
                "desc": "Связка новейшего API Gemini 3.6 Flash с верифицированной базой программ (130+ направлений): точные пороги ЕНТ, IELTS, реальные гранты и стоимость без галлюцинаций."
            },
            {
                "tag": "ОБЛАЧНАЯ БАЗА ДАННЫХ",
                "title": "Neon Serverless PostgreSQL (AWS us-east-2)",
                "desc": "Бессерверная реляционная БД с мгновенным масштабированием и RLS-безопасностью. Централизованное хранение профилей, Live-чата и трекеров с отказоустойчивой синхронизацией."
            },
            {
                "tag": "СОВРЕМЕННЫЙ ФРОНТЕНД",
                "title": "React 19 • TypeScript • Vite • Tailwind",
                "desc": "Мгновенная скорость работы (отклик <0.2 сек), строгая типизация, полная адаптивность под мобильные устройства и экспорт персональных дедлайнов в формат .ics (iCalendar)."
            },
            {
                "tag": "ФОНОВАЯ АВТОМАТИЗАЦИЯ",
                "title": "Telegram Bot Webhooks • Vercel Cron",
                "desc": "Serverless-архитектура без постоянных расходов: мгновенная обработка команд в Telegram через Webhook и автоматические напоминания о дедлайнах за 14, 7, 3 и 1 день."
            }
        ]

        for i, tc in enumerate(tech_cards):
            col = i % 2
            row = i // 2
            left = Inches(0.8 + col * 5.9)
            top = Inches(1.95 + row * 2.5)

            card = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(5.6), Inches(2.25))
            card.fill.solid()
            card.fill.fore_color.rgb = C_WHITE
            card.line.color.rgb = C_CARD_BORDER

            tf = card.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_right = Inches(0.3)
            tf.margin_top = Inches(0.2)

            p0 = tf.paragraphs[0]
            p0.text = tc["tag"]
            p0.font.size = Pt(10)
            p0.font.bold = True
            p0.font.color.rgb = C_ACCENT_PURPLE if "ИНТЕЛЛЕКТ" in tc["tag"] else C_ACCENT_BLUE
            p0.font.name = 'Arial'

            p1 = tf.add_paragraph()
            p1.text = tc["title"]
            p1.font.size = Pt(15)
            p1.font.bold = True
            p1.font.color.rgb = C_TEXT_MAIN
            p1.space_before = Pt(4)
            p1.font.name = 'Arial'

            p2 = tf.add_paragraph()
            p2.text = tc["desc"]
            p2.font.size = Pt(11)
            p2.font.color.rgb = C_TEXT_MUTED
            p2.space_before = Pt(4)
            p2.font.name = 'Arial'

        # ---------------------------------------------------------------------
        # СЛАЙД 10 (10-slides): КОМАНДА И КОНТАКТЫ (Dark Navy)
        # ---------------------------------------------------------------------
        s10 = prs.slides.add_slide(blank_layout)
        set_bg(s10, C_BG_DARK)
        if os.path.exists(logo_path):
            s10.shapes.add_picture(logo_path, Inches(0.9), Inches(0.9), width=Inches(1.5))

        c_box = s10.shapes.add_textbox(Inches(0.9), Inches(2.4), Inches(11.5), Inches(1.8))
        tf_c = c_box.text_frame
        tf_c.word_wrap = True

        p_c0 = tf_c.paragraphs[0]
        p_c0.text = "AdmitRoute: Поступление без стресса и иллюзий"
        p_c0.font.size = Pt(36)
        p_c0.font.bold = True
        p_c0.font.color.rgb = C_WHITE
        p_c0.font.name = 'Arial'

        p_c1 = tf_c.add_paragraph()
        p_c1.text = "Проект создан в рамках LOCUS Startup Hackathon 2026 (Кейс 02: Персональный маршрут поступления, код LOCUSCASE2)."
        p_c1.font.size = Pt(15)
        p_c1.font.color.rgb = RGBColor(148, 163, 184)
        p_c1.space_before = Pt(8)
        p_c1.font.name = 'Arial'

        contacts = [
            {"title": "ОСНОВАТЕЛЬ И РАЗРАБОТКА", "val": "Адильхан", "sub": "Product & Engineering"},
            {"title": "WHATSAPP / ТЕЛЕФОН", "val": "+7 775 253 01 10", "sub": "Прямая связь и оформление PRO"},
            {"title": "TELEGRAM", "val": "@nftkoroi", "sub": "Оперативные ответы в мессенджере"}
        ]

        for i, ci in enumerate(contacts):
            left = Inches(0.9 + i * 4.0)
            card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(4.5), Inches(3.7), Inches(2.2))
            card.fill.solid()
            card.fill.fore_color.rgb = RGBColor(30, 41, 59)
            card.line.color.rgb = RGBColor(51, 65, 85)

            tf = card.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_right = Inches(0.25)
            tf.margin_top = Inches(0.25)

            p0 = tf.paragraphs[0]
            p0.text = ci["title"]
            p0.font.size = Pt(10)
            p0.font.bold = True
            p0.font.color.rgb = C_SKY_BLUE
            p0.font.name = 'Arial'

            p1 = tf.add_paragraph()
            p1.text = ci["val"]
            p1.font.size = Pt(16)
            p1.font.bold = True
            p1.font.color.rgb = C_WHITE
            p1.space_before = Pt(6)
            p1.font.name = 'Arial'

            p2 = tf.add_paragraph()
            p2.text = ci["sub"]
            p2.font.size = Pt(11)
            p2.font.color.rgb = RGBColor(148, 163, 184)
            p2.space_before = Pt(4)
            p2.font.name = 'Arial'

    return prs

def main():
    print("Building 10-slide comprehensive deck...")
    deck_10 = build_deck(is_eight_slides=False)
    
    print("Building 8-slide hackathon regulation deck...")
    deck_8 = build_deck(is_eight_slides=True)

    # Save destinations
    dest_10 = [
        r'C:\Users\Адильхан\Documents\AdmitRoute_Presentation.pptx',
        r'C:\Users\Адильхан\Documents\admitroute\AdmitRoute_Presentation.pptx',
        r'C:\Users\Адильхан\.gemini\antigravity\scratch\admitroute\AdmitRoute_Presentation.pptx'
    ]
    for path in dest_10:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        deck_10.save(path)
        print(f"Saved 10-slide deck -> {path}")

    dest_8 = [
        r'C:\Users\Адильхан\Documents\AdmitRoute_Presentation_8Slides.pptx',
        r'C:\Users\Адильхан\Documents\admitroute\AdmitRoute_Presentation_8Slides.pptx',
        r'C:\Users\Адильхан\.gemini\antigravity\scratch\admitroute\AdmitRoute_Presentation_8Slides.pptx'
    ]
    for path in dest_8:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        deck_8.save(path)
        print(f"Saved 8-slide deck -> {path}")

if __name__ == '__main__':
    main()
