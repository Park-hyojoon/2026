import tkinter as tk
from tkinter import messagebox, colorchooser, ttk, simpledialog
from PIL import Image, ImageTk, ImageGrab
import os
import json
from datetime import datetime, timedelta

# --- [전역 변수] ---
last_focus_widget = None
SAVE_FILE = "saved_data.json"
LAYOUT_FILE = "layout.json"
BORDER_FILE = "border_settings.json"
widgets_dict = {}
widget_window_ids = {}
container_dict = {}  # 각 key의 container Frame 저장

# 박스 키 목록
BOX_KEYS = ["date", "sermon", "today", "order", "notice"]
BOX_NAMES = {
    "date": "날짜",
    "sermon": "설교",
    "today": "오늘",
    "order": "순서",
    "notice": "공지"
}

# [변경] 기본 위치를 눈에 확 띄게 훨씬 아래로 내렸습니다. (겹침 방지)
DEFAULT_LAYOUT = {
    "date":   [148, 110, 225, 14],
    "sermon": [24,  400, 224, 250],
    "today":  [260, 400, 240, 250],
    "order":  [24,  700, 224, 250],
    "notice": [260, 700, 240, 240]
}

MIN_UI_WIDTH = 660

# Stroke Border 기본 설정 (개별 박스별 + global)
DEFAULT_BORDER_SINGLE = {"color": "#cccccc", "thickness": 2}
DEFAULT_BORDER = {
    "global": DEFAULT_BORDER_SINGLE.copy(),
    "date": DEFAULT_BORDER_SINGLE.copy(),
    "sermon": DEFAULT_BORDER_SINGLE.copy(),
    "today": DEFAULT_BORDER_SINGLE.copy(),
    "order": DEFAULT_BORDER_SINGLE.copy(),
    "notice": DEFAULT_BORDER_SINGLE.copy()
}
border_settings = None  # load_border_settings에서 초기화

import re

def is_valid_hex_color(color_str):
    """HEX 색상 코드 유효성 검증 (#RGB 또는 #RRGGBB)"""
    if not isinstance(color_str, str):
        return False
    pattern = r'^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$'
    return bool(re.match(pattern, color_str))

def is_valid_thickness(thickness):
    """두께 유효성 검증 (0~10 정수)"""
    try:
        t = int(thickness)
        return 0 <= t <= 10
    except (ValueError, TypeError):
        return False

def get_safe_border(data, key):
    """안전하게 border 설정값 가져오기"""
    try:
        if key in data and isinstance(data[key], dict):
            color = data[key].get("color", DEFAULT_BORDER_SINGLE["color"])
            thickness = data[key].get("thickness", DEFAULT_BORDER_SINGLE["thickness"])
            # 유효성 검증
            if not is_valid_hex_color(color):
                color = DEFAULT_BORDER_SINGLE["color"]
            if not is_valid_thickness(thickness):
                thickness = DEFAULT_BORDER_SINGLE["thickness"]
            return {"color": color, "thickness": int(thickness)}
    except Exception:
        pass
    return DEFAULT_BORDER_SINGLE.copy()

def load_border_settings():
    """테두리 설정 로드 (마이그레이션 포함)"""
    global border_settings
    border_settings = {}

    if os.path.exists(BORDER_FILE):
        try:
            with open(BORDER_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)

            # 마이그레이션: 구버전 형식 감지 (global 키가 없으면 구버전)
            if isinstance(data, dict) and "global" not in data and "color" in data:
                # 구버전: {"color": "...", "thickness": ...}
                old_setting = get_safe_border({"old": data}, "old")
                old_setting = {"color": data.get("color", DEFAULT_BORDER_SINGLE["color"]),
                              "thickness": data.get("thickness", DEFAULT_BORDER_SINGLE["thickness"])}
                # 유효성 검증
                if not is_valid_hex_color(old_setting["color"]):
                    old_setting["color"] = DEFAULT_BORDER_SINGLE["color"]
                if not is_valid_thickness(old_setting["thickness"]):
                    old_setting["thickness"] = DEFAULT_BORDER_SINGLE["thickness"]

                # 새 형식으로 변환 (모든 박스에 동일 적용)
                border_settings = {"global": old_setting.copy()}
                for key in BOX_KEYS:
                    border_settings[key] = old_setting.copy()
                # 새 형식으로 저장
                save_border_settings()
            else:
                # 신버전: 각 키별로 안전하게 로드
                border_settings["global"] = get_safe_border(data, "global")
                for key in BOX_KEYS:
                    border_settings[key] = get_safe_border(data, key)
        except Exception as e:
            print(f"테두리 설정 로드 실패, 기본값 사용: {e}")
            border_settings = {k: v.copy() for k, v in DEFAULT_BORDER.items()}
    else:
        border_settings = {k: v.copy() for k, v in DEFAULT_BORDER.items()}

    return border_settings

def save_border_settings():
    """테두리 설정 저장"""
    try:
        with open(BORDER_FILE, "w", encoding="utf-8") as f:
            json.dump(border_settings, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"테두리 설정 저장 실패: {e}")

def main():
    global last_focus_widget, border_settings

    # 테두리 설정 로드
    load_border_settings()

    root = tk.Tk()
    root.title("Making e-mail 1.5 (드래그 이동 모드)")
    
    try:
        icon_img = tk.PhotoImage(file="main_icon.png")
        root.iconphoto(False, icon_img)
    except: pass

    bg_path = os.path.join("img", "bg.jpg")
    try:
        with Image.open(bg_path) as temp_img:
            real_img_w, real_img_h = temp_img.size
    except:
        real_img_w, real_img_h = 528, 943

    init_height = min(real_img_h + 60, 800)
    root.geometry(f"{max(real_img_w + 20, MIN_UI_WIDTH)}x{init_height}")
    root.resizable(True, True)

    FONT_FAMILY_DATE = "HY견고딕"
    FONT_FAMILY_MAIN = "한컴 고딕"
    toolbar_height = 50

    # --- [UI 구조] ---
    toolbar_bg = '#f8f9fa' # 더 밝고 현대적인 배경색
    toolbar = tk.Frame(root, bg=toolbar_bg, bd=1, relief=tk.FLAT, height=toolbar_height)
    toolbar.pack(side=tk.TOP, fill=tk.X)
    toolbar.pack_propagate(False)

    # 하단 상태바 추가
    status_bar = tk.Label(root, text=" 준비 완료", bd=1, relief=tk.SUNKEN, anchor=tk.W, font=("맑은 고딕", 9), bg="#f0f0f0")
    status_bar.pack(side=tk.BOTTOM, fill=tk.X)

    def set_status(msg):
        status_bar.config(text=f" {msg}")
        # 3초 후 기본 메시지로 복원
        root.after(3000, lambda: status_bar.config(text=" 준비 완료"))

    main_frame = tk.Frame(root)
    main_frame.pack(fill=tk.BOTH, expand=True)

    v_scrollbar = tk.Scrollbar(main_frame, orient=tk.VERTICAL)
    v_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    canvas = tk.Canvas(main_frame, bg='white', highlightthickness=0,
                       yscrollcommand=v_scrollbar.set)
    canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
    
    v_scrollbar.config(command=canvas.yview)
    canvas.config(scrollregion=(0, 0, real_img_w, real_img_h))

    def _on_mousewheel(event):
        canvas.yview_scroll(int(-1*(event.delta/120)), "units")
    canvas.bind_all("<MouseWheel>", _on_mousewheel)

    # --- [데이터 관리] ---
    def load_layout():
        if os.path.exists(LAYOUT_FILE):
            try:
                with open(LAYOUT_FILE, "r") as f:
                    return json.load(f)
            except: pass
        return DEFAULT_LAYOUT.copy()

    current_layout = load_layout()

    def save_current_layout():
        try:
            with open(LAYOUT_FILE, "w") as f:
                json.dump(current_layout, f, indent=4)
        except Exception as e:
            print(f"설정 저장 실패: {e}")

    # --- [핵심 기능: 마우스 드래그 이동 및 리사이즈] ---
    drag_data = {"x": 0, "y": 0, "item": None, "key": None, "mode": None, "start_w": 0, "start_h": 0}

    def start_drag(event, widget, key, mode="move"):
        # Alt 키를 누른 상태에서만 드래그 시작 (모드에 따라 분기)
        drag_data["item"] = widget_window_ids[key]
        drag_data["key"] = key
        drag_data["x"] = event.x_root
        drag_data["y"] = event.y_root
        drag_data["mode"] = mode
        
        # 현재 크기 저장
        current_w = current_layout[key][2]
        current_h = current_layout[key][3]
        drag_data["start_w"] = current_w
        drag_data["start_h"] = current_h
        
        if mode == "move":
            widget.config(cursor="fleur")
        elif mode == "resize":
            widget.config(cursor="sizing")

    def do_drag(event):
        if drag_data["item"]:
            dx = event.x_root - drag_data["x"]
            dy = event.y_root - drag_data["y"]
            
            if drag_data["mode"] == "move":
                # 이동 모드
                cur_coords = canvas.coords(drag_data["item"])
                canvas.move(drag_data["item"], dx, dy)
                drag_data["x"] = event.x_root
                drag_data["y"] = event.y_root
                
            elif drag_data["mode"] == "resize":
                # 리사이즈 모드
                new_w = max(50, drag_data["start_w"] + dx)
                new_h = max(20, drag_data["start_h"] + dy)
                canvas.itemconfig(drag_data["item"], width=new_w, height=new_h)

    def stop_drag(event, widget):
        if drag_data["item"]:
            key = drag_data["key"]
            final_coords = canvas.coords(drag_data["item"])
            new_x, new_y = int(final_coords[0]), int(final_coords[1])
            
            # 현재 크기 (리사이즈 되었을 수 있음)
            current_bbox = canvas.bbox(drag_data["item"])
            # bbox는 (x1, y1, x2, y2) 반환, width = x2-x1
            # 하지만 window item의 경우 config로 얻는게 더 정확할 수 있음.
            # 여기서는 canvas itemconfig로 설정한 값을 가져오는 방법이 모호하므로
            # event.width 등을 쓰거나 계산된 값을 사용해야 함.
            
            # 더 확실한 방법: current_layout 업데이트 시 drag 계산값 사용
            if drag_data["mode"] == "resize":
                dx = event.x_root - drag_data["x"] # stop 시점의 dx가 아님 주의.
                # start_drag 시점부터의 누적 dx를 구해야 하는데 구조상 복잡해짐.
                # 따라서 do_drag에서 이미 canvas item width/height를 바꿨으므로,
                # 단순히 canvas.itemcget 을 사용.
                new_w = int(float(canvas.itemcget(drag_data["item"], "width")))
                new_h = int(float(canvas.itemcget(drag_data["item"], "height")))
            else:
                new_w = current_layout[key][2]
                current_h = current_layout[key][3]
                new_h = current_h
            
            current_layout[key] = [new_x, new_y, new_w, new_h]
            save_current_layout()
            
            drag_data["item"] = None
            widget.config(cursor="xterm")

    # --- [기타 기능들] ---
    def refresh_layout():
        nonlocal current_layout
        current_layout = load_layout()
        for key, widget in widgets_dict.items():
            if key in current_layout and key in widget_window_ids:
                x, y, w, h = current_layout[key]
                canvas.coords(widget_window_ids[key], x, y)
                canvas.itemconfig(widget_window_ids[key], width=w, height=h)
        set_status("레이아웃이 새로고침되었습니다.")

    # 강력 초기화 (파일 삭제 후 기본값 로드)
    def factory_reset():
        if messagebox.askyesno("위치 초기화", "상자 위치들이 꼬였나요?\n모든 위치를 '아주 안전한 곳'으로 초기화합니다."):
            if os.path.exists(LAYOUT_FILE): os.remove(LAYOUT_FILE)
            nonlocal current_layout
            current_layout = DEFAULT_LAYOUT.copy() # 변경된 기본값(400, 700) 로드
            
            for key, widget in widgets_dict.items():
                if key in current_layout and key in widget_window_ids:
                    x, y, w, h = current_layout[key]
                    canvas.coords(widget_window_ids[key], x, y)
                    canvas.itemconfig(widget_window_ids[key], width=w, height=h)
            
            save_current_layout()
            set_status("모든 상자 위치가 초기화되었습니다.")

    # --- [테두리 설정 업데이트 함수] ---
    def update_border_for_key(key):
        """특정 박스의 테두리를 현재 설정으로 업데이트"""
        if key in container_dict and key in border_settings:
            container_dict[key].config(
                highlightthickness=border_settings[key]["thickness"],
                highlightbackground=border_settings[key]["color"]
            )

    def update_all_borders():
        """모든 컨테이너의 테두리를 현재 설정으로 업데이트"""
        for key in BOX_KEYS:
            update_border_for_key(key)

    # --- [우클릭 메뉴] ---
    def open_smart_edit_popup(click_x, click_y):
        popup = tk.Toplevel(root)
        popup.title("도구")
        popup.geometry("380x520")
        popup.resizable(False, False)

        tk.Label(popup, text="[Tip] Alt키를 누른채 상자를 드래그하세요!", fg="blue", font=("맑은 고딕", 10, "bold")).pack(pady=8)

        btn_reset = tk.Button(popup, text="위치 강제 초기화", command=factory_reset, bg="#ffcccc", height=1)
        btn_reset.pack(fill=tk.X, padx=20, pady=3)

        tk.Label(popup, text="상자가 겹치거나 화면 밖일 때 누르세요.", fg="gray", font=("맑은 고딕", 8)).pack()

        # === 테두리 설정 섹션 ===
        tk.Label(popup, text="").pack()
        tk.Label(popup, text="━━━━ 테두리 설정 ━━━━", font=("맑은 고딕", 10, "bold")).pack()

        # 적용 대상 선택
        target_frame = tk.Frame(popup)
        target_frame.pack(fill=tk.X, padx=20, pady=5)
        tk.Label(target_frame, text="적용 대상:", width=10, anchor="w").pack(side=tk.LEFT)

        target_options = ["전체 (일괄)"] + [f"{BOX_NAMES[k]} ({k})" for k in BOX_KEYS]
        target_var = tk.StringVar(value="전체 (일괄)")
        target_combo = ttk.Combobox(target_frame, textvariable=target_var,
                                    values=target_options, width=18, state="readonly")
        target_combo.pack(side=tk.LEFT, padx=5)

        def get_target_key():
            """선택된 대상의 키 반환 (전체면 None)"""
            val = target_var.get()
            if val == "전체 (일괄)":
                return None
            for k in BOX_KEYS:
                if k in val:
                    return k
            return None

        def get_current_settings():
            """현재 선택된 대상의 설정 반환"""
            key = get_target_key()
            if key is None:
                return border_settings.get("global", DEFAULT_BORDER_SINGLE)
            return border_settings.get(key, DEFAULT_BORDER_SINGLE)

        # 두께 설정
        thickness_frame = tk.Frame(popup)
        thickness_frame.pack(fill=tk.X, padx=20, pady=5)
        tk.Label(thickness_frame, text="두께:", width=10, anchor="w").pack(side=tk.LEFT)
        thickness_var = tk.StringVar(value=str(get_current_settings()["thickness"]))
        thickness_combo = ttk.Combobox(thickness_frame, textvariable=thickness_var,
                                       values=["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
                                       width=5, state="readonly")
        thickness_combo.pack(side=tk.LEFT, padx=5)

        # 색상 설정 (미리보기 + HEX 입력)
        color_frame = tk.Frame(popup)
        color_frame.pack(fill=tk.X, padx=20, pady=5)
        tk.Label(color_frame, text="색상:", width=10, anchor="w").pack(side=tk.LEFT)

        current_color = get_current_settings()["color"]
        color_preview = tk.Label(color_frame, bg=current_color, width=3, height=1, relief="solid", bd=1)
        color_preview.pack(side=tk.LEFT, padx=2)

        hex_var = tk.StringVar(value=current_color)
        hex_entry = tk.Entry(color_frame, textvariable=hex_var, width=10)
        hex_entry.pack(side=tk.LEFT, padx=2)

        def choose_color_dialog():
            try:
                initial = hex_var.get() if is_valid_hex_color(hex_var.get()) else "#cccccc"
                color = colorchooser.askcolor(initialcolor=initial)[1]
                if color:
                    hex_var.set(color)
                    color_preview.config(bg=color)
            except Exception:
                pass

        btn_picker = tk.Button(color_frame, text="선택", command=choose_color_dialog, width=4)
        btn_picker.pack(side=tk.LEFT, padx=2)

        # HEX 입력 시 미리보기 업데이트
        def on_hex_change(*args):
            color = hex_var.get()
            if is_valid_hex_color(color):
                try:
                    color_preview.config(bg=color)
                except Exception:
                    pass

        hex_var.trace_add("write", on_hex_change)

        # 대상 변경 시 설정값 업데이트
        def on_target_change(event=None):
            settings = get_current_settings()
            thickness_var.set(str(settings["thickness"]))
            hex_var.set(settings["color"])
            try:
                color_preview.config(bg=settings["color"])
            except Exception:
                color_preview.config(bg="#cccccc")

        target_combo.bind("<<ComboboxSelected>>", on_target_change)

        # 에러 메시지 라벨
        error_label = tk.Label(popup, text="", fg="red", font=("맑은 고딕", 9))
        error_label.pack(pady=2)

        # 적용 버튼
        def apply_settings():
            global border_settings

            # 입력값 검증
            color = hex_var.get().strip()
            if not is_valid_hex_color(color):
                error_label.config(text="잘못된 HEX 색상 코드입니다. (예: #cccccc)")
                return

            try:
                thickness = int(thickness_var.get())
            except ValueError:
                error_label.config(text="두께는 숫자여야 합니다.")
                return

            if not is_valid_thickness(thickness):
                error_label.config(text="두께는 0~10 사이여야 합니다.")
                return

            error_label.config(text="")  # 에러 초기화

            new_setting = {"color": color, "thickness": thickness}
            target_key = get_target_key()

            try:
                if target_key is None:
                    # 전체 일괄 적용
                    border_settings["global"] = new_setting.copy()
                    for k in BOX_KEYS:
                        border_settings[k] = new_setting.copy()
                    update_all_borders()
                    msg = "모든 박스에 적용되었습니다."
                else:
                    # 개별 적용
                    border_settings[target_key] = new_setting.copy()
                    update_border_for_key(target_key)
                    msg = f"'{BOX_NAMES[target_key]}' 박스에 적용되었습니다."

                save_border_settings()
                set_status(msg)
            except Exception as e:
                messagebox.showerror("에러", f"설정 적용 실패: {e}")

        btn_apply = tk.Button(popup, text="테두리 설정 적용", command=apply_settings, bg="#ccffcc", height=2)
        btn_apply.pack(fill=tk.X, padx=20, pady=10)

        # 기본값 복원 버튼
        def reset_to_default():
            global border_settings
            if messagebox.askyesno("확인", "테두리 설정을 기본값으로 복원할까요?"):
                border_settings = {k: v.copy() for k, v in DEFAULT_BORDER.items()}
                save_border_settings()
                on_target_change()  # UI 업데이트
                set_status("테두리 설정이 기본값으로 복원되었습니다.")

        btn_default = tk.Button(popup, text="기본값 복원", command=reset_to_default, bg="#eeeeee")
        btn_default.pack(fill=tk.X, padx=20, pady=5)

    def on_right_click(event):
        open_smart_edit_popup(0, 0)

    def on_focus_in(event):
        global last_focus_widget
        last_focus_widget = event.widget

    def get_current_text_widget():
        global last_focus_widget
        if last_focus_widget and isinstance(last_focus_widget, tk.Text):
            return last_focus_widget
        focused = root.focus_get()
        if isinstance(focused, tk.Text):
            return focused
        return None

    def save_image():
        try:
            x = root.winfo_rootx() + 2 
            y = root.winfo_rooty() + toolbar_height + 2
            w = min(real_img_w, canvas.winfo_width())
            h = min(real_img_h, canvas.winfo_height())
            bbox = (x, y, x + w, y + h)
            ImageGrab.grab(bbox).save("result.png")
            set_status("이미지가 result.png로 저장되었습니다!")
        except Exception as e:
            messagebox.showerror("에러", f"저장 실패: {e}")

    # (서식 함수들 생략없이 유지)
    def clear_formatting():
        widget = get_current_text_widget()
        if widget:
            try:
                if not widget.tag_ranges("sel"): return
                for tag in widget.tag_names():
                    if tag.startswith(("font_", "color_", "spacing_", "align_", "style_", "weight_")):
                        widget.tag_remove(tag, "sel.first", "sel.last")
                current_font_str = str(widget.cget("font"))
                family = FONT_FAMILY_DATE if FONT_FAMILY_DATE in current_font_str else FONT_FAMILY_MAIN
                base_tag = f"font_10_normal_{family.replace(' ', '')}"
                widget.tag_configure(base_tag, font=(family, 10))
                widget.tag_add(base_tag, "sel.first", "sel.last")
            except tk.TclError: pass

    def apply_font_style(target_bold=None):
        text_widget = get_current_text_widget()
        if not text_widget: return
        try:
            if not text_widget.tag_ranges("sel"): return
            try: current_size = int(size_var.get())
            except: current_size = 10
            
            # [변경] 드롭다운에서 선택된 폰트 패밀리 사용
            family = font_var.get()
            
            current_tags = text_widget.tag_names("sel.first")
            is_bold = False
            for tag in current_tags:
                if "weight_bold" in tag: is_bold = True; break
            final_bold = is_bold
            if target_bold is True: final_bold = True
            elif target_bold is False: final_bold = False
            elif target_bold is None: final_bold = not is_bold
            
            # 기존 폰트 태그 정리 (중복 방지)
            for tag in text_widget.tag_names():
                if tag.startswith("font_") and tag in text_widget.tag_names("sel.first"):
                    text_widget.tag_remove(tag, "sel.first", "sel.last")

            style_suffix = "bold" if final_bold else "normal"
            tag_name = f"font_{current_size}_{style_suffix}_{family.replace(' ', '')}"
            
            if final_bold:
                new_font = (family, current_size, "bold")
                text_widget.tag_add("weight_bold", "sel.first", "sel.last")
            else:
                new_font = (family, current_size)
                text_widget.tag_remove("weight_bold", "sel.first", "sel.last")
            
            text_widget.tag_configure(tag_name, font=new_font)
            text_widget.tag_add(tag_name, "sel.first", "sel.last")
            set_status(f"글꼴 스타일 적용 완료: {family}")
        except tk.TclError: pass
        text_widget.focus_set()

    def toggle_bold(event=None): apply_font_style(target_bold=None); return "break"
    def change_font_size_event(event): apply_font_style(target_bold=None)

    def change_color():
        text_widget = get_current_text_widget()
        if text_widget:
            try:
                if not text_widget.tag_ranges("sel"): return
                color = simpledialog.askstring("색상", "Hex 코드:")
                if not color: color = colorchooser.askcolor()[1]
                if color:
                    tag_name = f"color_{color}"
                    text_widget.tag_configure(tag_name, foreground=color)
                    text_widget.tag_add(tag_name, "sel.first", "sel.last")
            except tk.TclError: pass

    def set_align(align_type):
        text_widget = get_current_text_widget()
        if text_widget:
            try:
                if not text_widget.tag_ranges("sel"):
                    text_widget.tag_add("temp_align", "insert linestart", "insert lineend")
                    start = "temp_align.first"; end = "temp_align.last"
                else: start = "sel.first"; end = "sel.last"
                for tag in text_widget.tag_names():
                    if tag.startswith("align_"): text_widget.tag_remove(tag, start, end)
                tag_name = f"align_{align_type}"
                text_widget.tag_configure(tag_name, justify=align_type)
                text_widget.tag_add(tag_name, start, end)
                if text_widget.tag_ranges("temp_align"): text_widget.tag_remove("temp_align", "1.0", "end")
            except tk.TclError: pass
            text_widget.focus_set()

    def change_line_spacing(event):
        factor_str = spacing_var.get()
        text_widget = get_current_text_widget()
        if text_widget and factor_str:
            try:
                if not text_widget.tag_ranges("sel"): return
                factor = float(factor_str)
                pixel = 0 if factor <= 1.0 else int(14 * (factor - 1.0) * 1.5)
                tag_name = f"spacing_{factor}"
                text_widget.tag_configure(tag_name, spacing2=pixel, spacing3=pixel)
                text_widget.tag_add(tag_name, "sel.first", "sel.last")
                set_status(f"줄 간격 {factor}배 적용")
            except: pass
            text_widget.focus_set()

    def toggle_underline(event=None): # 생략 가능하나 안전을 위해 포함
        return "break"
    def undo_action(event=None):
        w = get_current_text_widget(); 
        if w: 
            try: w.edit_undo() 
            except: pass
        return "break"
    def redo_action(event=None):
        w = get_current_text_widget(); 
        if w: 
            try: w.edit_redo() 
            except: pass
        return "break"

    def serialize_widget(widget):
        content = widget.get("1.0", "end-1c")
        tags_data = []
        for tag in widget.tag_names():
            if tag == "sel": continue
            cfg = {}
            current_cfg = widget.tag_config(tag)
            for key in ['font', 'foreground', 'underline', 'justify', 'spacing2', 'spacing3']:
                if key in current_cfg:
                    val = current_cfg[key][4] 
                if val: cfg[key] = val
            ranges = widget.tag_ranges(tag)
            ranges_str = [str(r) for r in ranges]
            if ranges_str:
                tags_data.append({"name": tag, "config": cfg, "ranges": ranges_str})
        return {"text": content, "tags": tags_data}

    def deserialize_widget(widget, data):
        if not data: return
        if isinstance(data, str): widget.insert("1.0", data); return
        widget.delete("1.0", tk.END)
        widget.insert("1.0", data.get("text", ""))
        tags = data.get("tags", [])
        for tag_info in tags:
            try:
                tag_name = tag_info["name"]
                cfg = tag_info["config"]
                ranges = tag_info["ranges"]
                if cfg: widget.tag_configure(tag_name, **cfg)
                for i in range(0, len(ranges), 2):
                    if i+1 < len(ranges): widget.tag_add(tag_name, ranges[i], ranges[i+1])
            except: pass

    def on_closing():
        data = {}
        for key, widget in widgets_dict.items():
            data[key] = serialize_widget(widget)
        try:
            with open(SAVE_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
        except: pass
        root.destroy()

    def load_saved_data():
        if not os.path.exists(SAVE_FILE): return
        try:
            with open(SAVE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                for key, widget in widgets_dict.items():
                    deserialize_widget(widget, data.get(key))
                    widget.edit_reset()
        except: pass

    # --- [버튼 UI 배치] ---
    btn_opts = {'padx': 5, 'pady': 2, 'bg': 'white', 'relief': 'groove'}
    btn_save = tk.Button(toolbar, text="💾 저장", command=save_image, **btn_opts)
    btn_save.pack(side=tk.LEFT, padx=(5, 5), pady=5)
    
    btn_refresh = tk.Button(toolbar, text="🔄 새로고침", command=refresh_layout, **btn_opts)
    btn_refresh.pack(side=tk.LEFT, padx=(0, 10), pady=5)

    btn_bold = tk.Button(toolbar, text="B", font=("Arial", 9, "bold"), command=toggle_bold, width=2, **btn_opts)
    btn_bold.pack(side=tk.LEFT, padx=2, pady=5)
    btn_color = tk.Button(toolbar, text="🎨", command=change_color, width=2, **btn_opts)
    btn_color.pack(side=tk.LEFT, padx=2, pady=5)
    btn_clear = tk.Button(toolbar, text="🧹", command=clear_formatting, width=2, **btn_opts)
    btn_clear.pack(side=tk.LEFT, padx=2, pady=5)
    
    tk.Label(toolbar, text="|", bg=toolbar_bg, fg='gray').pack(side=tk.LEFT, padx=5)
    
    btn_left = tk.Button(toolbar, text="L", command=lambda: set_align('left'), width=2, **btn_opts)
    btn_left.pack(side=tk.LEFT, padx=1, pady=5)
    btn_center = tk.Button(toolbar, text="C", command=lambda: set_align('center'), width=2, **btn_opts)
    btn_center.pack(side=tk.LEFT, padx=1, pady=5)
    btn_right = tk.Button(toolbar, text="R", command=lambda: set_align('right'), width=2, **btn_opts)
    btn_right.pack(side=tk.LEFT, padx=1, pady=5)
    
    tk.Label(toolbar, text="|", bg=toolbar_bg, fg='gray').pack(side=tk.LEFT, padx=5)
    
    # 글꼴 패밀리 추가
    tk.Label(toolbar, text="글꼴", bg=toolbar_bg, font=("맑은 고딕", 9)).pack(side=tk.LEFT, padx=(5, 0))
    font_var = tk.StringVar(value="한컴 고딕")
    # 윈도우 기본 탑재 또는 많이 쓰이는 한국어 폰트 목록
    font_options = ["한컴 고딕", "맑은 고딕", "돋움", "굴림", "궁서", "HY견고딕", "나눔고딕", "함초롬바탕"]
    combo_font = ttk.Combobox(toolbar, textvariable=font_var, values=font_options, width=8, state="readonly")
    combo_font.pack(side=tk.LEFT, padx=2, pady=5)
    
    def change_font_family_event(event):
        apply_font_style(target_bold=None)
    
    combo_font.bind("<<ComboboxSelected>>", change_font_family_event)

    tk.Label(toolbar, text="크기", bg=toolbar_bg, font=("맑은 고딕", 9)).pack(side=tk.LEFT, padx=(5, 0))
    size_var = tk.StringVar(value="10")
    combo_size = ttk.Combobox(toolbar, textvariable=size_var, values=[9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 30], width=3, state="readonly")
    combo_size.pack(side=tk.LEFT, padx=2, pady=5)
    combo_size.bind("<<ComboboxSelected>>", change_font_size_event)
    
    tk.Label(toolbar, text="간격", bg=toolbar_bg, font=("맑은 고딕", 9)).pack(side=tk.LEFT, padx=(5, 0))
    spacing_var = tk.StringVar(value="1.0")
    combo_spacing = ttk.Combobox(toolbar, textvariable=spacing_var, values=["0.8", "0.9", "1.0", "1.2", "1.5", "1.8", "2.0"], width=4, state="readonly")
    combo_spacing.pack(side=tk.LEFT, padx=2, pady=5)
    combo_spacing.bind("<<ComboboxSelected>>", change_line_spacing)

    # --- [버턴 호버 효과 및 공통 스타일 함수] ---
    def setup_btn_style(btn):
        btn.config(
            bg='white', relief='flat', bd=0, 
            padx=8, pady=2,
            activebackground='#e9ecef',
            font=("맑은 고딕", 9)
        )
        # 테두리 효과를 위해 프레임으로 감싸거나 캔버스로 그리기도 하지만,
        # 가장 안전하게는 highlightthickness와 relief 조절
        btn.config(highlightthickness=1, highlightbackground='#dee2e6')

        def on_enter(e): btn.config(bg='#e9ecef', highlightbackground='#adb5bd')
        def on_leave(e): btn.config(bg='white', highlightbackground='#dee2e6')
        
        btn.bind("<Enter>", on_enter)
        btn.bind("<Leave>", on_leave)

    # 모든 버튼에 스타일 적용
    for child in toolbar.winfo_children():
        if isinstance(child, tk.Button):
            setup_btn_style(child)

    # --- [이미지 로딩] ---
    try:
        pil_image = Image.open(bg_path)
        pil_image = pil_image.resize((real_img_w, real_img_h), Image.Resampling.LANCZOS)
        bg_image = ImageTk.PhotoImage(pil_image)
        canvas.image = bg_image
        canvas.create_image(0, 0, image=bg_image, anchor=tk.NW)
    except:
        canvas.config(bg='lightgray')

    # --- [텍스트 박스 생성] ---
    text_settings = {'bg': 'white', 'bd': 0, 'highlightthickness': 0, 'exportselection': False, 'undo': True, 'maxundo': -1, 'wrap': 'word'}

    def create_text_widget_from_layout(key, font_family, font_size):
        x, y, w, h = current_layout[key]

        # 개별 박스 설정 가져오기 (안전하게)
        box_border = border_settings.get(key, border_settings.get("global", DEFAULT_BORDER_SINGLE))

        # Stroke Border 방식: Frame의 highlight가 테두리 역할
        container = tk.Frame(canvas, bd=0,
                            highlightthickness=box_border["thickness"],
                            highlightbackground=box_border["color"])

        # 텍스트 위젯 생성
        tw = tk.Text(container, font=(font_family, font_size), **text_settings)
        tw.pack(fill=tk.BOTH, expand=True)

        # 리사이즈 핸들 (우하단)
        size_grip = tk.Frame(container, bg="#aaaaaa", cursor="sizing", width=10, height=10)
        size_grip.place(relx=1.0, rely=1.0, anchor="se")
        size_grip.bind("<Button-1>", lambda e, w=size_grip, k=key: start_drag(e, w, k, mode="resize"))
        size_grip.bind("<B1-Motion>", do_drag)
        size_grip.bind("<ButtonRelease-1>", lambda e, w=size_grip: stop_drag(e, w))

        win_id = canvas.create_window(x, y, window=container, width=w, height=h, anchor=tk.NW)

        tw.bind("<FocusIn>", on_focus_in)
        tw.bind("<Control-Button-3>", on_right_click)

        # [핵심] Alt + 클릭으로 드래그 이동 (Text 위젯 본체)
        tw.bind("<Alt-Button-1>", lambda e, w=tw, k=key: start_drag(e, w, k, mode="move"))
        tw.bind("<Alt-B1-Motion>", do_drag)
        tw.bind("<Alt-ButtonRelease-1>", lambda e, w=tw: stop_drag(e, w))

        widgets_dict[key] = tw
        widget_window_ids[key] = win_id
        container_dict[key] = container  # 테두리 업데이트용 저장
        return tw

    text_date = create_text_widget_from_layout("date", FONT_FAMILY_DATE, 9)
    text_sermon = create_text_widget_from_layout("sermon", FONT_FAMILY_MAIN, 10)
    text_order = create_text_widget_from_layout("order", FONT_FAMILY_MAIN, 10)
    text_today = create_text_widget_from_layout("today", FONT_FAMILY_MAIN, 10)
    text_notice = create_text_widget_from_layout("notice", FONT_FAMILY_MAIN, 10)

    today = datetime.now()
    days_until_sunday = (6 - today.weekday()) % 7
    next_sunday = today + timedelta(days=days_until_sunday)
    formatted_date = next_sunday.strftime("%Y. %m. %d. 예배 시간 오전 11:30")
    if not os.path.exists(SAVE_FILE):
        text_date.insert("1.0", formatted_date)

    load_saved_data()
    root.protocol("WM_DELETE_WINDOW", on_closing)

    root.mainloop()

if __name__ == "__main__":
    main()