import * as React from "react";

const OriginalEssayIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={800}
		height={800}
		fill="none"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			strokeLinecap="round"
			strokeWidth={2}
			d="M19 11V8.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C17.48 5 16.92 5 15.8 5H7.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C4 6.52 4 7.08 4 8.2v5.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C5.52 17 6.08 17 7.2 17H14M8 13h4M8 9h7"
		/>
		<circle cx={18} cy={15} r={1} strokeWidth={2} />
		<path
			strokeLinecap="round"
			strokeWidth={2}
			d="M20 20s-.5-1-2-1-2 1-2 1"
		/>
	</svg>
)
export default OriginalEssayIcon;
