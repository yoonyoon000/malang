import { CircleDot, Hand, Palette, RefreshCcw, Repeat, Sparkles } from 'lucide-react';

export default function ControlPanel({
  softness,
  force,
  status,
  autoMode,
  onReset,
  onHarder,
  onColor,
  onShape,
  onAuto,
}) {
  return (
    <aside className="control-panel" onPointerDown={(event) => event.stopPropagation()}>
      <div className="meters">
        <div className="meter">
          <span className="meter-label">말랑도</span>
          <strong>{softness}%</strong>
        </div>
        <div className="meter">
          <span className="meter-label">쥐는 힘</span>
          <strong>{force}%</strong>
        </div>
        <div className="status-pill">
          <span className="status-label">현재 상태</span>
          <strong>{status}</strong>
        </div>
      </div>
      <div className="toy-buttons">
        <button className="toy-button" type="button" onClick={onReset} title="말랑이를 원래 형태로 되돌리기">
          <RefreshCcw />
          다시 통통하게
        </button>
        <button className="toy-button" type="button" onClick={onHarder} title="한 번 더 강하게 쥐기">
          <Hand />
          더 세게 쥐기
        </button>
        <button className="toy-button" type="button" onClick={onColor} title="말랑이 색 바꾸기">
          <Palette />
          말랑이 색 바꾸기
        </button>
        <button className="toy-button" type="button" onClick={onShape} title="말랑이 모양 바꾸기">
          <CircleDot />
          말랑이 모양 바꾸기
        </button>
        <button
          className={`toy-button ${autoMode ? 'active' : ''}`}
          type="button"
          onClick={onAuto}
          title="자동 주물주물 전환"
        >
          {autoMode ? <Sparkles /> : <Repeat />}
          자동 주물주물
        </button>
      </div>
    </aside>
  );
}
