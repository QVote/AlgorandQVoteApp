import React from "react";

export function QVoteLogo({ color, size }: { color: string; size: string }) {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 512.000000 512.000000"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        transform={"translate(0.000000,512.000000) scale(0.1,-0.1)"}
        fill={color}
        stroke="none"
      >
        <path
          d="M1195 4626 c-16 -7 -40 -24 -52 -37 -12 -13 -238 -412 -502 -887
    l-481 -863 2 -1209 c3 -1203 3 -1209 24 -1236 11 -15 33 -37 48 -48 27 -21 33
    -21 1208 -24 1163 -2 1182 -2 1222 18 23 11 51 34 63 52 11 18 320 573 685
    1233 l663 1200 0 857 c0 849 0 857 -21 884 -11 15 -33 37 -48 48 -27 21 -31
    21 -1404 23 -1132 2 -1382 0 -1407 -11z m2041 -1649 c18 -16 27 -34 27 -53 0
    -19 -164 -329 -497 -933 -273 -498 -504 -913 -513 -923 -10 -11 -30 -18 -54
    -18 -31 0 -42 6 -62 32 -13 18 -244 433 -512 923 -328 597 -488 900 -488 919
    0 19 9 37 27 53 l27 23 1009 0 1009 0 27 -23z"
        />
        <path
          d="M4075 1778 c-38 -34 -775 -1346 -775 -1381 0 -16 10 -38 25 -52 l24
    -25 771 0 771 0 25 26 c20 19 25 33 22 57 -5 41 -730 1333 -769 1370 -36 33
    -60 34 -94 5z"
        />
      </g>
    </svg>
  );
}
