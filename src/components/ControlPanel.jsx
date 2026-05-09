import { CircleDot, Palette, RotateCcw } from 'lucide-react';

export default function ControlPanel({ onResetView, onColor, onShape }) {
  return (
    <aside className="control-panel" onPointerDown={(event) => event.stopPropagation()}>
      <div className="toy-buttons">
        <button className="toy-button icon-button" type="button" onClick={onResetView} title="정면으로 돌아오기" aria-label="정면으로 돌아오기">
          <RotateCcw />
        </button>
        <button className="toy-button" type="button" onClick={onColor} title="말랑이 색 바꾸기">
          <Palette />
          말랑이 색 바꾸기
        </button>
        <button className="toy-button" type="button" onClick={onShape} title="말랑이 모양 바꾸기">
          <CircleDot />
          말랑이 모양 바꾸기
        </button>
      </div>
    </aside>
  );
}
