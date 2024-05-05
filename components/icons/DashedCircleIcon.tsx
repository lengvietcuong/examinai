import * as React from "react";

const DashedCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={800}
		height={800}
		fill="none"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			strokeDasharray="4 4"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
		/>
	</svg>
)
export default DashedCircleIcon;
