import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext, ttk
import os
import threading
import sys
import pythoncom
from main import generate_ppt

# work-plane 폴더를 모듈 경로에 추가하여 song_downloader 임포트
if getattr(sys, 'frozen', False):
    # PyInstaller로 빌드된 경우
    base_path = sys._MEIPASS
else:
    # 일반 파이썬 실행인 경우
    base_path = os.path.dirname(os.path.abspath(__file__))

sys.path.append(os.path.join(base_path, 'work-plane'))

try:
    import song_search # Ensure this is bundled by PyInstaller
    from song_downloader import SongDownloaderApp
except ImportError as e:
    SongDownloaderApp = None
    # Show error in GUI so we can debug executable issues
    # But only show if we have a root window? No, import happens before root.
    # We will let it fail silently here but show it in the disabled label or a popup later?
    # Actually, let's just print it for now, user can't see print in windowed mode.
    # We will handle the error display in create_widgets if it is None.
    error_msg = str(e)

import datetime


class ShortcutManager:
    def __init__(self, root):
        self.root = root
        self.shortcuts = {} # key: button_widget
        self.labels = []
        
        # Bind Alt key
        self.root.bind("<Alt_L>", self.show_hints)
        self.root.bind("<KeyRelease-Alt_L>", self.hide_hints)
        
    def register(self, char, button):
        """Register a shortcut key (char) for a button."""
        char = char.upper()
        self.shortcuts[char] = button
        
        # Bind Alt+Key
        # Note: We bind to root so it works globally
        self.root.bind(f"<Alt-{char.lower()}>", lambda e: button.invoke())
        
    def show_hints(self, event=None):
        """Show overlay labels on registered buttons."""
        if self.labels: return # Already shown
        
        for char, btn in self.shortcuts.items():
            if not btn.winfo_viewable(): continue
            
            # Get button position relative to root
            x = btn.winfo_rootx() - self.root.winfo_rootx()
            y = btn.winfo_rooty() - self.root.winfo_rooty()
            w = btn.winfo_width()
            
            # Create label
            lbl = tk.Label(self.root, text=char, bg="yellow", fg="black", 
                          font=("Arial", 10, "bold"), relief="solid", borderwidth=1)
            lbl.place(x=x+w-20, y=y-10) # Top-right corner of button
            self.labels.append(lbl)
            
    def hide_hints(self, event=None):
        """Remove overlay labels."""
        for lbl in self.labels:
            lbl.destroy()
        self.labels.clear()

class App:
    def __init__(self, root):
        self.root = root
        self.root.title("PPT Automation Tool")
        self.root.geometry("1200x900") # Increased width to 1050 for path visibility

        # Variables
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Worship Title (Default: 금요 기도회)
        self.worship_title_var = tk.StringVar(value="금요 기도회")
        
        # 1) PPT Folder (Songs) -> D:\05. Download
        self.ppt_dir_var = tk.StringVar(value=r"D:\05. Download")
        
        # 2) Template File -> D:\02. 열띰!\02. 교회\03. 금요기도회 PPT\004.pptx
        # Assuming 004.pptx is the filename inside that folder
        # 2) Template File -> D:\02. 열띰!\02. 교회\03. 금요기도회 PPT\friday.pptx
        # We start with Friday default
        self.template_path_var = tk.StringVar(value=r"D:\02. 열띰!\02. 교회\03. 금요기도회 PPT\friday.pptx")
        
        self.is_wednesday_var = tk.BooleanVar(value=False)
        self.sermon_title_var = tk.StringVar(value="")
        
        self.bible_title_var = tk.StringVar(value="")
        # self.bible_range_var removed as requested
        
        # Calculate next Friday for default filename
        today = datetime.date.today()
        friday = today + datetime.timedelta((4 - today.weekday()) % 7)
        default_filename = f"{friday.strftime('%Y년 %m월 %d일')} 금요기도회.pptx"
        
        # 3) Output File -> D:\02. 열띰!\02. 교회\03. 금요기도회 PPT
        self.output_path_var = tk.StringVar(value=os.path.join(r"D:\02. 열띰!\02. 교회\03. 금요기도회 PPT", default_filename))
        
        # Style Configuration for Tabs
        style = ttk.Style()
        style.configure("TNotebook.Tab", font=("Arial", 12, "bold"), padding=[10, 5])
        style.map("TNotebook.Tab", background=[("selected", "#b3e5fc"), ("!selected", "#f0f0f0")], foreground=[("selected", "black"), ("!selected", "#555")])
        
        # Initialize Shortcut Manager
        self.shortcuts = ShortcutManager(self.root)
        
        # Initialize downloader_app reference
        self.downloader_app = None

        # Set Window Icon
        try:
            icon_path = os.path.join(base_path, "makeppt001_1.ico")
            if os.path.exists(icon_path):
                self.root.iconbitmap(icon_path)
        except Exception:
            pass # Icon is optional

        # UI Elements
        self.create_widgets()
        
        # Initial population - Removed as requested
        # self.populate_song_lists()

        # Menu
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        about_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="About", menu=about_menu)
        about_menu.add_command(label="Info", command=self.show_about)



    def show_about(self):
        messagebox.showinfo("About", "2025년 12월 5일 FridayWorshipPPT v1.35 완성")

    def create_widgets(self):
        # 노트북(탭) 생성
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill="both", expand=True, padx=5, pady=5)

        # === 탭 1: 찬송가 다운로드 ===
        if SongDownloaderApp:
            self.tab_download = tk.Frame(self.notebook)
            self.notebook.add(self.tab_download, text="찬송가 다운로드")
            
            # 찬송가 다운로더 앱 임베딩
            self.downloader_app = SongDownloaderApp(self.root, parent=self.tab_download, is_standalone=False)
        else:
            self.tab_download = tk.Frame(self.notebook)
            self.notebook.add(self.tab_download, text="찬송가 다운로드 (사용 불가)")
            
            # Show the specific import error
            msg = f"song_downloader.py를 찾을 수 없습니다.\n\nError Details:\n{globals().get('error_msg', 'Unknown Error')}"
            tk.Label(self.tab_download, text=msg, fg="red", justify="left").pack(padx=20, pady=20)

        # === 탭 2: PPT 생성 ===
        self.tab_ppt = tk.Frame(self.notebook)
        self.notebook.add(self.tab_ppt, text="PPT 생성")
        
        # Main Container for Tab 2
        main_container = tk.Frame(self.tab_ppt)
        main_container.pack(fill="both", expand=True, padx=10, pady=10)
        
        main_container.grid_columnconfigure(0, weight=5, uniform="group1") # Left Frame (70%)
        main_container.grid_columnconfigure(1, weight=5, uniform="group1") # Right Frame (30%)
        main_container.grid_rowconfigure(0, weight=1)


        # Left Frame (Settings & Lists)
        left_frame = tk.Frame(main_container)
        left_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 5))

        # Right Frame (Inputs & Action)
        right_frame = tk.Frame(main_container)
        right_frame.grid(row=0, column=1, sticky="nsew", padx=(5, 0))

        # === LEFT FRAME CONTENT ===

        # 1. PPT Directory
        tk.Label(left_frame, text="PPT Folder (Songs):", font=("Arial", 10, "bold")).pack(anchor="w", pady=(0, 2))
        frame_ppt = tk.Frame(left_frame)
        frame_ppt.pack(fill="x", pady=(0, 10))
        tk.Entry(frame_ppt, textvariable=self.ppt_dir_var).pack(side="left", fill="x", expand=True)
        self.btn_browse_ppt = tk.Button(frame_ppt, text="Browse", command=self.browse_ppt_dir)
        self.btn_browse_ppt.pack(side="right", padx=2)
        
        # Tools Row
        frame_tools = tk.Frame(left_frame)
        frame_tools.pack(fill="x", pady=(0, 10))
        self.btn_refresh = tk.Button(frame_tools, text="Refresh", command=self.populate_song_lists)
        self.btn_refresh.pack(side="left", fill="x", expand=True, padx=2)
        self.btn_delete_all = tk.Button(frame_tools, text="Delete All", command=self.clear_all_lists)
        self.btn_delete_all.pack(side="left", fill="x", expand=True, padx=2)
        self.btn_fix_ppt = tk.Button(frame_tools, text="FIX PPT", command=self.reset_powerpoint, bg="#ffcccc")
        self.btn_fix_ppt.pack(side="left", fill="x", expand=True, padx=2)

        # 2. Template & Mode
        tk.Label(left_frame, text="Template & Mode:", font=("Arial", 10, "bold")).pack(anchor="w", pady=(0, 2))
        
        # Checkbox
        chk_wed = tk.Checkbutton(left_frame, text="Wednesday Mode", 
                                 variable=self.is_wednesday_var, command=self.toggle_mode)
        chk_wed.pack(anchor="w", pady=(0, 2))

        frame_tpl = tk.Frame(left_frame)
        frame_tpl.pack(fill="x", pady=(0, 10))
        tk.Entry(frame_tpl, textvariable=self.template_path_var).pack(side="left", fill="x", expand=True)
        self.btn_browse_template = tk.Button(frame_tpl, text="Browse", command=self.browse_template)
        self.btn_browse_template.pack(side="right", padx=2)

        # 3. Output File
        tk.Label(left_frame, text="Output File:", font=("Arial", 10, "bold")).pack(anchor="w", pady=(0, 2))
        frame_out = tk.Frame(left_frame)
        frame_out.pack(fill="x", pady=(0, 10))
        tk.Entry(frame_out, textvariable=self.output_path_var).pack(side="left", fill="x", expand=True)
        self.btn_browse_output = tk.Button(frame_out, text="Browse", command=self.browse_output)
        self.btn_browse_output.pack(side="right", padx=2)

        # 4. Songs Before Sermon
        tk.Label(left_frame, text="Songs Before Sermon:", font=("Arial", 10, "bold")).pack(anchor="w", pady=(0, 2))
        frame_before = tk.Frame(left_frame)
        frame_before.pack(fill="both", expand=True, pady=(0, 5))
        
        sb_before = tk.Scrollbar(frame_before)
        sb_before.pack(side="right", fill="y")
        
        self.list_before = tk.Listbox(frame_before, selectmode=tk.EXTENDED, yscrollcommand=sb_before.set, height=5)
        self.list_before.pack(side="left", fill="both", expand=True)
        sb_before.config(command=self.list_before.yview)
        
        # Controls Before
        frame_btns_before = tk.Frame(left_frame)
        frame_btns_before.pack(fill="x", pady=(0, 10))
        self.btn_before_up = tk.Button(frame_btns_before, text="\u2191", width=3, command=lambda: self.move_up(self.list_before))
        self.btn_before_up.pack(side="left", padx=2)
        self.btn_before_down = tk.Button(frame_btns_before, text="\u2193", width=3, command=lambda: self.move_down(self.list_before))
        self.btn_before_down.pack(side="left", padx=2)
        self.btn_before_del = tk.Button(frame_btns_before, text="Del", width=4, command=lambda: self.delete_song(self.list_before))
        self.btn_before_del.pack(side="left", padx=2)
        self.btn_before_clear = tk.Button(frame_btns_before, text="Clear", width=5, command=lambda: self.clear_all(self.list_before))
        self.btn_before_clear.pack(side="left", padx=2)
        self.btn_to_after = tk.Button(frame_btns_before, text="To After \u2193", command=self.move_to_after)
        self.btn_to_after.pack(side="right", padx=2)

        # 5. Songs After Sermon
        tk.Label(left_frame, text="Songs After Sermon:", font=("Arial", 10, "bold")).pack(anchor="w", pady=(0, 2))
        frame_after = tk.Frame(left_frame)
        frame_after.pack(fill="both", expand=True, pady=(0, 5))
        
        sb_after = tk.Scrollbar(frame_after)
        sb_after.pack(side="right", fill="y")
        
        self.list_after = tk.Listbox(frame_after, selectmode=tk.EXTENDED, yscrollcommand=sb_after.set, height=5)
        self.list_after.pack(side="left", fill="both", expand=True)
        sb_after.config(command=self.list_after.yview)

        # Controls After
        frame_btns_after = tk.Frame(left_frame)
        frame_btns_after.pack(fill="x", pady=(0, 0))
        self.btn_after_up = tk.Button(frame_btns_after, text="\u2191", width=3, command=lambda: self.move_up(self.list_after))
        self.btn_after_up.pack(side="left", padx=2)
        self.btn_after_down = tk.Button(frame_btns_after, text="\u2193", width=3, command=lambda: self.move_down(self.list_after))
        self.btn_after_down.pack(side="left", padx=2)
        self.btn_after_del = tk.Button(frame_btns_after, text="Del", width=4, command=lambda: self.delete_song(self.list_after))
        self.btn_after_del.pack(side="left", padx=2)
        self.btn_after_clear = tk.Button(frame_btns_after, text="Clear", width=5, command=lambda: self.clear_all(self.list_after))
        self.btn_after_clear.pack(side="left", padx=2)
        self.btn_to_before = tk.Button(frame_btns_after, text="\u2191 To Before", command=self.move_to_before)
        self.btn_to_before.pack(side="right", padx=2)


        # === RIGHT FRAME CONTENT ===

        # 1. Worship Title
        tk.Label(right_frame, text="Worship Title (Slide 1):").pack(anchor="w", pady=(0, 2))
        entry_worship = tk.Entry(right_frame, textvariable=self.worship_title_var)
        entry_worship.pack(fill="x", pady=(0, 10))

        # 2. Sermon Title
        tk.Label(right_frame, text="Sermon Title (Slide 6 - Wed Only):").pack(anchor="w", pady=(0, 2))
        entry_sermon = tk.Entry(right_frame, textvariable=self.sermon_title_var)
        entry_sermon.pack(fill="x", pady=(0, 10))

        # 3. Bible Chapter
        tk.Label(right_frame, text="Bible Chapter/Verse (All Slides):").pack(anchor="w", pady=(0, 2))
        entry_title = tk.Entry(right_frame, textvariable=self.bible_title_var)
        entry_title.pack(fill="x", pady=(0, 10))

        # 4. Bible Body
        tk.Label(right_frame, text="Bible Body (Slide 5) - Use '/' to split:", font=("Arial", 9)).pack(anchor="w", pady=(0, 2))
        # Enable Undo here
        self.bible_body_text = scrolledtext.ScrolledText(right_frame, height=20, undo=True)
        self.bible_body_text.pack(fill="both", expand=True, pady=(0, 10))
        self.bible_body_text.insert("1.0", "")
        
        # Tab Binding
        def focus_next_widget(event):
            event.widget.tk_focusNext().focus()
            return "break"
        self.bible_body_text.bind("<Tab>", focus_next_widget)

        # 5. Generate Button
        self.btn_gen = tk.Button(right_frame, text="Generate PPT", command=self.start_generation, bg="lightblue", font=("Arial", 12, "bold"), height=2)
        self.btn_gen.pack(fill="x", pady=(0, 0))
        
        # === REGISTER SHORTCUTS ===
        # Tab 1: Download
        if self.downloader_app:
            self.shortcuts.register('A', self.downloader_app.batch_btn)
            self.shortcuts.register('S', self.downloader_app.search_btn)
            self.shortcuts.register('D', self.downloader_app.download_all_btn)
            self.shortcuts.register('F', self.downloader_app.btn_add_to_queue)
            self.shortcuts.register('G', self.downloader_app.btn_download_now)
            self.shortcuts.register('Q', self.downloader_app.btn_remove_queue)
            self.shortcuts.register('W', self.downloader_app.btn_clear_queue)
            self.shortcuts.register('E', self.downloader_app.btn_clear_results)
            self.shortcuts.register('Z', self.downloader_app.btn_open_folder)
            self.shortcuts.register('X', self.downloader_app.btn_view_post)

        # Tab 2: PPT
        self.shortcuts.register('B', self.btn_browse_ppt)
        self.shortcuts.register('N', self.btn_browse_template)
        self.shortcuts.register('M', self.btn_browse_output)
        self.shortcuts.register('H', self.btn_refresh)
        self.shortcuts.register('J', self.btn_delete_all)
        self.shortcuts.register('K', self.btn_fix_ppt)
        self.shortcuts.register('U', self.btn_before_up)
        self.shortcuts.register('I', self.btn_before_down)
        self.shortcuts.register('O', self.btn_before_del)
        self.shortcuts.register('P', self.btn_before_clear)
        self.shortcuts.register('L', self.btn_gen)
        
        # Global Tab Shortcuts
        self.root.bind("<Alt-1>", lambda e: self.notebook.select(0))
        self.root.bind("<Alt-2>", lambda e: self.notebook.select(1))

        # Disable focus for all buttons (Text-only Tab Navigation)
        self.disable_button_focus(self.root)

    def disable_button_focus(self, widget):
        """Recursively disable focus for all Button widgets."""
        if isinstance(widget, tk.Button):
            widget.config(takefocus=0)
        for child in widget.winfo_children():
            self.disable_button_focus(child)

    def toggle_mode(self):
        """Switches template filename, output directory, and output filename based on checkbox"""
        today = datetime.date.today()
        
        if self.is_wednesday_var.get():
            # Wednesday Mode
            # 1. Template Path
            # Explicitly set to the requested Wednesday path
            new_tpl_path = r"D:\02. 열띰!\02. 교회\04. 수요기도회 PPT\wednesday.pptx"
            
            # 2. Date Calculation (Next Wednesday)
            target_weekday = 2 # Wednesday
            days_ahead = target_weekday - today.weekday()
            if days_ahead <= 0: # Target day already happened this week
                days_ahead += 7
            next_date = today + datetime.timedelta(days_ahead)
            
            # 3. Output Path
            base_output_dir = r"D:\02. 열띰!\02. 교회\04. 수요기도회 PPT"
            
            filename = f"{next_date.strftime('%Y년 %m월 %d일')} 수요기도회.pptx"
            
        else:
            # Friday Mode (Default)
            # 1. Template Path
            new_tpl_path = r"D:\02. 열띰!\02. 교회\03. 금요기도회 PPT\friday.pptx"
            
            # 2. Date Calculation (Next Friday)
            target_weekday = 4 # Friday
            days_ahead = target_weekday - today.weekday()
            if days_ahead <= 0:
                days_ahead += 7
            next_date = today + datetime.timedelta(days_ahead)
            
            # 3. Output Path
            base_output_dir = r"D:\02. 열띰!\02. 교회\03. 금요기도회 PPT"
            
            filename = f"{next_date.strftime('%Y년 %m월 %d일')} 금요기도회.pptx"

        # Apply changes
        self.template_path_var.set(new_tpl_path)
        
        # Output
        new_output_path = os.path.join(base_output_dir, filename)
        self.output_path_var.set(new_output_path)

    def browse_ppt_dir(self):
        # Users want to see files to verify they are in the right folder.
        # So we use askopenfilename but strictly to get the directory.
        initial = self.ppt_dir_var.get()
        if not os.path.exists(initial):
            initial = os.getcwd()
            
        paths = filedialog.askopenfilenames(
            title="Select song files (Directory will be selected)",
            initialdir=initial,
            filetypes=[("Song Files", "*.pptx;*.ppt"), ("All Files", "*.*")]
        )
        
        if paths:
            # multiple files might be selected
            # Use the directory of the first file
            path = paths[0]
            directory = os.path.dirname(path)
            self.ppt_dir_var.set(os.path.normpath(directory))
            
            # Pass ONLY the selected filenames
            selected_files = [os.path.basename(p) for p in paths]
            self.populate_song_lists(target_files=selected_files)

    def reset_powerpoint(self):
        """Force kills PowerPoint processes to fix lock issues"""
        if messagebox.askyesno("Confirm", "This will close ALL PowerPoint windows. Continue?"):
            try:
                os.system("taskkill /IM POWERPNT.EXE /F")
                messagebox.showinfo("Success", "PowerPoint has been reset.")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to reset PowerPoint: {e}")

    def clear_all_lists(self):
        self.list_before.delete(0, tk.END)
        self.list_after.delete(0, tk.END)

    def populate_song_lists(self, target_files=None):
        ppt_dir = self.ppt_dir_var.get()
        self.list_before.delete(0, tk.END)
        self.list_after.delete(0, tk.END)
        
        if os.path.exists(ppt_dir):
            files = []
            if target_files:
                # Use provided files, but filter for safety
                files = [f for f in target_files if f.lower().endswith(('.pptx', '.ppt')) and not f.startswith("~$")]
            else:
                # Scan directory (Default/Refresh behavior)
                files = [f for f in os.listdir(ppt_dir) if f.lower().endswith(('.pptx', '.ppt')) and not f.startswith("~$")]
            
            files.sort()
            
            # Default split: First 2 to Before, Rest to After
            for i, f in enumerate(files):
                if i < 2:
                    self.list_before.insert(tk.END, f)
                else:
                    self.list_after.insert(tk.END, f)

    def move_up(self, listbox):
        try:
            selection = listbox.curselection()
            if not selection:
                return
            
            # Convert to list and sort
            selection = sorted(list(selection))
            
            # If any item is already at the top, we can't move the block up if it's contiguous with top
            # But standard behavior is to move all movable items up.
            # Let's iterate from top to bottom of selection
            
            for index in selection:
                if index > 0:
                    text = listbox.get(index)
                    listbox.delete(index)
                    listbox.insert(index - 1, text)
                    listbox.selection_set(index - 1)
        except Exception:
            pass

    def move_down(self, listbox):
        try:
            selection = listbox.curselection()
            if not selection:
                return
            
            # Convert to list and sort descending
            selection = sorted(list(selection), reverse=True)
            
            for index in selection:
                if index < listbox.size() - 1:
                    text = listbox.get(index)
                    listbox.delete(index)
                    listbox.insert(index + 1, text)
                    listbox.selection_set(index + 1)
        except Exception:
            pass

    def delete_song(self, listbox):
        try:
            selection = listbox.curselection()
            if not selection:
                return
            
            # Delete in reverse order to maintain indices
            for index in sorted(list(selection), reverse=True):
                listbox.delete(index)
        except Exception:
            pass

    def clear_all(self, listbox):
        listbox.delete(0, tk.END)

    def move_to_after(self):
        try:
            selection = self.list_before.curselection()
            if not selection:
                return
            
            # Get items
            items = [self.list_before.get(i) for i in selection]
            
            # Delete from source (reverse order)
            for index in sorted(list(selection), reverse=True):
                self.list_before.delete(index)
                
            # Insert into target (at top, in order)
            # To keep their relative order, insert them in reverse order at index 0?
            # No, if we have [A, B] selected, we want [A, B] at top of After.
            # So insert B at 0, then A at 0? No, that gives [A, B].
            # Wait: Insert A at 0 -> [A, ...]. Insert B at 0 -> [B, A, ...]. Reversed.
            # So we should insert in reverse order of appearance in 'items' to preserve order at top.
            
            for item in reversed(items):
                self.list_after.insert(0, item)
                self.list_after.selection_set(0)
                
        except Exception:
            pass

    def move_to_before(self):
        try:
            selection = self.list_after.curselection()
            if not selection:
                return
            
            # Get items
            items = [self.list_after.get(i) for i in selection]
            
            # Delete from source (reverse order)
            for index in sorted(list(selection), reverse=True):
                self.list_after.delete(index)
                
            # Insert into target (at bottom)
            for item in items:
                self.list_before.insert(tk.END, item)
                self.list_before.selection_set(tk.END)
                
        except Exception:
            pass

    def browse_template(self):
        initial = os.path.dirname(self.template_path_var.get())
        if not os.path.exists(initial):
            initial = os.getcwd()
            
        path = filedialog.askopenfilename(initialdir=initial, filetypes=[("PowerPoint Files", "*.pptx;*.ppt")])
        if path:
            self.template_path_var.set(os.path.normpath(path))

    def browse_output(self):
        initial = os.path.dirname(self.output_path_var.get())
        if not os.path.exists(initial):
            initial = os.getcwd()
            
        # Suggest the current filename
        initial_file = os.path.basename(self.output_path_var.get())
        
        path = filedialog.asksaveasfilename(initialdir=initial, initialfile=initial_file, filetypes=[("PowerPoint Files", "*.pptx")])
        if path:
            if not path.lower().endswith(".pptx"):
                path += ".pptx"
            self.output_path_var.set(os.path.normpath(path))

    def start_generation(self):
        # Gather inputs
        ppt_dir = self.ppt_dir_var.get()
        template_path = self.template_path_var.get()
        output_path = self.output_path_var.get()
        bible_title = self.bible_title_var.get()
        worship_title = self.worship_title_var.get()
        sermon_title = self.sermon_title_var.get() if self.is_wednesday_var.get() else ""
        # bible_range = self.bible_range_var.get() # Removed
        bible_body = self.bible_body_text.get("1.0", "end-1c")
        
        # Get songs from listboxes
        files_before = self.list_before.get(0, tk.END)
        files_after = self.list_after.get(0, tk.END)
        
        songs_before = [os.path.join(ppt_dir, f) for f in files_before]
        songs_after = [os.path.join(ppt_dir, f) for f in files_after]
        
        # Run in a separate thread
        # Pass bible_title for both title and range arguments
        threading.Thread(target=self.run_logic, args=(songs_before, songs_after, template_path, output_path, worship_title, bible_title, bible_title, bible_body, sermon_title)).start()

    def run_logic(self, songs_before, songs_after, template_path, output_path, worship_title, bible_title, bible_range, bible_body, sermon_title=""):
        pythoncom.CoInitialize()
        try:
            errors, warnings = generate_ppt(songs_before, songs_after, template_path, output_path, worship_title, bible_title, bible_range, bible_body, sermon_title)
            
            msg = ""
            if errors:
                msg += "Errors occurred:\n" + "\n".join([f"- {e}" for e in errors]) + "\n\n"
            
            if warnings:
                msg += "Warnings:\n" + "\n".join([f"- {w}" for w in warnings]) + "\n\n"
                
            if not errors:
                msg += f"Presentation generated successfully!\nSaved to: {output_path}"
                if warnings:
                    messagebox.showwarning("Completed with Warnings", msg)
                else:
                    messagebox.showinfo("Success", msg)
                
                # Auto Open File
                try:
                    os.startfile(output_path)
                except Exception as e:
                    print(f"Could not auto-open file: {e}")

            else:
                messagebox.showerror("Error", msg)
                
        except Exception as e:
            messagebox.showerror("Error", f"An critical error occurred:\n{e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = App(root)
    root.mainloop()
