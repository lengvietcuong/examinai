import { type SVGProps } from "react";

export function USFlag({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 7410 3900"
      className={className}
      {...props}
    >
      <rect width="7410" height="3900" fill="#b22234" />
      <path
        d="M0,450H7410m0,600H0m0,600H7410m0,600H0m0,600H7410m0,600H0"
        stroke="#fff"
        strokeWidth="300"
      />
      <rect width="2964" height="2100" fill="#3c3b6e" />
      <g fill="#fff">
        <g id="s18">
          <g id="s9">
            <g id="s5">
              <g id="s4">
                <path
                  id="s"
                  d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"
                />
                <use href="#s" y="420" />
                <use href="#s" y="840" />
                <use href="#s" y="1260" />
              </g>
              <use href="#s" y="1680" />
            </g>
            <use href="#s4" x="494" y="210" />
          </g>
          <use href="#s9" x="494" />
        </g>
        <use href="#s18" x="988" />
        <use href="#s9" x="1976" />
        <use href="#s5" x="2470" />
      </g>
    </svg>
  );
}

export function VietnamFlag({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 600"
      className={className}
      {...props}
    >
      <rect width="900" height="600" fill="#da251d" />
      <polygon
        points="450,125.6 494.1,261.2 637.7,261.2 521.8,338.8 565.9,474.4 450,396.8 334.1,474.4 378.2,338.8 262.4,261.2 405.9,261.2"
        fill="#ffff00"
      />
    </svg>
  );
}
