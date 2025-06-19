import { useState } from "react";
import { useGameStore } from './store'; // Zustand のストアを活用

function GameDetail({ game }) {
  const [names, setNames] = useState(['プレイヤー1', 'プレイヤー2', 'プレイヤー3']);
  const [scores, setScores] = useState(['', '', '']);
  const [chips, setChips] = useState(['', '', '']);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const { selectGame } = useGameStore(); // 戻る機能のため

  const handleScoreChange = (i, value) => {
    const newScores = [...scores];
    newScores[i] = value;
    const filled = newScores.filter(v => v !== '').map(Number);
    if (filled.length === 2) {
      const total = game.origin;
      const missingIndex = newScores.findIndex(v => v === '');
      const filledSum = filled.reduce((a, b) => a + b, 0);
      newScores[missingIndex] = String(total - filledSum);
    }
    setScores(newScores);
  };

  const calcResult = () => {
    const numericScores = scores.map(Number);
    const round = calculateRoundResult(numericScores, game);
    const chipGain = chips.map(Number).map(c => c * game.chip);
    const final = names.map((_, i) => round[`P${i + 1}`] * game.rate + chipGain[i]);
    setResult(final);
    setHistory([...history, { round, chipGain, final }]);
    setScores(['', '', '']);
    setChips(['', '', '']);
  };

  const resetAll = () => {
    setHistory([]);
    setResult(null);
    setScores(['', '', '']);
    setChips(['', '', '']);
  };

  const totalResult = () => {
    const total = [0, 0, 0];
    for (const h of history) {
      for (let i = 0; i < 3; i++) total[i] += h.final[i];
    }
    return total;
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">{game.name}：詳細画面</h2>
      <div className="grid grid-cols-3 gap-2">
        {names.map((n, i) => (
          <input key={i} className="border p-1" value={n} onChange={(e) => {
            const newNames = [...names]; newNames[i] = e.target.value; setNames(newNames);
          }} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {scores.map((s, i) => (
          <input key={i} type="number" className="border p-1" value={s} onChange={(e) => handleScoreChange(i, e.target.value)} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {chips.map((c, i) => (
          <input key={i} type="number" placeholder="チップ" className="border p-1" value={c} onChange={(e) => {
            const newChips = [...chips]; newChips[i] = e.target.value; setChips(newChips);
          }} />
        ))}
      </div>
      <div className="flex gap-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={calcResult}>1半荘追加</button>
        <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={resetAll}>全リセット</button>
        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => selectGame(null)}>戻る</button>
      </div>

      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold">半荘履歴</h3>
          <ul className="space-y-2">
            {history.map((h, idx) => (
              <li key={idx} className="bg-gray-50 p-2 border rounded">
                {names.map((n, i) => (
                  <div key={i}>{n}：{h.final[i].toLocaleString()}円</div>
                ))}
              </li>
            ))}
          </ul>
          <h3 className="font-bold mt-4">合計収支</h3>
          <div className="grid grid-cols-3 gap-2">
            {totalResult().map((val, i) => (
              <div key={i} className="bg-yellow-100 p-2 rounded text-center">{names[i]}：{val.toLocaleString()}円</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function calculateRoundResult(scores, rule) {
  let players = [
    { name: 'P1', score: scores[0] },
    { name: 'P2', score: scores[1] },
    { name: 'P3', score: scores[2] }
  ];
  players = players.map(p => ({ ...p, rounded: Math.round(p.score / 10) * 10 }));
  if (!rule.boxRule) {
    players = players.map(p => ({ ...p, rounded: p.rounded < 0 ? 0 : p.rounded }));
  }
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const ranks = sorted.map(p => p.name);
  const result = {};
  for (let p of players) result[p.name] = p.rounded;
  const second = ranks[1];
  const third = ranks[2];
  result[second] += rule.uma2;
  if (result[second] < rule.returnPoint) result[second] += rule.uma2Low;
  result[third] += rule.uma3;
  result[second] -= rule.returnPoint;
  result[third] -= rule.returnPoint;
  const total = -(result[second] + result[third]);
  const first = ranks[0];
  result[first] = total;
  for (let k in result) {
    result[k] = Math.round(result[k] / 1000);
  }
  return result;
}

export default GameDetail;
