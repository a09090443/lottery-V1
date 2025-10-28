'use client';

/**
 * Winner Card Component (Public)
 * 中獎者卡片元件（用於大型顯示螢幕）
 */

import { ParticipantDisplayData } from '@/types';

export interface WinnerCardProps {
  /** 獎項名稱 */
  prizeName: string;
  /** 抽獎序號 */
  drawSequence: number;
  /** 總數量 */
  totalQuantity: number;
  /** 中獎者資訊（含遮罩） */
  winner: ParticipantDisplayData;
  /** 是否顯示祝賀訊息 */
  showCongratulations?: boolean;
  /** 大小變體 */
  size?: 'normal' | 'large' | 'fullscreen';
}

/**
 * 中獎者卡片元件（公告版）
 */
export function WinnerCard({
  prizeName,
  drawSequence,
  totalQuantity,
  winner,
  showCongratulations = true,
  size = 'normal',
}: WinnerCardProps) {
  const sizeConfig = {
    normal: {
      container: 'p-8',
      title: 'text-3xl',
      name: 'text-5xl',
      id: 'text-2xl',
      badge: 'text-lg px-6 py-3',
    },
    large: {
      container: 'p-12',
      title: 'text-4xl',
      name: 'text-6xl',
      id: 'text-3xl',
      badge: 'text-xl px-8 py-4',
    },
    fullscreen: {
      container: 'p-16',
      title: 'text-5xl',
      name: 'text-7xl',
      id: 'text-4xl',
      badge: 'text-2xl px-10 py-5',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className="bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 rounded-2xl shadow-2xl overflow-hidden">
      <div className={`text-white ${config.container}`}>
        {/* Congratulations Message */}
        {showCongratulations && (
          <div className="text-center mb-8">
            <div className={`${config.title} font-bold mb-2 animate-pulse`}>
              🎉 恭喜中獎！🎉
            </div>
          </div>
        )}

        {/* Prize Name */}
        <div className="text-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 inline-block">
            <div className="text-white/80 text-sm mb-2">獎項</div>
            <div className={`${config.title} font-bold`}>{prizeName}</div>
          </div>
        </div>

        {/* Winner Information */}
        <div className="bg-white rounded-2xl p-8 text-center mb-6 shadow-xl">
          {/* Sequence Badge */}
          <div className="flex justify-center mb-6">
            <span className={`inline-flex items-center ${config.badge} bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg`}>
              第 {drawSequence} 位得主（共 {totalQuantity} 個）
            </span>
          </div>

          {/* Winner Name */}
          <div className="mb-6">
            <div className="text-gray-600 text-sm mb-2">中獎者</div>
            <div className={`${config.name} font-bold text-gray-900 tracking-wide`}>
              {winner.name}
            </div>
          </div>

          {/* IDs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {winner.employeeIdDisplay && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-600 text-xs mb-1">員工編號</div>
                <div className={`${config.id} font-mono font-semibold text-gray-900`}>
                  {winner.employeeIdDisplay}
                </div>
              </div>
            )}

            {winner.nationalIdDisplay && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-600 text-xs mb-1">身分證字號</div>
                <div className={`${config.id} font-mono font-semibold text-gray-900`}>
                  {winner.nationalIdDisplay}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="text-center text-white/60 text-sm">
          請中獎者於活動結束後領取獎品
        </div>
      </div>
    </div>
  );
}

/**
 * 多位中獎者展示（網格模式）
 */
export interface WinnersGridProps {
  winners: Array<{
    prizeName: string;
    drawSequence: number;
    totalQuantity: number;
    winner: ParticipantDisplayData;
  }>;
  columns?: 2 | 3 | 4;
}

export function WinnersGrid({ winners, columns = 3 }: WinnersGridProps) {
  if (winners.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        尚無中獎者
      </div>
    );
  }

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {winners.map((item, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-800 rounded-full font-bold mb-3">
              {item.drawSequence}
            </div>

            <div className="text-sm text-gray-600 mb-1">{item.prizeName}</div>
            <div className="text-xl font-bold text-gray-900 mb-2">{item.winner.name}</div>

            <div className="space-y-1 text-xs text-gray-500 font-mono">
              {item.winner.employeeIdDisplay && <div>{item.winner.employeeIdDisplay}</div>}
              {item.winner.nationalIdDisplay && <div>{item.winner.nationalIdDisplay}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
