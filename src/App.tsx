import { useEffect, useState } from 'react';
import './App.css';

const positionsByPlayers: Record<number, string[]> = {
    2: ['SB', 'BB'],
    3: ['BTN', 'SB', 'BB'],
    4: ['UTG', 'BTN', 'SB', 'BB'],
    5: ['UTG', 'CO', 'BTN', 'SB', 'BB'],
    6: ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
    7: ['UTG', 'UTG+1', 'MP', 'CO', 'BTN', 'SB', 'BB'],
    8: ['UTG', 'UTG+1', 'MP', 'MP+1', 'CO', 'BTN', 'SB', 'BB'],
    9: ['UTG', 'UTG+1', 'UTG+2', 'MP', 'MP+1', 'CO', 'BTN', 'SB', 'BB'],
};

const allRanks = [
    'A',
    'K',
    'Q',
    'J',
    'T',
    '9',
    '8',
    '7',
    '6',
    '5',
    '4',
    '3',
    '2',
];

// GTO-based opening ranges for cash games
const ranges: Record<string, Record<number, string[]>> = {
    UTG: {
        4: ['88+', 'AJs+', 'KQs', 'AKo'], // 5.5% - Very tight
        5: ['77+', 'ATs+', 'KQs', 'AQo+'], // 7.7% - Tight
        6: ['66+', 'A9s+', 'KQs', 'AQo+', 'KQo'], // 9.2% - Standard
        7: ['66+', 'A9s+', 'KJs+', 'QJs', 'AQo+'], // 8.9% - Back to tight
        8: ['77+', 'ATs+', 'KQs', 'AQo+'], // 7.7% - Tighter
        9: ['77+', 'AJs+', 'KQs', 'AQo+'], // 6.8% - Very tight
    },
    'UTG+1': {
        7: ['55+', 'A9s+', 'KJs+', 'QJs', 'JTs', 'AJo+', 'KQo'], // 11.3%
        8: ['55+', 'A9s+', 'KTs+', 'QTs+', 'JTs', 'AJo+', 'KQo'], // 10.7%
        9: ['66+', 'ATs+', 'KJs+', 'QJs', 'AQo+', 'KQo'], // 9.8%
    },
    'UTG+2': {
        9: ['44+', 'A8s+', 'K9s+', 'QTs+', 'JTs', 'T9s', 'AJo+', 'KQo'], // 13.6%
    },
    MP: {
        6: ['55+', 'A8s+', 'KTs+', 'QTs+', 'JTs', 'AJo+', 'KQo'], // 12.4%
        7: ['44+', 'A7s+', 'K9s+', 'Q9s+', 'JTs', 'T9s', 'ATo+', 'KJo+'], // 15.7%
        8: ['44+', 'A6s+', 'K9s+', 'Q9s+', 'J9s+', 'T9s', 'ATo+', 'KJo+'], // 16.9%
        9: ['33+', 'A5s+', 'K8s+', 'Q9s+', 'J9s+', 'T9s', 'ATo+', 'KJo+'], // 18.3%
    },
    'MP+1': {
        8: [
            '33+',
            'A5s+',
            'K8s+',
            'Q9s+',
            'J9s+',
            'T9s',
            '98s',
            'ATo+',
            'KJo+',
        ], // 20.1%
        9: [
            '33+',
            'A4s+',
            'K7s+',
            'Q8s+',
            'J9s+',
            'T8s+',
            '98s',
            'A9o+',
            'KJo+',
        ], // 22.5%
    },
    CO: {
        5: ['44+', 'A7s+', 'K9s+', 'Q9s+', 'JTs', 'T9s', 'AJo+', 'KQo'], // 16.3%
        6: [
            '33+',
            'A5s+',
            'K8s+',
            'Q8s+',
            'J9s+',
            'T9s',
            '98s',
            'ATo+',
            'KJo+',
        ], // 22.5%
        7: [
            '22+',
            'A4s+',
            'K7s+',
            'Q8s+',
            'J8s+',
            'T8s+',
            '97s+',
            'A9o+',
            'KJo+',
        ], // 27.8%
        8: [
            '22+',
            'A3s+',
            'K6s+',
            'Q7s+',
            'J8s+',
            'T8s+',
            '97s+',
            '86s+',
            'A8o+',
            'KTo+',
        ], // 32.5%
        9: [
            '22+',
            'A2s+',
            'K5s+',
            'Q6s+',
            'J7s+',
            'T7s+',
            '96s+',
            '86s+',
            '75s+',
            'A7o+',
            'KTo+',
        ], // 38.2%
    },
    BTN: {
        2: [
            '22+',
            'A2s+',
            'K4s+',
            'Q6s+',
            'J7s+',
            'T7s+',
            '96s+',
            '86s+',
            '75s+',
            'A5o+',
            'K9o+',
            'QTo+',
        ], // 42.0%
        3: [
            '22+',
            'A2s+',
            'K3s+',
            'Q5s+',
            'J6s+',
            'T6s+',
            '95s+',
            '85s+',
            '74s+',
            'A4o+',
            'K8o+',
            'Q9o+',
            'JTo',
        ], // 46.8%
        4: [
            '22+',
            'A2s+',
            'K2s+',
            'Q4s+',
            'J5s+',
            'T6s+',
            '94s+',
            '84s+',
            '74s+',
            '63s+',
            'A3o+',
            'K7o+',
            'Q9o+',
            'JTo',
        ], // 51.4%
        5: [
            '22+',
            'A2s+',
            'K2s+',
            'Q3s+',
            'J4s+',
            'T5s+',
            '93s+',
            '83s+',
            '73s+',
            '62s+',
            'A2o+',
            'K6o+',
            'Q8o+',
            'J9o+',
        ], // 56.2%
        6: [
            '22+',
            'A2s+',
            'K2s+',
            'Q2s+',
            'J3s+',
            'T4s+',
            '92s+',
            '82s+',
            '72s+',
            '62s+',
            '52s+',
            'A2o+',
            'K5o+',
            'Q7o+',
            'J8o+',
            'T9o',
        ], // 61.8%
        7: [
            '22+',
            'A2s+',
            'K2s+',
            'Q2s+',
            'J2s+',
            'T3s+',
            '92s+',
            '82s+',
            '72s+',
            '62s+',
            '52s+',
            '42s+',
            'A2o+',
            'K4o+',
            'Q6o+',
            'J7o+',
            'T8o+',
        ], // 67.5%
        8: [
            '22+',
            'A2s+',
            'K2s+',
            'Q2s+',
            'J2s+',
            'T2s+',
            '92s+',
            '82s+',
            '72s+',
            '62s+',
            '52s+',
            '42s+',
            '32s',
            'A2o+',
            'K3o+',
            'Q5o+',
            'J6o+',
            'T7o+',
            '98o',
        ], // 72.8%
        9: [
            '22+',
            'A2s+',
            'K2s+',
            'Q2s+',
            'J2s+',
            'T2s+',
            '92s+',
            '82s+',
            '72s+',
            '62s+',
            '52s+',
            '42s+',
            '32s',
            'A2o+',
            'K2o+',
            'Q4o+',
            'J5o+',
            'T6o+',
            '96o+',
        ], // 78.1%
    },
    SB: {
        2: [
            '22+',
            'A2s+',
            'K2s+',
            'Q4s+',
            'J6s+',
            'T7s+',
            '96s+',
            '86s+',
            '75s+',
            'A2o+',
            'K6o+',
            'Q8o+',
            'J9o+',
        ], // 48.5%
        3: ['55+', 'A5s+', 'K8s+', 'Q9s+', 'J9s+', 'T9s', 'ATo+', 'KJo+'], // 15.4% - vs BTN
        4: [
            '44+',
            'A4s+',
            'K7s+',
            'Q8s+',
            'J9s+',
            'T9s',
            '98s',
            'A9o+',
            'KJo+',
        ], // 18.9% - vs BTN
        5: [
            '33+',
            'A3s+',
            'K6s+',
            'Q7s+',
            'J8s+',
            'T8s+',
            '97s+',
            'A8o+',
            'KTo+',
        ], // 25.4% - vs BTN
        6: [
            '33+',
            'A2s+',
            'K5s+',
            'Q6s+',
            'J7s+',
            'T7s+',
            '96s+',
            '86s+',
            '75s+',
            'A7o+',
            'K9o+',
            'QTo+',
        ], // 32.8% - vs BTN
        7: [
            '22+',
            'A2s+',
            'K4s+',
            'Q5s+',
            'J6s+',
            'T6s+',
            '95s+',
            '85s+',
            '74s+',
            '64s+',
            'A6o+',
            'K8o+',
            'Q9o+',
            'JTo',
        ], // 40.2% - vs BTN
        8: [
            '22+',
            'A2s+',
            'K3s+',
            'Q4s+',
            'J5s+',
            'T5s+',
            '94s+',
            '84s+',
            '73s+',
            '63s+',
            '53s+',
            'A5o+',
            'K7o+',
            'Q8o+',
            'J9o+',
        ], // 46.8% - vs BTN
        9: [
            '22+',
            'A2s+',
            'K2s+',
            'Q3s+',
            'J4s+',
            'T4s+',
            '93s+',
            '83s+',
            '72s+',
            '62s+',
            '52s+',
            '42s+',
            'A4o+',
            'K6o+',
            'Q7o+',
            'J8o+',
            'T9o',
        ], // 52.7% - vs BTN
    },
    BB: {
        2: [
            '22+',
            'A2s+',
            'K2s+',
            'Q2s+',
            'J4s+',
            'T6s+',
            '95s+',
            '84s+',
            '74s+',
            '63s+',
            '53s+',
            'A2o+',
            'K4o+',
            'Q7o+',
            'J8o+',
            'T9o',
        ], // 58.3% - vs SB
        3: [], // BB never raises vs raise, only call/fold
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
    },
};

const parseCombo = (combo: string): Set<string> => {
    const set = new Set<string>();

    const addPairRange = (rank: string) => {
        const idx = allRanks.indexOf(rank);
        for (let i = idx; i >= 0; i--) {
            set.add(allRanks[i] + allRanks[i]);
        }
    };

    if (combo.endsWith('+')) {
        const base = combo.slice(0, -1);

        if (base.length === 2 && base[0] === base[1]) {
            // Pairs like "66+"
            addPairRange(base[0]);
        } else if (base.endsWith('s')) {
            // Suited hands like "A2s+"
            const r1 = base[0];
            const r2 = base[1];
            const r2Idx = allRanks.indexOf(r2);

            for (let i = r2Idx; i >= 0; i--) {
                const currentRank = allRanks[i];
                if (currentRank !== r1) {
                    set.add(r1 + currentRank + 's');
                }
            }
        } else if (base.endsWith('o')) {
            // Offsuit hands like "AQo+"
            const r1 = base[0];
            const r2 = base[1];
            const r2Idx = allRanks.indexOf(r2);

            for (let i = r2Idx; i >= 0; i--) {
                const currentRank = allRanks[i];
                if (currentRank !== r1) {
                    set.add(r1 + currentRank + 'o');
                }
            }
        } else {
            // Both suited and offsuit like "AQ+"
            const r1 = base[0];
            const r2 = base[1];
            const r2Idx = allRanks.indexOf(r2);

            for (let i = r2Idx; i >= 0; i--) {
                const currentRank = allRanks[i];
                if (currentRank !== r1) {
                    set.add(r1 + currentRank + 's');
                    set.add(r1 + currentRank + 'o');
                }
            }
        }
    } else {
        // Single combo like "AKs", "AKo", "AA"
        set.add(combo);
    }

    return set;
};

const buildMatrix = (
    combos: string[]
): { label: string; play: boolean }[][] => {
    const handSet = new Set<string>();
    combos.forEach((c) => parseCombo(c).forEach((h) => handSet.add(h)));

    return allRanks.map((r1, i) =>
        allRanks.map((r2, j) => {
            let label = '';
            if (i < j) label = r1 + r2 + 's';
            else if (i > j) label = r2 + r1 + 'o';
            else label = r1 + r1;
            return { label, play: handSet.has(label) };
        })
    );
};

export default function Grid() {
    const [players, setPlayers] = useState(6);
    const [position, setPosition] = useState('UTG');
    const [isCompact, setIsCompact] = useState(false);
    const [showPercentage, setShowPercentage] = useState(true);

    useEffect(() => {
        const availablePositions = positionsByPlayers[players];
        setPosition(availablePositions[0]);
    }, [players]);

    const positions = positionsByPlayers[players];
    const hands = ranges[position]?.[players] || [];
    const matrix = buildMatrix(hands);

    // Calculate percentage of hands played
    const totalHands = 169;
    const playedHands = hands.reduce(
        (count, combo) => count + parseCombo(combo).size,
        0
    );
    const percentage = ((playedHands / totalHands) * 100).toFixed(1);

    return (
        <div className={`${isCompact ? 'p-2' : 'p-6'} max-w-6xl mx-auto`}>
            <h1 className="text-4xl font-extrabold mb-6 text-center text-white">
                Cash Game Preflop Ranges
            </h1>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-80 border border-[#424242] rounded-lg shadow-lg p-4">
                    <h2 className="text-xl font-bold text-white mb-4">
                        Quick Setup
                    </h2>
                    <div className="mb-4">
                        <label className="text-white text-sm mb-2 block font-medium">
                            Players
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                            {[2, 3, 4, 5, 6, 7, 8, 9].map((p) => (
                                <button
                                    key={p}
                                    className={`p-2 rounded text-sm font-medium transition ${
                                        players === p
                                            ? 'text-indigo-600'
                                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    }`}
                                    onClick={() => setPlayers(p)}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="text-white text-sm mb-2 block font-medium">
                            Position
                        </label>
                        <div className="grid grid-cols-2 gap-1">
                            {positions.map((pos) => (
                                <button
                                    key={pos}
                                    className={`p-2 rounded text-xs font-medium transition ${
                                        position === pos
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    }`}
                                    onClick={() => setPosition(pos)}
                                >
                                    {pos}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="border border-[#424242] rounded p-3 mb-4">
                        <div className="text-white text-sm mb-2">
                            <strong className="text-green-400">
                                {position}
                            </strong>{' '}
                            vs {players} players
                        </div>
                        {showPercentage && (
                            <div className="text-green-400 text-lg font-bold">
                                {percentage}%
                            </div>
                        )}
                        <div className="text-gray-300 text-xs">
                            {playedHands} / {totalHands} combinations
                        </div>
                        <div className="text-gray-400 text-xs mt-1 break-words">
                            {hands.join(', ') || 'No range defined'}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button
                            className="w-full p-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition"
                            onClick={() => setIsCompact(!isCompact)}
                        >
                            {isCompact ? '📋 Expand' : '📱 Compact'} View
                        </button>
                        <button
                            className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition"
                            onClick={() => setShowPercentage(!showPercentage)}
                        >
                            {showPercentage ? '🔢 Hide' : '📊 Show'} Percentage
                        </button>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="border border-[#424242] rounded-lg shadow-lg p-4">
                        <table
                            className={`table-auto border-separate mx-auto ${
                                isCompact
                                    ? 'border-spacing-0'
                                    : 'border-spacing-1'
                            }`}
                        >
                            <thead>
                                <tr>
                                    <th
                                        className={`border p-1 border-[#424242] ${
                                            isCompact ? 'w-6 h-6' : 'w-8 h-8'
                                        }`}
                                    ></th>
                                    {allRanks.map((r) => (
                                        <th
                                            key={r}
                                            className={`border border-[#424242] text-center text-whitfont-bold ${
                                                isCompact
                                                    ? 'w-6 h-6 text-xs p-0'
                                                    : 'w-10 h-10 text-sm p-1'
                                            }`}
                                        >
                                            {r}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {matrix.map((row, i) => (
                                    <tr key={i}>
                                        <th
                                            className={`border border-[#424242] text-white text-center font-bold ${
                                                isCompact
                                                    ? 'w-6 h-6 text-xs p-0'
                                                    : 'w-10 h-10 text-sm p-1'
                                            }`}
                                        >
                                            {allRanks[i]}
                                        </th>
                                        {row.map((cell, j) => (
                                            <td
                                                key={j}
                                                title={`${cell.label} - ${
                                                    cell.play ? 'RAISE' : 'FOLD'
                                                }`}
                                                className={`border text-center align-middle font-bold transition hover:brightness-110 cursor-pointer ${
                                                    isCompact
                                                        ? 'w-6 h-6 text-xs p-0'
                                                        : 'w-10 h-10 text-xs p-1'
                                                } ${
                                                    cell.play
                                                        ? 'bg-green-500 text-white border-green-400'
                                                        : 'bg-red-500 text-white border-red-400'
                                                }`}
                                            >
                                                {isCompact ? '' : cell.label}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 flex justify-center gap-6 text-sm text-white">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded border border-green-400" />
                                <span>RAISE</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded border border-red-400" />
                                <span>FOLD</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
