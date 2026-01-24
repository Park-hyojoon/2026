"""
찬송가 다운로더 GUI v2.0
getwater.tistory.com 및 cwy0675.tistory.com에서 찬송가 PPT 파일을 검색하고 다운로드합니다.
여러 곡을 한 번에 검색 및 다운로드할 수 있습니다.
"""

import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import os
import sys
import threading
import re
import webbrowser


# 부모 폴더(루트)의 song_search.py를 사용하도록 경로 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from song_search import search_songs, get_download_info, download_file, sanitize_filename



class SongDownloaderApp:
    def __init__(self, root, parent=None, is_standalone=True, on_download_complete=None):
        self.root = root
        self.parent = parent if parent else root
        self.is_standalone = is_standalone
        self.on_download_complete = on_download_complete
        
        if self.is_standalone:
            self.root.title("찬송가 다운로더 v2.0")
            self.root.geometry("750x850")

        # 검색 결과 저장
        self.search_results = []
        
        # 선택된 다운로드 대기열 (최대 7곡)
        self.selected_queue = []

        # 기본 저장 경로
        self.save_dir_var = tk.StringVar(value=r"D:\05. Download")

        # 파일 번호
        self.file_number_var = tk.StringVar(value="1")

        # 검색 소스 선택 (기본: 두 사이트 모두)
        self.source_getwater = tk.BooleanVar(value=True)
        self.source_cwy0675 = tk.BooleanVar(value=True)
        
        # 검색 결과 누적 옵션 (기본: OFF - 사용자 피드백 '딱! 2개만' 반영)
        self.cumulative_search = tk.BooleanVar(value=False)

        # 일괄 다운로드 진행 상태
        self.is_batch_downloading = False
        self.batch_cancel_flag = False

        # UI 생성
        self.create_widgets()

    def create_widgets(self):
        # 상단과 하단을 잇는 스크롤 가능한 캔버스 설정
        # parent가 있으면 parent를 사용, 없으면 root 사용
        master = self.parent
        
        canvas = tk.Canvas(master)
        scrollbar = ttk.Scrollbar(master, orient="vertical", command=canvas.yview)
        
        # 메인 프레임 (캔버스 안에 들어갈 내용)
        main_frame = tk.Frame(canvas, padx=15, pady=15)
        
        # 캔버스 윈도우 생성
        self.canvas_window = canvas.create_window((0, 0), window=main_frame, anchor="nw")
        
        # 스크롤 영역 자동 조절
        def _on_frame_configure(event):
            canvas.configure(scrollregion=canvas.bbox("all"))
        
        def _on_canvas_configure(event):
            # 캔버스 너비에 맞춰 프레임 너비 조절
            canvas.itemconfig(self.canvas_window, width=event.width)

        main_frame.bind("<Configure>", _on_frame_configure)
        canvas.bind("<Configure>", _on_canvas_configure)
        canvas.configure(yscrollcommand=scrollbar.set)
        
        # 배치
        scrollbar.pack(side="right", fill="y")
        canvas.pack(side="left", fill="both", expand=True)

        # 마우스 휠 지원
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
        canvas.bind_all("<MouseWheel>", _on_mousewheel)

        # === 일괄 검색 영역 (NEW) ===
        batch_frame = tk.LabelFrame(main_frame, text="일괄 다운로드 (여러 곡)", padx=10, pady=10)
        batch_frame.pack(fill="x", pady=(0, 10))

        tk.Label(batch_frame, text="찬송가 번호:").pack(side="left")

        self.batch_entry = tk.Entry(batch_frame, width=30)
        self.batch_entry.pack(side="left", padx=(5, 5))
        self.batch_entry.insert(0, "예: 28, 29, 30 또는 28-32")
        self.batch_entry.bind("<FocusIn>", lambda e: self.batch_entry.delete(0, tk.END) if "예:" in self.batch_entry.get() else None)

        tk.Label(batch_frame, text="종류:").pack(side="left", padx=(10, 5))
        self.song_type_var = tk.StringVar(value="새찬송가 ppt")
        type_combo = ttk.Combobox(batch_frame, textvariable=self.song_type_var, width=15, state="readonly")
        type_combo['values'] = ("새찬송가 ppt", "통일찬송가 ppt", "새찬송가 악보")
        type_combo.pack(side="left", padx=(0, 10))

        # [Relocated] 일괄 검색 및 다운로드 버튼 (상단 배치)
        # 버튼들은 아래의 전용 프레임으로 이동했습니다.

        # === [Relocated] 일괄 실행 버튼 영역 (프레임 사이 빈 공간) ===
        btn_action_frame = tk.Frame(main_frame)
        btn_action_frame.pack(fill="x", pady=(0, 10))

        self.batch_search_btn = tk.Button(btn_action_frame, text="🔍 일괄 검색", command=self.batch_search,
                                   bg="#FFD700", font=("Arial", 10, "bold"), width=15)
        self.batch_search_btn.pack(side="left", padx=(10, 5))

        self.batch_btn = tk.Button(btn_action_frame, text="📥 일괄 다운로드", command=self.batch_download,
                                   bg="#90EE90", font=("Arial", 10, "bold"), width=15)
        self.batch_btn.pack(side="left", padx=5)

        # === 검색 영역 ===
        search_frame = tk.LabelFrame(main_frame, text="개별 검색", padx=10, pady=10)
        search_frame.pack(fill="x", pady=(0, 10))

        # 검색어 입력 행
        search_input_frame = tk.Frame(search_frame)
        search_input_frame.pack(fill="x", pady=(0, 5))

        tk.Label(search_input_frame, text="검색어:").pack(side="left")

        self.search_entry = tk.Entry(search_input_frame, width=40)
        self.search_entry.pack(side="left", padx=(5, 10), fill="x", expand=True)
        self.search_entry.insert(0, "새찬송가 ppt ")
        self.search_entry.bind("<Return>", lambda e: self.do_search())

        self.search_btn = tk.Button(search_input_frame, text="검색", command=self.do_search, width=10)
        self.search_btn.pack(side="right")

        # 검색 소스 선택 체크박스
        source_frame = tk.Frame(search_frame)
        source_frame.pack(fill="x", pady=(0, 5))

        tk.Label(source_frame, text="검색 사이트:", fg="#555").pack(side="left", padx=(0, 10))
        tk.Checkbutton(source_frame, text="getwater.tistory.com", variable=self.source_getwater).pack(side="left", padx=5)
        tk.Checkbutton(source_frame, text="cwy0675.tistory.com", variable=self.source_cwy0675).pack(side="left", padx=5)
        
        # 검색 결과 누적 옵션
        option_frame = tk.Frame(search_frame)
        option_frame.pack(fill="x")
        
        tk.Checkbutton(option_frame, text="✓ 검색 결과 누적 (최대 7곡)", variable=self.cumulative_search, 
                      fg="#0066cc", font=("Arial", 9, "bold")).pack(side="left", padx=(0, 10))
        self.btn_clear_results = tk.Button(option_frame, text="결과 초기화", command=self.clear_results, bg="#ffcccc")
        self.btn_clear_results.pack(side="left")

        # === 검색 결과 영역 ===
        result_frame = tk.LabelFrame(main_frame, text="검색 결과 (클릭/드래그로 다중 선택 가능)", padx=10, pady=10)
        result_frame.pack(fill="both", expand=True, pady=(0, 10))

        # 리스트박스 + 스크롤바
        list_frame = tk.Frame(result_frame)
        list_frame.pack(fill="both", expand=True)

        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side="right", fill="y")

        self.result_listbox = tk.Listbox(list_frame, selectmode=tk.EXTENDED, yscrollcommand=scrollbar.set, height=8)
        self.result_listbox.pack(side="left", fill="both", expand=True)
        scrollbar.config(command=self.result_listbox.yview)

        self.result_listbox.bind("<Double-1>", lambda e: self.add_to_queue())

        # 선택 버튼
        btn_frame = tk.Frame(result_frame)
        btn_frame.pack(fill="x", pady=(10, 0))

        self.btn_select_first = tk.Button(btn_frame, text="첫 번째 선택", command=self.select_first)
        self.btn_select_first.pack(side="left", padx=2)
        self.btn_add_to_queue = tk.Button(btn_frame, text="→ 대기열에 추가", command=self.add_to_queue, 
                  bg="#e1f5fe", font=("Arial", 10, "bold"))
        self.btn_add_to_queue.pack(side="left", padx=2)
        self.btn_download_now = tk.Button(btn_frame, text="즉시 다운로드", command=self.select_song)
        self.btn_download_now.pack(side="left", padx=2)
        self.btn_view_post = tk.Button(btn_frame, text="🌐 포스트 보기", command=self.view_post, bg="#f5f5f5")
        self.btn_view_post.pack(side="left", padx=2)

        # === 선택된 다운로드 대기열 (NEW) ===
        queue_frame = tk.LabelFrame(main_frame, text="선택된 다운로드 대기열 (최대 7곡)", padx=10, pady=10)
        queue_frame.pack(fill="both", expand=True, pady=(0, 10))

        q_list_frame = tk.Frame(queue_frame)
        q_list_frame.pack(fill="both", expand=True)

        q_scrollbar = tk.Scrollbar(q_list_frame)
        q_scrollbar.pack(side="right", fill="y")

        self.queue_listbox = tk.Listbox(q_list_frame, selectmode=tk.SINGLE, yscrollcommand=q_scrollbar.set, height=5)
        self.queue_listbox.pack(side="left", fill="both", expand=True)
        q_scrollbar.config(command=self.queue_listbox.yview)

        q_btn_frame = tk.Frame(queue_frame)
        q_btn_frame.pack(fill="x", pady=(10, 0))

        self.btn_remove_queue = tk.Button(q_btn_frame, text="선택 삭제", command=self.remove_from_queue)
        self.btn_remove_queue.pack(side="left", padx=2)
        self.btn_clear_queue = tk.Button(q_btn_frame, text="대기열 초기화", command=self.clear_queue)
        self.btn_clear_queue.pack(side="left", padx=2)
        
        self.download_all_btn = tk.Button(q_btn_frame, text="모두 다운로드", command=self.download_queue,
                                         bg="#ccffcc", font=("Arial", 10, "bold"), width=15)
        self.download_all_btn.pack(side="right", padx=2)

        # === 저장 설정 영역 ===
        save_frame = tk.LabelFrame(main_frame, text="저장 설정", padx=10, pady=10)
        save_frame.pack(fill="x", pady=(0, 10))

        # 저장 경로
        path_frame = tk.Frame(save_frame)
        path_frame.pack(fill="x", pady=(0, 5))

        tk.Label(path_frame, text="저장 경로:").pack(side="left")
        tk.Entry(path_frame, textvariable=self.save_dir_var, width=50).pack(side="left", padx=5, fill="x", expand=True)
        self.btn_browse_save = tk.Button(path_frame, text="찾기", command=self.browse_save_dir)
        self.btn_browse_save.pack(side="right", padx=2)
        self.btn_open_folder = tk.Button(path_frame, text="📁 폴더 열기", command=self.open_folder, bg="#fff9c4")
        self.btn_open_folder.pack(side="right", padx=2)


        # 파일 번호
        num_frame = tk.Frame(save_frame)
        num_frame.pack(fill="x")

        tk.Label(num_frame, text="파일 앞 번호:").pack(side="left")
        self.number_spinbox = tk.Spinbox(num_frame, from_=1, to=99, width=5, textvariable=self.file_number_var)
        self.number_spinbox.pack(side="left", padx=5)
        tk.Label(num_frame, text="(자동 증가)").pack(side="left", padx=5)

        # === 상태 영역 ===
        status_frame = tk.Frame(main_frame)
        status_frame.pack(fill="x", pady=(0, 5))

        self.status_label = tk.Label(status_frame, text="찬송가 번호를 입력하고 일괄 다운로드를 누르세요.", anchor="w", fg="blue")
        self.status_label.pack(fill="x")

        # 진행률 바
        self.progress = ttk.Progressbar(status_frame, mode='determinate', length=300)
        self.progress.pack(fill="x", pady=(5, 0))

        # 버튼 포커스 비활성화 (Tab 키로 버튼 건너뛰기)
        self.disable_button_focus(self.root)

    def disable_button_focus(self, widget):
        """Recursively disable focus for all Button widgets."""
        if isinstance(widget, tk.Button):
            widget.config(takefocus=0)
        for child in widget.winfo_children():
            self.disable_button_focus(child)

    def parse_song_numbers(self, input_text):
        """
        찬송가 번호 입력을 파싱합니다.
        예: "28, 29, 30" 또는 "28-32" → [28, 29, 30, 31, 32]
        복잡한 입력(예: "3( 436, 204, 288)")도 처리합니다.
        """
        numbers = []
        if not input_text or "예:" in input_text:
            return []

        # 불필요한 괄호 등을 쉼표로 치환하여 분리하기 쉽게 만듦
        cleaned = input_text.replace('(', ',').replace(')', ',').replace('[', ',').replace(']', ',')
        
        parts = [p.strip() for p in cleaned.split(',')]

        for part in parts:
            if not part: continue
            
            # 범위 확인 (예: 28-32)
            # 숫자와 숫자 사이에 하이픈이 있는 경우
            range_match = re.search(r'(\d+)\s*-\s*(\d+)', part)
            if range_match:
                try:
                    start = int(range_match.group(1))
                    end = int(range_match.group(2))
                    if start <= end:
                        numbers.extend(range(start, end + 1))
                    continue
                except:
                    pass
            
            # 범위가 아니면 포함된 모든 숫자 추출
            found_nums = re.findall(r'\d+', part)
            for num_str in found_nums:
                try:
                    numbers.append(int(num_str))
                except:
                    pass

        return numbers

    def batch_search(self):
        """일괄 검색 실행"""
        input_text = self.batch_entry.get().strip()
        if not input_text or "예:" in input_text:
            messagebox.showwarning("경고", "찬송가 번호를 입력하세요.")
            return

        numbers = self.parse_song_numbers(input_text)
        if not numbers:
            messagebox.showwarning("경고", "검색할 번호가 없습니다.")
            return

        song_type = self.song_type_var.get()
        
        # 일괄 검색 시작
        self.status_label.config(text=f"일괄 검색 시작: {len(numbers)}곡...")
        self.batch_search_btn.config(state="disabled")
        self.batch_btn.config(state="disabled")
        self.search_btn.config(state="disabled")
        
        # 검색 결과 초기화 (누적 여부와 상관없이 일괄 검색은 보통 새로운 세트로 간주하지만, 
        # 사용자가 혼동하지 않도록 기존 결과 유지 여부는 옵션을 따름)
        if not self.cumulative_search.get():
            self.result_listbox.delete(0, tk.END)
            self.search_results = []
        
        threading.Thread(target=self._batch_search_thread, args=(numbers, song_type), daemon=True).start()

    def _batch_search_thread(self, numbers, song_type):
        """일괄 검색 스레드"""
        total = len(numbers)
        found_count = 0
        
        sources = []
        if self.source_getwater.get(): sources.append('getwater')
        if self.source_cwy0675.get(): sources.append('cwy0675')
        
        if not sources:
            self.root.after(0, lambda: messagebox.showerror("오류", "검색 사이트를 선택하세요."))
            self.root.after(0, lambda: self.batch_search_btn.config(state="normal"))
            return

        for i, num in enumerate(numbers):
            try:
                self.root.after(0, lambda n=num, idx=i+1, t=total:
                    self.status_label.config(text=f"[{idx}/{t}] {n}장 검색 중..."))
                
                keyword = f"{song_type} {num}장"
                results = search_songs(keyword, sources=sources)
                
                if results:
                    # 정확한 매칭만 필터링 (예: "28장" 검색 시 "128장", "228장" 등 제외)
                    # 패턴: 공백 또는 시작 + 숫자 + "장"
                    pattern = r'(?:^|\s)' + str(num) + r'장(?:\s|$|[^\d])'
                    filtered_results = [r for r in results if re.search(pattern, r['title'])]
                    
                    if filtered_results:
                        found_count += 1
                        # 각 소스당 최상위 1개씩만 선택하여 노이즈 최소화
                        best_results = []
                        for source in sources:
                            source_results = [r for r in filtered_results if r['source'] == source]
                            if source_results:
                                best_results.append(source_results[0])
                        
                        self.search_results.extend(best_results)
            except:
                pass
        
        # UI 업데이트
        self.root.after(0, lambda: self._on_batch_search_complete(found_count, total))

    def _on_batch_search_complete(self, found, total):
        self.batch_search_btn.config(state="normal")
        self.batch_btn.config(state="normal")
        self.search_btn.config(state="normal")
        
        # 중복 제거
        if self.cumulative_search.get():
             # 중복 제거 (URL 기준)
            seen_urls = set()
            unique_results = []
            for r in self.search_results:
                if r['url'] not in seen_urls:
                    seen_urls.add(r['url'])
                    unique_results.append(r)
            self.search_results = unique_results
        
        self._redisplay_results()
        self.status_label.config(text=f"일괄 검색 완료: {found}/{total}곡 찾음 (총 {len(self.search_results)}개 결과)")
        messagebox.showinfo("완료", f"일괄 검색이 완료되었습니다.\n{found}/{total}곡을 찾았습니다.")

    def batch_download(self):
        """일괄 다운로드 실행"""
        if self.is_batch_downloading:
            messagebox.showwarning("경고", "이미 다운로드가 진행 중입니다.")
            return

        input_text = self.batch_entry.get().strip()
        if not input_text or "예:" in input_text:
            messagebox.showwarning("경고", "찬송가 번호를 입력하세요.\n예: 28, 29, 30 또는 28-32")
            return

        numbers = self.parse_song_numbers(input_text)

        if not numbers:
            messagebox.showwarning("경고", "올바른 번호 형식을 입력하세요.\n예: 28, 29, 30 또는 28-32")
            return

        # 확인
        song_type = self.song_type_var.get()
        msg = f"{len(numbers)}개의 곡을 다운로드합니다.\n\n"
        msg += f"종류: {song_type}\n"
        msg += f"번호: {', '.join(map(str, numbers[:10]))}"
        if len(numbers) > 10:
            msg += f"... (+{len(numbers)-10}개)"
        msg += f"\n\n계속하시겠습니까?"

        if not messagebox.askyesno("확인", msg):
            return

        # 일괄 다운로드 시작
        self.is_batch_downloading = True
        self.batch_cancel_flag = False
        self.batch_btn.config(state="disabled", text="다운로드 중...")
        self.search_btn.config(state="disabled")

        threading.Thread(target=self._batch_download_thread, args=(numbers, song_type), daemon=True).start()

    def _batch_download_thread(self, numbers, song_type):
        """일괄 다운로드 스레드"""
        total = len(numbers)
        success_count = 0
        failed_list = []
        downloaded_files = []

        # 선택된 검색 소스 확인
        sources = []
        if self.source_getwater.get():
            sources.append('getwater')
        if self.source_cwy0675.get():
            sources.append('cwy0675')
        
        if not sources:
            self.root.after(0, lambda: messagebox.showerror("오류", "검색 사이트를 최소 1개 이상 선택해주세요."))
            self.root.after(0, lambda: self._on_batch_complete(total, 0, ["검색 사이트 미선택"], []))
            return

        for i, num in enumerate(numbers):
            if self.batch_cancel_flag:
                break

            try:
                # 상태 업데이트
                self.root.after(0, lambda n=num, idx=i+1, t=total:
                    self.status_label.config(text=f"[{idx}/{t}] {n}장 검색 중..."))

                # 검색어 생성
                keyword = f"{song_type} {num}장"

                # 선택된 소스에서만 검색
                results = search_songs(keyword, sources=sources)

                if not results:
                    failed_list.append(f"{num}장 (검색 결과 없음)")
                    continue

                # 첫 번째 결과 다운로드 정보 가져오기
                self.root.after(0, lambda n=num, idx=i+1, t=total:
                    self.status_label.config(text=f"[{idx}/{t}] {n}장 다운로드 준비 중..."))

                info = get_download_info(results[0]['url'])

                if not info['download_url']:
                    failed_list.append(f"{num}장 (다운로드 링크 없음)")
                    continue

                # 파일명 생성
                filename = info['filename'] or f"{num}장.ppt"
                filename = sanitize_filename(filename)

                # 번호 추가
                current_num = int(self.file_number_var.get()) + i
                new_filename = f"{current_num}. {filename}"

                # 저장 경로
                save_dir = self.save_dir_var.get()
                save_path = os.path.join(save_dir, new_filename)

                # 중복 파일 건너뛰기
                if os.path.exists(save_path):
                    self.root.after(0, lambda n=num:
                        self.status_label.config(text=f"{n}장 이미 존재 (건너뜀)"))
                    continue

                # 다운로드
                self.root.after(0, lambda n=num, idx=i+1, t=total:
                    self.status_label.config(text=f"[{idx}/{t}] {n}장 다운로드 중..."))

                def update_progress(percent):
                    overall_progress = ((i + percent/100) / total) * 100
                    self.root.after(0, lambda p=overall_progress: self.progress.configure(value=p))

                download_file(info['download_url'], save_path, progress_callback=update_progress)

                success_count += 1
                downloaded_files.append(new_filename)
                self.root.after(0, lambda n=num:
                    self.status_label.config(text=f"{n}장 완료!"))

            except Exception as e:
                failed_list.append(f"{num}장 ({str(e)[:30]})")

        # 완료
        self.root.after(0, lambda: self._on_batch_complete(total, success_count, failed_list, downloaded_files))

    def _on_batch_complete(self, total, success, failed_list, downloaded_files=[]):
        """일괄 다운로드 완료"""
        self.is_batch_downloading = False
        self.batch_btn.config(state="normal", text="일괄 다운로드")
        self.search_btn.config(state="normal")
        self.progress['value'] = 100

        # 번호 업데이트
        try:
            new_num = int(self.file_number_var.get()) + success
            self.file_number_var.set(str(new_num))
        except:
            pass
            
        # Call the external callback if provided (e.g. to Notify Main App)
        # Call the external callback if provided (e.g. to Notify Main App)
        if self.on_download_complete:
            # Pass success count, failed list, AND the list of actual filenames
            self.on_download_complete(success, failed_list, downloaded_files)

        # 결과 메시지
        msg = f"일괄 다운로드 완료!\n\n"
        msg += f"총 {total}곡 중 {success}곡 성공\n"

        if failed_list:
            msg += f"\n실패: {len(failed_list)}곡\n"
            msg += "\n".join(failed_list[:10])
            if len(failed_list) > 10:
                msg += f"\n... (+{len(failed_list)-10}개)"

        self.status_label.config(text=f"완료: {success}/{total}곡 성공")
        messagebox.showinfo("완료", msg)

        # 폴더 열기
        if success > 0 and messagebox.askyesno("확인", "저장 폴더를 여시겠습니까?"):
            os.startfile(self.save_dir_var.get())

    def browse_save_dir(self):
        """저장 폴더 선택"""
        initial = self.save_dir_var.get()
        if not os.path.exists(initial):
            initial = os.getcwd()

        path = filedialog.askdirectory(initialdir=initial)
        if path:
            self.save_dir_var.set(path)

    def open_folder(self):
        """저장 폴더 열기"""
        path = self.save_dir_var.get()
        if os.path.exists(path):
            os.startfile(path)
        else:
            messagebox.showwarning("경고", "폴더가 존재하지 않습니다.")

    def view_post(self):
        """선택한 곡의 블로그 포스트 보기"""
        selection = self.result_listbox.curselection()
        if not selection:
            messagebox.showwarning("경고", "포스트를 볼 곡을 선택하세요.")
            return

        index = selection[0]
        if index < len(self.search_results):
            url = self.search_results[index]['url']
            webbrowser.open(url)


    def do_search(self):
        """개별 검색 실행"""
        keyword = self.search_entry.get().strip()
        
        # 안전 장치: 기본 검색어 상태에서 일괄 다운로드 입력창에 내용이 있는 경우
        default_keywords = ["새찬송가 ppt", "새찬송가 ppt "]
        batch_input = self.batch_entry.get().strip()
        if keyword in default_keywords and batch_input and "예:" not in batch_input:
            msg = "현재 '개별 검색' 버튼을 누르셨습니다.\n검색어: " + keyword + "\n\n"
            msg += "'일괄 다운로드' 입력창에 숫자가 있습니다.\n'일괄 검색' 또는 '일괄 다운로드'를 하시려던 것인가요?\n\n"
            msg += "그래도 현재 검색어(" + keyword + ")로 검색하시겠습니까?"
            if not messagebox.askyesno("확인", msg):
                return

        if not keyword:
            messagebox.showwarning("경고", "검색어를 입력하세요.")
            return

        self.status_label.config(text=f"'{keyword}' 검색 중...")
        self.search_btn.config(state="disabled")
        
        # 누적 모드가 아니면 결과 초기화 (Option A의 기본 동작: 검색 결과는 교체됨)
        if not self.cumulative_search.get():
            self.result_listbox.delete(0, tk.END)
            self.search_results = []
        
        self.progress['value'] = 0

        # 스레드로 검색
        threading.Thread(target=self._search_thread, args=(keyword,), daemon=True).start()

    def add_to_queue(self):
        """선택한 곡을 대기열에 추가 (여러 곡 선택 가능)"""
        selection = self.result_listbox.curselection()
        if not selection:
            messagebox.showwarning("경고", "대기열에 추가할 곡을 선택하세요.")
            return

        # 선택된 모든 항목 가져오기
        selected_results = [self.search_results[idx] for idx in selection]

        # 현재 대기열 크기 확인
        current_queue_size = len(self.selected_queue)
        available_slots = 7 - current_queue_size

        if available_slots <= 0:
            messagebox.showwarning("제한", "대기열에는 최대 7곡까지만 추가할 수 있습니다.")
            return

        # 중복 제거 및 추가
        added_count = 0
        skipped_count = 0

        for result in selected_results:
            # 대기열 용량 체크
            if len(self.selected_queue) >= 7:
                remaining = len(selected_results) - (added_count + skipped_count)
                if remaining > 0:
                    messagebox.showwarning("제한", f"대기열 용량 초과로 {remaining}곡은 추가되지 않았습니다.\n(최대 7곡)")
                break

            # 중복 체크
            if any(r['url'] == result['url'] for r in self.selected_queue):
                skipped_count += 1
                continue

            self.selected_queue.append(result)
            added_count += 1

        self._redisplay_queue()

        # 상태 메시지
        if added_count > 0 and skipped_count > 0:
            self.status_label.config(text=f"{added_count}곡 추가됨, {skipped_count}곡 중복 제외 (총 {len(self.selected_queue)}곡)")
        elif added_count > 0:
            self.status_label.config(text=f"{added_count}곡 대기열에 추가됨 (총 {len(self.selected_queue)}곡)")
        else:
            self.status_label.config(text="선택한 곡이 모두 이미 대기열에 포함되어 있습니다.")
            messagebox.showinfo("정보", "선택한 곡이 모두 이미 대기열에 포함되어 있습니다.")

    def remove_from_queue(self):
        """대기열에서 선택한 곡 삭제"""
        selection = self.queue_listbox.curselection()
        if not selection:
            return

        index = selection[0]
        removed = self.selected_queue.pop(index)
        self._redisplay_queue()
        self.status_label.config(text=f"'{removed['title']}' 대기열에서 삭제됨")

    def clear_queue(self):
        """대기열 전체 초기화"""
        if not self.selected_queue:
            return
        
        if messagebox.askyesno("확인", "대기열의 모든 곡을 삭제하시겠습니까?"):
            self.selected_queue = []
            self._redisplay_queue()
            self.status_label.config(text="대기열이 비워졌습니다.")

    def _redisplay_queue(self):
        """대기열 리스트박스 갱신"""
        self.queue_listbox.delete(0, tk.END)
        for i, result in enumerate(self.selected_queue):
            source = result.get('source', 'unknown')
            title = result['title']
            self.queue_listbox.insert(tk.END, f"{i+1}. [{source}] {title}")
        
        # 마지막 항목 선택
        if self.selected_queue:
            self.queue_listbox.selection_set(tk.END)

    def download_queue(self):
        """대기열에 있는 모든 곡 다운로드"""
        if not self.selected_queue:
            messagebox.showwarning("경고", "다운로드할 곡이 대기열에 없습니다.")
            return

        if self.is_batch_downloading:
            messagebox.showwarning("경고", "이미 다운로드가 진행 중입니다.")
            return

        msg = f"{len(self.selected_queue)}개의 곡을 대기열에서 다운로드합니다.\n계속하시겠습니까?"
        if not messagebox.askyesno("확인", msg):
            return

        # 다운로드 시작
        self.is_batch_downloading = True
        self.batch_cancel_flag = False
        self.download_all_btn.config(state="disabled", text="다운로드 중...")
        
        threading.Thread(target=self._download_queue_thread, daemon=True).start()

    def download_selected_items(self, items, callback=None):
        """외부에서 호출: 선택된 항목 리스트를 다운로드하고 callback(filename)을 호출"""
        if not items: return
        
        # 다운로드 로직 재사용을 위해 스레드 시작
        threading.Thread(target=self._download_items_thread, args=(items, callback), daemon=True).start()

    def _download_items_thread(self, items, callback):
        """특정 항목 리스트 다운로드 스레드"""
        total = len(items)
        success_count = 0
        
        for i, result in enumerate(items):
            try:
                self.root.after(0, lambda r=result, idx=i+1, t=total:
                    self.status_label.config(text=f"전송 중... [{idx}/{t}] '{r['title']}'"))

                info = get_download_info(result['url'])
                if not info['download_url']: continue

                filename = info['filename'] or f"{result['title']}.ppt"
                filename = sanitize_filename(filename)
                
                # 파일 번호 사용 안 함 (전송 모드에서는 번호 없이 또는 기존 번호 유지?)
                # 사용자 요구: 그냥 다운받아서 리스트에 넣기를 원함.
                # 번호가 필요하면 file_number_var 사용.
                current_num = int(self.file_number_var.get())
                new_filename = f"{current_num}. {filename}"
                
                save_dir = self.save_dir_var.get()
                save_path = os.path.join(save_dir, new_filename)

                # 이미 있으면 그냥 사용
                if not os.path.exists(save_path):
                    download_file(info['download_url'], save_path)
                
                # 성공 처리
                success_count += 1
                self.root.after(0, lambda n=current_num: self.file_number_var.set(str(n + 1)))
                
                if callback:
                    self.root.after(0, lambda f=new_filename: callback(f))
                    
            except Exception as e:
                print(f"Error downloading {result['title']}: {e}")

        self.root.after(0, lambda: self.status_label.config(text=f"전송 완료: {success_count}곡"))

    def _download_queue_thread(self):
        """대기열 다운로드 스레드"""
        queue_to_download = list(self.selected_queue)
        total = len(queue_to_download)
        success_count = 0
        failed_list = []
        downloaded_files = []

        for i, result in enumerate(queue_to_download):
            if self.batch_cancel_flag:
                break

            try:
                self.root.after(0, lambda r=result, idx=i+1, t=total:
                    self.status_label.config(text=f"[{idx}/{t}] '{r['title']}' 정보 가져오는 중..."))

                info = get_download_info(result['url'])
                if not info['download_url']:
                    failed_list.append(f"{result['title']} (링크 없음)")
                    continue

                # 파일명 생성
                filename = info['filename'] or f"{result['title']}.ppt"
                filename = sanitize_filename(filename)

                # 파일 번호 (현재 설정된 번호부터 자동 증가)
                current_num = int(self.file_number_var.get())
                new_filename = f"{current_num}. {filename}"

                # 저장 경로
                save_dir = self.save_dir_var.get()
                save_path = os.path.join(save_dir, new_filename)

                # 중복 체크
                if os.path.exists(save_path):
                    success_count += 1
                    downloaded_files.append(new_filename)
                    self.root.after(0, lambda n=current_num: self.file_number_var.set(str(n + 1)))
                    continue

                self.root.after(0, lambda r=result, idx=i+1, t=total:
                    self.status_label.config(text=f"[{idx}/{t}] '{r['title']}' 다운로드 중..."))

                def update_progress(percent):
                    overall_progress = ((i + percent/100) / total) * 100
                    self.root.after(0, lambda p=overall_progress: self.progress.configure(value=p))

                download_file(info['download_url'], save_path, progress_callback=update_progress)
                
                success_count += 1
                downloaded_files.append(new_filename)
                # 실시간 번호 증가
                self.root.after(0, lambda n=current_num: self.file_number_var.set(str(n + 1)))

            except Exception as e:
                failed_list.append(f"{result['title']} ({str(e)[:20]})")

        self.root.after(0, lambda: self._on_download_queue_complete(total, success_count, failed_list, downloaded_files))

    def _on_download_queue_complete(self, total, success, failed_list, downloaded_files=[]):
        """대기열 다운로드 완료 콜백"""
        self.is_batch_downloading = False
        self.download_all_btn.config(state="normal", text="모두 다운로드")
        self.progress['value'] = 100
        
        # Call the external callback
        # Call the external callback
        if self.on_download_complete:
             self.on_download_complete(success, failed_list, downloaded_files)

        msg = f"대기열 다운로드 완료!\n\n총 {total}곡 중 {success}곡 성공"
        if failed_list:
            msg += f"\n실패: {len(failed_list)}곡\n" + "\n".join(failed_list[:5])

        self.status_label.config(text=f"대기열 완료: {success}/{total}곡 성공")
        messagebox.showinfo("완료", msg)
        
        if success > 0 and messagebox.askyesno("대기열 비우기", "성공적으로 다운로드된 곡들을 대기열에서 삭제할까요?"):
            self.selected_queue = []
            self._redisplay_queue()

    def clear_results(self):
        """검색 결과 초기화"""
        self.result_listbox.delete(0, tk.END)
        self.search_results = []
        self.progress['value'] = 0
        self.status_label.config(text="검색 결과가 초기화되었습니다.")

    def _search_thread(self, keyword):
        """검색 스레드"""
        try:
            # 선택된 검색 소스 확인
            sources = []
            if self.source_getwater.get():
                sources.append('getwater')
            if self.source_cwy0675.get():
                sources.append('cwy0675')
            
            if not sources:
                raise Exception("검색 사이트를 최소 1개 이상 선택해주세요.")
            
            results = search_songs(keyword, sources=sources)
            self.root.after(0, lambda: self._on_search_complete(results))
        except Exception as e:
            self.root.after(0, lambda: self._on_search_error(str(e)))

    def _on_search_complete(self, results):
        """검색 완료 콜백"""
        self.search_btn.config(state="normal")
        
        if not results:
            self.status_label.config(text="검색 결과가 없습니다.")
            return
        
        # 정밀 필터 적용 (검색어에 숫자가 포함된 경우)
        keyword = self.search_entry.get().strip()
        num_match = re.search(r'\d+', keyword)
        if num_match:
            num = num_match.group()
            pattern = r'(?:^|\s)' + num + r'장(?:\s|$|[^\d])'
            # 숫자가 포함된 검색어라면 해당 숫자 장수만 필터링
            results = [r for r in results if re.search(pattern, r['title'])]
            if results:
                self.status_label.config(text=f"정밀 필터 적용됨 ({len(results)}건)")
        
        # 누적 모드: 기존 결과에 추가
        if self.cumulative_search.get():
            self.search_results.extend(results)
            # 중복 제거 (URL 기준)
            seen_urls = set()
            unique_results = []
            for r in self.search_results:
                if r['url'] not in seen_urls:
                    seen_urls.add(r['url'])
                    unique_results.append(r)
            self.search_results = unique_results
        else:
            # 누적 모드 아닐 때: 교체
            self.search_results = results
        
        # 결과 표시
        self._redisplay_results()
        
        # 누적 모드 상태 표시
        total_count = len(self.search_results)
        new_count = len(results)
        if self.cumulative_search.get():
            self.status_label.config(text=f"검색 완료: +{new_count}개 추가 (총 {total_count}곡)")
        else:
            self.status_label.config(text=f"검색 완료: {total_count}개 결과")
    
    def _redisplay_results(self):
        """검색 결과 재표시"""
        self.result_listbox.delete(0, tk.END)
        for i, result in enumerate(self.search_results):
            source = result.get('source', 'unknown')
            title = result['title']
            self.result_listbox.insert(tk.END, f"{i+1}. [{source}] {title}")
        
        # 첫 번째 항목 선택
        if self.search_results:
            self.result_listbox.selection_set(0)

    def _on_search_error(self, error):
        """검색 오류 콜백"""
        self.search_btn.config(state="normal")
        self.status_label.config(text=f"검색 오류: {error}")
        messagebox.showerror("오류", f"검색 중 오류 발생:\n{error}")

    def select_first(self):
        """첫 번째 결과 선택"""
        if self.search_results:
            self.result_listbox.selection_clear(0, tk.END)
            self.result_listbox.selection_set(0)
            self.select_song()

    def select_song(self):
        """선택한 곡 다운로드"""
        selection = self.result_listbox.curselection()
        if not selection:
            messagebox.showwarning("경고", "다운로드할 곡을 선택하세요.")
            return

        index = selection[0]
        if index >= len(self.search_results):
            return

        result = self.search_results[index]
        self.status_label.config(text=f"'{result['title']}' 정보 가져오는 중...")

        # 스레드로 다운로드 정보 가져오기
        threading.Thread(target=self._download_thread, args=(result,), daemon=True).start()

    def _download_thread(self, result):
        """개별 다운로드 스레드"""
        try:
            # 다운로드 정보 가져오기
            self.root.after(0, lambda: self.status_label.config(text="다운로드 정보 확인 중..."))
            info = get_download_info(result['url'])

            if not info['download_url']:
                raise Exception("다운로드 링크를 찾을 수 없습니다.")

            # 파일명 생성
            filename = info['filename'] or f"{result['title']}.ppt"
            filename = sanitize_filename(filename)

            # 번호 추가
            file_number = self.file_number_var.get()
            new_filename = f"{file_number}. {filename}"

            # 저장 경로
            save_dir = self.save_dir_var.get()
            save_path = os.path.join(save_dir, new_filename)

            # 파일 중복 확인
            if os.path.exists(save_path):
                def ask_overwrite():
                    return messagebox.askyesno("확인", f"파일이 이미 존재합니다.\n{new_filename}\n\n덮어쓰시겠습니까?")

                # 메인 스레드에서 대화상자 표시
                result_var = [None]
                def show_dialog():
                    result_var[0] = ask_overwrite()
                self.root.after(0, show_dialog)

                # 대기
                import time
                while result_var[0] is None:
                    time.sleep(0.1)

                if not result_var[0]:
                    self.root.after(0, lambda: self._on_download_cancel())
                    return

            # 다운로드 시작
            self.root.after(0, lambda: self.status_label.config(text=f"다운로드 중: {new_filename}"))

            def update_progress(percent):
                self.root.after(0, lambda p=percent: self.progress.configure(value=p))

            download_file(info['download_url'], save_path, progress_callback=update_progress)

            # 완료
            self.root.after(0, lambda: self._on_download_complete(new_filename, save_path))

        except Exception as e:
            self.root.after(0, lambda: self._on_download_error(str(e)))

    def _on_download_complete(self, filename, save_path):
        """개별 다운로드 완료 콜백"""
        self.progress['value'] = 100
        self.status_label.config(text=f"다운로드 완료: {filename}")

        # 번호 증가
        try:
            current_num = int(self.file_number_var.get())
            self.file_number_var.set(str(current_num + 1))
        except:
            pass

        messagebox.showinfo("완료", f"다운로드 완료!\n\n파일: {filename}\n경로: {save_path}")

        # 폴더 열기 옵션
        if messagebox.askyesno("확인", "저장 폴더를 여시겠습니까?"):
            os.startfile(os.path.dirname(save_path))

    def _on_download_error(self, error):
        """다운로드 오류 콜백"""
        self.progress['value'] = 0
        self.status_label.config(text=f"다운로드 오류: {error}")
        messagebox.showerror("오류", f"다운로드 실패:\n{error}")

    def _on_download_cancel(self):
        """다운로드 취소 콜백"""
        self.progress['value'] = 0
        self.status_label.config(text="다운로드 취소됨")


def launch():
    """독립 실행 또는 외부에서 호출용"""
    root = tk.Tk()
    app = SongDownloaderApp(root)
    root.mainloop()


if __name__ == "__main__":
    launch()
