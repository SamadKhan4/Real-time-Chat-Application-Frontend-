import React, { useMemo } from "react";

const emptyBoard = Array(9).fill(null);

const TicTacToeGame = ({
  authUser,
  game,
  gameState,
  isOwnMessage,
  onJoin,
  onMove,
  onRestart,
}) => {
  const state = gameState || {
    board: emptyBoard,
    currentTurn: "x",
    status: "invited",
    winner: null,
    players: game.players,
  };

  const mySymbol = useMemo(() => {
    if (game.players?.x?.toString() === authUser?._id?.toString()) return "x";
    if (game.players?.o?.toString() === authUser?._id?.toString()) return "o";
    return null;
  }, [authUser?._id, game.players]);

  const isJoined = Boolean(gameState);
  const isMyTurn = state.status === "playing" && state.currentTurn === mySymbol;
  const winnerText = state.winner?.symbol === "draw"
    ? "Game draw"
    : state.winner?.symbol
      ? `${state.winner.symbol.toUpperCase()} won`
      : null;

  const statusText = !isJoined
    ? isOwnMessage
      ? "Waiting for friend to join"
      : "Your friend invited you"
    : winnerText || (isMyTurn ? "Your turn" : `${state.currentTurn.toUpperCase()}'s turn`);

  return (
    <div className={`w-[260px] overflow-hidden rounded-2xl border border-violet-300/25 bg-black/45 text-white shadow-xl ${isOwnMessage ? "rounded-br-none" : "rounded-bl-none"}`}>
      <div className="border-b border-white/10 bg-violet-500/20 px-4 py-3">
        <p className="text-sm font-semibold">Tic Tac Toe</p>
        <p className="text-xs text-violet-100/80">{statusText}</p>
      </div>

      <div className="p-4">
        {isJoined ? (
          <div className="grid grid-cols-3 gap-2">
            {state.board.map((cell, index) => {
              const isWinningCell = state.winner?.line?.includes(index);

              return (
                <button
                  key={`${game.gameId}-${index}`}
                  type="button"
                  disabled={!isMyTurn || Boolean(cell) || state.status !== "playing"}
                  onClick={() => onMove(game.gameId, index)}
                  className={`aspect-square rounded-xl border text-3xl font-black transition ${
                    isWinningCell
                      ? "border-emerald-300 bg-emerald-400/25 text-emerald-100"
                      : "border-white/10 bg-white/10 text-white hover:bg-white/15"
                  } disabled:cursor-not-allowed disabled:opacity-80`}
                >
                  {cell?.toUpperCase()}
                </button>
              );
            })}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onJoin(game)}
            className="w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Let's play
          </button>
        )}

        {isJoined && state.status === "completed" && (
          <button
            type="button"
            onClick={() => onRestart(game.gameId)}
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Play again
          </button>
        )}
      </div>
    </div>
  );
};

export default TicTacToeGame;
