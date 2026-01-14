import React, { useState, useRef } from 'react';
import { Save, User, Clock, Calendar, Hash, Download, Upload, FolderOpen, AlertCircle, CheckCircle } from 'lucide-react';

export default function Settings({ data, onUpdate, onImportData }) {
    const [saved, setSaved] = useState(false);
    const [exportStatus, setExportStatus] = useState(null); // null, 'success', 'error'
    const [importStatus, setImportStatus] = useState(null); // null, 'success', 'error'
    const fileInputRef = useRef(null);

    // 저장 경로 설정 (UI 표시용)
    const currentYear = new Date().getFullYear();
    const defaultSavePath = `amir-learning-planner/data/${currentYear}`;
    const [savePath, setSavePath] = useState(data.settings?.savePath || defaultSavePath);

    const handleChange = (path, value) => {
        onUpdate(path, value);
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    // 데이터 내보내기
    const handleExport = () => {
        try {
            const exportData = {
                ...data,
                exportedAt: new Date().toISOString(),
                version: '1.0',
                savePath: savePath
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const today = new Date().toISOString().split('T')[0];
            const filename = `amir-planner-backup-${currentYear}-${today}.json`;

            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportStatus('success');
            setTimeout(() => setExportStatus(null), 3000);
        } catch (error) {
            console.error('Export failed:', error);
            setExportStatus('error');
            setTimeout(() => setExportStatus(null), 3000);
        }
    };

    // 데이터 가져오기
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                // 데이터 유효성 검사
                if (!importedData.user || !importedData.dailyGoals) {
                    throw new Error('Invalid data format');
                }

                // 부모 컴포넌트로 전달
                if (onImportData) {
                    onImportData(importedData);
                }

                setImportStatus('success');
                setTimeout(() => setImportStatus(null), 3000);
            } catch (error) {
                console.error('Import failed:', error);
                setImportStatus('error');
                setTimeout(() => setImportStatus(null), 3000);
            }
        };
        reader.readAsText(file);

        // 파일 입력 초기화
        event.target.value = '';
    };

    // 저장 경로 변경
    const handleSavePathChange = (newPath) => {
        setSavePath(newPath);
        handleChange('settings.savePath', newPath);
    };

    const lang = data?.user?.language || 'ko';

    const t = {
        title: lang === 'en' ? 'Settings' : '설정',
        subtitle: lang === 'en' ? 'Set your own learning goals and environment.' : '나만의 학습 목표와 환경을 설정하세요.',
        basicInfo: lang === 'en' ? 'Basic Info' : '기본 정보',
        name: lang === 'en' ? 'Name' : '이름',
        language: lang === 'en' ? 'Language' : 'Language / 언어',
        strategyGuide: lang === 'en' ? 'Strategy Guide' : '전략 가이드 표시',
        strategyDesc: lang === 'en' ? 'Shows daily learning strategy on top.' : '데스크탑 상단에 일일 학습 전략을 보여줍니다.',
        examSchedule: lang === 'en' ? 'Exam Schedule' : '시험 일정',
        level2: lang === 'en' ? 'Accounting Level 2' : '전산회계 2급',
        level1: lang === 'en' ? 'Accounting Level 1' : '전산회계 1급',
        dailyGoals: lang === 'en' ? 'Daily Goals (Hours)' : '일일 목표 (시간)',
        weeklyGoals: lang === 'en' ? 'Weekly Goals (Hours)' : '주간 목표 (시간)',
        dataManagement: lang === 'en' ? 'Data Management' : '데이터 관리',
        savePath: lang === 'en' ? 'Save Path (Reference)' : '저장 경로 (참고용)',
        savePathDesc: lang === 'en' ? '* Actually stored in browser localStorage. This is for reference when exporting.' : '* 웹앱 특성상 실제 저장은 브라우저 localStorage에 됩니다. 이 경로는 내보낸 파일을 저장할 위치를 기억하기 위한 참고용입니다.',
        exportTitle: lang === 'en' ? 'Export Data' : '데이터 내보내기',
        exportDesc: lang === 'en' ? 'Save all records and settings as a JSON file.' : '모든 학습 기록, 설정, 회고록을 JSON 파일로 저장합니다.',
        exportBtn: lang === 'en' ? 'Export to JSON' : 'JSON 파일로 내보내기',
        importTitle: lang === 'en' ? 'Import Data' : '데이터 가져오기',
        importDesc: lang === 'en' ? 'Restore data from a previously exported JSON file.' : '이전에 내보낸 JSON 파일을 불러와 데이터를 복원합니다.',
        importBtn: lang === 'en' ? 'Import from JSON' : 'JSON 파일 가져오기',
        importWarning: lang === 'en' ? '* Current data will be overwritten.' : '* 가져오기 시 현재 데이터가 덮어씌워집니다.',
        currentData: lang === 'en' ? 'Current Data Status' : '현재 저장된 데이터',
        records: lang === 'en' ? 'Study Records' : '학습 기록',
        phrases: lang === 'en' ? 'English Phrases' : '영어 표현',
        materials: lang === 'en' ? 'Materials' : '업로드 자료',
        lastModified: lang === 'en' ? 'Last Modified' : '마지막 수정',
        saveBtn: lang === 'en' ? 'Save Settings' : '설정 저장하기',
        saved: lang === 'en' ? 'Saved!' : '저장 완료!',
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <header className="mb-8">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{t.title}</h2>
                <p className="text-gray-400 font-bold mt-2">{t.subtitle}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Profile Section */}
                <section className="bg-white rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <User size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{t.basicInfo}</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">{t.name}</label>
                            <input
                                type="text"
                                value={data.user.name}
                                onChange={(e) => handleChange('user.name', e.target.value)}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="pt-2">
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">{t.language}</label>
                            <select
                                value={data.user.language}
                                onChange={(e) => handleChange('user.language', e.target.value)}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                            >
                                <option value="ko">한국어 (Korean)</option>
                                <option value="en">English (영어)</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between pt-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900">{t.strategyGuide}</label>
                                <p className="text-xs text-gray-400 font-medium">{t.strategyDesc}</p>
                            </div>
                            <button
                                onClick={() => handleChange('user.showStrategy', !data.user.showStrategy)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${data.user.showStrategy ? 'bg-primary' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.user.showStrategy ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Exam Schedule Section */}
                <section className="bg-white rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                            <Calendar size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{t.examSchedule}</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">{t.level2}</label>
                            <input
                                type="date"
                                value={data.accounting.level2.examDate}
                                onChange={(e) => handleChange('accounting.level2.examDate', e.target.value)}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">{t.level1}</label>
                            <input
                                type="date"
                                value={data.accounting.level1.examDate}
                                onChange={(e) => handleChange('accounting.level1.examDate', e.target.value)}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* Daily Goals Section */}
                <section className="bg-white rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                            <Clock size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{t.dailyGoals}</h3>
                    </div>
                    <div className="space-y-6">
                        {Object.entries(data.dailyGoals).map(([key, value]) => (
                            <div key={key}>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                                        {lang === 'en' ? key.toUpperCase() : key === 'accounting' ? '회계' : key === 'english' ? '영어' : 'AI'}
                                    </label>
                                    <span className="text-sm font-black text-blue-600">{value}h</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="5"
                                    step="0.5"
                                    value={value}
                                    onChange={(e) => handleChange(`dailyGoals.${key}`, parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Weekly Goals Section */}
                <section className="bg-white rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-green-100 rounded-xl text-green-600">
                            <Hash size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{t.weeklyGoals}</h3>
                    </div>
                    <div className="space-y-6">
                        {Object.entries(data.weeklyGoals).map(([key, value]) => (
                            <div key={key}>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                                        {lang === 'en' ? key.toUpperCase() : key === 'accounting' ? '회계' : key === 'english' ? '영어' : 'AI'}
                                    </label>
                                    <span className="text-sm font-black text-green-600">{value}h</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    step="0.5"
                                    value={value}
                                    onChange={(e) => handleChange(`weeklyGoals.${key}`, parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Data Management Section */}
                <section className="bg-white rounded-[2rem] p-8 shadow-sm md:col-span-2">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                            <FolderOpen size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{t.dataManagement}</h3>
                    </div>

                    <div className="space-y-6">
                        {/* 저장 경로 설정 */}
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                {t.savePath}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={savePath}
                                    onChange={(e) => handleSavePathChange(e.target.value)}
                                    className="flex-1 bg-gray-50 rounded-xl px-4 py-3 font-mono text-sm text-gray-700 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    placeholder="amir-learning-planner/data/2026"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                {t.savePathDesc}
                            </p>
                        </div>

                        {/* 내보내기/가져오기 버튼 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            {/* 내보내기 */}
                            <div className="p-6 bg-blue-50 rounded-2xl">
                                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <Download size={18} />
                                    {t.exportTitle}
                                </h4>
                                <p className="text-sm text-blue-700 mb-4">
                                    {t.exportDesc}
                                </p>
                                <button
                                    onClick={handleExport}
                                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${exportStatus === 'success'
                                        ? 'bg-green-500 text-white'
                                        : exportStatus === 'error'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    {exportStatus === 'success' ? (
                                        <>
                                            <CheckCircle size={18} />
                                            {lang === 'en' ? 'Export Successful!' : '내보내기 완료!'}
                                        </>
                                    ) : exportStatus === 'error' ? (
                                        <>
                                            <AlertCircle size={18} />
                                            {lang === 'en' ? 'Error' : '오류 발생'}
                                        </>
                                    ) : (
                                        <>
                                            <Download size={18} />
                                            {t.exportBtn}
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-blue-600 mt-2 text-center">
                                    {lang === 'en' ? 'Filename' : '파일명'}: amir-planner-backup-{currentYear}-{new Date().toISOString().split('T')[0]}.json
                                </p>
                            </div>

                            {/* 가져오기 */}
                            <div className="p-6 bg-emerald-50 rounded-2xl">
                                <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                    <Upload size={18} />
                                    {t.importTitle}
                                </h4>
                                <p className="text-sm text-emerald-700 mb-4">
                                    {t.importDesc}
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${importStatus === 'success'
                                        ? 'bg-green-500 text-white'
                                        : importStatus === 'error'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        }`}
                                >
                                    {importStatus === 'success' ? (
                                        <>
                                            <CheckCircle size={18} />
                                            {lang === 'en' ? 'Import Successful!' : '가져오기 완료!'}
                                        </>
                                    ) : importStatus === 'error' ? (
                                        <>
                                            <AlertCircle size={18} />
                                            {lang === 'en' ? 'Invalid File' : '파일 형식 오류'}
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={18} />
                                            {t.importBtn}
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-emerald-600 mt-2 text-center">
                                    {t.importWarning}
                                </p>
                            </div>
                        </div>

                        {/* 현재 데이터 상태 */}
                        <div className="p-4 bg-gray-50 rounded-xl mt-4">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{t.currentData}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-gray-400 text-xs">{t.records}</p>
                                    <p className="font-bold text-gray-900">{data.accounting?.studyLog?.length || 0}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-gray-400 text-xs">{t.phrases}</p>
                                    <p className="font-bold text-gray-900">{data.english?.targetPhrases?.length || 0}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-gray-400 text-xs">{t.materials}</p>
                                    <p className="font-bold text-gray-900">{data.accounting?.level2?.referenceMaterials?.length || 0}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-gray-400 text-xs">{t.lastModified}</p>
                                    <p className="font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* 데이터 초기화 (Danger Zone) */}
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-red-700 flex items-center gap-2">
                                        <AlertCircle size={18} />
                                        {lang === 'en' ? 'Factory Reset' : '데이터 초기화'}
                                    </h4>
                                    <p className="text-xs text-red-500 mt-1">
                                        {lang === 'en' ? 'Delete all data and return to initial state.' : '모든 데이터를 삭제하고 초기 상태로 되돌립니다.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm(lang === 'en' ? 'Are you sure? This cannot be undone.' : '정말 초기화하시겠습니까? 복구할 수 없습니다.')) {
                                            localStorage.clear();
                                            window.location.reload();
                                        }
                                    }}
                                    className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                >
                                    {lang === 'en' ? 'Reset All Data' : '초기화 실행'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="flex justify-end sticky bottom-24 md:static">
                <button
                    onClick={handleSave}
                    className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold shadow-xl transition-all duration-300 ${saved ? 'bg-green-500 text-white shadow-green-200' : 'bg-primary text-white shadow-primary/20 hover:scale-105'
                        }`}
                >
                    <Save size={20} />
                    <span>{saved ? t.saved : t.saveBtn}</span>
                </button>
            </div>
        </div>
    );
}
