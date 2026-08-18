export function QRCodeSVG({
  value,
  size = 160,
}: {
  value: string;
  size?: number;
}) {
  const N = 25;

  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (Math.imul(31, seed) + value.charCodeAt(i)) | 0;
  }
  seed = Math.abs(seed) || 1;

  let s = seed;
  const rand = () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };

  const finderCell = (r: number, c: number): boolean => {
    if (r === 0 || r === 6 || c === 0 || c === 6) return true;
    if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
    return false;
  };

  const cells = Array.from({ length: N }, (_, r) =>
    Array.from({ length: N }, (_, c): boolean => {
      if (r < 7 && c < 7) return finderCell(r, c);
      if (r < 7 && c >= N - 7) return finderCell(r, c - (N - 7));
      if (r >= N - 7 && c < 7) return finderCell(r - (N - 7), c);
      if (r === 6 || c === 6) return (r + c) % 2 === 0;
      return rand() > 0.42;
    }),
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${N} ${N}`}
      style={{ display: "block" }}
    >
      <rect width={N} height={N} fill="white" />
      {cells.flatMap((row, r) =>
        row.flatMap((filled, c) =>
          filled
            ? [
                <rect
                  key={`${r}-${c}`}
                  x={c}
                  y={r}
                  width={1}
                  height={1}
                  fill="#1B2B4E"
                />,
              ]
            : [],
        ),
      )}
    </svg>
  );
}
