import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BatteryFull,
  Camera,
  ChevronLeft,
  Clock,
  FileText,
  History,
  Map,
  Search,
  ShieldCheck,
  Signal,
  User,
  Wifi,
  X
} from "lucide-react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

import {
  getApiBaseUrl,
  getHealthStatus,
  type HistoryItem,
  type FoundRecord,
  searchRecords,
  toHistoryItem
} from "./lib/foundproof";
import {
  IllBlockchain,
  IllCamera,
  IllFind,
  IllHandoff,
  IllMap,
  IllProof,
  IllScan
} from "./components/Illustrations";
import "leaflet/dist/leaflet.css";

type Screen =
  | "splash"
  | "onboarding1"
  | "onboarding2"
  | "home"
  | "camera"
  | "ai_scan"
  | "record_form"
  | "writing_progress"
  | "proof_summary"
  | "proof_detail"
  | "history"
  | "history_detail"
  | "map"
  | "profile";

type ProofDetailBackTarget = "proof_summary" | "history_detail" | "home";
type MapBackTarget = "home" | "history_detail";
type MapFocus = {
  lat: number;
  lng: number;
  zoom: number;
};

type RecordDraft = {
  category: string;
  memo: string;
  time: string;
  location: string;
  handoffType: string;
  handoffNote: string;
};

const DEMO_LATITUDE = 35.6595;
const DEMO_LONGITUDE = 139.7005;
const DEMO_BLINK_COUNT = 5;
const DEMO_BLINK_INTERVAL_MS = 680;
const AI_SCAN_DURATION_MS = 2400;
const AI_SCAN_BAR_DURATION_S = 2.4;
const DEMO_PROOF_RECORD: FoundRecord = {
  id: "FP-DEMO-001",
  imageUrl: "/uploads/49e03609-1b41-4e4e-b9ec-40fa962c46c2.png",
  thumbnailUrl: "/uploads/49e03609-1b41-4e4e-b9ec-40fa962c46c2.png",
  imageHash: "6d155599f77405e39e310a1871a26a61aea35184be502de6f2308e7609d2c4ce",
  capturedAt: "2026-03-15T13:42:00.000Z",
  createdAt: "2026-03-15T13:42:41.398Z",
  latitude: DEMO_LATITUDE,
  longitude: DEMO_LONGITUDE,
  locationLabel: "東京都渋谷区道玄坂2丁目",
  category: "ワイヤレスイヤホン",
  description: "黒色のケースに入っていました。",
  handoffType: "station_counter",
  handoffNote: "渋谷駅窓口",
  status: "anchored",
  proofChain: "symbol",
  proofTxHash: "A5C03240F52B0D425BD982012A17B18F103B7A913BB35C0582CF604BF548DF4F",
  proofRecordHash: "83e7dab754d5820ea9f437f55dcc2412c8e2dc3529a14d53f40d408fd0984e95",
  proofVersion: "1",
  proofExplorerUrl: "http://127.0.0.1:90/transactions/A5C03240F52B0D425BD982012A17B18F103B7A913BB35C0582CF604BF548DF4F"
};

const HANDOFF_OPTIONS = [
  { value: "station_counter", label: "駅の窓口" },
  { value: "police_box", label: "交番・警察署" },
  { value: "facility_desk", label: "商業施設の受付" },
  { value: "school_office", label: "学校・オフィスの窓口" },
  { value: "other_authorized_desk", label: "その他" }
] as const;

const mapMarkerIcon = new L.DivIcon({
  className: "custom-leaflet-icon",
  html: '<div style="width: 36px; height: 36px; background-color: white; border: 2px solid #64CCC5; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64CCC5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>',
  iconAnchor: [18, 36],
  iconSize: [36, 36]
});

const initialDraft = (): RecordDraft => ({
  category: "",
  memo: "",
  time: "",
  location: "",
  handoffType: "station_counter",
  handoffNote: ""
});

const DEFAULT_MAP_FOCUS: MapFocus = {
  lat: 35.683,
  lng: 139.739,
  zoom: 10.95
};

const ScreenWrapper = ({
  children,
  hideNav = false,
  onBack,
  onGoHome,
  noScroll = false
}: {
  children: React.ReactNode;
  hideNav?: boolean;
  onBack?: () => void;
  onGoHome?: () => void;
  noScroll?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className="absolute inset-0 flex flex-col bg-[#FAFAFA]"
  >
    <div className="z-50 flex h-12 w-full shrink-0 items-center justify-between bg-transparent px-6 pt-2">
      <span className="text-[15px] font-semibold text-[#172B2A]">9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal className="h-4 w-4 text-[#172B2A]" />
        <Wifi className="h-4 w-4 text-[#172B2A]" />
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-[#172B2A]">82%</span>
          <BatteryFull className="h-[22px] w-[22px] text-[#172B2A]" />
        </div>
      </div>
    </div>

    {!hideNav && onBack ? (
      <div className="flex h-12 w-full shrink-0 items-center px-4">
        <button onClick={onBack} className="rounded-full p-2 transition-colors hover:bg-gray-100">
          <ChevronLeft className="h-6 w-6 text-[#172B2A]" />
        </button>
      </div>
    ) : null}

    <div className={`relative flex flex-1 flex-col ${noScroll ? "overflow-hidden" : "overflow-y-auto pb-8"}`}>
      {children}
    </div>

    <div className="flex h-8 w-full shrink-0 cursor-pointer items-center justify-center bg-transparent pb-2" onClick={onGoHome}>
      <div className="h-1.5 w-1/3 rounded-full bg-[#172B2A]/20 transition-colors hover:bg-[#172B2A]/40" />
    </div>
  </motion.div>
);

const MapFocusController = ({ focus }: { focus: MapFocus }) => {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();

      const target = L.latLng(focus.lat, focus.lng);
      const projected = map.project(target, focus.zoom);
      const verticalOffset = map.getSize().y * 0.18;
      const adjustedCenter = map.unproject(projected.add([0, verticalOffset]), focus.zoom);

      map.flyTo(adjustedCenter, focus.zoom, {
        animate: true,
        duration: 1.6
      });
    }, 240);

    return () => window.clearTimeout(timer);
  }, [focus, map]);

  return null;
};

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "text";
  className?: string;
  disabled?: boolean;
}) => {
  const baseStyle = "flex w-full items-center justify-center gap-2 rounded-full py-4 text-lg font-bold transition-transform";
  const variants = {
    primary: disabled
      ? "cursor-not-allowed bg-gray-300 text-gray-500"
      : "bg-[#64CCC5] text-[#172B2A] transition-colors hover:bg-[#85E0D6] active:scale-95",
    secondary: disabled
      ? "cursor-not-allowed border-2 border-gray-200 bg-gray-100 text-gray-400"
      : "border border-gray-200 bg-white text-[#172B2A] shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-95",
    text: disabled
      ? "cursor-not-allowed bg-transparent text-gray-300"
      : "bg-transparent text-[#718096] transition-colors hover:text-[#172B2A] active:scale-95"
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

function getDefaultCapturedAt() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hour}:${minute}`;
}

function toIsoTimestamp(value: string) {
  const normalized = value.replace(/\//g, "-");
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function describeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "不明なエラーが発生しました。";
}

function buildNewDraft() {
  return {
    category: "ワイヤレスイヤホン",
    memo: "",
    time: getDefaultCapturedAt(),
    location: "東京都渋谷区道玄坂2丁目",
    handoffType: "station_counter",
    handoffNote: ""
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [recordDraft, setRecordDraft] = useState<RecordDraft>(initialDraft());
  const [pendingDraft, setPendingDraft] = useState<RecordDraft | null>(null);
  const [isCameraHovered, setIsCameraHovered] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>("未確認");
  const [apiReachable, setApiReachable] = useState(false);
  const [activeRecord, setActiveRecord] = useState<FoundRecord | null>(null);
  const [progressBlinkCount, setProgressBlinkCount] = useState(0);
  const [proofDetailBackTarget, setProofDetailBackTarget] = useState<ProofDetailBackTarget>("home");
  const [mapFocus, setMapFocus] = useState<MapFocus>(DEFAULT_MAP_FOCUS);
  const [mapBackTarget, setMapBackTarget] = useState<MapBackTarget>("home");
  const [isMapReady, setIsMapReady] = useState(false);
  const [hasMapLoadedOnce, setHasMapLoadedOnce] = useState(false);

  const apiBaseUrl = getApiBaseUrl();
  const activeHistoryItem = useMemo(() => (activeRecord ? toHistoryItem(activeRecord) : null), [activeRecord]);
  const selectedHistoryItem = useMemo(
    () =>
      historyData.find((item) => item.id === selectedHistoryId) ??
      (activeHistoryItem && activeHistoryItem.id === selectedHistoryId ? activeHistoryItem : null) ??
      activeHistoryItem ??
      historyData[0] ??
      null,
    [activeHistoryItem, historyData, selectedHistoryId]
  );

  useEffect(() => {
    if (screen === "splash") {
      const timer = window.setTimeout(() => setScreen("onboarding1"), 1500);
      return () => window.clearTimeout(timer);
    }

    if (screen === "ai_scan") {
      const timer = window.setTimeout(() => {
        setRecordDraft(buildNewDraft());
        setScreen("record_form");
      }, AI_SCAN_DURATION_MS);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [screen]);

  useEffect(() => {
    if (screen === "map") {
      setIsMapReady(false);
      setHasMapLoadedOnce(false);
    }
  }, [screen]);

  useEffect(() => {
    refreshData().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (screen !== "writing_progress" || !pendingDraft) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsWriting(true);
      setProgressBlinkCount(0);
      setSubmissionError(null);

      try {
        for (let blink = 1; blink <= DEMO_BLINK_COUNT; blink += 1) {
          await sleep(DEMO_BLINK_INTERVAL_MS);
          if (cancelled) {
            return;
          }
          setProgressBlinkCount(blink);
        }

        const demoRecord: FoundRecord = {
          ...DEMO_PROOF_RECORD,
          category: pendingDraft.category,
          description: pendingDraft.memo,
          locationLabel: pendingDraft.location,
          handoffType: pendingDraft.handoffType,
          handoffNote: pendingDraft.handoffNote,
          capturedAt: toIsoTimestamp(pendingDraft.time)
        };

        setActiveRecord(demoRecord);
        setSelectedHistoryId(demoRecord.id);
        setRecordDraft(initialDraft());
        setPendingDraft(null);
        setProgressBlinkCount(0);
        setSubmissionError(null);
        setProofDetailBackTarget("proof_summary");
        setScreen("proof_summary");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPendingDraft(null);
        setProgressBlinkCount(0);
        setSubmissionError(describeError(error));
        setScreen("record_form");
      } finally {
        if (!cancelled) {
          setIsWriting(false);
        }
      }
    };

    run().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pendingDraft, screen]);

  async function refreshData(preferredRecord?: FoundRecord) {
    try {
      const [health, records] = await Promise.all([getHealthStatus(), searchRecords()]);
      setHealthStatus(`${health.status} (${health.mode})`);
      setApiReachable(health.status === "ok");

      const items = records.map(toHistoryItem);
      setHistoryData(items);

      if (preferredRecord) {
        setActiveRecord(preferredRecord);
        setSelectedHistoryId(preferredRecord.id);
        return;
      }

      if (items[0]) {
        setSelectedHistoryId((current) => current ?? items[0].id);
      }

      if (!preferredRecord && records[0]) {
        setActiveRecord(records[0]);
      }
    } catch (error) {
      setApiReachable(false);
      setHealthStatus(`unreachable (${describeError(error)})`);
    }
  }

  function handlePrimaryStart() {
    setScreen("home");
  }

  function handleGoHome() {
    setScreen("home");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-200 p-4 font-sans text-[#172B2A]">
      <div className="relative h-[844px] w-full max-w-[390px] overflow-hidden rounded-[40px] bg-black p-2 shadow-2xl ring-1 ring-black/5">
        <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-[#FAFAFA]">
          <AnimatePresence mode="wait">
            {screen === "splash" ? (
              <motion.div
                key="splash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-[#172B2A]"
                onClick={() => setScreen("onboarding1")}
              >
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#64CCC5] shadow-lg">
                  <Search className="h-12 w-12 text-white" />
                </div>
                <h1 className="mb-2 text-4xl font-bold tracking-wider text-white">FoundProof</h1>
                <p className="text-sm font-medium tracking-widest text-[#64CCC5]">拾った瞬間を、証明に</p>
              </motion.div>
            ) : null}

            {screen === "onboarding1" ? (
              <ScreenWrapper key="onboarding1" hideNav onGoHome={handleGoHome}>
                <div className="flex flex-1 flex-col p-8">
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <IllFind className="mb-12 h-64 w-64" />
                    <h2 className="mb-4 text-center text-2xl font-bold leading-tight">記録する</h2>
                    <p className="text-center leading-relaxed text-[#718096]">
                      見つけた場所や時間を安全に記録し、
                      <br />
                      あなたの責任ある行動を証明します。
                    </p>
                  </div>
                  <div className="mt-auto flex flex-col items-center gap-6">
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#172B2A]" />
                      <div className="h-2 w-2 rounded-full bg-gray-300" />
                    </div>
                    <Button onClick={() => setScreen("onboarding2")}>次へ</Button>
                  </div>
                </div>
              </ScreenWrapper>
            ) : null}

            {screen === "onboarding2" ? (
              <ScreenWrapper key="onboarding2" onBack={() => setScreen("onboarding1")} onGoHome={handleGoHome}>
                <div className="flex flex-1 flex-col p-8">
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <IllHandoff className="mb-12 h-64 w-64" />
                    <h2 className="mb-4 text-center text-2xl font-bold leading-tight">届ける</h2>
                    <p className="text-center leading-relaxed text-[#718096]">
                      交番や施設の窓口へ届けたことを記録し、
                      <br />
                      ブロックチェーンに証跡として残します。
                    </p>
                  </div>
                  <div className="mt-auto flex flex-col items-center gap-6">
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-300" />
                      <div className="h-2 w-2 rounded-full bg-[#172B2A]" />
                    </div>
                    <Button onClick={handlePrimaryStart}>はじめる</Button>
                  </div>
                </div>
              </ScreenWrapper>
            ) : null}

            {screen === "home" ? (
              <ScreenWrapper key="home" hideNav onGoHome={handleGoHome}>
                <div className="flex h-full flex-col p-6">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">FoundProof</h1>
                      <p className="text-sm text-[#718096]">Private Symbol proof demo</p>
                    </div>
                    <button
                      onClick={() => setScreen("profile")}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
                    >
                      <User className="h-5 w-5 text-[#172B2A]" />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col gap-6">
                    <button
                      onClick={() => setScreen("camera")}
                      className="flex w-full flex-col items-center justify-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:bg-[#E0F7F4]/30 hover:shadow-md active:scale-95"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E0F7F4]">
                        <Camera className="h-8 w-8 text-[#64CCC5]" />
                      </div>
                      <span className="text-xl font-bold">見つけたものを記録する</span>
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setScreen("history")}
                        className="flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:bg-[#E0F7F4]/30 hover:shadow-md active:scale-95"
                      >
                        <History className="h-8 w-8 text-[#172B2A]" />
                        <span className="text-sm font-bold">過去の記録</span>
                      </button>
                      <button
                      onClick={() => {
                        setMapBackTarget("home");
                        setMapFocus(DEFAULT_MAP_FOCUS);
                        setScreen("map");
                      }}
                      className="flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:bg-[#E0F7F4]/30 hover:shadow-md active:scale-95"
                    >
                        <Map className="h-8 w-8 text-[#172B2A]" />
                        <span className="text-sm font-bold">発見マップ</span>
                      </button>
                    </div>
                  </div>
                </div>
              </ScreenWrapper>
            ) : null}

            {screen === "camera" ? (
              <motion.div
                key="camera"
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-50 flex flex-col overflow-hidden bg-black"
              >
                <div className="mt-12 flex items-center justify-between p-4">
                  <button onClick={() => setScreen("home")} className="p-2">
                    <X className="h-8 w-8 text-white" />
                  </button>
                </div>
                <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gray-800" />
                  <motion.div
                    initial={false}
                    animate={{ opacity: isCapturing ? [0, 0.34, 0] : 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="pointer-events-none absolute inset-0 z-20 bg-[#172B2A]"
                  />
                  <motion.div
                    initial={false}
                    animate={{ scale: isCapturing ? [1, 0.985, 1] : 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="relative z-10 flex h-64 w-64 items-center justify-center rounded-3xl"
                  >
                    <div className="relative flex h-24 w-32 rotate-12 flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-600 bg-gray-700/80 shadow-2xl">
                      <div className="absolute left-0 right-0 top-1/3 h-px w-full bg-gray-600" />
                      <div className="absolute top-1/2 mt-2 h-1.5 w-1.5 rounded-full bg-green-400" />
                    </div>
                  </motion.div>
                </div>
                <div className="relative flex h-40 items-center justify-center border-t border-gray-800 bg-[#172B2A] pb-8">
                  <button
                    onClick={() => {
                      setIsCameraHovered(false);
                      window.setTimeout(() => {
                        setIsCapturing(true);
                      }, 120);
                      window.setTimeout(() => {
                        setIsCapturing(false);
                        setScreen("ai_scan");
                      }, 760);
                    }}
                    onMouseEnter={() => setIsCameraHovered(true)}
                    onMouseLeave={() => setIsCameraHovered(false)}
                    className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#64CCC5] transition-transform hover:scale-105 active:scale-95"
                  >
                    <div
                      className={`h-16 w-16 rounded-full transition-all duration-300 ${
                        isCapturing ? "scale-90 bg-[#DFF7F3]" : isCameraHovered ? "bg-[#85E0D6]" : "bg-[#64CCC5]"
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            ) : null}

            {screen === "ai_scan" ? (
              <motion.div
                key="ai_scan"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0 }}
                className="absolute inset-0 flex flex-col bg-[#172B2A]"
              >
                <div className="z-50 flex h-12 w-full shrink-0 items-center justify-between px-6 pt-2">
                  <span className="text-[15px] font-semibold text-white">9:41</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="h-4 w-4 text-white" />
                    <Wifi className="h-4 w-4 text-white" />
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-white">82%</span>
                      <BatteryFull className="h-[22px] w-[22px] text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center bg-[#172B2A] p-8">
                  <div className="relative mb-12 h-64 w-64">
                    <IllScan className="h-full w-full" />
                    <motion.div
                      animate={{ top: ["28%", "72%", "28%"] }}
                      transition={{ duration: AI_SCAN_BAR_DURATION_S, repeat: Infinity, ease: "linear" }}
                      className="absolute left-[25%] right-[25%] h-1 bg-[#64CCC5]"
                    />
                  </div>
                  <h2 className="mb-4 text-2xl font-bold text-white">AI で解析中...</h2>
                  <p className="text-center leading-relaxed text-white/70">
                    カテゴリと説明を生成し、
                    <br />
                    記録フォームに引き継ぎます。
                  </p>
                </div>

                <div className="flex h-8 w-full shrink-0 items-center justify-center bg-[#172B2A] pb-2">
                  <div className="h-1.5 w-1/3 rounded-full bg-white/20" />
                </div>
              </motion.div>
            ) : null}

            {screen === "record_form" ? (
              <ScreenWrapper key="record_form" onBack={() => setScreen("camera")} onGoHome={handleGoHome}>
                <div className="flex h-full flex-col p-6">
                  <h2 className="mb-6 text-2xl font-bold">記録の確認</h2>
                  {submissionError ? (
                    <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{submissionError}</div>
                  ) : null}
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <label className="mb-2 block text-sm font-bold text-[#718096]">カテゴリー</label>
                      <input
                        type="text"
                        value={recordDraft.category}
                        onChange={(event) => setRecordDraft({ ...recordDraft, category: event.target.value })}
                        className="w-full bg-transparent text-lg font-bold outline-none"
                      />
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <label className="mb-2 block text-sm font-bold text-[#718096]">見つけた時間</label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#64CCC5]" />
                        <input
                          type="text"
                          value={recordDraft.time}
                          onChange={(event) => setRecordDraft({ ...recordDraft, time: event.target.value })}
                          className="w-full bg-transparent text-lg font-bold outline-none"
                        />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <label className="mb-2 block text-sm font-bold text-[#718096]">場所</label>
                      <input
                        type="text"
                        value={recordDraft.location}
                        onChange={(event) => setRecordDraft({ ...recordDraft, location: event.target.value })}
                        className="w-full bg-transparent text-lg font-bold outline-none"
                      />
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <label className="mb-2 block text-sm font-bold text-[#718096]">届け先</label>
                      <select
                        value={recordDraft.handoffType}
                        onChange={(event) => setRecordDraft({ ...recordDraft, handoffType: event.target.value })}
                        className="w-full bg-transparent text-lg font-bold outline-none"
                      >
                        {HANDOFF_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <label className="mb-2 block text-sm font-bold text-[#718096]">施設名 / 補足</label>
                      <input
                        type="text"
                        value={recordDraft.handoffNote}
                        onChange={(event) => setRecordDraft({ ...recordDraft, handoffNote: event.target.value })}
                        className="w-full bg-transparent text-lg font-bold outline-none"
                        placeholder="任意入力"
                      />
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <label className="mb-2 block text-sm font-bold text-[#718096]">補足メモ</label>
                      <textarea
                        value={recordDraft.memo}
                        onChange={(event) => setRecordDraft({ ...recordDraft, memo: event.target.value })}
                        className="h-24 w-full resize-none bg-transparent text-lg font-bold outline-none"
                        placeholder="任意入力"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      disabled={!recordDraft.category || !apiReachable}
                      onClick={() => {
                        setSubmissionError(null);
                        setPendingDraft(recordDraft);
                        setScreen("writing_progress");
                      }}
                    >
                      記録を保存して Symbol にアンカー
                    </Button>
                  </div>
                </div>
              </ScreenWrapper>
            ) : null}

            {screen === "writing_progress" ? (
              <ScreenWrapper key="writing_progress" hideNav onGoHome={handleGoHome}>
                <div className="flex flex-1 flex-col items-center justify-center p-8">
                  <IllBlockchain className="mb-12 h-64 w-64 animate-pulse" />
                  <h2 className="mb-4 text-center text-2xl font-bold">証明を Symbol に記録中...</h2>
                  <p className="space-y-1 text-center leading-snug text-[#718096]">
                    <span className="block">この拾得記録の証明を、</span>
                    <span className="block">Symbolのトランザクションに記録しています。</span>
                  </p>
                  <div className="mt-8 flex gap-3">
                    {Array.from({ length: DEMO_BLINK_COUNT }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-2.5 w-2.5 rounded-full transition-colors ${index < progressBlinkCount ? "bg-[#64CCC5]" : "bg-[#D7E3E2]"}`}
                      />
                    ))}
                  </div>
                </div>
              </ScreenWrapper>
            ) : null}

            {screen === "proof_summary" ? (
              <ScreenWrapper key="proof_summary" hideNav onGoHome={handleGoHome}>
                <div className="flex flex-1 flex-col items-center justify-center p-8">
                  <IllProof className="mb-12 h-64 w-64" />
                  <h2 className="mb-2 text-center text-2xl font-bold">証明が作成されました</h2>
                  <p className="mb-8 rounded-full bg-[#E0F7F4] px-4 py-2 font-mono text-sm text-[#64CCC5]">
                    Record ID: {activeRecord?.id ?? "pending"}
                  </p>
                  <p className="mb-12 space-y-1 text-center leading-snug text-[#718096]">
                    <span className="block">記録は保存され、証明は</span>
                    <span className="block">Symbolに記録されました。</span>
                  </p>
                  <div className="w-full flex-col gap-4">
                    <Button
                      onClick={() => {
                        setProofDetailBackTarget("proof_summary");
                        setScreen("proof_detail");
                      }}
                    >
                      証明の詳細を見る
                    </Button>
                    <Button variant="text" onClick={() => setScreen("home")}>
                      ホームへ戻る
                    </Button>
                  </div>
                </div>
              </ScreenWrapper>
            ) : null}

            {screen === "proof_detail" ? (
              <ScreenWrapper key="proof_detail" onBack={() => setScreen(proofDetailBackTarget)} onGoHome={handleGoHome}>
                <div className="flex h-full flex-col p-6">
                  <h2 className="mb-6 text-2xl font-bold">証明の詳細</h2>
                  {isWriting ? (
                    <div className="mb-4 rounded-2xl bg-[#E0F7F4] px-4 py-3 text-sm font-bold text-[#172B2A]">
                      記録を保存し、private Symbol network に proof を記録しています。
                    </div>
                  ) : null}
                  {submissionError ? (
                    <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">{submissionError}</div>
                  ) : null}
                  {selectedHistoryItem ? (
                    <div className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <ShieldCheck className="h-8 w-8 text-[#64CCC5]" />
                        <div>
                          <p className="font-bold">Verified on Private Symbol</p>
                          <p className="text-xs text-[#718096]">{selectedHistoryItem.time}</p>
                        </div>
                      </div>
                      <div>
                        <span className="mb-1 block text-sm font-bold text-[#718096]">Transaction Hash</span>
                        <p className="break-all rounded-xl bg-gray-50 p-3 font-mono text-xs">{selectedHistoryItem.txHash}</p>
                      </div>
                      <div>
                        <span className="mb-1 block text-sm font-bold text-[#718096]">Record Data</span>
                        <div className="space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
                          <p>
                            <span className="font-bold">Category:</span> {selectedHistoryItem.category}
                          </p>
                          <p>
                            <span className="font-bold">Location:</span> {selectedHistoryItem.location}
                          </p>
                          <p>
                            <span className="font-bold">Handoff:</span> {selectedHistoryItem.handoff}
                          </p>
                          <p>
                            <span className="font-bold">Status:</span> {selectedHistoryItem.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      {isWriting ? "証明データを準備しています..." : "証明データがありません。"}
                    </div>
                  )}
                </div>
              </ScreenWrapper>
            ) : null}

            {screen === "history" ? (
              <ScreenWrapper key="history" onBack={() => setScreen("home")} onGoHome={handleGoHome}>
                <div className="flex h-full flex-col p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">過去の記録</h2>
                    <button
                      onClick={() => refreshData().catch(() => undefined)}
                      className="min-h-11 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold shadow-sm transition-colors hover:bg-[#E0F7F4]/40 active:scale-95"
                    >
                      更新
                    </button>
                  </div>
                  {historyData.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <History className="mb-4 h-16 w-16 text-gray-300" />
                      <p className="font-bold text-[#718096]">まだ記録がありません</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {historyData.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedHistoryId(item.id);
                            setScreen("history_detail");
                          }}
                          className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:bg-[#E0F7F4]/30 hover:shadow-md active:scale-95"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E0F7F4]">
                            <FileText className="h-6 w-6 text-[#64CCC5]" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold">{item.category}</p>
                            <p className="text-sm text-[#718096]">{item.time}</p>
                          </div>
                          <ShieldCheck className="h-5 w-5 text-[#64CCC5]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScreenWrapper>
            ) : null}

            {screen === "history_detail" ? (
              <ScreenWrapper key="history_detail" onBack={() => setScreen("history")} onGoHome={handleGoHome}>
                <div className="flex h-full flex-col overflow-hidden">
                  <div className="shrink-0 px-6 pb-2 pt-6">
                    <h2 className="text-2xl font-bold">記録の詳細</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 pt-2">
                    {selectedHistoryItem ? (
                      <div className="mb-8 flex shrink-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex flex-col gap-6 p-6">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <span className="text-lg font-bold">{selectedHistoryItem.category}</span>
                            <span className="rounded-full bg-[#E0F7F4] px-3 py-1 text-xs font-bold text-[#64CCC5]">Proof Verified</span>
                          </div>
                          <div>
                            <span className="mb-1 block text-sm font-bold text-[#718096]">時間</span>
                            <span className="text-base font-bold">{selectedHistoryItem.time}</span>
                          </div>
                          <div>
                            <span className="mb-1 block text-sm font-bold text-[#718096]">場所</span>
                            <span className="text-base font-bold">{selectedHistoryItem.location}</span>
                          </div>
                          <div>
                            <span className="mb-1 block text-sm font-bold text-[#718096]">届け先</span>
                            <span className="text-base font-bold">{selectedHistoryItem.handoff}</span>
                          </div>
                          <div>
                            <span className="mb-1 block text-sm font-bold text-[#718096]">メモ</span>
                            <span className="text-base font-bold">{selectedHistoryItem.memo}</span>
                          </div>
                          <div className="mt-8 flex flex-col gap-3">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setMapBackTarget("history_detail");
                                setMapFocus({
                                  lat: selectedHistoryItem.lat,
                                  lng: selectedHistoryItem.lng,
                                  zoom: 16
                                });
                                setScreen("map");
                              }}
                            >
                              マップで見る
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setProofDetailBackTarget("history_detail");
                                setScreen("proof_detail");
                              }}
                            >
                              証明データを確認
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </ScreenWrapper>
            ) : null}

            {screen === "map" ? (
              <ScreenWrapper key="map" hideNav onGoHome={handleGoHome} noScroll>
                <div className="flex h-full flex-col">
                  <div className="z-10 flex h-12 w-full shrink-0 items-center bg-white px-4">
                    <button onClick={() => setScreen(mapBackTarget)} className="rounded-full p-2 transition-colors hover:bg-gray-100">
                      <ChevronLeft className="h-6 w-6 text-[#172B2A]" />
                    </button>
                    <h2 className="ml-2 text-lg font-bold">発見マップ</h2>
                  </div>
                  <div className="relative flex-1 bg-[#E0F7F4]">
                    {!hasMapLoadedOnce && !isMapReady ? (
                      <div className="absolute inset-0 z-[900] flex items-center justify-center bg-[#E8EEED]">
                        <div className="rounded-full bg-white/90 px-5 py-3 text-sm font-bold text-[#172B2A] shadow-sm">
                          地図を読み込み中...
                        </div>
                      </div>
                    ) : null}
                    <div className={`h-full w-full transition-opacity duration-300 ${isMapReady ? "opacity-100" : "opacity-0"}`}>
                    <MapContainer center={[DEFAULT_MAP_FOCUS.lat, DEFAULT_MAP_FOCUS.lng]} zoom={DEFAULT_MAP_FOCUS.zoom} style={{ width: "100%", height: "100%" }} zoomControl={false}>
                      <MapFocusController focus={mapFocus} />
                      <TileLayer
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        eventHandlers={{
                          loading: () => {
                            if (!hasMapLoadedOnce) {
                              setIsMapReady(false);
                            }
                          },
                          load: () => {
                            setIsMapReady(true);
                            setHasMapLoadedOnce(true);
                          }
                        }}
                      />
                      {historyData.map((item) => (
                        <Marker
                          key={item.id}
                          position={[item.lat, item.lng]}
                          icon={mapMarkerIcon}
                          eventHandlers={{
                            click: () => {
                              setSelectedHistoryId(item.id);
                              setScreen("history_detail");
                            }
                          }}
                        />
                      ))}
                    </MapContainer>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 z-[1000] rounded-t-3xl bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                      <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-[#172B2A]/20" />
                      <h3 className="mb-4 text-lg font-bold">最近の記録</h3>
                      {historyData.length === 0 ? (
                        <p className="py-4 text-center text-[#718096]">まだ記録がありません</p>
                      ) : (
                        <div className="custom-scrollbar flex max-h-48 flex-col gap-3 overflow-y-auto pb-2 pr-3">
                          {historyData.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedHistoryId(item.id);
                                setMapFocus({
                                  lat: item.lat,
                                  lng: item.lng,
                                  zoom: 16
                                });
                              }}
                              className="flex shrink-0 cursor-pointer items-center gap-4 rounded-2xl bg-gray-50 p-4 transition-all duration-300 hover:bg-[#E0F7F4]/50 hover:shadow-sm active:scale-95"
                            >
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E0F7F4]">
                                <FileText className="h-6 w-6 text-[#64CCC5]" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold">{item.category}</p>
                                <p className="text-sm text-[#718096]">{item.handoff}へ記録</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScreenWrapper>
            ) : null}

            {screen === "profile" ? (
              <ScreenWrapper key="profile" onBack={() => setScreen("home")} onGoHome={handleGoHome}>
                <div className="flex h-full flex-col p-6">
                  <h2 className="mb-8 text-2xl font-bold">プロフィール</h2>

                  <div className="mb-8 flex cursor-pointer items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:bg-[#E0F7F4]/30 hover:shadow-md">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <User className="h-8 w-8 text-[#718096]" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">Private Demo Mode</p>
                      <p className="text-sm text-[#718096]">記録数: {historyData.length}件</p>
                    </div>
                  </div>
                </div>
              </ScreenWrapper>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
